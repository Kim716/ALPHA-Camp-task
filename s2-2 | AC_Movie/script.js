"use strict";
// DATA
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const moviePanel = document.querySelector(".movie-panel");

const movies = [];

// FUNCTION：將資料渲染到畫面上
function renderPanel(data) {
  let movieHTML = "";

  movies.forEach((item) => {
    // image title
    movieHTML += `
       <div class="col-sm-3">
        <div class="card mt-2">
          <img
            src="${POSTER_URL}${item.image}"
            class="card-img-top"
            alt="movie poster"
          />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button
              class="btn btn-primary btn-show-more"
              data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${item.id}" 
            >
              more
            </button>
            <button class="btn btn-info btn-add-favorite">+</button>
          </div>
        </div>
       </div>
    `;
  }); // 把 id 在渲染時就放在 show more 的按鈕上，點擊時每個按鈕就會指向特定 id，呈現資料我們就鎖定這個 id 來找到對應資料

  moviePanel.innerHTML = movieHTML;
}

// FUNCTION 彈出視窗
function showModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // 抓取特定 id 的資料
  axios.get(INDEX_URL + id).then(function (response) {
    const results = response.data.results;

    modalTitle.textContent = results.title;
    modalImage.firstElementChild.src = POSTER_URL + results.image;
    modalDate.textContent = `release date: ${results.release_date}`;
    modalDescription.textContent = results.description;
  });
}

// EVENT LISTENER: 彈出視窗按鈕
moviePanel.addEventListener("click", (event) => {
  if (event.target.matches(".btn-show-more")) {
    console.log(event.target);
    console.log(event.target.dataset);
    showModal(event.target.dataset.id);
  }
});

axios
  .get(INDEX_URL)
  .then(function (response) {
    movies.push(...response.data.results);
    renderPanel(movies);
  })
  .catch(function (error) {
    console.log(error);
  });
