"use strict";
// 載入 Express 框架
// 這次不需要 require(‘http’) 因為 Express 內部已經載入 HTTP 模組了。
const express = require("express");
// 存入變數中
const app = express();

// 定義要使用的 port num
// 這次我們沒有定義 hostname。因為在 Express 中，如果沒有定義 hostname ，Express 就會預設用 localhost。
const port = 3000;

// 設定 route 和 伺服器回應內容
// 以下表示在 localhost:3000/ （根目錄下）
// 不需要設定 header，express 會自動判斷 content type
app.get("/", (req, res) => {
  res.send("This is my first Web APP created by Express");
});

// 設定其他路由
app.get("/languages/:language", (req, res) => {
  res.send(`${req.params.language} is a popular language`);
});

// 啟動伺服器監聽
app.listen(port, () => {
  console.log("Express is running on http://localhost:${port}");
});
