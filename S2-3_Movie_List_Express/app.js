"use strict";
// 載入 express
const express = require("express");
const app = express();

// 載入電影資料
const movies = require("./movies.json");
// 這裡有用 ./ 是告知 express 檔案和 app.js 同一層，之前沒用，express 會先去 modules 找

// 載入 handlebars
const exhbs = require("express-handlebars");
// 告訴 Express：麻煩幫我把樣板引擎交給 express-handlebars
app.engine("handlebars", exhbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const port = 3000;

// 設定靜態檔案，請 express 到這裡找靜態檔案
app.use(express.static("public"));

// 設定路由
app.get("/", (req, res) => {
  res.render("index", { movies: movies.results }); // 屬性名稱和值一樣，可以寫成這樣{ movies }
  // res.send("Hi there");
});

app.get("/search", (req, res) => {
  const keyword = req.query.keyword;
  // console.log(encodeURIComponent(keyword));
  const searchedMovies = movies.results.filter((movie) =>
    movie.title.toLowerCase().includes(keyword.toLowerCase())
  );
  res.render("index", { movies: searchedMovies, keyword: keyword });
});

app.get("/movie/:id", (req, res) => {
  // 用 filter 篩選出吻合 id 的電影
  const movie = movies.results.find(
    (movie) => movie.id.toString() === req.params.id
    // 建議用 toString，如果是後者用 Number() 可能會發生空字串仍被轉換為 0 的狀況
  );
  res.render("show", { movie: movie });

  //方法二
  // const index = Number(req.params.id) - 1;
  // res.render("show", { movie: movies.results[index] });
});

// start & listen on Express server
app.listen(port, () => {
  console.log("I'm listening");
});
