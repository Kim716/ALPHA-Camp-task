"use strict";
const GAME_STATE = Object.freeze({
  AwaitFirstPlayer: "AwaitFirstPlayer",
  AwaitSecondPlayer: "AwaitSecondPlayer",
  PlayerWon: "PlayerWon",
  GameDraw: "GameDraw",
});

const model = {
  // 紀錄兩位玩家下載哪一格
  firstPlayerRecord: [],
  secondPlayerRecord: [],
  // 還能下棋的陣列
  emptyPosition: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  winPattern: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ],
};

const view = {
  table: document.querySelector("#app table"),

  // 畫圈圈叉叉，寫成一個簡潔很多！
  draw: function (cell, shape) {
    cell.innerHTML = `<div class='${shape}' />`;
  },
};

const controller = {
  currentStage: GAME_STATE.AwaitFirstPlayer,

  dispatchAction: function (cell) {
    const index = Number(cell.dataset.index);

    switch (this.currentStage) {
      // 圈圈先發，點擊放圈圈、狀態換另一個人放叉叉
      case GAME_STATE.AwaitFirstPlayer:
        view.draw(cell, "circle");
        this.currentStage = GAME_STATE.AwaitSecondPlayer;
        break;
      // 叉叉後發，點擊放插插、狀態回到第一人
      case GAME_STATE.AwaitSecondPlayer:
        view.draw(cell, "cross");
        this.currentStage = GAME_STATE.AwaitFirstPlayer;
        break;
    }
  },
};

view.table.addEventListener("click", function onTableClicked(e) {
  // 不是點在格子內的就直接return
  if (e.target.tagName !== "TD") {
    return;
  }

  controller.dispatchAction(e.target);
});
