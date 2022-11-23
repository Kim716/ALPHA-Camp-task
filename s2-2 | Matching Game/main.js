"use strict";
// 遊戲狀態 //
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

// --- DATA --- //
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

// --- Model 管理資料 --- //
const model = {
  // 分數、嘗試次數
  score: 0,
  triedTimes: 0,

  // 被翻開的卡片資料
  revealedCards: [],

  // 判斷兩張牌是否配對成功（餘數一樣，就是不同花色同個數字）
  isRevealedCardsMatches: function () {
    return (
      Number(this.revealedCards[0].dataset.index) % 13 ===
      Number(this.revealedCards[1].dataset.index) % 13
    );
  },
};

// --- View --- //
const view = {
  cardPanel: document.querySelector("#card-panel"),

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

  displayCards: function (indexes) {
    this.cardPanel.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCards: function (...cards) {
    cards.forEach((card) => {
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
    });
  },

  // 配對成功 (這裡是 rest pattern 把傳進來的多個參數包成陣列)
  pairedCards: function (...cards) {
    cards.forEach((card) => {
      card.classList.add("paired");
    });
  },

  // 修改分數
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  // 修改次數
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
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

// --- Controller --- //
const controller = {
  // 目前遊戲狀態
  currentState: GAME_STATE.FirstCardAwaits,

  // controller 會啟動遊戲的初始化，所以發牌由它呼叫
  renderCards: function () {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  // 根據遊戲狀態派發工作
  dispatchCardAction: function (card) {
    // 被點擊的card如果已經是正面，就不能再執行下去
    if (!card.classList.contains("back")) {
      return;
    }

    switch (this.currentState) {
      // 在等待翻開第一張卡的階段，點擊卡片卡會被翻開、資料會被塞入這張牌的資訊、遊戲狀態進入等待第二張牌
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      // 等待翻開第二張卡的階段，點擊卡片嘗試次數+1、卡會被翻開、資料會被塞入這張牌的資訊、判斷兩張卡牌
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        if (model.isRevealedCardsMatches()) {
          // 成功時更改狀態，產生成功樣式、清空翻牌資訊、加分、回到等待翻開第一張卡階段
          this.currentState = GAME_STATE.CardsMatched;
          view.pairedCards(...model.revealedCards);
          model.revealedCards = [];
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 失敗時時更改狀態，隔一秒翻回去、清空翻牌資訊、回到等待翻開第一張卡階段
          this.currentState = GAME_STATE.CardsMatchFailed;
          setTimeout(this.resetCards, 1000);
        }
        break;
      case GAME_STATE.CardsMatched:
        break;
    }
  },

  // 回到狀態一繼續遊戲
  resetCards: function () {
    view.flipCards(...model.revealedCards);
    model.revealedCards = []; // 要擺在settimeout裡面，不然擺外面會先清空，就翻不到牌
    controller.currentState = GAME_STATE.FirstCardAwaits; // 這裡如果用 this，它不會指向controller，而是指向 window，因為是setTimeout呼叫他，而setTimeout是瀏覽器提供的函式？
  },
};

// --- EVENT LISTENER --- //
// EL-1 監聽翻牌事件（監聽牌桌）
view.cardPanel.addEventListener("click", (e) => {
  if (e.target.matches("#card-panel")) return;

  if (e.target.matches(".card")) {
    controller.dispatchCardAction(e.target);
    return;
  }

  if (e.target.matches(".for-card-EL")) {
    controller.dispatchCardAction(e.target.parentElement);
  }
});

// --- EXECUTE --- //
controller.renderCards();

// // EL-1 監聽翻牌事件（監聽每張牌）
// document.querySelectorAll(".card").forEach((card) => {
//   card.addEventListener("click", (e) => {
//     console.log(e.target);
//     view.flipCard(card);
//   });
// });
