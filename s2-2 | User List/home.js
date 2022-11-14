"use strict";
// 在地嚮導 APP
// 篩選性別、年齡功能、地區、評分最高

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const userPanel = document.querySelector("#user-panel");
const searchForm = document.querySelector("#searchForm");

const userData = [];

//// FUNCTION render Cards
function renderData(data) {
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
          <h5 class="card-title card-user-name">${user.name} ${
      user.surname
    }</h5>
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

//// FUNCTION show modal
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

//// FUNCTION
function searchUserName(keyword) {
  const filteredUser = [];

  userData.forEach((user) => {
    // 資料有分 name 跟 surname ，先合併
    user.fullName = `${user.name} ${user.surname}`.toLowerCase().trim();
    // 檢查名字有沒有符合的，有就抓進陣列
    if (user.fullName.includes(keyword)) {
      filteredUser.push(user);
    }
  });

  // 因為有 forEach 就順便在裡面 push 了，不然也可以用 .filter()
  /*
    let filteredUser = []
    filteredUser = userData.filter((user) => user.fullName.includes(keyword));
  */

  // 如果搜尋結果沒有吻合的，filteredUser陣列會為空，這時也不用重新渲染畫面，跳出提示就好
  // 補充： include() 空的會讓全部都通過篩選，filteredUser陣列為全滿
  if (filteredUser.length === 0) {
    return alert("沒有符合的人名！");
  }

  // 重新渲染畫面
  renderData(filteredUser);
}

//// EVENT LISTENER 彈出使用者資訊視窗
userPanel.addEventListener("click", (event) => {
  if (event.target.matches(".user-avatar")) {
    const id = event.target.dataset.id;
    showModal(id);
  }
});

//// EVENT LISTENER 搜尋列
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = document
    .querySelector("#searchInput")
    .value.toLowerCase()
    .trim();

  searchUserName(keyword);
});

//// EXECUTE
axios
  .get(`${INDEX_URL}`)
  .then((response) => {
    userData.push(...response.data.results);
    renderData(userData);
  })
  .catch((error) => console.log(error));
