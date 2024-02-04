import * as impHttp from "./http.js";
import * as impLotoGame from "./loto/loto-game.js";
import * as impLotoNavigation from "./loto/loto-navigation.js";
import * as impDominoNav from "./domino/domino-navigation.js";
import * as impLeadersFunc from "./pages/leaders.js";
import * as impProfileFunc from "./pages/profile.js";
import * as impLotoNav from "./loto/loto-navigation.js";
import * as impPopup from "./pages/popup.js";
import * as impMoveElement from "./move-element.js";
import * as impAudio from "./audio.js";
let preloader = document.querySelector(".page-preloader");
let header = document.querySelector("header");
let main = document.querySelector("main");
let footer = document.querySelector("footer");
let mainContainer = document.querySelector(".main__container");
mainContainer.classList.add("header__padding");

export function hideAuthorization() {
  const auth = document.querySelector(".registration");
  auth.classList.remove("opened");
}

export function addListeners(ws) {
  let game = document.querySelector(".games");
  let lotoRooms = game.querySelectorAll(".loto-room");

  lotoRooms.forEach((room) => {
    room.addEventListener("click", () => {
      const roomId = room.getAttribute("room");
      impLotoNavigation.openLotoRoom(window.ws, roomId);
      impAudio.playGameClick();
    });
  });
}

export async function addHashListeners(ws = null) {
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    mainContainer.classList.add("header__padding");
  }

  let currentGames = await checkUserCurrentGames();

  switch (currentGames.currGame) {
    case "free":
      preloader.classList.add("d-none");
      break;
    case "loto":
      if (currentGames.gameStarted) {
        location.hash = `#loto-game-${currentGames.roomId}`;
      } else {
        location.hash = `#loto-room-${currentGames.roomId}`;
      }
      const localItemsToClear = JSON.parse(
        localStorage.getItem("localItemsToClear")
      );
      if (localItemsToClear) {
        localItemsToClear.forEach((item) => {
          localStorage.removeItem(item);
        });
        localStorage.removeItem("localItemsToClear");
      }
      // preloader.classList.add("d-none");
      break;
    case "domino":
      window.location.hash = `domino-room-table/${currentGames.roomId}/${
        currentGames.tableId
      }/${currentGames.playerMode}/${currentGames.gameMode.toUpperCase()}`;
      // preloader.classList.add("d-none");
      break;
  }

  // на изменение хеша

  // удаляем листенер
  window.removeEventListener("hashchange", hashNavigation);

  // добавляем листенер
  window.addEventListener("hashchange", hashNavigation);
}

export async function hashNavigation() {
  // console.log("location changed", location.hash);

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  let websocket = window.ws;
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    mainContainer.classList.add("header__padding");
  }
  window.scrollTo(0, 0);

  preloader.classList.remove("d-none");

  let hash = location.hash;

  let currentGames = await checkUserCurrentGames();
  switch (currentGames.currGame) {
    case "free":
      preloader.classList.add("d-none");
      break;
    case "loto":
      if (currentGames.gameStarted) {
        location.hash = `#loto-game-${currentGames.roomId}`;
      } else {
        location.hash = `#loto-room-${currentGames.roomId}`;
      }
      const localItemsToClear = JSON.parse(
        localStorage.getItem("localItemsToClear")
      );
      if (localItemsToClear) {
        localItemsToClear.forEach((item) => {
          localStorage.removeItem(item);
        });
        localStorage.removeItem("localItemsToClear");
      }
      // preloader.classList.add("d-none");
      break;
    case "domino":
      window.location.hash = `domino-room-table/${currentGames.roomId}/${
        currentGames.tableId
      }/${currentGames.playerMode}/${currentGames.gameMode.toUpperCase()}`;
      // preloader.classList.add("d-none");
      break;
  }
  if (!hash || hash == "" || hash == "#") {
    location.hash = "#gamemode-choose";
  } else if (hash == "#loto-menu") {
    let navMenu = document.querySelector(".menu-footer");
    let navButtons = navMenu.querySelectorAll(".active");
    navButtons.forEach((button) => button.classList.remove("active"));
    let openGamesLobbyBtn = document.querySelector(".open-games-menu");
    openGamesLobbyBtn.classList.add("active");

    // закрыть вебсокет если он открыт

    // // console.log(websocket);
    // if (websocket && websocket.readyState == 1) {
    //   websocket.close(
    //     3001,
    //     JSON.stringify({
    //       // roomId,
    //       // bet: bet,
    //       userId: localUser.userId,
    //       username: localUser.username,
    //       method: "disconnectGame",
    //       page: "mainLotoPage",
    //     })
    //   );
    // }
    let mainPage = document.querySelector("#loto");
    if (!mainPage) {
      redirectToMainPage();
      ws.send(
        JSON.stringify({
          username: localUser.username,
          userId: localUser.userId,
          method: "getAllInfo",
        })
      );
    }
    // preloader.classList.remove("d-none");
  } else if (hash.includes("loto-room")) {
    // open loto room waiting page if game is not started
    const roomId = Number(hash.split("-")[2][0]);

    const bet = impLotoGame.getBetByRoomId(roomId);
    websocket.send(
      JSON.stringify({
        roomId,
        bet,
        username: localUser.username,
        userId: localUser.userId,
        method: "connectGame",
      })
    );
    await openRoomByHash(hash);
    if (!preloader.classList.contains("d-none")) {
      preloader.classList.add("d-none");
    }
  } else if (hash.includes("loto-game")) {
    if (!header.classList.contains("d-none")) {
      header.classList.add("d-none");
      mainContainer.classList.remove("header__padding");
    }

    const query = new URLSearchParams(hash.split("?")[1]);
    const roomId = Number(hash.split("-")[2].split("?")[0]);

    // даные об игре
    const bet = impLotoGame.getBetByRoomId(roomId);
    const bank = Number(query.get("bank")).toFixed(2);
    const jackpot = Number(query.get("jackpot")).toFixed(2);
    const online = Number(query.get("online"));
    const isJackpotPlaying = JSON.parse(query.get("isJackpotPlaying"));

    window.ws.send(
      JSON.stringify({
        roomId,
        bet: bet,
        username: localUser.username,
        userId: localUser.userId,
        method: "connectGame",
      })
    );

    if (!preloader.classList.contains("d-none")) {
      preloader.classList.add("d-none");
    }

    const isAudioAllowed = JSON.parse(query.get("sound"));

    await impLotoGame.openGamePage(
      +online || null,
      +bet || null,
      +bank || null,
      +roomId,
      +jackpot || null,
      isJackpotPlaying || null,
      isAudioAllowed || null
    );
    // ============= DOMINO ============== //
  } else if (hash == "#gamemode-choose") {
    let navMenu = document.querySelector(".menu-footer");
    if (navMenu) {
      const navButtons = navMenu.querySelectorAll(".active");
      navButtons.forEach((button) => button.classList.remove("active"));
      let openGamesLobbyBtn = document.querySelector(".open-games-menu");
      openGamesLobbyBtn.classList.add("active");
    }

    impDominoNav.openDominoChoosePage();
    pageNavigation(websocket);
  } else if (hash == "#domino-menu") {
    setTimeout(() => {
      window.ws.send(
        JSON.stringify({
          method: "clearWS",
        })
      );
      impDominoNav.openDominoMenuPage(true, null, "CLASSIC");
      const dominoPopup = document.querySelector(
        ".domino-waiting-popup-wrapper"
      );
      if (dominoPopup) {
        dominoPopup.remove();
      }
    }, 50);
  } else if (hash == "#domino-menu4") {
    window.ws.send(
      JSON.stringify({
        method: "clearWS",
      })
    );
    impDominoNav.openDominoMenuPage(false, null, "CLASSIC");
    const dominoPopup = document.querySelector(".domino-waiting-popup-wrapper");
    if (dominoPopup) {
      dominoPopup.remove();
    }
  } else if (hash == "#domino-menu-telephone") {
    window.ws.send(
      JSON.stringify({
        method: "clearWS",
      })
    );
    impDominoNav.openDominoMenuPage(true, null, "TELEPHONE");
    const dominoPopup = document.querySelector(".domino-waiting-popup-wrapper");
    if (dominoPopup) {
      dominoPopup.remove();
    }
  } else if (hash == "#domino-menu-telephone4") {
    window.ws.send(
      JSON.stringify({
        method: "clearWS",
      })
    );
    impDominoNav.openDominoMenuPage(false, null, "TELEPHONE");
    const dominoPopup = document.querySelector(".domino-waiting-popup-wrapper");
    if (dominoPopup) {
      dominoPopup.remove();
    }
  } else if (hash.includes("#domino-room-table")) {
    hideNavigation();
    const dominoRoomId = +hash.split("/")[1];
    const tableId = +hash.split("/")[2];
    const playerMode = +hash.split("/")[3];
    const gameMode = hash.split("/")[4];
    if (dominoRoomId && dominoRoomId && playerMode && gameMode) {
      impDominoNav.openDominoTable(dominoRoomId, tableId, playerMode, gameMode);
      try {
        ws.send(
          JSON.stringify({
            dominoRoomId,
            tableId,
            playerMode,
            gameMode,
            username: localUser.username,
            userId: localUser.userId,
            avatar: localUser.avatar,
            method: "connectDomino",
          })
        );
        preloader.classList.add("d-none");
      } catch {
        impPopup.openErorPopup("Ошибка подключения");
        setTimeout(() => location.reload(), 3000);
      }
    } else {
      console.error("Ошибка при получании даных комнаты! попробуйте еще раз");
    }
  }

  let navMenu = document.querySelector(".menu-footer");
  let navButtons = navMenu.querySelectorAll(".active");
  let openGamesLobbyBtn = document.querySelector(".open-games-menu-loto");
  let openLeadersMenuBtn = document.querySelector(".open-liders-menu");
  let openSettingsBtn = document.querySelector(".open-settings");
  let openProfileBtn = document.querySelector(".open-profile");
  switch (hash) {
    case "#leaders":
      // impLeadersFunc.openLeadersMenuPage();
      // if (preloader.classList.contains("d-none")) {
      //   preloader.classList.remove("d-none");
      // }
      mainContainer.classList.add("header__padding");
      mainContainer.classList.add("footer__padding");
      header.classList.remove("d-none");
      footer.classList.remove("d-none");

      impLeadersFunc.openLeadersPage("loto");
      navButtons.forEach((button) => button.classList.remove("active"));

      openLeadersMenuBtn.classList.add("active");
      break;

    case "#profile":
      // if (preloader.classList.contains("d-none")) {
      //   preloader.classList.remove("d-none");
      // }

      impProfileFunc.openProfilePage();
      header.classList.add("d-none");
      mainContainer.classList.remove("header__padding");
      navButtons.forEach((button) => button.classList.remove("active"));

      openProfileBtn.classList.add("active");
      break;
    case "#deposit":
      await impProfileFunc.openBalance();
      header.classList.add("d-none");
      preloader.classList.add("d-none");
      mainContainer.classList.remove("header__padding");
      navButtons.forEach((button) => button.classList.remove("active"));

      openSettingsBtn.classList.add("active");

      break;
  }
}

async function openRoomByHash(hash) {
  let siteLanguage = window.siteLanguage;
  let body = document.querySelector("main");
  header.classList.remove("d-none");
  body.innerHTML = `
  <div class="main__container header__padding">
  <div class="loto-room-page ">
  <div class="loto-room-content">
    <div class="loto-room-page__timer">
      <img src="img/timer-icon.png" alt="" /><span>00:00</span>
    </div>
    <div class="room-jackpot">
      <div class="room-jackpot-sum">
        <img src="img/jackpot-icon.png" alt="" /><span>0</span> ₼
      </div>
      <div class="room-jackpot-question">
        <img src="img/question-tag.png" alt="" />
      </div>
    </div>
    <div class="loto-room-page__exit">
      <span>${siteLanguage.lotoRoomPage.gameInfo.exitRoomText}</span> <img src="img/logout.png" alt="" />
    </div>
    <div class="loto-room__gameinfo loto-gameinfo">
      <div class="loto-gameinfo__top-row">
        <p class="loto-gameinfo__top-row-item loto-gameinfo__bet">
          ${siteLanguage.lotoRoomPage.gameInfo.betText}: <span>0</span>₼
        </p>
        <p class="loto-gameinfo__top-row-item loto-gameinfo__bank">
        ${siteLanguage.lotoRoomPage.gameInfo.bankText}: <span>0</span>₼
        </p>
        <div class="loto-room-page__exit-wrapper"></div>
      </div>
      <div class="loto-gameinfo__bottom-row">
        <p class="loto-gameinfo__online">
          <img src="img/online-icon.png" alt="" /> <span>0</span>
        </p>
        <p class="loto-gameinfo__timer-wrapper"></p>
        <p class="loto-gameinfo__auto-button active">
          <img src="img/autogame-icon.png" alt="" /><span>${siteLanguage.lotoRoomPage.gameInfo.autoButtonText}</span>
        </p>
        <p class="loto-gameinfo__jackpot-block-wrapper"></p>
        <p class="loto-gameinfo__sounds-button active">
          <img src="img/profile icons/sound.png" alt="" />
        </p>
      </div>
    </div>
    <div class="loto-room__main loto-gamemain"></div>
    <div class="loto-room__controlls loto-gamecontrolls">
      <div class="loto-gamecontrolls__buy">${siteLanguage.lotoRoomPage.buyTicketButtonText}</div>
      <div class="loto-gamecontrolls__counter">
        <div class="loto-gamecontrolls__counter__minus">-</div>
        <div class="loto-gamecontrolls__counter__value">1</div>
        <div class="loto-gamecontrolls__counter__plus">+</div>
      </div>
    </div>
  </div>
</div>
</div>`;

  impMoveElement.moveElement(
    "loto-room-content",
    "loto-room-page__timer",
    "loto-gameinfo",
    "loto-gameinfo__timer-wrapper",
    998
  );

  impMoveElement.moveElement(
    "loto-room-content",
    "room-jackpot",
    "loto-gameinfo",
    "loto-gameinfo__jackpot-block-wrapper",
    998
  );

  impMoveElement.moveElement(
    "loto-room-content",
    "loto-room-page__exit",
    "loto-gameinfo",
    "loto-room-page__exit-wrapper",
    768
  );

  const jackpotInformationButton = document.querySelector(
    ".room-jackpot-question"
  );

  jackpotInformationButton.addEventListener("click", function () {
    impPopup.openJackpotInfoPopup();
  });

  const autoButton = document.querySelector(".loto-gameinfo__auto-button");

  autoButton.addEventListener("click", () => {
    if (autoButton.classList.contains("active")) {
      autoButton.classList.remove("active");
      localStorage.setItem("auto-play", false);
    } else {
      autoButton.classList.add("active");
      localStorage.setItem("auto-play", true);
    }
  });

  let autoPlay = localStorage.getItem("auto-play");
  if (autoPlay == "true") {
    autoButton.classList.add("active");
  } else {
    autoButton.classList.remove("active");
  }

  const soundButton = document.querySelector(".loto-gameinfo__sounds-button");

  let menuSoundsAllowed = localStorage.getItem("sounds-menu");
  let gameSoundsAllowed = localStorage.getItem("sounds-game");

  if (menuSoundsAllowed == "true" || gameSoundsAllowed == "true") {
    soundButton.classList.add("active");
  } else {
    soundButton.classList.remove("active");
  }

  soundButton.addEventListener("click", () => {
    toggleSound();
  });

  const toggleSound = () => {
    if (soundButton.classList.contains("active")) {
      soundButton.classList.remove("active");
      localStorage.setItem("sounds-game", false);
      localStorage.setItem("sounds-menu", false);
      impAudio.setGameSoundsAllowed(false);
      impAudio.setMenuSoundsAllowed(false);
    } else {
      soundButton.classList.add("active");
      localStorage.setItem("sounds-game", true);
      localStorage.setItem("sounds-menu", true);
      impAudio.setGameSoundsAllowed(true);
      impAudio.setMenuSoundsAllowed(true);
    }
  };

  const roomId = +hash.split("-")[2];
  const bet = impLotoGame.getBetByRoomId(Number(roomId));

  // убираем навигацию сайта
  let footer = document.querySelector("#footer");
  if (footer && !footer.classList.contains("d-none")) {
    footer.classList.add("d-none");
  }
  let userCards = await impHttp.getTickets();
  userCards = userCards.data;

  impLotoGame.showUserTickets(userCards, roomId);

  impLotoNav.counterTickets();
  impLotoNav.buyTickets(window.ws, roomId, bet);

  // выход из комнаты и отключение от вебсокета комнаты
  let exitButton = document.querySelector(".loto-room-page__exit");
  if (exitButton) {
    exitButton.addEventListener("click", async function () {
      const boughtTickets = document.querySelectorAll(
        ".loto-gamemain__ticket.bought-ticket"
      );
      if (boughtTickets.length > 0) {
        impPopup.openExitPopup(
          siteLanguage.popups.cancelBet,
          Number(roomId),
          bet
        );
      } else {
        let ws = window.ws;
        // ws.close(1000, JSON.stringify({ reason: "" }));
        let localUser = localStorage.getItem("user");
        localUser = JSON.parse(localUser);
        ws.close(
          3001,
          JSON.stringify({
            method: "exitGame",
            userId: localUser.userId,
            page: "mainLotoPage",
          })
        );
        location.hash = "#loto-menu";
      }
    });
  }
}

// use location.hash = ""
export function redirectToMainPage() {
  let siteLanguage = window.siteLanguage;

  const main = document.querySelector("main");
  main.innerHTML = "";
  let main__container = document.createElement("div");
  main__container.classList.add("main__container");

  main__container.innerHTML = `
  <section class="games">
    <div class="games__container" id="loto">
      <a class="game loto-room loto-room-1" room="1">
        <div class="loto-room__body">
          <div class="loto-room__body-left room-left">
            <div class="room-left__item room-left__item-1">
              <div class="logo">
                <img src="img/loto-room-card-logo.png" alt="" />
              </div>
              <div class="room-left__item-timer-block">
                <p class="timer-block__text">${siteLanguage.mainPage.gamecards.timerTextWaiting}</p>
                <span class="timer-block__timer">00:00</span>
              </div>
            </div>
            <div class="room-left__item room-left__item-2">
              <div class="room-left__item-info-row lobby-room-bet">
                <img src="img/bank-icon.png" alt="" />
                <p><span>0</span> ₼</p>
              </div>
              <div
                class="room-left__item-info-row room-left__item-info-row-green lobby-room-online"
              >
                <img src="img/lobby-online-icon.png" alt="" />
                <p>${siteLanguage.mainPage.gamecards.onlineText}: <span>0</span></p>
              </div>
            </div>
            <div class="room-left__item room-left__item-3">
              <div class="room-left__item-info-row">
                <img src="img/bank-before-icon.png" alt="" />
                <p>
                  ${siteLanguage.mainPage.gamecards.bankText}
                  <span class="game__room-prevbank-sum">0</span> ₼
                </p>
              </div>
            </div>
          </div>
          <div class="loto-room__body-right">
            <div class="loto-room__body-right__jackpot-text">
              <img src="img/jackpot-text.png" alt="" />
            </div>
            <div class="loto-room__body-right__jackpot">
              <img src="img/room-jackpot-img.png" alt="" />
              <p class="loto-room__body-right__jackpot-sum">
                <span class="game__room-jackpot-sum"> 0 </span>
                ₼
              </p>
            </div>
            <div class="loto-room__body-right__price-block">
              <p class="price-text"> ${siteLanguage.mainPage.gamecards.priceText}:</p>
              <button class="price">
                <div class="price-money"><span>0.20</span> ₼</div>
                <div class="price-tockens">
                  x2
                  <div class="price-tockens__decor">
                    <img src="img/room-tokens-decor.png" alt="" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </a>
      <a class="game loto-room loto-room-2" room="2">
        <div class="loto-room__body">
          <div class="loto-room__body-left room-left">
            <div class="room-left__item room-left__item-1">
              <div class="logo">
                <img src="img/loto-room-card-logo.png" alt="" />
              </div>
              <div class="room-left__item-timer-block">
                <p class="timer-block__text">${siteLanguage.mainPage.gamecards.timerTextWaiting}</p>
                <span class="timer-block__timer">00:00</span>
              </div>
            </div>
            <div class="room-left__item room-left__item-2">
              <div class="room-left__item-info-row lobby-room-bet">
                <img src="img/bank-icon.png" alt="" />
                <p><span>0</span> ₼</p>
              </div>
              <div
                class="room-left__item-info-row room-left__item-info-row-green lobby-room-online"
              >
                <img src="img/lobby-online-icon.png" alt="" />
                <p>${siteLanguage.mainPage.gamecards.onlineText}: <span>0</span></p>
              </div>
            </div>
            <div class="room-left__item room-left__item-3">
              <div class="room-left__item-info-row">
                <img src="img/bank-before-icon.png" alt="" />
                <p>
                  ${siteLanguage.mainPage.gamecards.bankText}
                  <span class="game__room-prevbank-sum">0</span> ₼
                </p>
              </div>
            </div>
          </div>
          <div class="loto-room__body-right">
            <div class="loto-room__body-right__jackpot-text">
              <img src="img/jackpot-text.png" alt="" />
            </div>
            <div class="loto-room__body-right__jackpot">
              <img src="img/room-jackpot-img.png" alt="" />
              <p class="loto-room__body-right__jackpot-sum">
                <span class="game__room-jackpot-sum"> 0 </span>
                ₼
              </p>
            </div>
            <div class="loto-room__body-right__price-block">
              <p class="price-text">${siteLanguage.mainPage.gamecards.priceText}:</p>
              <button class="price">
                <div class="price-money"><span>0.50</span> ₼</div>
                <div class="price-tockens">
                  x5
                  <div class="price-tockens__decor">
                    <img src="img/room-tokens-decor.png" alt="" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </a>
      <a class="game loto-room loto-room-3" room="3">
        <div class="loto-room__body">
          <div class="loto-room__body-left room-left">
            <div class="room-left__item room-left__item-1">
              <div class="logo">
                <img src="img/loto-room-card-logo.png" alt="" />
              </div>
              <div class="room-left__item-timer-block">
                <p class="timer-block__text"> ${siteLanguage.mainPage.gamecards.timerTextWaiting}</p>
                <span class="timer-block__timer">00:00</span>
              </div>
            </div>
            <div class="room-left__item room-left__item-2">
              <div class="room-left__item-info-row lobby-room-bet">
                <img src="img/bank-icon.png" alt="" />
                <p><span>0</span> ₼</p>
              </div>
              <div
                class="room-left__item-info-row room-left__item-info-row-green lobby-room-online"
              >
                <img src="img/lobby-online-icon.png" alt="" />
                <p> ${siteLanguage.mainPage.gamecards.onlineText}: <span>0</span></p>
              </div>
            </div>
            <div class="room-left__item room-left__item-3">
              <div class="room-left__item-info-row">
                <img src="img/bank-before-icon.png" alt="" />
                <p>
                  ${siteLanguage.mainPage.gamecards.bankText}
                  <span class="game__room-prevbank-sum">0</span> ₼
                </p>
              </div>
            </div>
          </div>
          <div class="loto-room__body-right">
            <div class="loto-room__body-right__jackpot-text">
              <img src="img/jackpot-text.png" alt="" />
            </div>
            <div class="loto-room__body-right__jackpot">
              <img src="img/room-jackpot-img.png" alt="" />
              <p class="loto-room__body-right__jackpot-sum">
                <span class="game__room-jackpot-sum"> 0 </span>
                ₼
              </p>
            </div>
            <div class="loto-room__body-right__price-block">
              <p class="price-text"> ${siteLanguage.mainPage.gamecards.priceText}:</p>
              <button class="price">
                <div class="price-money"><span>1</span> ₼</div>
                <div class="price-tockens">
                  x10
                  <div class="price-tockens__decor">
                    <img src="img/room-tokens-decor.png" alt="" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </a>
      <a class="game loto-room loto-room-4" room="4">
        <div class="loto-room__body">
          <div class="loto-room__body-left room-left">
            <div class="room-left__item room-left__item-1">
              <div class="logo">
                <img src="img/loto-room-card-logo.png" alt="" />
              </div>
              <div class="room-left__item-timer-block">
                <p class="timer-block__text">${siteLanguage.mainPage.gamecards.timerTextWaiting}</p>
                <span class="timer-block__timer">00:00</span>
              </div>
            </div>
            <div class="room-left__item room-left__item-2">
              <div class="room-left__item-info-row lobby-room-bet">
                <img src="img/bank-icon.png" alt="" />
                <p><span>0</span> ₼</p>
              </div>
              <div
                class="room-left__item-info-row room-left__item-info-row-green lobby-room-online"
              >
                <img src="img/lobby-online-icon.png" alt="" />
                <p>${siteLanguage.mainPage.gamecards.onlineText}: <span>0</span></p>
              </div>
            </div>
            <div class="room-left__item room-left__item-3">
              <div class="room-left__item-info-row">
                <img src="img/bank-before-icon.png" alt="" />
                <p>
                  ${siteLanguage.mainPage.gamecards.bankText}
                  <span class="game__room-prevbank-sum">0</span> ₼
                </p>
              </div>
            </div>
          </div>
          <div class="loto-room__body-right">
            <div class="loto-room__body-right__jackpot-text">
              <img src="img/jackpot-text.png" alt="" />
            </div>
            <div class="loto-room__body-right__jackpot">
              <img src="img/room-jackpot-img.png" alt="" />
              <p class="loto-room__body-right__jackpot-sum">
                <span class="game__room-jackpot-sum"> 0 </span>
                ₼
              </p>
            </div>
            <div class="loto-room__body-right__price-block">
              <p class="price-text">${siteLanguage.mainPage.gamecards.priceText}:</p>
              <button class="price">
                <div class="price-money"><span>5</span> ₼</div>
                <div class="price-tockens">
                  x50
                  <div class="price-tockens__decor">
                    <img src="img/room-tokens-decor.png" alt="" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </a>
      <a class="game loto-room loto-room-5" room="5">
        <div class="loto-room__body">
          <div class="loto-room__body-left room-left">
            <div class="room-left__item room-left__item-1">
              <div class="logo">
                <img src="img/loto-room-card-logo.png" alt="" />
              </div>
              <div class="room-left__item-timer-block">
                <p class="timer-block__text">${siteLanguage.mainPage.gamecards.timerTextWaiting}</p>
                <span class="timer-block__timer">00:00</span>
              </div>
            </div>
            <div class="room-left__item room-left__item-2">
              <div class="room-left__item-info-row lobby-room-bet">
                <img src="img/bank-icon.png" alt="" />
                <p><span>0</span> ₼</p>
              </div>
              <div
                class="room-left__item-info-row room-left__item-info-row-green lobby-room-online"
              >
                <img src="img/lobby-online-icon.png" alt="" />
                <p>${siteLanguage.mainPage.gamecards.onlineText}: <span>0</span></p>
              </div>
            </div>
            <div class="room-left__item room-left__item-3">
              <div class="room-left__item-info-row">
                <img src="img/bank-before-icon.png" alt="" />
                <p>
                  ${siteLanguage.mainPage.gamecards.bankText}
                  <span class="game__room-prevbank-sum">0</span> ₼
                </p>
              </div>
            </div>
          </div>
          <div class="loto-room__body-right">
            <div class="loto-room__body-right__jackpot-text">
              <img src="img/jackpot-text.png" alt="" />
            </div>
            <div class="loto-room__body-right__jackpot">
              <img src="img/room-jackpot-img.png" alt="" />
              <p class="loto-room__body-right__jackpot-sum">
                <span class="game__room-jackpot-sum"> 0 </span>
                ₼
              </p>
            </div>
            <div class="loto-room__body-right__price-block">
              <p class="price-text">${siteLanguage.mainPage.gamecards.priceText}:</p>
              <button class="price">
                <div class="price-money"><span>10</span> ₼</div>
                <div class="price-tockens">
                  x100
                  <div class="price-tockens__decor">
                    <img src="img/room-tokens-decor.png" alt="" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  </section>
  `;

  main.appendChild(main__container);

  addListeners(window.ws);

  // добавляем навигацию сайта
  let footer = document.querySelector("#footer");
  header.classList.remove("d-none");
  footer.classList.remove("d-none");
  main__container.classList.add("footer__padding", "header__padding");
}

export function pageNavigation(ws) {
  let footer = document.querySelector("#footer");

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  // добавляем стили навигации на сайт
  if (footer && footer.classList.contains("d-none")) {
    footer.classList.remove("d-none");
    mainContainer.classList.add("footer__padding");
  }
  let headerTopupBalance = document.querySelector(".header__balance-block");
  if (headerTopupBalance) {
    headerTopupBalance.addEventListener("click", function () {
      if (
        location.hash.includes("loto-room") ||
        location.hash.includes("loto-game")
      ) {
        return;
      }
      location.hash = "#deposit";
    });
  }

  createPageNavBlock();
  let navMenu = document.querySelector(".menu-footer");
  if (navMenu) {
    // let openGamesLobbyBtn = document.querySelector(".open-games-menu-loto");
    let openLeadersMenuBtn = document.querySelector(".open-liders-menu");
    let openSettingsBtn = document.querySelector(".open-settings");
    let openProfileBtn = document.querySelector(".open-profile");
    const navButtons = [openLeadersMenuBtn, openSettingsBtn, openProfileBtn];

    // открытие страници лидеров
    openLeadersMenuBtn.addEventListener("click", function () {
      location.hash = "#leaders";
      navButtons.forEach((btn) => btn.classList.remove("active"));
      openLeadersMenuBtn.classList.add("active");
      impAudio.playRating();
    });

    // // открытие страницы с играми лото
    // openGamesLobbyBtn.addEventListener("click", function () {
    //   let isCurrGameMenuPage = document.querySelector(".games");
    //   if (!isCurrGameMenuPage) {
    //     location.hash = "#";
    //     redirectToMainPage();
    //     ws.send(
    //       JSON.stringify({
    //         username: localUser.username,
    //         userId: localUser.userId,
    //         method: "getAllInfo",
    //       })
    //     );

    //     navButtons.forEach((btn) => btn.classList.remove("active"));
    //     openGamesLobbyBtn.classList.add("active");
    //   }
    // });

    // открытие страницы с депозитом
    openSettingsBtn.addEventListener("click", async function () {
      location.hash = "#deposit";
      navButtons.forEach((btn) => btn.classList.remove("active"));
      openSettingsBtn.classList.add("active");
      impAudio.playProfileDeposit();
    });

    // открытие страницы с профилем
    openProfileBtn.addEventListener("click", function () {
      // ws.close();
      // impProfileFunc.openProfilePage();
      location.hash = "#profile";
      navButtons.forEach((btn) => btn.classList.remove("active"));
      openProfileBtn.classList.add("active");
      impAudio.playProfileDeposit();
    });
  }
}

export function createPageNavBlock() {
  let footer = document.querySelector("#footer");
  if (footer) {
    footer.innerHTML = `<footer id="footer"> 
    <div class="footer__container">
     <div class="foter__content">
       <div class="footer__menu menu-footer">
         <div class="menu-footer__item open-profile"><img src="img/profile-button.png" alt=""></div>
         <div class="menu-footer__item"><img src="img/chat.png" alt=""></div>
         <div
           class="menu-footer__item menu-footer__main-item open-games-menu active"
         >
        
         <img src="img/games.png" alt="">
         </div>
         <div class="menu-footer__item open-liders-menu"><img src="img/leaders.png" alt=""></div>
         <div class="menu-footer__item open-settings"><img src="img/deposit.png" alt=""></div>
       </div>
     </div>
   </div>
 </footer>`;

    // let menuButton = document.querySelector(".menu-footer__main-item");
    // let menuBlock = document.querySelector(".open-games__drop-menu");

    // menuButton.addEventListener("click", function () {
    //   if (menuBlock.classList.contains("opened")) {
    //     menuBlock.classList.remove("opened");
    //   } else {
    //     menuBlock.classList.add("opened");
    //   }
    // });

    // const openLotoMenu = document.querySelector(".open-games-menu-loto");
    const openGamesMenu = document.querySelector(".open-games-menu");

    // openLotoMenu.addEventListener("click", function () {
    //   location.hash = "";
    // });

    openGamesMenu.addEventListener("click", function () {
      location.hash = "#gamemode-choose";
    });
  }
}

export const applyDefaultSettings = () => {
  if (!localStorage.getItem("auto-play")) {
    localStorage.setItem("auto-play", true);
  }
  if (!localStorage.getItem("sounds-game")) {
    localStorage.setItem("sounds-game", true);
  }
  if (!localStorage.getItem("sounds-menu")) {
    localStorage.setItem("sounds-menu", true);
  }
  if (!localStorage.getItem("cask-color")) {
    localStorage.setItem("cask-color", "yellow");
  }
};

export function addUnauthorizedHashListeners() {
  const hash = location.hash;
  switch (hash) {
    case "#conditions":
      openConditionsPage();
    case "#privacy-policy":
      openPrivacyPolicyPage();
  }
}

function hideRegistration() {
  const preloader = document.querySelector(".page-preloader");
  preloader.classList.add("d-none");

  const registration = document.querySelector(".registration");
  if (registration) {
    registration.classList.remove("opened");
  }
}

function hideNavigation() {
  const header = document.querySelector("header");
  header.classList.add("d-none");
  const footer = document.querySelector("footer");
  footer.classList.add("d-none");
  const main = document.querySelector(".main__container");
  main.classList.remove("header__padding", "footer__padding");
}

function openConditionsPage() {
  hideRegistration();
  hideNavigation();

  const main = document.querySelector(".main__container");
  main.innerHTML = `
    <div class="conditions-page">
      <a href="#" class="conditions-logo">
        <img src="img/logo.png" alt="" width="180" />
      </a>
      <div class="text-container">
        <p class="text-container-subtitle">Terms and Conditions</p>
        <h1 class="text-container-h1">
        GENERAL PROVISIONS
        </h1>
        <h2 class="text-container-h2">
        1. INTRODUCTION
        </h2>
        <p class="text-container-p">
        1.1 Using and/or visiting any part of the website legi10.com and its mirror websites (hereinafter - the "Website"), or opening an account on the Website, the Customer undertakes to comply with: General terms and conditions, represented on this page: Privacy Policy; represented on a separate page; Anti-fraud Policy; Any terms and conditions of the promotions, the bonuses and the special offers, the Website will inform about every so often.<br>
        1.2. All of the above-mentioned terms and conditions are hereinafter collectively referred to as the “Terms”.<br>
        1.3. Before accepting the Terms, they should be read carefully. If the Customer does not agree to accept and to comply with the Terms, he/she should not open an account and continue to use the services of the Website. It will be deemed to be the acceptance of the Terms if the Customer continues to use the services of the Website. The date of entry into force of the Terms shall be 1 November 2017.<br>
        </p>
        <h2 class="text-container-h2">
        2. PARTIES TO THE AGREEMENT
        </h2>
        <p class="text-container-p">
        2.1 The Terms of Use shall be agreed between You and the Operator and the Payment processor.<br>
        2.2 “Operator" means Group of companies – COLDMINDS SOLUTION LTD., registration No. 13585118, registered address is at Kemp House, 160 City Road, London, EC1V 2NX, United Kingdom. The company COLDMINDS SOLUTION LTD. was founded in London, and laws of United Kingdom apply to its activity.<br>
        2.3 “Payment Processor" means COLDMINDS SOLUTION LTD, a company registered in Kemp House, 160 City Road, London with registered company number 13585118.<br>
        2.4 All information on the Website is provided by the provider of services on the Website, a company COLDMINDS SOLUTION LTD. (hereinafter legi10.com), is a company operating https://www.legi10.com. Services are provided to card holder by COLDMINDS SOLUTION LTD located at Kemp House, 160 City Road, London, EC1V 2NX, United Kingdom. In the event of any inquiries and complaints, please direct them to COLDMINDS SOLUTION LTD. COLDMINDS SOLUTION LTD is fully liable for any acts of their employees, agents or affiliated entities. COLDMINDS SOLUTION LTD as Payment processor and COLDMINDS SOLUTION LTD. as Operator in these Terms and Conditions is referred to as legi10, legi10.com, “We", “Us", “Our", “Management", “Site" or “Company" that you enter contract with. The Player and registered Account Holder shall be referred to as “You", “Yours", “Customer" or “The Player".
        </p>

        <h2 class="text-container-h2">
        3. THE AMENDMENTS TO THE TERMS AND CONDITIONS
        </h2>
        <p class="text-container-p">
        3.1. The Company reserves the right to amend the changes, the additions and the updates to any of the Terms for a number of reasons, including the commercial, the legal (in accordance with the new laws and the regulations) and also due to the changes in customer service. Any changes, additions or updates are published on the Website to inform the customers. The Player assumes responsibility for familiarizing themselves with the Terms and Conditions. For this reason, we encourage players to check for updates every so often. The Company retained the discretion to amend the changes to the Website, the services and the software and/or the technical requirements necessary for the access and the use of the services any time and without prior notification.<br>
        3.2. If the Customer does not agree to any changes, additions or amendments, he/she may stop using the Website and/or close the Account in pursuant to paragraph 12 of the Terms. The further use of the Website services by the Customer after the date of entry into force of the changes will signify his/her acceptance of the revised Terms, including (for the avoidance of doubt) any additions, exclusions, replacements and other Changes in respect of the company's services pursuant to paragraph 3.1 of the Terms and conditions, whether or not the customer has been informed and been familiar with the amended Terms.
        </p>
      </div>
    </div>
  `;

  const logo = document.querySelector(".conditions-logo");
  logo.addEventListener("click", function () {
    location.hash = "";
    location.reload();
  });
}
function openPrivacyPolicyPage() {
  hideRegistration();
  hideNavigation();
  const main = document.querySelector(".main__container");
  main.innerHTML = `
    <div class="private-policy-page">
      <a href="#" class="private-policy-logo">
        <img src="img/logo.png" alt="" width="180" />
      </a>
      <div class="text-container">
        <p class="text-container-subtitle">Company Policy</p>
        <p class="text-container-p">
        In order to show our firm commitment to strong business practices legi10.com publishes this Privacy Statement.
        </p>
        <p class="text-container-p">
        Here at legi10.com, we believe that good business relationships are built over time by way of honesty and trust. That is why the privacy of your information is extremely important for us. This means that we are committed to protecting your privacy so that your experience with legi10.com is a pleasant and secure one.
        </p>
        <h2 class="text-container-h2">
        Secured Transactions
        </h2>
        <p class="text-container-p">
        You can rest assured that we employ all possible measures to provide you with secure money transactions. We use security connections SSL, certified by Secure Server Certification Authority GoDaddy. The site has security measures in place to protect the loss, misuse and alteration of any information you give us.
        </p>

        <p class="text-container-p">
        Winnings — your winnings and cash-outs are kept strictly confidential, and winnings information is stored in secure operating environments. legi10.com keeps your winnings information private and does not provide this information to any third party unless such information is required to be disclosed by law, regulation or any governmental or competent regulatory authority.
        </p>

        <p class="text-container-p">
        Credit Card Security — using your Credit Card at legi10.com is perfectly safe. CVC utilizes sophisticated RSA public/private key encryption technology to ensure that sensitive data is transferred securely over the Internet. All Credit Card details are stored on a secure server, which is protected by the latest firewall system. This means that using your Credit Card at legi10.com is even safer than using it to order food at your local restaurant.
        </p>

        <h2 class="text-container-h2">
        Personal Information
        </h2>


        <p class="text-container-p">
        Our policy at legi10.com is that all personal information you provide, such as your name, postal address, e-mail address, telephone number, date of birth, sex, IP address is private and confidential and will not be shared, rented, sold or distributed in any manner to any other person, company or organization.
        </p>

        <h2 class="text-container-h2">
        Anti-Spam Policy
        </h2>


        <p class="text-container-p">
        legi10.com operates a strict anti-spam policy. All emails sent to our players are legitimate and are in regard to the players account, and to inform them of opportunities open to them like casino promotions, draws and tournaments. The frequency of promo mails may vary and reach up to 3 emails per day. All players reserve the right to request that these emails be stopped, and are to contact us directly for this to be fulfilled or unsubscribe by clicking the link in the bottom of an email. We operate using IP addresses to help diagnose problems with our servers. Your IP address is used to help identify you and your wagering account.
        </p>

        <h2 class="text-container-h2">
        Cookie Policy
        </h2>

        <p class="text-container-p">
        Cookies are small files that a site or its service provider transfers to your computer‘s hard drive through your Web browser (if you allow) that enables the sites or service providers systems to recognize your browser and capture and remember certain information.
        </p>
        <h2 class="text-container-h2">
        Maintaining control
        </h2>

        <p class="text-container-p">
        Playing in legi10.com should be seen as entertainment and leisure, not as earning money. Unfortunately, today the problem of gambling addiction is getting more acute and many people get into a situation when they can not stop chasing the win and jeopardizing not only financial but also psychological state. In order to control gambling passion we strongly advise you to consider the following recommendations:
        </p>
        <ul class="text-container-ul">
          <li class="text-container-li">
            Playing in a casino should be moderate and considered as a form of leisure, but not making money.
          </li>
          <li class="text-container-li">
            Do not try to win back the money immediately after a loss. Do it being calm.
          </li>
          <li class="text-container-li">
            Play only when you can cover the losses. Never borrow money for gambling.
          </li>
          <li class="text-container-li">
            Monitor time and money spent on the game.
          </li>
        </ul>
        
        <p class="text-container-p">
        If you need to limit gambling, please contact our casino support team and we will restrict your access for a while.
        If you need advice or assistance concerning gambling addiction and other problems that result from gambling, please contact one of the following organizations.
        </p>
      </div>
    </div>
  `;

  const logo = document.querySelector(".private-policy-logo");
  logo.addEventListener("click", function () {
    location.hash = "";
    location.reload();
  });
}
// // console.log();
export async function checkUserCurrentGames() {
  let message = { currGame: null };

  // проверка на лото
  const ticketsResponce = await impHttp.getTickets();
  if (ticketsResponce.status == 200) {
    let userTickets = ticketsResponce.data;
    if (userTickets.length > 0 && !location.hash.includes("loto-game")) {
      const roomId = userTickets[0].gameLevel;
      const isGameStartedRes = await impHttp.isGameStarted(roomId);
      if (isGameStartedRes.status == 200) {
        let isGameStarted = isGameStartedRes.data;
        if (JSON.parse(isGameStarted) == true) {
          message.currGame = "loto";
          message.roomId = roomId;
          message.gameStarted = true;
          return message;
        } else {
          message.currGame = "loto";
          message.roomId = roomId;
          message.gameStarted = false;
          return message;
        }
      } else {
        // message.currGame = "free";
        // return message;
      }
    } else {
      const localItemsToClear = JSON.parse(
        localStorage.getItem("localItemsToClear")
      );
      if (localItemsToClear) {
        localItemsToClear.forEach((item) => {
          localStorage.removeItem(item);
        });
        localStorage.removeItem("localItemsToClear");
      }
      // message.currGame = "free";
      // return message;
    }
  }

  // проверка на активные игры домино
  const dominoResponse = await impHttp.getDominoStatus();
  if (dominoResponse.status == 200) {
    const inDominoGameStatus = dominoResponse.data.message;
    if (inDominoGameStatus) {
      const { roomId, tableId, playerMode, gameMode } =
        dominoResponse.data.roomInfo;
      message.currGame = "domino";
      message.roomId = roomId;
      message.tableId = tableId;
      message.playerMode = playerMode;
      message.gameMode = gameMode.toUpperCase();
      message.gameStarted = true;
      return message;
    } else {
      // message.currGame = "free";
      // return message;
    }
  } else {
    // message.currGame = "free";
    // return message;
  }

  if (message.currGame == null) {
    message.currGame = "free";
    return message;
  }
}
