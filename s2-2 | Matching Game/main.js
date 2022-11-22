"use strict";
// --- DATA --- //
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

// --- DOM nodes MVC 都會用到--- //
const cardPanel = document.querySelector("#card-panel");

// --- View --- //
const view = {
  transformNumber: function (number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  getCardContent: function (index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.trunc(index / 13)];

    if (index > 12 && index < 39) {
      return `
      <div class='for-card-EL'></div>
        <p class='red'>${number}</p>
        <img
          src="${symbol}"
          alt="花色"
        />
        <p class='red'>${number}</p>
      `;
    }
    return `
        <div class='for-card-EL'></div>
        <p>${number}</p>
        <img
          src="${symbol}"
          alt="花色"
        />
        <p>${number}</p>
      `;
  },

  getCardElement: function (index) {
    return `<div class="card back" data-index='${index}'></div>`;
  },

  renderCards: function () {
    cardPanel.innerHTML = utility
      .getRandomNumberArray(52)
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCard: function (card) {
    const cardIndex = Number(card.dataset.index);

    // 背翻正
    if (card.classList.contains("back")) {
      card.classList.remove("back");
      card.innerHTML = this.getCardContent(cardIndex);
      return;
    }

    // 正翻背
    card.classList.add("back");
    card.innerHTML = "";
  },
};

// --- Utilities --- //
const utility = {
  getRandomNumberArray: function (count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index >= 0; index--) {
      const randomIndex = Math.trunc(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

// --- EVENT LISTENER --- //
// EL-1 監聽翻牌事件（監聽牌桌）
cardPanel.addEventListener("click", (e) => {
  if (e.target.matches("#card-panel")) return;

  if (e.target.matches(".card")) {
    view.flipCard(e.target);
    return;
  }

  if (e.target.matches(".for-card-EL")) {
    view.flipCard(e.target.parentElement);
  }
});

// --- EXECUTE --- //
view.renderCards();

// // EL-1 監聽翻牌事件（監聽每張牌）
// document.querySelectorAll(".card").forEach((card) => {
//   card.addEventListener("click", (e) => {
//     console.log(e.target);
//     view.flipCard(card);
//   });
// });
