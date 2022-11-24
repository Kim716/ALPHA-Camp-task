"use strict";
const GAME_STATE = Object.freeze({
  AwaitFirstPlayer: "AwaitFirstPlayer",
  AwaitSecondPlayer: "AwaitSecondPlayer",
  PlayerWin: "PlayerWin",
  GameDraw: "GameDraw",
});

const model = {
  // 紀錄兩位玩家下載哪一格
  firstPlayerRecord: [],
  secondPlayerRecord: [],
  // 還能下棋的陣列
  emptyPosition: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  winPatterns: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ],

  isPlayerWin: function (stepsRecords) {
    // 檢查每個可能獲勝的步法
    for (const line of this.winPatterns) {
      // 當檢查到有玩家現階段的步法符合其中一個，就回傳 true（有人獲勝）
      // every 是代表陣列中的每個項目都符合判斷式時回傳true ，否則就會變成false
      if (line.every((step) => stepsRecords.includes(step))) {
        return true;
      }
    }
    // 沒有獲勝的步法存在
    return false;
  },
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
    const removeIndex = model.emptyPosition.indexOf(index);

    switch (this.currentStage) {
      // 圈圈先發，點擊放圈圈、紀錄此玩家下的、狀態換另一個人放叉叉
      case GAME_STATE.AwaitFirstPlayer:
        view.draw(cell, "circle");
        model.firstPlayerRecord.push(index);
        // TODO 以下判斷應該可以重構
        model.emptyPosition.splice(removeIndex, 1);
        // TODO 以下判斷應該可以重構
        if (model.isPlayerWin(model.firstPlayerRecord)) {
          this.currentStage = GAME_STATE.PlayerWin;
          setTimeout(() => alert("circle win!"), 100); // 先有畫面才跳alert
          return;
        }
        this.currentStage = GAME_STATE.AwaitSecondPlayer;
        break;
      // 叉叉後發，點擊放插插、狀態回到第一人
      case GAME_STATE.AwaitSecondPlayer:
        view.draw(cell, "cross");
        model.secondPlayerRecord.push(index);
        // TODO 以下判斷應該可以重構
        model.emptyPosition.splice(removeIndex, 1);
        // TODO 以下判斷應該可以重構
        if (model.isPlayerWin(model.firstPlayerRecord)) {
          this.currentStage = GAME_STATE.PlayerWin;
          setTimeout(() => alert("cross win!"), 100); // 先有畫面才跳alert
          return;
        }
        this.currentStage = GAME_STATE.AwaitFirstPlayer;
        break;
    }

    if (model.emptyPosition.length === 0) {
      setTimeout(() => alert("Draw!"), 100);
    }
    console.log(model.emptyPosition);
  },
};

view.table.addEventListener("click", function onTableClicked(e) {
  // 不是點在格子內的就直接return
  if (e.target.tagName !== "TD") {
    return;
  }

  controller.dispatchAction(e.target);
});
