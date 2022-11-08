"use strict";
const BASE_URL = "https://movie-list.alphacamp.io";
const MOVIE_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const moviePanel = document.querySelector("#movie-panel");
const searchForm = document.querySelector("#search-form");

const movies = [];

// FUNCTION render movie data
function renderDatas(datas) {
  let rawHTML = "";
  for (const movie of datas) {
    rawHTML += `
      <div class="col-sm-3 mb-2">
          <div class="card">
            <img
              src="${POSTER_URL}${movie.image}"
              class="card-img-top"
              alt="..."
            />
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary more-btn"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${movie.id}"          
              >
                more
              </button>
              <button class="btn btn-info favorite-btn" data-id="${movie.id}">❤️</button>
            </div>
          </div>
        </div>
        `;
  }
  moviePanel.innerHTML = rawHTML;
}

// FUNCTION show modal
function showModal(data) {
  const title = document.querySelector("#movie-modal-title");
  const img = document.querySelector("#movie-modal-img");
  const date = document.querySelector("#movie-modal-date");
  const description = document.querySelector("#movie-modal-description");

  title.textContent = data.title;
  img.src = POSTER_URL + data.image;
  date.textContent = `Release date: ${data.release_date}`;
  description.textContent = data.description;
}

// FUNCTION 搜尋電影
function searchMovies(keywords) {
  let filteredMovies = [];

  if (!keywords.length) {
    return alert("Type something valid");
  }

  // array.filter 會找出「所有」符合條件判斷式的陣列
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keywords)
  );
  // 優化前：
  // movies.forEach((movie) => {
  //   if (movie.title.toLowerCase().includes(keywords)) {
  //     filteredMovies.push(movie);
  //   }
  // });

  if (!filteredMovies[0]) {
    return alert("can't find the movie");
  }

  renderDatas(filteredMovies);
}

// FUNCTION 加入收藏清單
function addFavoriteMovie(id) {
  // 創造一個放收藏電影的陣列清單，已經有一部以上就會取原本的，是null的話就建立空陣列
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  // 如果已經有了，就不要重複加了，arr.some 是尋找的意思 回傳布林值
  // 踩坑筆記：測試時不小心把 null 放入陣列中，[null]無法啟動.some()
  // 噴錯Cannot read properties of null (reading 'id')
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  // 去找吻合這個 id 的電影 .find 是透過迭代迴圈的方式去找符合判斷條件是的，找到「第一個」就會回傳、停了
  const movie = movies.find((movie) => movie.id === id);
  // 把那個要收藏的電影加到清單中
  list.push(movie);
  // 把此刻的清單轉換成 string，存到 local storage（key & value 都只接受 string)
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// EVENT LISTENER show modal
// 點擊時跳出該電影資料
moviePanel.addEventListener("click", function (event) {
  // 要在render時 moreBtn favBtn 加上 data-id="" 來辨識是哪部電影
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".more-btn")) {
    axios
      .get(MOVIE_URL + id)
      .then((response) => {
        showModal(response.data.results);
      })
      .catch((error) => console.log(error));
  } else if (event.target.matches(".favorite-btn")) {
    addFavoriteMovie(id);
  }
});

// EVENT LISTENER 產生搜尋結果
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // 防止瀏覽器預設的跳轉頁面
  const keywords = document
    .querySelector("#search-value")
    .value.trim()
    .toLowerCase();

  searchMovies(keywords);
});

// EVENT LISTENER ：每按一次就搜尋一次的版本
/*
searchForm.addEventListener("keyup", (event) => {
  event.preventDefault(); // 防止瀏覽器預設的跳轉頁面
  const keywords = document
    .querySelector("#search-value")
    .value.trim()
    .toLowerCase();
  const validMovies = [];

  movies.forEach((movie) => {
    if (movie.title.toLowerCase().includes(keywords)) {
      validMovies.push(movie);
    }
  });

  renderDatas(validMovies); //
});
*/

// EXECUTE
axios
  .get(MOVIE_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderDatas(movies);
  })
  .catch((error) => console.log(error));
