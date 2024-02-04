import * as impNav from "../navigation.js";
import * as authinterface from "../authinterface.js";
import * as impHttp from "../http.js";
import * as impAudio from "../audio.js";
import * as impLocalization from "../localize.js";

import * as forgotPass from "../../../changePassword/forgotPasswordReq.js";
import * as time from "../time.js";
import { API_URL_PART, IS_HOSTED_STATIC } from "../config.js";
import { getDominoRoomBetInfo } from "../domino/domino-navigation.js";

// 100 предупреждения
// 200 выиграш
// 300 проиграш
// 400 ошибка в игре
// 500 анонс

const isPopupOpened = () => {
  return document.querySelector(".popup") ? true : false;
};

export const open = (text, status, showButton = false, ws = null) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "default-popup");
  popupElement.innerHTML = `<div class="popup__body">
  <div class="popup__content ${status === 200 ? "popup__content_won" : ""} ${
    status === 300 ? "popup__content_lost" : ""
  }">
    <button class="popup__close"></button>
    <div class="popup__text ${status === 400 ? "popup__text-red" : ""}">
      ${text}
    </div>
    ${
      showButton
        ? `<button class="popup__button">${siteLanguage.profilePage.myGamesPage.statsItem.continueText}</button>`
        : ""
    }
  </div>
</div>`;

  body.appendChild(popupElement);

  if (showButton) {
    const button = body.querySelector(".popup__button");
    button.addEventListener("click", () => {
      close(popupElement);
      ws.close(
        1000,
        JSON.stringify({
          method: "exitGame",
          userId: localUser.userId,
          page: "mainLotoPage",
        })
      );
    });
  }
  const closeButton = document.querySelector(".popup__close");
  closeButton.addEventListener("click", function () {
    close(popupElement);
  });
};

export const openForgotPassPopup = () => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "changePasswordPopup");
  popupElement.innerHTML = `
  <div class="popup__content">
    <div class="popup__header">
      <button class="popup__close"></button>
    </div>
    <h2 class="popup__title">${siteLanguage.popups.dropPasswordTitle}</h2>  
    <p class="popup__text">${siteLanguage.popups.dropPasswordText}</p>
    <input
      class="change-password-mail-input"
      type="email"
      name=""
      id=""
      placeholder="${siteLanguage.popups.dropPasswordPlaceholder}"
    />
    <p class="popup__text-error"></p>
    <button class="popup__button">${siteLanguage.popups.dropPasswordSend}</button>
  </div>
`;

  body.appendChild(popupElement);

  const closeButton = document.querySelector(".popup__close");
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      close(popupElement);
    });
  }

  const submitButton = document.querySelector(".popup__button");
  if (submitButton) {
    submitButton.addEventListener("click", async function () {
      await forgotPass.sendMailRequest();
    });
  }
};

export const openErorPopup = (text, reload = false, hash = null) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "error-popup");
  popupElement.innerHTML = `<div class="popup__body">
  <div class="popup__content">
    <div class="popup-header">
      <p>${siteLanguage.profilePage.myGamesPage.statsItem.errorText}</p>
      <img src="img/error-icon.png" alt="" />
    </div>
    <div class="popup__text">
      ${text}
    </div>
    <button class="popup__button">${siteLanguage.profilePage.myGamesPage.statsItem.closeText}</button>
  </div>
</div>`;

  body.appendChild(popupElement);

  const closeButton = document.querySelector(".popup__button");
  closeButton.addEventListener("click", function () {
    close(popupElement);
    if (reload == true) {
      if (hash) {
        location.hash = hash;
      } else {
        location.hash = "#gamemode-choose";
      }
    }
  });
};

export const openConnectionErorPopup = (text) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "error-popup");
  popupElement.innerHTML = `<div class="popup__body">
  <div class="popup__content">
    <div class="popup-header">
      <p>${siteLanguage.profilePage.myGamesPage.statsItem.errorText}</p>
      <img src="img/error-icon.png" alt="" />
    </div>
    <div class="popup__text">
      ${text}
    </div>
    <button class="popup__button">${siteLanguage.words.reload}</button>
  </div>
</div>`;

  body.appendChild(popupElement);

  const closeButton = document.querySelector(".popup__button");
  closeButton.addEventListener("click", function () {
    window.ws = null;
    location.reload();
  });
};

export function close(element) {
  element.remove();
}

export const openAnotherAccountEnterPopup = (ws) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup");
  popupElement.innerHTML = `
  <div class="popup__body another-account-popup">
  <div class="popup__content">
    <div class="popup__img">
      <img src="img/popup-alert.png" alt="" />
    </div>
    <div class="popup__text">
      ${siteLanguage.popups.anotherAccountEnter}
    </div>
    <div class="popup__buttons">
      <button class="popup__button popup__submit-button">${siteLanguage.profilePage.myGamesPage.statsItem.understandText}</button>
    </div>
  </div>
</div>`;

  body.appendChild(popupElement);

  const button = body.querySelector(".popup__submit-button");
  button.addEventListener("click", async () => {
    close(popupElement);
    location.reload();
  });
};

export const openSuuccessBonusesChange = (ws) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup");
  popupElement.innerHTML = `
    <div class="popup__body success-bonuses-change-popup">
      <div class="popup__content">
        
        <div class="popup__text">
          ${siteLanguage.popups.bonusesSuccess}
        </div>
        <div class="popup__buttons">
          <button class="popup__button popup__submit-button">${siteLanguage.words.ok}</button>
        </div>
      </div>
    </div>`;
  body.appendChild(popupElement);

  const button = body.querySelector(".popup__submit-button");
  button.addEventListener("click", async () => {
    close(popupElement);
  });
};

export const openExitPopup = (text, roomId, bet = null) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup");
  popupElement.innerHTML = `
  <div class="popup__body exit-room-popup">
  <div class="popup__content">
    <div class="popup__img">
      <img src="img/popup-alert.png" alt="" />
    </div>
    <div class="popup__text">
      ${text}
    </div>
    <div class="popup__buttons">
      <button class="popup__button popup__submit-button red">${siteLanguage.words.yes}</button>
      <button class="popup__button close-popup green">${siteLanguage.words.no}</button>
    </div>
  </div>
</div>`;

  body.appendChild(popupElement);

  const button = body.querySelector(".popup__submit-button");
  button.addEventListener("click", async () => {
    close(popupElement);

    let user = localStorage.getItem("user");
    if (user) {
      user = JSON.parse(user);
    } else return;

    let ws = window.ws;
    let closeMsg = {
      reason: "rejectGameBet",
      method: "rejectGameBet",
      roomId: roomId,
      bet: bet,
      userId: user.userId,
    };
    ws.send(JSON.stringify(closeMsg));

    // let responce = await impHttp.deleteTicketsReturnBalance(roomId, bet);
    // if (responce.status == 200) {
    //   authinterface.updateBalance(responce.data.balance);
    //   location.hash = "";
    // } else {
    //   open("Ошибка выхода из игры", 300);
    // }
    // responce.data.balance
  });

  const closeButtons = document.querySelectorAll(".close-popup");
  closeButtons.forEach((closeButton) => {
    closeButton.addEventListener("click", function () {
      close(popupElement);
    });
  });
};

export const openEndGamePopup = (
  title,
  status,
  winnersData,
  bank,
  isJackpotWon,
  jackpotData
) => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  //status
  //200 - ok
  //400 - error
  let wonSum = bank / winnersData.length;

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "end-game-popup");

  popupElement.innerHTML = `
  <div class="popup__body end-game-popup__body">
  <div class="popup__content end-game-popup__content">
    <button class="popup__close-timer close-popup-timer">0</button>
    <div class="popup__title end-game-popup__title">
      ${title}
    </div>
    
      <div class="popup__text end-game-popup__text">
        ${siteLanguage.popups.endGamePopupDescr}:
      </div>
      <div class="end-game-popup__winners-wrapper">
        <div class="end-game-popup__winners end-game-winners">
          
        </div>
      </div>
    </div>
    </div>
    `;

  // вставляем победителей и их билеты

  let winnersBody = popupElement.querySelector(".end-game-winners");
  winnersData.forEach((winnerData) => {
    let winnerItem = document.createElement("div");
    winnerItem.classList.add("end-game-winners__item");

    let winnerItemHeader = document.createElement("div");
    winnerItemHeader.classList.add("end-game-winners__item-header");

    let winnerItemName = document.createElement("div");
    winnerItemName.classList.add("end-game-winners__item-name");
    winnerItemName.innerHTML = `${winnerData.userName}`;

    let winnerItemWon = document.createElement("div");
    winnerItemWon.classList.add("end-game-winners__item-won");
    winnerItemWon.innerHTML = `${wonSum.toFixed(2)}₼`;

    winnerItemHeader.appendChild(winnerItemName);
    winnerItemHeader.appendChild(winnerItemWon);
    winnerItem.appendChild(winnerItemHeader);

    winnerData.cards.forEach((card) => {
      let ticket = document.createElement("div");
      ticket.classList.add("end-game-winners__item-ticket");

      card.forEach((cellNumber) => {
        let cellItem = document.createElement("div");
        cellItem.classList.add("end-game-winners__item-ticket-cell");
        let cellNumberItem = document.createElement("div");
        cellNumberItem.classList.add("end-game-winners__item-ticket-number");
        cellNumberItem.innerHTML = cellNumber;
        if (cellNumber != " ") {
          cellItem.classList.add("active");
        }
        cellItem.appendChild(cellNumberItem);
        ticket.appendChild(cellItem);
      });

      winnerItem.appendChild(ticket);
    });
    winnersBody.appendChild(winnerItem);
  });
  // запускаем таймер до следующего переключения на попап

  var timerElement = popupElement.querySelector(".close-popup-timer");

  // Устанавливаем начальное значение таймера
  var seconds = 10;

  // Функция обновления таймера
  function updateTimer() {
    timerElement.textContent = seconds;
    seconds--;
    timerElement.innerHTML = seconds;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      timerElement.innerHTML = 0;
      close(popupElement);
      openJackpotPopup(isJackpotWon, jackpotData);
    }
  }

  var timerInterval = setInterval(updateTimer, 1000);

  body.appendChild(popupElement);
};

function openJackpotPopup(isJackpotWon, jackpotData) {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  if (isJackpotWon) {
    const body = document.querySelector("body");
    let popupElement = document.createElement("div");

    // обновления баланса пользователю
    let localUser = localStorage.getItem("user");
    if (localUser) {
      localUser = JSON.parse(localUser);
      authinterface.updateBalance(+localUser.balance);
    }

    let jackpotWinnerText = siteLanguage.popups.jackpotWonPopup;

    jackpotWinnerText = jackpotWinnerText.replace(
      "JACKPOT_USERNAME",
      jackpotData.jackpotWinnerName
    );

    popupElement.classList.add("popup", "jackpot-popup");
    popupElement.innerHTML = `
    <div class="popup__body jackpot-popup__body">
      <div class="popup__content jackpot-popup__content">
        <div class="jackpot-popup__jackpot-img">
          <img src="img/jackpot-text.png" alt="" />
        </div>
        <div class="jackpot-popup__jackpot animation"><span>${jackpotData.jackpotSum}</span>₼</div>
        <div class="popup__title jackpot-popup__title visible">
        ${jackpotWinnerText}
        </div>
      </div>
    </div>
      `;
    body.appendChild(popupElement);
    setTimeout(() => {
      close(popupElement);
    }, 11000);
  } else {
    const body = document.querySelector("body");
    let popupElement = document.createElement("div");
    popupElement.classList.add("popup", "jackpot-popup");
    popupElement.innerHTML = `
    <div class="popup__body jackpot-popup__body">
    <div class="popup__content jackpot-popup__content">
      <div class="jackpot-popup__jackpot-img">
        <img src="img/jackpot-text.png" alt="" />
      </div>
      <div class="jackpot-popup__jackpot animation"><span>${jackpotData.jackpotSum}</span>₼</div>
      <div class="popup__title jackpot-popup__title visible">
      ${siteLanguage.popups.jackpotLosedPopup}
      </div>
    </div>
  </div>
      `;
    body.appendChild(popupElement);
    setTimeout(() => {
      close(popupElement);
    }, 11000);
  }
}

export function openJackpotInfoPopup() {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "jackpot-popup");
  popupElement.innerHTML = `
  <div class="popup__body jackpot-info-popup">
    <div class="popup__content">
      <div class="popup__text">
      ${siteLanguage.popups.jackpotInfoPopup}
      </div>
      <img src="img/jackpot-info-image.png" class="jackpot-popup-image">
      <div class="popup-button__gotit"> ${siteLanguage.profilePage.myGamesPage.statsItem.understandText}</div>
    </div>
  </div>
      `;

  let gotItBtn = popupElement.querySelector(".popup-button__gotit");
  gotItBtn.addEventListener("click", function () {
    close(popupElement);
  });

  body.appendChild(popupElement);
}

export function openInfoTokensPopup() {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "jackpot-popup");
  popupElement.innerHTML = `
  <div class="popup__body jackpot-info-popup">
    <div class="popup__content">
      <div class="popup__text popup__text-bold">
      ${siteLanguage.popups.statsInfoPopup}

      </div>
      <div class="tokens-popup-table">
        <div class="tokens-popup-table__item">
          <div class="tokens-table-item-left">
            <img class="tokens-popup-left-image" src="img/money-arm.png" width="40" alt="icon">
            <p class="tokens-popup-left-text">
              0.20 ₼
            </p>
          </div>
          <div class="tokens-table-item-right">
            <p class="tokens-popup-right-text">
              2 coin
            </p>
            <img class="tokens-popup-right-image" src="img/room-tokens-decor.png" alt="icon">
          </div>
        </div>

        <div class="tokens-popup-table__item">
          <div class="tokens-table-item-left">
            <img class="tokens-popup-left-image" src="img/money-arm.png" width="40" alt="icon">
            <p class="tokens-popup-left-text">
              0.50 ₼
            </p>
          </div>
          <div class="tokens-table-item-right">
            <p class="tokens-popup-right-text">
              5 coin
            </p>
            <img class="tokens-popup-right-image" src="img/room-tokens-decor.png" alt="icon">
          </div>
        </div>

        <div class="tokens-popup-table__item">
          <div class="tokens-table-item-left">
            <img class="tokens-popup-left-image" src="img/money-arm.png" width="40" alt="icon">
            <p class="tokens-popup-left-text">
              1.00 ₼
            </p>
          </div>

          <div class="tokens-table-item-right">
            <p class="tokens-popup-right-text">
              10 coin
            </p>
            <img class="tokens-popup-right-image" src="img/room-tokens-decor.png" alt="icon">
          </div>
        </div>

        <div class="tokens-popup-table__item">
          <div class="tokens-table-item-left">
            <img class="tokens-popup-left-image" src="img/money-arm.png" width="40" alt="icon">
            <p class="tokens-popup-left-text">
              5.00 ₼
            </p>
          </div>
          <div class="tokens-table-item-right">
            <p class="tokens-popup-right-text">
              50 coin
            </p>
            <img class="tokens-popup-right-image" src="img/room-tokens-decor.png" alt="icon">
          </div>
        </div>

        <div class="tokens-popup-table__item">
          <div class="tokens-table-item-left">
            <img class="tokens-popup-left-image" src="img/money-arm.png" width="40" alt="icon">
            <p class="tokens-popup-left-text">
              10.00 ₼
            </p>
          </div>
          <div class="tokens-table-item-right">
            <p class="tokens-popup-right-text">
              100 coin
            </p>
            <img class="tokens-popup-right-image" src="img/room-tokens-decor.png" alt="icon">
          </div>
        </div>
      </div>
      <div class="popup-button__gotit">${siteLanguage.profilePage.myGamesPage.statsItem.understandText}</div>
    </div>
  </div>
  `;

  let gotItBtn = popupElement.querySelector(".popup-button__gotit");
  gotItBtn.addEventListener("click", function () {
    close(popupElement);
  });

  body.appendChild(popupElement);
}

export function openChangeLanguage() {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "change-language-popup");
  popupElement.innerHTML = `
  <div class="popup__body change-language-popup">
  <div class="popup__content language-popup-content">
    <div class="change-language-popup__buttons">
      <button lang="ru" class="language-popup__button">Русский</button>
      <button lang="UA" class="language-popup__button">Українська</button>
      <button lang="AZ" class="language-popup__button">Azərbaycan dili</button>
      <button lang="TR" class="language-popup__button">Türkçe</button>
      <button lang="EN" class="language-popup__button">English</button>
    </div>
  </div>
  `;

  const languageButtons = popupElement.querySelectorAll(
    ".language-popup__button"
  );
  languageButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      let lang = button.getAttribute("lang");
      localStorage.setItem("language", lang);
      let siteLanguage = await impLocalization.getCurrentSiteLang();
      window.siteLanguage = siteLanguage;
      impAudio.setLanguage(lang);
      impLocalization.translateMainPage();
      impLocalization.translateProfilePage();

      const languageText = document.querySelector(
        ".select-language__text span"
      );
      if (languageText) {
        languageText.innerHTML = button.innerHTML;
      }
      impLocalization.translateAuthPage();

      close(popupElement);
    });
  });

  body.appendChild(popupElement);
}

export const openDominoWaitingPopup = async (
  online,
  dominoRoomId,
  tableId,
  playerMode,
  gameMode,
  startTime,
  players
) => {
  if (isPopupOpened()) {
    return;
  }
  const siteLanguage = window.siteLanguage;

  const { bet } = getDominoRoomBetInfo(dominoRoomId);

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "domino-waiting-popup-wrapper");
  popupElement.innerHTML = `
  <div class="popup__body">
  <div
    class="popup__content domino-waiting-popup"
    roomId="${dominoRoomId}"
    tableId="${tableId}"
    playerMode="${playerMode}"
    gameMode="${gameMode}"
  >
    <div class="popup__header">
      <div class="popup__timer">
        <img src="img/timer-icon.png" alt="timer" />
        <span class="domino-waiting-popup__timer">00:00</span>
      </div>
      <p class="domino-waiting-popup-bet">${bet.toFixed(2)} ₼</p>
    </div>
    <div class="popup__text domino-waiting-popup__text">
      <div class="domino-waiting-popup-avatars"></div>
      <p>${siteLanguage.popups.findingPlayers}</p>
      <div class="game-mode-banner">
        <p>
          ${siteLanguage.popups.gameLable}: <span class="game">${
    gameMode == "CLASSIC"
      ? siteLanguage.popups.classicMode
      : siteLanguage.popups.telephoneMode
  }</span> <span class="players">${playerMode}</span> ${
    siteLanguage.popups.playersLable
  }
        </p>
      </div>
    </div>
    <div
      style="
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      "
    >
      <button
        class="domino-waiting-popup__button domino-waiting-popup__button-room"
      >
        ${siteLanguage.popups.leaveRoom}
      </button>
      <button
        class="domino-waiting-popup__button domino-waiting-popup__button-games"
      >
        ${siteLanguage.popups.leaveToGameMenu}
      </button>
    </div>
  </div>
</div>
  `;

  const avatarsBlock = popupElement.querySelector(
    ".domino-waiting-popup-avatars"
  );

  avatarsBlock.innerHTML = "";

  for (let i = 1; i <= playerMode; i++) {
    avatarsBlock.innerHTML += `
      <div class="domino-waiting-popup-avatar-wrapper"> 
      <div class="domino-waiting-popup-avatar loading" slot="${i}">
      </div>
	  <p class="domino-waiting-popup-avatar__text">Search..
      </div>
      ${i != playerMode ? '<div class="domino-waiting-popup-vs">VS</div>' : ""}
    `;
  }

  // sort players by connectionDate
  players = players.sort((a, b) => a.connectionDate - b.connectionDate);

  // for each player remove loader in slot, add avatar
  players.forEach((player, index) => {
    // const avatarBlock = avatarsBlock.children[index * 2];
    const avatarBlock = avatarsBlock.querySelector(`[slot="${index + 1}"]`);
    avatarBlock.classList.remove("loading");
    avatarBlock.innerHTML = `
      <img src="http${API_URL_PART}${
      (IS_HOSTED_STATIC ? "/static/avatars/" : "/") + player.avatar
    }" alt="">
    `;
  });

  body.appendChild(popupElement);

  let timerTimeout = null;
  // таймер
  const timerBlock = document.querySelector(".domino-waiting-popup__timer");
  // считаем время которое прошло, startTime - время начала ожидания

  const targetTime = new Date(startTime).getTime();
  let nowClientTime = await time.NowClientTime();

  let distance = nowClientTime - targetTime;

  timerTimeout = setInterval(async () => {
    distance += 200;

    const minutes = Math.floor(distance / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Add leading zeros for formatting
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");
    if (timerBlock) {
      timerBlock.innerHTML = `${formattedMinutes}:${formattedSeconds}`;
    }
  }, 200);

  // кнопки выхода
  const quitWainingButton = popupElement.querySelector(
    ".domino-waiting-popup__button-room"
  );

  const quitWaitingToGamesButton = popupElement.querySelector(
    ".domino-waiting-popup__button-games"
  );

  quitWainingButton.addEventListener("click", function () {
    let websocket = window.ws;

    try {
      websocket.send(
        JSON.stringify({
          method: "leaveDominoTable",
          dominoRoomId,
          tableId,
          playerMode,
          gameMode,
          userId: +JSON.parse(localStorage.getItem("user")).userId,
        })
      );
    } catch {
      impPopup.openErorPopup(siteLanguage.popups.connectionErrorText);
      setTimeout(() => location.reload(), 3000);
    }
    let localUser = localStorage.getItem("user");
    localUser = JSON.parse(localUser);

    // make gamemode to be titled
    gameMode = gameMode.split("")[0] + gameMode.toLowerCase().slice(1);

    if (websocket && websocket.readyState == 1) {
      // // console.log("close ws");
      clearInterval(timerTimeout);
      websocket.close(
        3001,
        JSON.stringify({
          userId: localUser.userId,
          username: localUser.username,
          method: "disconnectGame",
          page: `domino${gameMode}Page${playerMode == 4 ? "4" : ""}`,
        })
      );
    }
    close(popupElement);
  });

  quitWaitingToGamesButton.addEventListener("click", function () {
    let websocket = window.ws;
    try {
      websocket.send(
        JSON.stringify({
          method: "leaveDominoTable",
          dominoRoomId,
          tableId,
          playerMode,
          gameMode,
          userId: +JSON.parse(localStorage.getItem("user")).userId,
        })
      );
    } catch {
      impPopup.openErorPopup(siteLanguage.popups.connectionErrorText);
      setTimeout(() => location.reload(), 3000);
    }
    let localUser = localStorage.getItem("user");
    localUser = JSON.parse(localUser);

    if (websocket && websocket.readyState == 1) {
      // // console.log("close ws");
      clearInterval(timerTimeout);

      websocket.close(
        3001,
        JSON.stringify({
          userId: localUser.userId,
          username: localUser.username,
          method: "disconnectGame",
          page: "mainPage",
        })
      );
    }

    close(popupElement);
  });
};

export const updateDominoWaitingPopup = (online, players, playerMode) => {
  const onlineElement = document.querySelector(".domino-waiting-popup__online");
  if (onlineElement) {
    onlineElement.innerHTML = online;
  }

  const avatarsBlock = document.querySelector(".domino-waiting-popup-avatars");

  avatarsBlock.innerHTML = "";

  for (let i = 1; i <= playerMode; i++) {
    avatarsBlock.innerHTML += `
      <div class="domino-waiting-popup-avatar loading" slot="${i}">
      </div>
      ${i != playerMode ? '<div class="domino-waiting-popup-vs">VS</div>' : ""}
    `;
  }

  // sort players by connectionDate
  players = players.sort((a, b) => a.connectionDate - b.connectionDate);

  players.forEach((player, index) => {
    const avatarBlock = avatarsBlock.querySelector(`[slot="${index + 1}"]`);
    avatarBlock.classList.remove("loading");
    avatarBlock.innerHTML = `
      <img src="http${API_URL_PART}${
      (IS_HOSTED_STATIC ? "/static/avatars/" : "/") + player.avatar
    }" alt="">
    `;
  });
};

export const openDominoTimerPopup = (msg) => {
  const siteLanguage = window.siteLanguage;
  const prevPopup = document.querySelector(".popup");
  if (prevPopup) {
    prevPopup.remove();
  }

  if (isPopupOpened()) {
    return;
  }

  let playerMode, dominoRoomId, tableId;

  dominoRoomId = msg.dominoRoomId;
  tableId = msg.tableId;
  playerMode = msg.playerMode;
  const { bet } = getDominoRoomBetInfo(dominoRoomId);

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup");
  popupElement.innerHTML = `
      <div class="popup__body">
        <div class="popup__content domino-starting-popup">
          <div class="popup__header">
          <p class="domino-waiting-popup-bet">${bet.toFixed(2)} ₼</p>
          </div>
          <div class="domino-waiting-popup-avatars">
          
          </div>
          <div class="popup__text domino-starting-popup__text">
            <p>${siteLanguage.popups.startGameWaiting}</p>
          </div>
          <div class="popup__timer">
            <span class="domino-starting-popup__timer">5</span>
        </div>
        </div>
      </div>
  `;

  const timerElement = popupElement.querySelector(
    ".domino-starting-popup__timer"
  );

  const avatarsBlock = popupElement.querySelector(
    ".domino-waiting-popup-avatars"
  );

  avatarsBlock.innerHTML = "";

  for (let i = 1; i <= playerMode; i++) {
    avatarsBlock.innerHTML += `
      <div class="domino-waiting-popup-avatar loading" slot="${i}">
      </div>
      ${i != playerMode ? '<div class="domino-waiting-popup-vs">VS</div>' : ""}
    `;
  }
  let players = msg.players;
  players.forEach((player, index) => {
    const avatarBlock = avatarsBlock.querySelector(`[slot="${index + 1}"]`);
    avatarBlock.classList.remove("loading");
    avatarBlock.innerHTML = `
      <img src="http${API_URL_PART}${
      (IS_HOSTED_STATIC ? "/static/avatars/" : "/") + player.avatar
    }" alt="">
    `;
  });

  //`00:${
  // timeLeft < 10
  let timeLeft = 5; //Kamal loto dashinin cixma vaxti
  //let timeLeft = 1000;

  const timerInterval = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      close(popupElement);
    } else {
      timerElement.innerHTML = `${timeLeft < 5 ? "" + timeLeft : timeLeft}`;
    }
  }, 1000);

  body.appendChild(popupElement);
};

export const openDominoWinGame = (winners, playersTiles, prize = null) => {
  const siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    const popups = document.querySelectorAll(".popup");
    if (popups) {
      popups.forEach((popup) => {
        popup.remove();
      });
    }
  }

  const main = document.querySelector(".main__container");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup");

  let winnersList = "";
  winners.forEach((winner) => {
    winnersList += `<p class = "domino-win-popup__winner">${winner.username}</p>`;
  });
  popupElement.innerHTML = `
     <div class="popup">
        <div class="popup__body">
          <div class="popup__content domino-win-popup">
            <button class="popup__close-timer close-popup-timer">10</button>
            <img
              class="domino-win-popup__img"
              src="img/domino-winner-image.png"
              alt=""
            />

            <div class="popup__text domino-win-popup__information">
              <div class="domino-win-popup__sum">${
                siteLanguage.profilePage.myGamesPage.statsItem.sumWinText
              } ${prize ? prize : 0} ₼</div>
              <p class="domino-win-popup__title">
                ${siteLanguage.popups.gameFinished}
              </p>
              <p class="domino-win-popup__winners-text">
                ${siteLanguage.popups.winners}
              </p>
              ${winnersList}
            </div>
          </div>
        </div>
      </div>
  `;

  main.appendChild(popupElement);

  let timerElement = popupElement.querySelector(".close-popup-timer");

  // Устанавливаем начальное значение таймера
  let seconds = 10;

  // Функция обновления таймера
  function updateTimer() {
    timerElement.textContent = seconds;
    seconds--;
    timerElement.innerHTML = seconds;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      timerElement.innerHTML = "0";
    }
  }

  let timerInterval = setInterval(updateTimer, 1000);
};

export const openDominoLoseGame = (winners, playersTiles) => {
  const siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    const popups = document.querySelectorAll(".popup");
    if (popups) {
      popups.forEach((popup) => {
        popup.remove();
      });
    }
  }

  const main = document.querySelector(".main__container");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup");

  let winnersList = "";
  winners.forEach((winner) => {
    winnersList += `
      <p class = "domino-win-popup__winner">${winner.username}</p>
    `;
  });

  const gameMode = location.hash
    .split("/")
    [location.hash.split("/").length - 1].toUpperCase();

  popupElement.innerHTML = `
    <div class="popup">
      <div class="popup__body">
        <div class="popup__content domino-lose-popup">
        <button class="popup__close-timer close-popup-timer">10</button>
          <div class="popup__text domino-lose-popup__text">
            <p class = "domino-lose-popup__title">${
              siteLanguage.popups.gameFinished
            }</p>
            <p id="domino-lose-popup-lost" class="domino-lose-popup__title">${
              gameMode == "TELEPHONE"
                ? siteLanguage.popups.youLostPoints
                : siteLanguage.popups.youLost
            }</p>
            <p class="domino-lose-popup__winners domino-lose-popup__winners-text">${
              siteLanguage.popups.winners
            }</p>
            ${winnersList}
            <div class="domino-lose-popup__tiles">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  main.appendChild(popupElement);

  let showPoints = true;
  // if game was finished because of no available turns

  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }

  playersTiles.forEach((playerTiles) => {
    if (playerTiles.tiles.length == 0) {
      showPoints = false;
    }
  });

  const winnersBlock = popupElement.querySelector(
    ".domino-lose-popup__winners"
  );

  // insert before winners block new div
  if (showPoints) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("domino-lose-popup__title");
    if (gameMode == "CLASSIC") {
      newDiv.innerHTML = siteLanguage.popups.youLostMorePoints;
    } else {
      newDiv.innerHTML = siteLanguage.popups.youLostPoints;
    }
    const lostText = document.querySelector("#domino-lose-popup-lost");
    if (lostText) {
      lostText.remove();
    }

    winnersBlock.parentNode.insertBefore(newDiv, winnersBlock);
  }

  formPopupTiles(
    playersTiles,
    popupElement,
    gameMode == "CLASSIC",
    false,
    showPoints
  );

  let timerElement = popupElement.querySelector(".close-popup-timer");

  // Устанавливаем начальное значение таймера
  let seconds = 10;

  // Функция обновления таймера
  function updateTimer() {
    timerElement.textContent = seconds;
    seconds--;
    timerElement.innerHTML = seconds;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      timerElement.innerHTML = "0";
    }
  }

  let timerInterval = setInterval(updateTimer, 1000);
};

const formPopupTiles = (
  playersTiles,
  popupElement,
  isClassic,
  wasRoundFinished = true,
  showPoints = false
) => {
  const siteLanguage = window.siteLanguage;

  const tilesBlock = popupElement.querySelector(".domino-lose-popup__tiles");
  playersTiles.forEach((playerTiles) => {
    // // console.log("playerTiles", playerTiles);
    let playerTilesPoints = 0;

    if (playerTiles.tiles && playerTiles.tiles.length == 1) {
      playerTiles.tiles.forEach((tile) => {
        if (tile.left == 0 && tile.right == 0) {
          playerTilesPoints += 10;
        }
        playerTilesPoints += tile.left + tile.right;
      });
    } else {
      playerTiles.tiles.forEach((tile) => {
        playerTilesPoints += tile.left + tile.right;
      });
    }

    tilesBlock.innerHTML += `
      <div>
        <p style="width:100%;background-color:#fff;height:2px;margin:10px 0;"></p>
          <div style="display:flex;justify-content:space-between;">
            <p>
             <span class="text-gold">${playerTiles.username}</span>.
              ${
                (playerTilesPoints && !isClassic) || showPoints
                  ? siteLanguage.popups.tiles + " " + playerTilesPoints
                  : ""
              }
            </p>
            <p class="domino-lose-popup-score text-gold">
            ${
              !isClassic && playerTiles.score
                ? `
              <span><span class="domino-lose-popup-score-bold">${
                playerTiles.score
              }</span>/165</span>
              <span class="domino-lose-popup-progress-bar">
                <span class="domino-lose-popup-score-progress" style="width: ${Math.round(
                  (playerTiles.score / 165) * 100
                )}%;"></span>
              </span>
            `
                : ""
            }
            </p>
          </div>
      </div>
      <div class="domino-lose-popup__player-tiles domino-lose-popup__player-tiles-${
        playerTiles.userId
      }">
      </div>
    `;
  });

  const tilesContainers = popupElement.querySelectorAll(
    ".domino-lose-popup__player-tiles"
  );

  tilesContainers.forEach((tilesContainer) => {
    const userId = +tilesContainer.classList[1].split("-")[4];
    const playerTiles = playersTiles.find((playerTiles) => {
      return playerTiles.userId == userId;
    });

    if (playerTiles.tiles.length == 0) {
      tilesContainer.innerHTML += `
        <p>${siteLanguage.popups.tilesEnded}</p>
      `;
    }

    playerTiles.tiles.forEach((tile) => {
      tilesContainer.innerHTML += `
      <div class="domino-tile">
        <div class="domino-tile__half domino-dots-${tile.left}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.left)}
        </div>
        <div class="domino-tile__half domino-dots-${tile.right}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.right)}
        </div>
      </div>
      `;
    });
  });
};

export const openFinisedGamePopup = () => {
  const siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    const popups = document.querySelectorAll(".popup");
    if (popups) {
      popups.forEach((popup) => {
        popup.remove();
      });
    }
  }

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "finishedGameAlert-popup");
  popupElement.innerHTML = `

  <div class="popup__body">
    <div class="popup__content domino-finishedGameAlert-popup">
      <div class="popup__header">
        <div class="preloader">
          <div class="lds-ring black">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="popup__text domino-finishedGameAlert-popup__text">
        ${siteLanguage.popups.gameFinishedWait}
      </div>
    </div>
  </div>

  `;

  body.appendChild(popupElement);
};

export const openDominoTelephoneRoundFinishPopup = (
  score,
  username,
  playersScore,
  prevWinnerScore,
  winnerId,
  playersTiles
) => {
  const siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    const popups = document.querySelectorAll(".popup");
    if (popups) {
      popups.forEach((popup) => {
        popup.remove();
      });
    }
  }
  const main = document.querySelector(".main__container");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "telephone-finish-popup");

  setTimeout(() => {
    close(popupElement);
  }, 8000); //Kamal domino telefonda raundlar arasi xali gosteren popup

  const allScoreElements = document.querySelectorAll(".telephone-finish-score");

  let playersScoreList = "";

  playersScore.forEach((playerScore) => {
    if (winnerId == playerScore.userId) {
      playersScoreList += `
        <p userid="${playerScore.userId}">
          <span class="telephone-finish-username">${playerScore.username}</span>: 
          <span class="telephone-finish-score telephone-finish-user-${playerScore.userId}">
            +${score}
          </span>
        </p>
      `;
    }
  });

  popupElement.innerHTML = `
    <div class="popup__body">
      <div class="popup__content">
        <div class="telephone-finish-popup__shaded-text">
          ${siteLanguage.popups.whoWins}
        </div>
        <div class="popup__text domino-lose-popup__text">
          ${siteLanguage.popups.roundResults}
          <br>
          ${playersScoreList}
          <div class="domino-lose-popup__tiles">
          </div>
        </div>
      </div>
    </div>
  `;

  main.appendChild(popupElement);

  formPopupTiles(playersTiles, popupElement);

  const winnerScoreElement = document.querySelector(
    `.telephone-finish-user-${winnerId}`
  );

  // impLotoNav.animateNumberChange(winnerScoreElement, prevWinnerScore, score, 3);
  winnerScoreElement.innerHTML = `+${score}`;

  let lostScoreElements = [];
  allScoreElements.forEach((scoreElement) => {
    if (!scoreElement.classList.contains(`telephone-finish-user-${winnerId}`)) {
      lostScoreElements.push(scoreElement);
    }
  });

  lostScoreElements.forEach((scoreElement) => {
    // impLotoNav.animateNumberChange(scoreElement, score, 0, 3);
    scoreElement.innerHTML = 0;
  });
};

export const openEmojiPopup = () => {
  const main = document.querySelector(".main__container");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "emoji-popup");

  popupElement.innerHTML = `
    <div class="popup__body emoji-popup__body">
      <div class="popup__content emoji-popup__content">
        
      </div>
    </div>
  `;

  let closeButton = document.createElement("button");
  closeButton.classList.add("popup__close");
  closeButton.addEventListener("click", () => {
    close(popupElement);
  });

  main.appendChild(popupElement);

  const emojiPopupContent = popupElement.querySelector(".emoji-popup__content");

  emojiPopupContent.appendChild(closeButton);

  let chatButtons = document.querySelectorAll(".domino-game__button-wrapper");

  if (window.isChatBlocked) {
    chatButtons.forEach((item) => {
      if (item) {
        let chatBlocked = item.querySelector(".chat-blocked");
        if (!chatBlocked) {
          let lockBlock = document.createElement("div");
          lockBlock.innerHTML = `<img src="img/choose-mode-locked.png" alt="lock">`;
          lockBlock.classList.add("chat-blocked");
          item.appendChild(lockBlock);
        }
      }
    });
  }

  for (let i = 1; i <= 24; i++) {
    let emojiItem = document.createElement("div");
    emojiItem.classList.add("emoji-popup__item");
    emojiItem.innerHTML = `<img emojiId="${i}" src="img/emojis/${i}.png" alt="emoji" width="64px" />`;

    emojiItem.addEventListener("click", (e) => {
      if (window.isChatBlocked) {
        return;
      }

      window.ws.send(
        JSON.stringify({
          method: "sendEmoji",
          roomId: +location.hash.split("/")[1],
          tableId: +location.hash.split("/")[2],
          playerMode: +location.hash.split("/")[3],
          gameMode: location.hash.split("/")[4],
          emojiId: +e.target.getAttribute("emojiId"),
          userId: JSON.parse(localStorage.getItem("user")).userId,
        })
      );
      close(popupElement);

      chatButtons.forEach((item) => {
        if (item) {
          let chatBlocked = item.querySelector(".chat-blocked");
          if (!chatBlocked) {
            let lockBlock = document.createElement("div");
            lockBlock.innerHTML = `<img src="img/choose-mode-locked.png" alt="lock">`;
            lockBlock.classList.add("chat-blocked");
            item.appendChild(lockBlock);
          }
        }
      });

      window.isChatBlocked = true;
      setTimeout(() => {
        chatButtons.forEach((item) => {
          let chatBlocked = item.querySelector(".chat-blocked");
          if (chatBlocked) {
            chatBlocked.remove();
          }
        });
        window.isChatBlocked = false;
      }, 5000);
    });

    emojiPopupContent.appendChild(emojiItem);
  }
};

export const openTextPopup = () => {
  const siteLanguage = window.siteLanguage;

  const main = document.querySelector(".main__container");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "phrase-popup");

  popupElement.innerHTML = `
    <div class="popup__body phrase-popup__body">
      <div class="popup__content phrase-popup__content">
        
      </div>
    </div>
  `;

  let closeButton = document.createElement("button");
  closeButton.classList.add("popup__close");
  closeButton.addEventListener("click", () => {
    close(popupElement);
  });

  main.appendChild(popupElement);

  const phrasePopupContent = popupElement.querySelector(
    ".phrase-popup__content"
  );

  let chatButtons = document.querySelectorAll(".domino-game__button-wrapper");

  phrasePopupContent.appendChild(closeButton);

  if (window.isChatBlocked) {
    chatButtons.forEach((item) => {
      chatButtons.forEach((item) => {
        if (item) {
          let chatBlocked = item.querySelector(".chat-blocked");
          if (!chatBlocked) {
            let lockBlock = document.createElement("div");
            lockBlock.innerHTML = `<img src="img/choose-mode-locked.png" alt="lock">`;
            lockBlock.classList.add("chat-blocked");
            item.appendChild(lockBlock);
          }
        }
      });
    });
  }

  for (let i = 1; i <= 24; i++) {
    let phraseItem = document.createElement("div");
    phraseItem.classList.add("phrase-popup__item");
    phraseItem.setAttribute("phraseId", i);
    phraseItem.innerHTML = siteLanguage.dominoPhrases[`phrase${i}`];

    phraseItem.addEventListener("click", (e) => {
      if (window.isChatBlocked) {
        return;
      }

      window.ws.send(
        JSON.stringify({
          method: "sendPhrase",
          roomId: +location.hash.split("/")[1],
          tableId: +location.hash.split("/")[2],
          playerMode: +location.hash.split("/")[3],
          gameMode: location.hash.split("/")[4],
          phraseId: +e.target.getAttribute("phraseId"),
          userId: JSON.parse(localStorage.getItem("user")).userId,
        })
      );

      close(popupElement);

      chatButtons.forEach((item) => {
        if (item) {
          let chatBlocked = item.querySelector(".chat-blocked");
          if (!chatBlocked) {
            let lockBlock = document.createElement("div");
            lockBlock.innerHTML = `<img src="img/choose-mode-locked.png" alt="lock">`;
            lockBlock.classList.add("chat-blocked");
            item.appendChild(lockBlock);
          }
        }
      });

      // block phrases and emojis for 10 seconds
      window.isChatBlocked = true;
      setTimeout(() => {
        chatButtons.forEach((item) => {
          let chatBlocked = item.querySelector(".chat-blocked");
          if (chatBlocked) {
            chatBlocked.remove();
          }
        });
        window.isChatBlocked = false;
      }, 5000);
    });

    phrasePopupContent.appendChild(phraseItem);
  }
};

export const openSettingsPopup = () => {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }
  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "domino-settings-popup");
  popupElement.innerHTML = `
    <div class="popup__body domino-settings-popup__body">
      <div class="popup__content domino-settings-popup__content">
        <div class="domino-settings-option domino-settings__sound">
          <a class="profile__button domino-settings-option-item">
            <img src="img/profile icons/sound.png" alt="ЗВУК" />
            <p>${siteLanguage.profilePage.mainButtons.soundsBtnText}</p>
            <div class="profile__button-switcher curpointer">
              <button class="profile__button-switcher-on active">
                ON
              </button>
              <button class="profile__button-switcher-off">OFF</button>
              </div>
              </a>
              </div>
              <div class="domino-settings-option domino-settings__rooles">
              <a class="profile__button domino-settings-option-item">
              <img src="./img/question-tag.png" alt="" />
              <p>${siteLanguage.popups.rules}</p>
              </a>
        </div>

        <div class="domino-settings__button">${siteLanguage.popups.gotIt}</div>
        </div>
    </div>
  `;

  body.appendChild(popupElement);
  const soundSwitcher = document.querySelector(".profile__button-switcher");
  const soundOn = document.querySelector(".profile__button-switcher-on");
  const soundOff = document.querySelector(".profile__button-switcher-off");

  let menuSoundsAllowed = localStorage.getItem("sounds-menu");
  let gameSoundsAllowed = localStorage.getItem("sounds-game");

  if (menuSoundsAllowed == "true" || gameSoundsAllowed == "true") {
    soundOn.classList.add("active");
    soundOff.classList.remove("active");
  } else {
    soundOn.classList.remove("active");
    soundOff.classList.add("active");
  }

  const toggleSound = () => {
    if (soundOn.classList.contains("active")) {
      soundOn.classList.remove("active");
      soundOff.classList.add("active");
      localStorage.setItem("sounds-game", false);
      localStorage.setItem("sounds-menu", false);
      impAudio.setGameSoundsAllowed(false);
      impAudio.setMenuSoundsAllowed(false);
    } else {
      soundOn.classList.add("active");
      soundOff.classList.remove("active");
      localStorage.setItem("sounds-game", true);
      localStorage.setItem("sounds-menu", true);
      impAudio.setGameSoundsAllowed(true);
      impAudio.setMenuSoundsAllowed(true);
    }
  };

  soundSwitcher.addEventListener("click", () => {
    toggleSound();
  });

  const gameMode = location.hash
    .split("/")
    [location.hash.split("/").length - 1].toUpperCase();

  const rulesButton = document.querySelector(".domino-settings__rooles");
  rulesButton.addEventListener("click", () => {
    openRulesInfoPopup(gameMode);
  });

  let gotItBtn = popupElement.querySelector(".domino-settings__button");
  gotItBtn.addEventListener("click", function () {
    close(popupElement);
  });
};

export function openRulesInfoPopup(gameMode = "CLASSIC") {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    const popups = document.querySelectorAll(".popup");
    if (popups) {
      popups.forEach((popup) => {
        popup.remove();
      });
    }
  }

  // // console.log(`dominoRules${gameMode}`);

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "jackpot-popup", "domino-rules-popup");
  popupElement.innerHTML = `
  <div class="popup__body jackpot-info-popup">
    <div class="popup__content">
    <h2>${
      gameMode == "CLASSIC"
        ? siteLanguage.popups.rulesClassic
        : siteLanguage.popups.rulesTelephone
    }</h2>
      <div class="popup__text">
        ${siteLanguage.popups[`dominoRules${gameMode}`]}
      </div>
      <div class="popup-button__gotit"> ${
        siteLanguage.profilePage.myGamesPage.statsItem.understandText
      }</div>
    </div>
  </div>
  `;

  let gotItBtn = popupElement.querySelector(".popup-button__gotit");
  gotItBtn.addEventListener("click", function () {
    close(popupElement);
  });

  body.appendChild(popupElement);
}

export function showEnemyTiles(
  enemyPlayerName,
  enemyPlayerTilesArr,
  enemyPlayerId
) {
  let siteLanguage = window.siteLanguage;
  if (isPopupOpened()) {
    return;
  }

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "domino-enemy-tiles-popup");
  popupElement.innerHTML = `
  <div class="popup__body domino-enemy-tiles-popup__body">
    <div class="popup__content domino-enemy-tiles-popup__content">
      <div class="domino-enemy-tiles-popup__header">
        <p>${enemyPlayerName}</p>
        
      </div>
      <div class="domino-enemy-tiles-popup__main">
      <button class="popup__close domino-enemy-tiles-popup__close"></button>
      <div class="domino-enemy-tiles-popup__tiles" userId="${enemyPlayerId}"></div>
      
      </div>
    </div>
  </div>
  `;
  body.appendChild(popupElement);

  const tilesContainer = popupElement.querySelector(
    ".domino-enemy-tiles-popup__tiles"
  );
  enemyPlayerTilesArr.forEach((tile) => {
    tilesContainer.innerHTML += `
      <div class="domino-tile domino-enemy-tiles-popup__tile">
        <div class="domino-tile__half domino-dots-${tile.left}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.left)}
        </div>
        <div class="domino-tile__half domino-dots-${tile.right}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.right)}
        </div>
      </div>
      `;
  });

  const closeButton = popupElement.querySelector(
    ".domino-enemy-tiles-popup__close"
  );
  closeButton.addEventListener("click", () => {
    close(popupElement);
  });
}

export function updateEnemyTilesPopup(playersTiles) {
  const popup = document.querySelector(".domino-enemy-tiles-popup");
  if (popup) {
    const tilesBlock = popup.querySelector(".domino-enemy-tiles-popup__tiles");
    const userId = +tilesBlock.getAttribute("userId");
    // console.log(userId);

    tilesBlock.innerHTML = "";

    const playerTiles = playersTiles.find((playerTiles) => {
      // console.log(playerTiles.userId == userId, playerTiles.userId, userId);
      return playerTiles.userId == userId;
    });

    playerTiles.tiles.forEach((tile) => {
      tilesBlock.innerHTML += `
      <div class="domino-tile domino-enemy-tiles-popup__tile">
        <div class="domino-tile__half domino-dots-${tile.left}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.left)}
        </div>
        <div class="domino-tile__half domino-dots-${tile.right}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.right)}
        </div>
      </div>
      `;
    });
  }
}
