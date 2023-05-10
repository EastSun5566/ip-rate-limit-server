# IP rate limit server

This project is based on my [typescript-koa-starter](https://github.com/EastSun5566/typescript-koa-starter)

## Required features

- 每個 IP 每分鐘僅能接受 60 個 requests
- 在首頁顯示目前的 request 量，超過限制的話則顯示 Error，例如在一分鐘內第 30 個 request 則顯示 30，第 61 個 request 則顯示 Error

## Using stack

- Node.js v12 w/ TypeScript
- Redis v6
- Docker
- Jest

## Table of contents

- [IP rate limit server](#ip-rate-limit-server)
  - [Required features](#required-features)
  - [Using stack](#using-stack)
  - [Table of contents](#table-of-contents)
  - [Getting started](#getting-started)
    - [Starting dev server with docker](#starting-dev-server-with-docker)
    - [Starting server with docker](#starting-server-with-docker)
    - [Starting test with docker](#starting-test-with-docker)
  - [Test cases](#test-cases)
  - [Folder structure](#folder-structure)
  - [The Why \& How](#the-why--how)

## Getting started

### Starting dev server with docker

```sh
docker-compose run --service-ports server npm run start:dev
```

### Starting server with docker

```sh
docker-compose up
```

### Starting test with docker

```sh
docker-compose run server npm test
```

## Test cases

- Given: 初次請求

  ```sh
  curl -i http://localhost:8080

  HTTP/1.1 200 OK
  X-rateLimit-Limit: 60
  X-Rate-Limit-Remaining: 59
  X-RateLimit-Reset: 1604393498011

  {
    "ip": "192.168.0.1",
    "count": 1,
    "ttl": 60
  }
  ```

- Given: 在一分鐘內請求數已達上限

  ```sh
  curl -i http://localhost:8080

  HTTP/1.1 429 Too Many Requests

  {
    "message": "too many requests"
  }
  ```

- Given: 在請求數已達上限的重設時間後

  則結果同 case 1

## Folder structure

```sh
src
├── config.ts
├── controllers
│   ├── home.ts
│   └── index.ts
├── db
│   ├── index.ts
│   └── redis.ts
├── index.ts # 進入點
├── middlewares
│   ├── error-handler.ts
│   ├── index.ts
│   └── rate-limiter.ts # 限流 middleware，當超出限制時拋出 429 錯誤給 client
├── models
│   ├── index.ts
│   └── ip.ts # IP 計數 model，連接 redis
├── router.ts
├── server.ts # 初始化 server 並 apply 限流 middleware
├── services
│   ├── index.ts
│   └── ip-rate-limit.ts # IP 的限流服務，檢查當前此 IP 的請求數量，超出即拋錯
└── utils
    └── errors.ts
```

## The Why & How

使用 IP 做唯一辨識去限制單位時間內的請求數，此問題可先分成兩個子問題：

1. 需要記住每個 IP 當前的請求數，並在請求進來後加一
1. 需要在給定時間內重置計數

最簡單直覺的方式是使用 local memory 記住狀態，以 Map key 為 IP、 value 為請求數，並用給定時間做 setInterval 去 delete key 重置，當然這有很多缺點：

1. QPS 很高時 local memory 會被塞爆
1. setInterval 通常會延遲，也就是說相同 IP 會超訪
1. 水平擴展時狀態全部失效

所以這邊選擇用使用外部的 In-memory DB Redis，為何不用使用其他的 On-disk DBs，除了條件有提到不用實作資料持久化外有幾個原因：

1. disk I/O 比讀寫 memory 慢很多
1. 此資料用途不用到非常精準，流失也無所謂
1. 避免主 DB 增加工作量

關於 Redis 上的設計，用 IP 加上簡單前綴避免命名空間衝突做為 key，value 即為請求數，使用 `INCR` 操作作去增加計數，即可做到避免用 get/set 會產生的 Read–write conflict，但這邊會有個問題，在新 IP 被初次計數時是需要設置過期秒數，所以這邊使用 SET 操作額外提供的 option `NX` 做條件判斷再包進 Transactions 中解決，示意如下：

```ts
const key = `ip:${ip}`;

redis
  .multi() // Tx 開始
  .set(key, 0, "EX", 60, "NX") // 若 key 不存在，才設置 key 值為 0 並設置過期秒數 60
  .incr(key) // key 值加ㄧ
  .exec(); // Tx 結束
```
