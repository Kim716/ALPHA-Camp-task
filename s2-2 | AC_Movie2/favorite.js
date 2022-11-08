"use strict";
const BASE_URL = "https://movie-list.alphacamp.io";
const MOVIE_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const moviePanel = document.querySelector("#movie-panel");

let favMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

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
              <button class="btn btn-danger remove-btn" data-id="${movie.id}">X</button>
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

// FUNCTION 刪除收藏店電影
function deleteMovie(id) {
  // 防呆：陣列是空的，就沒有什麼好刪的
  if (!movies || !movies.length) return;
  // .findIndex 會回傳符合條件的 item 的 index
  const movieIndex = favMovies.findIndex((movie) => movie.id === id);
  // 防呆：找不到那個項目，上面回傳 -1 ，就也不用刪了
  if (movieIndex === -1) return;
  // 拿掉！
  favMovies.splice(movieIndex, 1);
  // 更改 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(favMovies));
  // 重新渲染
  renderDatas(favMovies);
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
  } else if (event.target.matches(".remove-btn")) {
    deleteMovie(id);
  }
});

// EXECUTE
renderDatas(favMovies);
