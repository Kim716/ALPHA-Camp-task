"use strict";
// 在地嚮導 APP
// 篩選性別、年齡功能、地區、評分最高

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const userPanel = document.querySelector("#user-panel");
const userData = [];

// FUNCTION get user data then render it
// 到底要先抓資料存下來再渲染，還是抓完就渲染？自己的JS沒有存
function renderData(URL) {
  axios
    .get(`${URL}`)
    .then((response) => {
      userData.push(...response.data.results);
      generateCards(userData);
    })
    .catch((error) => console.log(error));
}

// FUNCTION generate Cards
function generateCards(data) {
  let rawHTML = "";

  data.forEach((user) => {
    rawHTML += `
      <div class="card mb-2" style="width: 10rem">
        <img
          src="${user.avatar}"
          class="user-avatar card-img-top"
          alt="user avatar"
          type="button"
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#user-modal"
          data-id="${user.id}"
        />
        <div class="card-body d-flex flex-column justify-content-between">
          <h5 class="card-title">${user.name} ${user.surname}</h5>
          <p class="card-text">${user.gender === "male" ? "💁🏻‍♂️" : "💁🏻‍♀️"}</p>
          <p class="card-text">Region: ${user.region}</p>
        </div>
        <div class="card-footer d-flex justify-content-center">
          <a href="#" class="btn">🖤</a>
        </div>
      </div>
    `;
  });

  userPanel.innerHTML = rawHTML;
}

// FUNCTION show modal
function showModal(id) {
  const avatar = document.querySelector("#user-modal-avatar");
  const name = document.querySelector("#user-modal-name");
  const gender = document.querySelector("#user-modal-gender");
  const info = document.querySelector("#user-modal-info");

  axios.get(`${INDEX_URL}${id}`).then((response) => {
    const user = response.data;

    avatar.src = user.avatar;
    name.textContent = `${user.name} ${user.surname}`;
    gender.textContent = user.gender === "male" ? "💁🏻‍♂️" : "💁🏻‍♀️";
    info.innerHTML = `
      <li>AGE: ${user.age}</li>
      <li>BIRTHDAY: ${user.birthday}</li>
      <li>REGION: ${user.region}</li>
      <li>EMAIL: ${user.email}</li>
    `;
  });
}

// EVENT LISTENER
userPanel.addEventListener("click", (event) => {
  if (event.target.matches(".user-avatar")) {
    const id = event.target.dataset.id;
    showModal(id);
  }
});

// EXECUTE
renderData(INDEX_URL);
