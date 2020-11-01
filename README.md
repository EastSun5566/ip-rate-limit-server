# IP rate limit server

## Requirement

- 每個 IP 每分鐘僅能接受 60 個 requests
- 在首頁顯示目前的 request 量，超過限制的話則顯示 Error，例如在一分鐘內第 30 個 request 則顯示 30，第 61 個 request 則顯示 Error

## Getting started

```sh
# install dep
npm i

# start dev
npm run start:dev

# start prod
npm start

# start dev with docker
start:docker:dev

# start prod with docker
start:docker
```
