# IP rate limit server

> 依據 IP 限流 server

## Requirement

- 每個 IP 每分鐘僅能接受 60 個 requests
- 在首頁顯示目前的 request 量，超過限制的話則顯示 Error，例如在一分鐘內第 30 個 request 則顯示 30，第 61 個 request 則顯示 Error

## Using stack

- Node.js v12 w/ TypeScript
- Redis v6
- Docker
- Jest

## Getting started

### Starting server

```sh
# install dep
npm i

# start server with docker
npm run start:docker
```

### Starting test

```sh
# install dep
npm i

# start test with docker
npm run test:docker
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
    "ip": "192.168.0.0",
    "count": 1,
    "ttl": 60
  }
  ```

- Given: 一分鐘請求數已達上限

  ```sh
  curl -i http://localhost:8080

  HTTP/1.1 429 Too Many Requests

  {
    "message": "too many requests"
  }
  ```

## Project structure

| folder                      | description                                            |
| --------------------------- | ------------------------------------------------------ |
| src/index                   | 進入點                                                 |
| src/app                     | 初始化 koa app， 並 apply 限流中間件                   |
| src/middleware/rate-limiter | 限流中間件，當超出限制時直接拋出 429 錯誤給 client     |
| src/services/ip-rate-limit  | IP 的限流服務，檢查當前此 IP 的請求數量                |
| src/models/ip               | IP 計數的資料 store，連接 redis 並增加當前 IP 請求數加 |

## Design process
