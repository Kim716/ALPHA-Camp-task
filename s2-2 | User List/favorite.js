"use strict";

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USER_PER_PAGE = 12;
const userData = [];
let filteredUser = [];
const favoriteUserList =
  JSON.parse(localStorage.getItem("favoriteUserList")) || [];

// DOM nodes
const userPanel = document.querySelector("#user-panel");
const searchForm = document.querySelector("#searchForm");
const pagination = document.querySelector(".pagination");

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
          <a  class="btn"><i class="fa-solid fa-trash-can delete-btn" data-id="${
            user.id
          }"></i></a>
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

//// FUNCTION 切割每頁的資料
function getDataPerPage(page) {
  // 看是不是在搜尋條件下
  const data = filteredUser.length ? filteredUser : favoriteUserList;

  const startIndex = (page - 1) * 12;
  return data.slice(startIndex, startIndex + 12);
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

//// FUNCTION 搜尋結果
function searchUserName(keyword) {
  favoriteUserList.forEach((user) => {
    // 資料有分 name 跟 surname ，先合併
    user.fullName = `${user.name} ${user.surname}`.toLowerCase().trim();
    // 檢查名字有沒有符合的，有就抓進陣列
    // if (user.fullName.includes(keyword)) {
    //   filteredUser.push(user);
    // }
  });

  filteredUser = favoriteUserList.filter((user) =>
    user.fullName.includes(keyword)
  );

  // 因為有 forEach 就順便在裡面 push 了，不然也可以用 .filter()
  /*
    let filteredUser = []
    filteredUser = favoriteUserList.filter((user) => user.fullName.includes(keyword));

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

//// FUNCTION 刪除我的最愛
function deleteFavorite(id) {
  // 如果根本沒有喜愛的user 就不用啟動
  if (!favoriteUserList || !favoriteUserList.length) return;
  // 找到符合 id 的那筆資料在清單中的 index
  const index = favoriteUserList.findIndex((user) => user.id === id);
  let nowPage = 0;
  // const nowPage =
  //   index === 0 ? Math.ceil((index + 1) / 12) : Math.ceil(index / 12); // TODO 當刪除第一頁以上的第一個，會跳轉到前一頁；但如果不讓他跳轉，在那頁什麼都沒有的時候還會停在那邊，也是很奇怪
  // // 找不到那個user，就不用繼續下去

  if (index === -1) return;
  // 從清單中移除
  favoriteUserList.splice(index, 1);

  // 為了避免計算出第零頁而無法成功跳頁，index 為零時，需要+1
  // 刪除的不是最後一個，但為12的倍數，就需要+1來避免跳轉到前一頁
  // 只要刪除的是最後一個，也就是 favoriteUserList[index] 會變成 undefined 的狀況，代表要往前一頁跳轉（這時index為12的倍數）（這時已經排除 index 為零的狀況）
  if (index === 0 || favoriteUserList[index]) {
    nowPage = Math.ceil((index + 1) / 12);
  } else if (!favoriteUserList[index]) {
    nowPage = Math.ceil(index / 12);
  }

  // 更新 local storage
  localStorage.setItem("favoriteUserList", JSON.stringify(favoriteUserList));
  // 重新 render 當前頁面
  renderData(getDataPerPage(nowPage));
  renderPaginator(favoriteUserList.length);
  activePagination(nowPage);
}

//// FUNCTION active 頁碼
function activePagination(page) {
  const pages = document.querySelectorAll(".page-item");
  pages.forEach((p) => {
    Number(p.textContent) === page
      ? p.classList.add("active")
      : p.classList.remove("active");
  });
}

//// EVENT LISTENER 彈出使用者資訊視窗、加入最愛
userPanel.addEventListener("click", (event) => {
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".user-avatar")) {
    showModal(id);
  } else if (event.target.matches(".delete-btn")) {
    deleteFavorite(id);
  }
});

//// EVENT LISTENER 頁碼
pagination.addEventListener("click", (event) => {
  // const pages = document.querySelectorAll(".page-item");
  const page = Number(event.target.textContent);
  // active樣式
  // pages.forEach((p) => {
  //   Number(p.textContent) === page
  //     ? p.classList.add("active")
  //     : p.classList.remove("active");
  // });
  // 呈現該頁內容
  renderData(getDataPerPage(page));
  activePagination(page);
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
    renderPaginator(favoriteUserList.length);
    renderData(getDataPerPage(1));
    // 第一頁的頁碼要先為 active 樣式
    document.querySelector(".page-item").classList.add("active");
  })
  .catch((error) => console.log(error));
