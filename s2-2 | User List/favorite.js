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
          <p class="card-text">${user.gender === "male" ? "ππ»ββοΈ" : "ππ»ββοΈ"}</p>
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

//// FUNCTION render ει 
function renderPaginator(count) {
  const pageCount = Math.ceil(count / USER_PER_PAGE);

  let rawHTML = "";

  for (let page = 1; page <= pageCount; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#">${page}</a></li>`;
  }

  pagination.innerHTML = rawHTML;
}

//// FUNCTION εε²ζ―ι ηθ³ζ
function getDataPerPage(page) {
  // ηζ―δΈζ―ε¨ζε°ζ’δ»ΆδΈ
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
    gender.textContent = user.gender === "male" ? "ππ»ββοΈ" : "ππ»ββοΈ";
    info.innerHTML = `
      <li>AGE: ${user.age}</li>
      <li>BIRTHDAY: ${user.birthday}</li>
      <li>REGION: ${user.region}</li>
      <li>EMAIL: ${user.email}</li>
    `;
  });
}

//// FUNCTION ζε°η΅ζ
function searchUserName(keyword) {
  favoriteUserList.forEach((user) => {
    // θ³ζζε name θ· surname οΌεεδ½΅
    user.fullName = `${user.name} ${user.surname}`.toLowerCase().trim();
    // ζͺ’ζ₯εε­ζζ²ζη¬¦εηοΌζε°±ζι²ι£ε
    // if (user.fullName.includes(keyword)) {
    //   filteredUser.push(user);
    // }
  });

  filteredUser = favoriteUserList.filter((user) =>
    user.fullName.includes(keyword)
  );

  // ε ηΊζ forEach ε°±ι δΎΏε¨θ£‘ι’ push δΊοΌδΈηΆδΉε―δ»₯η¨ .filter()
  /*
    let filteredUser = []
    filteredUser = favoriteUserList.filter((user) => user.fullName.includes(keyword));

    // εε­Έιζ¨£ε
    filteredUsers = users.filter((user) =>
        (user.name + ' ' + user.surname).toLowerCase().includes(keyword)
    );
  */

  // ε¦ζζε°η΅ζζ²ζε»εηοΌfilteredUserι£εζηΊη©ΊοΌιζδΉδΈη¨ιζ°ζΈ²ζη«ι’οΌθ·³εΊζη€Ίε°±ε₯½
  // θ£εοΌ include() η©Ίηζθ?ε¨ι¨ι½ιιη―©ιΈοΌfilteredUserι£εηΊε¨ζ»Ώ
  if (filteredUser.length === 0) {
    return alert("ζ²ζη¬¦εηδΊΊεοΌ");
  }

  // ιζ°ζΈ²ζη«ι’
  renderData(getDataPerPage(1));
  renderPaginator(filteredUser.length);
}

//// FUNCTION εͺι€ζηζζ
function deleteFavorite(id) {
  // ε¦ζζ Ήζ¬ζ²ζεζηuser ε°±δΈη¨εε
  if (!favoriteUserList || !favoriteUserList.length) return;
  // ζΎε°η¬¦ε id ηι£η­θ³ζε¨ζΈε?δΈ­η index
  const index = favoriteUserList.findIndex((user) => user.id === id);
  let nowPage = 0;
  // const nowPage =
  //   index === 0 ? Math.ceil((index + 1) / 12) : Math.ceil(index / 12); // TODO ηΆεͺι€η¬¬δΈι δ»₯δΈηη¬¬δΈεοΌζθ·³θ½ε°εδΈι οΌδ½ε¦ζδΈθ?δ»θ·³θ½οΌε¨ι£ι δ»ιΊΌι½ζ²ζηζειζεε¨ι£ιοΌδΉζ―εΎε₯ζͺ
  // // ζΎδΈε°ι£εuserοΌε°±δΈη¨ηΉΌηΊδΈε»

  if (index === -1) return;
  // εΎζΈε?δΈ­η§»ι€
  favoriteUserList.splice(index, 1);

  // ηΊδΊιΏεθ¨η?εΊη¬¬ιΆι θη‘ζ³ζεθ·³ι οΌindex ηΊιΆζοΌιθ¦+1
  // εͺι€ηδΈζ―ζεΎδΈεοΌδ½ηΊ12ηεζΈοΌε°±ιθ¦+1δΎιΏεθ·³θ½ε°εδΈι 
  // εͺθ¦εͺι€ηζ―ζεΎδΈεοΌδΉε°±ζ― favoriteUserList[index] ζθ?ζ undefined ηηζ³οΌδ»£θ‘¨θ¦εΎεδΈι θ·³θ½οΌιζindexηΊ12ηεζΈοΌοΌιζε·²ηΆζι€ index ηΊιΆηηζ³οΌ
  if (index === 0 || favoriteUserList[index]) {
    nowPage = Math.ceil((index + 1) / 12);
  } else if (!favoriteUserList[index]) {
    nowPage = Math.ceil(index / 12);
  }

  // ζ΄ζ° local storage
  localStorage.setItem("favoriteUserList", JSON.stringify(favoriteUserList));
  // ιζ° render ηΆει ι’
  renderData(getDataPerPage(nowPage));
  renderPaginator(favoriteUserList.length);
  activePagination(nowPage);
}

//// FUNCTION active ι η’Ό
function activePagination(page) {
  const pages = document.querySelectorAll(".page-item");
  pages.forEach((p) => {
    Number(p.textContent) === page
      ? p.classList.add("active")
      : p.classList.remove("active");
  });
}

//// EVENT LISTENER ε½εΊδ½Ώη¨θθ³θ¨θ¦ηͺγε ε₯ζζ
userPanel.addEventListener("click", (event) => {
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".user-avatar")) {
    showModal(id);
  } else if (event.target.matches(".delete-btn")) {
    deleteFavorite(id);
  }
});

//// EVENT LISTENER ι η’Ό
pagination.addEventListener("click", (event) => {
  // const pages = document.querySelectorAll(".page-item");
  const page = Number(event.target.textContent);
  // activeζ¨£εΌ
  // pages.forEach((p) => {
  //   Number(p.textContent) === page
  //     ? p.classList.add("active")
  //     : p.classList.remove("active");
  // });
  // εηΎθ©²ι ε§ε?Ή
  renderData(getDataPerPage(page));
  activePagination(page);
});

//// EVENT LISTENER ζε°ε
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
    // η¬¬δΈι ηι η’Όθ¦εηΊ active ζ¨£εΌ
    document.querySelector(".page-item").classList.add("active");
  })
  .catch((error) => console.log(error));
