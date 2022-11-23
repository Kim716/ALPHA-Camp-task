"use strict";
// 遊戲狀態 //
// 運用Object.freeze()讓括號內的物件被凍結，防止物件內容、屬性、原型被修改
// 為淺凍結
const GAME_STATE = Object.freeze({
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
});

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

  // 判斷兩張牌是否配對成功（餘數一樣，就是不同花色同個數字）回傳 Boolean
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
  restartBtn: document.querySelector(".restart-btn"),

  // 製作特殊數字牌
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

  // 根據傳入的數字製造卡牌 html
  getCardContent: function (index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.trunc(index / 13)];

    return `
        
        <p class='card-number for-card-EL'>${number}</p>
        <img
          src="${symbol}"
          alt="花色"
          class='for-card-EL'
        />
        <p class='card-number for-card-EL'>${number}</p>
      `;
  },

  // 菱形、愛心數字轉紅 （指定抽到的那張牌）
  turnRedCard: function (card, index) {
    if (index > 12 && index < 39) {
      card
        .querySelectorAll(".card-number")
        .forEach((num) => num.classList.add("red"));
    }
  },

  // 製作出 card div （背面時只需要它）
  getCardElement: function (index) {
    return `<div class="card back" data-index='${index}'></div>`;
  },

  // 收到亂數陣列，製作 card div 陣列，利用.join() 塞入 innerHTML
  displayCards: function (indexes) {
    this.cardPanel.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  // 翻牌
  flipCards: function (...cards) {
    cards.forEach((card) => {
      const cardIndex = Number(card.dataset.index);
      // 背翻正：呈現資訊
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(cardIndex);
        this.turnRedCard(card, cardIndex);
        return;
      }

      // 正翻背：有牌背花色，清空資訊
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

  // 錯誤時的動畫
  appendWrongAnimation: function (...cards) {
    cards.forEach((card) => {
      card.classList.add("wrong");
      // 在動畫結束時把動畫的class移除，不然就只能播一次
      card.addEventListener(
        "animationend",
        (e) => {
          e.target.classList.remove("wrong");
        },
        // 為了避免一直掛上監聽器吃效能，這個監聽器只用一次就會被刪掉，預設為false
        { once: true }
      );
    });
  },

  // 遊戲結束：創建div，放入結束資訊，成為body中第一個元素
  showGameFinished: function () {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `<p>🎊 Complete! 🎊</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`;
    document.querySelector("body").prepend(div);
  },
};

// --- Utilities --- //
// 別人寫好的演算法模組
const utility = {
  // Fisher-Yates Shuffle
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
          // 成功時更改狀態，產生成功樣式、清空翻牌資訊、加分、判斷結束了嗎、回到等待翻開第一張卡階段
          this.currentState = GAME_STATE.CardsMatched;
          view.pairedCards(...model.revealedCards);
          model.revealedCards = [];
          view.renderScore((model.score += 10));
          // 如果全部翻完，遊戲狀態為結束，跑出結束畫面
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 失敗時時更改狀態，失敗動畫、隔一秒翻回去、清空翻牌資訊、回到等待翻開第一張卡階段
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
  },

  // 回到狀態一的設置繼續遊戲
  resetCards: function () {
    view.flipCards(...model.revealedCards);
    model.revealedCards = []; // 要擺在settimeout裡面，不然擺外面會先清空，就翻不到牌
    controller.currentState = GAME_STATE.FirstCardAwaits; // 這裡如果用 this，它不會指向controller，而是指向 window，因為是setTimeout呼叫他，而setTimeout是瀏覽器提供的函式？ // 要在setTimeout中，不然沒跑完動畫就可以一直點，會出現不對的畫面
  },

  // 重新開始遊戲
  restartGame: function () {
    // 清空分數
    model.score = 0;
    view.renderScore(model.score);
    // 清空次數
    model.triedTimes = 0;
    view.renderTriedTimes(model.triedTimes);
    // 如果是在結束時 restart 才需要移調畫面
    const completedView = document.querySelector(".completed");
    if (completedView) completedView.remove();
    // 重新洗牌，會被監聽器呼叫，所以要用controller
    controller.renderCards();
    // 更改遊戲狀態
    controller.currentState = GAME_STATE.FirstCardAwaits;
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
  // 點擊到數字或圖案時，但因為遊戲有自動翻背設計，所以不會需要它來翻回背面
  // if (e.target.matches(".for-card-EL")) {
  //   controller.dispatchCardAction(e.target.parentElement);
  // }
});

// EL-2 監聽重新按鈕
view.restartBtn.addEventListener("click", controller.restartGame);

// --- EXECUTE --- //
controller.renderCards();

// // EL-1 監聽翻牌事件（監聽每張牌）
// document.querySelectorAll(".card").forEach((card) => {
//   card.addEventListener("click", (e) => {
//     console.log(e.target);
//     view.flipCard(card);
//   });
// });
