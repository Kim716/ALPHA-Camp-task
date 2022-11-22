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

  generateCardHTML: function (index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.trunc(index / 13)];
    return `<div class="card">
        <p>${number}</p>
        <img
          src="${symbol}"
          alt="花色"
        />
        <p>${number}</p>
      </div>`;
  },

  renderCards: function () {
    cardPanel.innerHTML = utility
      .getRandomNumberArray(52)
      .map((index) => this.generateCardHTML(index))
      .join("");
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

view.renderCards();
