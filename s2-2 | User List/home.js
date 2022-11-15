"use strict";
// 在地嚮導 APP
// 篩選性別、年齡功能、地區、評分最高

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USER_PER_PAGE = 12;

const userPanel = document.querySelector("#user-panel");
const searchForm = document.querySelector("#searchForm");
const pagination = document.querySelector(".pagination");

const userData = [];
let filteredUser = [];
const favoriteUserList =
  JSON.parse(localStorage.getItem("favoriteUserList")) || [];

//// FUNCTION render Cards
function renderData(data) {
  let rawHTML = "";

  data.forEach((user) => {
    rawHTML += `
      <div class="card mb-3" style="width: 12rem; margin-right: 1rem">
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
          <a  class="btn favorite-btn" data-id="${user.id}">🖤</a>
        </div>
      </div>
    `;
  });

  userPanel.innerHTML = rawHTML;
}

//// FUNCTION render 分頁
function renderPaginator(count) {
  const pageCount = Math.ceil(count / USER_PER_PAGE);

  let rawHTML = "";

  for (let page = 1; page <= pageCount; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#">${page}</a></li>`;
  }

  pagination.innerHTML = rawHTML;
}

// FUNCTION 切割每頁的資料
function getDataPerPage(page) {
  // 看是不是在搜尋條件下
  const data = filteredUser.length ? filteredUser : userData;

  const startIndex = (page - 1) * 12;
  return data.slice(startIndex, startIndex + 12);
}

//// FUNCTION show modal
function showModal(id) {
  const avatar = document.querySelector("#user-modal-avatar");
  const name = document.querySelector("#user-modal-name");
  const gender = document.querySelector("#user-modal-gender");
  const info = document.querySelector("#user-modal-info");

  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  name.textContent = "";
  avatar.src = "";
  gender.textContent = "";
  info.innerHTML = "";

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

//// FUNCTION 搜尋結果
function searchUserName(keyword) {
  userData.forEach((user) => {
    // 資料有分 name 跟 surname ，先合併
    user.fullName = `${user.name} ${user.surname}`.toLowerCase().trim();
    // 檢查名字有沒有符合的，有就抓進陣列
    // if (user.fullName.includes(keyword)) {
    //   filteredUser.push(user);
    // }
  });
  filteredUser = userData.filter((user) => user.fullName.includes(keyword));

  // 因為有 forEach 就順便在裡面 push 了，不然也可以用 .filter()
  /*
    let filteredUser = []
    filteredUser = userData.filter((user) => user.fullName.includes(keyword));

        // 同學這樣做
    filteredUsers = users.filter((user) =>
        (user.name + ' ' + user.surname).toLowerCase().includes(keyword)
    );
  */

  // 如果搜尋結果沒有吻合的，filteredUser陣列會為空，這時也不用重新渲染畫面，跳出提示就好
  // 補充： include() 空的會讓全部都通過篩選，filteredUser陣列為全滿
  if (filteredUser.length === 0) {
    return alert("沒有符合的人名！");
  }

  // 重新渲染畫面
  renderData(getDataPerPage(1));
  renderPaginator(filteredUser.length);
}

//// FUNCTION 加入最愛
function addToFavorite(id) {
  // 找到符合 id 的那筆資料
  const favoriteUser = userData.find((user) => user.id === id);

  if (favoriteUserList.some((user) => user.id === id)) {
    return alert("這個人已經在你的最愛");
  }
  // 放入最愛清單
  favoriteUserList.push(favoriteUser);
  // 更新 local storage
  localStorage.setItem("favoriteUserList", JSON.stringify(favoriteUserList));
}

//// EVENT LISTENER 彈出使用者資訊視窗、加入最愛
userPanel.addEventListener("click", (event) => {
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".user-avatar")) {
    showModal(id);
  } else if (event.target.matches(".favorite-btn")) {
    addToFavorite(id);
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

//// EVENT LISTENER 頁碼
pagination.addEventListener("click", (event) => {
  const pages = document.querySelectorAll(".page-item");
  const page = Number(event.target.textContent);
  // active樣式
  pages.forEach((p) => {
    Number(p.textContent) === page
      ? p.classList.add("active")
      : p.classList.remove("active");
  });
  // 呈現該頁內容
  renderData(getDataPerPage(page));
});

//// EXECUTE
axios
  .get(`${INDEX_URL}`)
  .then((response) => {
    userData.push(...response.data.results);
    renderPaginator(userData.length);
    renderData(getDataPerPage(1));
    // 第一頁的頁碼要先為 active 樣式
    document.querySelector(".page-item").classList.add("active");
  })
  .catch((error) => console.log(error));
