import * as impLotoGame from "./loto/loto-game.js";
import * as impLotoNav from "./loto/loto-navigation.js";
import * as impPopup from "./pages/popup.js";
import * as impHttp from "./http.js";
import * as impNav from "./navigation.js";
import * as authinterface from "./authinterface.js";
import * as impDominoNav from "./domino/domino-navigation.js";
import * as impdominoGame from "./domino/domino-game.js";
import * as BackgammonsWS from "../WSEP.js";
import * as impAudio from "./audio.js";
import { API_URL_PART } from "./config.js";

let preloader = document.querySelector(".page-preloader");

let lotoTimer = null;
let timerStarted = false;

let intervals = [];
let activeTimers = {
  room1: null,
  room2: null,
  room3: null,
  room4: null,
  room5: null,
};
let activeFinishTimers = {
  room1: null,
  room2: null,
  room3: null,
  room4: null,
  room5: null,
};

let pingIntervals = [];

export const connectWebsocketFunctions = () => {
  // const ws = new WebSocket(`wss://app.24loto.com/game`);
  // const ws = new WebSocket(`wss://loto-server-new.onrender.com/game`);
  const ws = new WebSocket(`ws${API_URL_PART}/game`);
  // const ws = new WebSocket(`wss://lotogame.onrender.com/game`);
  window.ws = ws;

  let clientId = impLotoNav.createClientId();

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  ws.onopen = () => {
    // console.log("Подключение установлено");
    ws.send(
      JSON.stringify({
        clientId: clientId,
        username: localUser.username,
        userId: localUser.userId,
        method: "connectGeneral",
      })
    );

    pingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    const newPingInterval = setInterval(() => {
      try {
        let windowWs = window.ws;
        if (windowWs) {
          windowWs.send(JSON.stringify({ method: "ping" }));
        }
      } catch (e) {
        // console.log(e);
      }
    }, 20000);
    pingIntervals.push(newPingInterval);
  };

  ws.onmessage = async (event) => {
    let msg = JSON.parse(event.data);
    localUser = JSON.parse(localStorage.getItem("user"));
    let dominoRoomLoader = document.querySelector(".domino-game-loader");

    console.log(msg);
    switch (msg.method) {
      case "wsMsg":
        console.log("ws cleaned");
        break;
      case "connectGeneral":
        break;
      case "logoutUser":
        // // console.log(msg);
        localStorage.removeItem("token");
        location.username = null;
        localStorage.removeItem("user");
        let disconnectMsg = {
          reason: "anotherConnection",
          page: "mainLotoPage",
        };
        ws.close(1000, JSON.stringify(disconnectMsg));
        impPopup.openAnotherAccountEnterPopup(ws);
        break;
      case "getAllInfo":
        impLotoNav.updateAllRoomsOnline(msg.rooms);
        impLotoNav.updateAllRoomsBet(msg.bank);

        for (let room = 1; room <= 5; room++) {
          let roomTimer = activeTimers[`room${room}`];
          if (roomTimer != null) {
            roomTimer = null;
            clearInterval(roomTimer);
          }
        }

        await impLotoNav.startMenuTimerLobby(
          msg.timers,
          activeTimers,
          activeFinishTimers
        );

        for (let room = 1; room <= 5; room++) {
          if (activeFinishTimers[`room${room}`] != null) {
            clearInterval(activeFinishTimers[`room${room}`]);
            activeFinishTimers[`room${room}`] = null;
          }
        }
        await impLotoNav.startMenuTimerGame(
          msg.timers,
          activeTimers,
          activeFinishTimers
        );
        break;
      case "allRoomsOnline":
        impLotoNav.updateAllRoomsOnline(msg.rooms);
        break;
      case "updateAllRoomsBank":
        impLotoNav.updateAllRoomsBet(msg.bank);
        break;
      case "updateAllRoomsJackpot":
        impLotoNav.updateAllRoomsJackpot(msg.jackpots);
        break;
      case "allRoomsStartTimers":
        for (let room = 1; room <= 5; room++) {
          if (activeTimers[`room${room}`] != null) {
            clearInterval(activeTimers[`room${room}`]);
            activeTimers[`room${room}`] = null;
          }
        }
        await impLotoNav.startMenuTimerLobby(
          msg.timers,
          activeTimers,
          activeFinishTimers
        );
        break;
      case "allRoomsFinishTimers":
        // // console.log(activeFinishTimers);
        // // console.log(msg);
        for (let room = 1; room <= 5; room++) {
          if (activeFinishTimers[`room${room}`] != null) {
            clearInterval(activeFinishTimers[`room${room}`]);
            activeFinishTimers[`room${room}`] = null;
          }
        }
        await impLotoNav.startMenuTimerGame(
          msg.timers,
          activeTimers,
          activeFinishTimers
        );
        break;
      case "updateBalance":
        authinterface.updateBalance(msg.balance);
        break;
      case "connectGame":
        // // console.log(msg);
        // // проверка есть ли юзер в комнате
        // добавление информации о комнате
        impLotoNav.setBet(msg);
        impLotoNav.updateOnline(msg.online);
        if (msg.startedAt != null) {
          // // console.log(msg.startedAt);
          impLotoNav.deleteExitButton();
          if (lotoTimer == null) {
            impLotoNav.startLotoTimer(
              msg.startedAt,
              activeTimers,
              activeFinishTimers
            );
          }
        }

        impLotoNav.updatIngameBank(msg.bank);

        if (msg.isJackpotPlaying == true) {
          impLotoNav.animateJackpot();
        }

        let { data: userTickets } = await impHttp.getTickets();
        const userTickesInRoom = userTickets.filter(
          (ticket) => ticket.gameLevel == msg.roomId
        );

        if (msg.userId == localUser.userId && !userTickesInRoom.length) {
          // создаём билет если только зашел в комнату
          let ticketData = impLotoGame.generateLotoCard();
          let cells = ticketData.newCard;
          let ticketId = ticketData.id;
          impLotoNav.createTicket(cells, ticketId);
        }
        break;
      case "disconnectGame":
        impLotoNav.setBet(msg);
        impLotoNav.updateOnline(msg.online);
        // updateBank(msg);
        break;
      case "buyTickets":
        if (msg.isBought == false) {
          impPopup.openErorPopup(siteLanguage.popups.ticketBuyError);
          return;
        }
        impLotoNav.deleteTickets();
        impLotoNav.createTickets(msg);
        // update counter
        const counter = document.querySelector(
          ".loto-gamecontrolls__counter__value"
        );
        counter.innerHTML = document.querySelectorAll(
          ".loto-gamemain__ticket"
        ).length;

        break;

      case "didntBoughtTickets":
        let bet = 0;
        switch (msg.roomId) {
          case 1:
            bet = 0.2;
            break;
          case 2:
            bet = 0.5;
            break;
          case 3:
            bet = 1;
            break;
          case 4:
            bet = 5;
            break;
          case 5:
            bet = 10;
            break;
        }
        // countCards(ws, msg.roomId, bet);
        ws.close(
          1000,
          JSON.stringify({
            roomId: msg.roomId,
            bet: bet,
            userId: localUser.userId,
            username: localUser.username,
            method: "disconnectGame",
            page: "mainLotoPage",
          })
        );
        impPopup.openErorPopup("Вы не купили билеты для игры!");
        break;
      case "updateRoomTimer":
        // // console.log(msg);
        if (msg.startedAt != null) {
          // // console.log(msg.startedAt);
          if (lotoTimer == null) {
            impLotoNav.deleteExitButton();
            impLotoNav.startLotoTimer(
              msg.startedAt,
              activeTimers,
              activeFinishTimers
            );
          }
        }
        break;

      case "updateBank":
        impLotoNav.updateBank(msg.bank);
        break;
      case "updateJackpot":
        impLotoNav.updateJackpot(msg.jackpot);
        break;
      case "updateAllRoomsPrevBank":
        impLotoNav.updatePrevBanks(msg.prevBank);
        break;
      case "updateOnline":
        impLotoNav.updateOnline(msg.online);
        break;
      case "openGame":
        // // console.log(msg);
        location.hash = `#loto-game-${msg.roomId}?bet=${msg.bet}&bank=${msg.bank}&jackpot=${msg.jackpot}&online=${msg.online}&isJackpotPlaying=${msg.isJackpotPlaying}&sound=true`;
        break;
      case "sendNewCask":
        impLotoGame.createCask(ws, msg.cask, msg.caskNumber, msg.pastCasks);
        // await impLotoGame.colorDropedCasks(msg.pastCasks);
        break;

      case "jackpotWon":
        impLotoGame.showJackpotWon(msg.winner, msg.sum);
        localStorage.setItem("jackpotWon", JSON.stringify(true));

        break;

      case "winGame":
        // // console.log(msg);
        impLotoGame.checkWin(
          msg.winners,
          msg.bank,
          msg.winnersAmount,
          msg.isJackpotWon,
          msg.jackpotData,
          msg.winnersData
        );
        localStorage.setItem("pastCasks", JSON.stringify([]));
        localStorage.setItem("jackpotWon", JSON.stringify(false));
        localStorage.setItem("ticketsInfo", JSON.stringify([]));
        break;
      case "leftSome":
        switch (msg.type) {
          case "left1":
            impLotoNav.handleLeftSome(msg, "left1");
            break;
          case "left2":
            impLotoNav.handleLeftSome(msg, "left2");
            break;
          case "left3":
            impLotoNav.handleLeftSome(msg, "left3");
            break;
        }
        break;
      case "rejectGameBet":
        if (msg.error > 0) {
          impPopup.open("Ошибка выхода из игры", 300);
        } else {
          authinterface.updateBalance(msg.newBalance);
        }
        break;
      // ================== BACKGAMMONS ==================
        case "backgammons::event":
          BackgammonsWS.onnewmsg(msg);
          break;
      // ================== DOMINO ==================

      case "connectDomino":
        console.log(msg);
        console.log(msg.userId, "userID подключился");
        impDominoNav.addOnlineToTable(msg);
        impDominoNav.startTableTimer(msg);

        // impPopup.openDominoLoseGame([{ userId: 2, username: "bebra" }], []);

        // impPopup.openDominoWinGame([{ userId: 1, username: "2voby" }]);

        let user = localStorage.getItem("user");
        user = JSON.parse(user);
        if (msg.userId == user.userId) {
          window.dominoRoomId = msg.dominoRoomId;
          window.tableId = msg.tableId;
          window.gameMode = msg.gameMode;
          window.playerMode = msg.playerMode;

          window.location.hash = `domino-room-table/${msg.dominoRoomId}/${msg.tableId}/${msg.playerMode}/${msg.gameMode}`;
        }
        // window.location.hash = `domino-room-table/${msg.dominoRoomId}/${msg.tableId}/${msg.playerMode}/${msg.gameMode}`;
        break;

      case "getAllDominoInfo":
        console.log(msg);
        await impDominoNav.addDominoRoomsInfo(msg);
        await impDominoNav.setRoomsTimers(msg);

        let dominoWaitingPopup = document.querySelector(
          ".domino-waiting-popup"
        );

        if (dominoWaitingPopup) {
          const popupRoomId = dominoWaitingPopup.getAttribute("roomId");
          const popupTableId = dominoWaitingPopup.getAttribute("tableId");
          const popupPlayerMode = dominoWaitingPopup.getAttribute("playerMode");
          const popupGameMode = dominoWaitingPopup.getAttribute("gameMode");
          if (dominoWaitingPopup) {
            const table = msg.dominoInfo
              .find(
                (room) =>
                  room.dominoRoomId == popupRoomId &&
                  room.gameMode == popupGameMode &&
                  room.playerMode == popupPlayerMode
              )
              .tables.find((table) => table.tableId == popupTableId);
            impPopup.updateDominoWaitingPopup(
              table.online,
              table.players,
              popupPlayerMode
            );
          }
        }

        break;

      case "startDominoTableTimerMenu":
        await impDominoNav.createDominoTimer(msg);
        break;

      case "startDominoTableTimerTable":
        console.log("players", msg);
        impPopup.openDominoTimerPopup(msg);
        break;

      case "isDominoStarted":
        if (msg.allow == true) {
          const { dominoRoomId, tableId, gameMode, playerMode } = msg;
          window.location.hash = `domino-room-table/${dominoRoomId}/${tableId}/${playerMode}/${gameMode.toUpperCase()}`;
        } else {
          impPopup.openErorPopup("Подождите пока закончится игра!");
        }
        break;
      
      case "waitingTableData":
        let roomOnline = msg.online;
        const isPopupOpened =
          document.querySelector(".domino-waiting-popup") != null;
        if (!isPopupOpened) {
          if (!msg.isStarted) {
            impPopup.openDominoWaitingPopup(
              roomOnline,
              msg.dominoRoomId,
              msg.tableId,
              msg.playerMode,
              msg.gameMode,
              msg.startedWaitingAt,
              msg.players
            );
          }
        } else {
          impPopup.updateDominoWaitingPopup(
            roomOnline,
            msg.players,
            msg.playerMode
          );
        }

        break;

      case "startDominoGameTable":
        localUser = JSON.parse(localStorage.getItem("user"));

        window.playersTiles = JSON.stringify(
          msg.players.map((player) => {
            return {
              userId: player.userId,
              tiles: player.tiles,
            };
          })
        );

        window.dominoRoomId = msg.dominoRoomId;
        window.tableId = msg.tableId;
        window.gameMode = msg.gameMode;
        window.playerMode = msg.playerMode;

        if (msg.continued == false) {
          authinterface.updateBalance(localUser.balance - msg.bet);
        }

        impAudio.playGameStarted();
        localStorage.removeItem("dominoGameScene");
        window.currentTurn = msg.turn;

        impdominoGame.dropTableInfo();
        // // console.log(msg.scene);
        localStorage.setItem("dominoGameScene", JSON.stringify(msg.scene));

        try {
          // рисуем инфу
          impdominoGame.setDominoTableInfo(msg);
          impdominoGame.setDominoTurn(msg.turn, msg.turnTime);
          impdominoGame.tilesState(msg.turn, [], msg.continued, true);
          // impdominoGame.tilesController(
          //   msg.dominoRoomId,
          //   msg.tableId,
          //   msg.playerMode,
          //   msg.gameMode
          // );
        } catch (e) {
          console.error(e);
        } finally {
          // убираем прелоадер
          let roomStartPreloader = document.querySelector(
            ".domino-game-room__preloader"
          );
          if (roomStartPreloader) {
            roomStartPreloader.remove();
          }
        }

        break;

      case "newDominoTurn":
        // const playerTilesPopup = document.querySelector(
        //   ".domino-enemy-tiles-popup"
        // );
        // if (playerTilesPopup) {
        //   playerTilesPopup.remove();
        // }

        localStorage.setItem("dominoGameScene", JSON.stringify(msg.scene));
        // localStorage.setItem("playersTiles", JSON.stringify(msg.playersTiles));
        window.playersTiles = JSON.stringify(msg.playersTiles);

        window.currentTurn = msg.currentTurn;
        impdominoGame.setDominoTurn(msg.currentTurn, msg.turnTime);
        impdominoGame.tilesState(msg.currentTurn, msg.scene);

        if (
          msg.skipedTurn.skipedTurn == true &&
          msg.skipedTurn.playerId == localUser.userId
        ) {
          impdominoGame.showSkipedTurnWindow();
        } else if (
          msg.autoTurn.autoTurn == true &&
          msg.autoTurn.playerId == localUser.userId
        ) {
          impdominoGame.showAutoTurnWindow("auto");
        }

        // if (msg.autoTurn.autoTurn == true) {
        //   impdominoGame.showSkippedEnemyTurn(msg.autoTurn.playerId, "auto");
        // } else
        if (msg.skipedTurn.skipedTurn == true) {
          impdominoGame.showSkippedEnemyTurn(
            msg.skipedTurn.playerId,
            "skipped"
          );
        }

        if (dominoRoomLoader) {
          dominoRoomLoader.remove();
        }
        break;

      case "deleteInventoryTile":
        impdominoGame.deletePlayerTiles(msg.deletedTileId, msg.tiles);
        break;

      case "updateDominoGameScene":
        impdominoGame.updateGameScene(msg.scene);
        break;

      case "openTileMarket":
        impdominoGame.openTilesMarket(msg.market);

        break;

      case "getMarketTile":
        impdominoGame.getMarketTile(msg.tile, msg);

        break;

      case "enemyOpenMarket":
        impdominoGame.showMarketEnemy(msg.userId);
        break;
      case "updateUserTiles":
        // получаем масив всех доминошек
        impdominoGame.drawPlayerTiles(msg.tiles);
        // impdominoGame.tilesState(msg.turn, msg.scene);
        // impdominoGame.tilesController(
        //   msg.dominoRoomId,
        //   msg.tableId,
        //   msg.playerMode,
        //   msg.gameMode
        // );
        break;

      case "updateMarketNumber":
        impdominoGame.updateMarketNum(msg.marketNumber, msg.player);
        break;

      case "updateEnemysTilesCount":
        impdominoGame.updateEnemysTilesCount(msg.playerTilesData);
        break;

      case "updateEnemysTilesMarket":
        // localStorage.setItem("playersTiles", JSON.stringify(msg.playersTiles));
        // console.log("UPDATE ENEMY TILES MARKET", msg.playersTiles);
        window.playersTiles = JSON.stringify(msg.playersTiles);
        impPopup.updateEnemyTilesPopup(msg.playersTiles);
        break;

      case "winDominoGame":
        localUser = localStorage.getItem("user");
        if (localUser) {
          localUser = JSON.parse(localUser);
        }

        impdominoGame.dropTableInfo();
        // authinterface.updateBalance(localUser.balance + msg.prize - msg.bet);
        authinterface.updateBalance(localUser.balance + msg.prize);
        impPopup.openDominoWinGame(msg.winners, msg.playersTiles, msg.prize);
        if (dominoRoomLoader) {
          dominoRoomLoader.remove();
        }
        break;

      case "endDominoGame":
        localUser = localStorage.getItem("user");
        if (localUser) {
          localUser = JSON.parse(localUser);
        }
        impdominoGame.dropTableInfo();
        // authinterface.updateBalance(localUser.balance - msg.lostAmount);
        impPopup.openDominoLoseGame(msg.winners, msg.playersTiles);
        // const userData = JSON.parse(localStorage.getItem("user"));
        // userData.balance -= msg.lostAmount;
        // localStorage.setItem("user", JSON.stringify(userData));
        if (dominoRoomLoader) {
          dominoRoomLoader.remove();
        }

        window.dominoRoomId = null;
        window.tableId = null;
        window.gameMode = null;
        window.playerMode = null;

        break;

      case "endAndCloseDominoGame":
        const gameMode = msg.gameMode;
        let disconnectDomninoMsg = {
          reason: "createNewWs",
          page:
            gameMode == "CLASSIC" ? "dominoClassicPage" : "dominoTelephonePage",
        };

        let popups = document.querySelectorAll(".popup");
        popups.forEach((popup) => {
          popup.remove();
        });
        if (dominoRoomLoader) {
          dominoRoomLoader.remove();
        }

        window.ws.close(1000, JSON.stringify(disconnectDomninoMsg));

        window.dominoRoomId = null;
        window.tableId = null;
        window.gameMode = null;
        window.playerMode = null;

        break;

      case "reconnectDominoGame":
        localStorage.setItem("dominoGameScene", JSON.stringify(msg.scene));
        window.playersTiles = JSON.stringify(msg.playersTiles);

        if (msg.turnTime) {
          window.currentTurn = +msg.turn;

          window.dominoRoomId = msg.roomId;
          window.tableId = msg.tableId;
          window.gameMode = msg.gameMode;
          window.playerMode = msg.playerMode;

          impdominoGame.reconnectFillTable(msg);
          let roomPreloader = document.querySelector(
            ".domino-game-room__preloader"
          );

          if (roomPreloader) {
            roomPreloader.remove();
          }
          if (dominoRoomLoader) {
            dominoRoomLoader.remove();
          }
        } else {
          console.error(
            "Error while getting turn time! try to reload the page "
          );
        }

        break;

      case "reconnectEndedDominoGame":
        impPopup.openFinisedGamePopup();
        break;

      case "finishTelephoneRound":
        impdominoGame.dropTableInfo();
        impPopup.openDominoTelephoneRoundFinishPopup(
          msg.lastWinnerScore,
          msg.lastWinnerUsername,
          msg.playersScore,
          msg.lastWinnerPrevScore,
          msg.lastWinnerId,
          msg.playersTiles
        );
        if (dominoRoomLoader) {
          dominoRoomLoader.remove();
        }
        break;

      case "notEnoughBalance":
        impPopup.openErorPopup("Недостаточно средств на балансе");
        break;

      case "sendEmoji":
        impdominoGame.showEmoji(msg);
        break;

      case "sendPhrase":
        impdominoGame.showPhrase(msg);
        break;

      case "updatePlayerScore":
        impdominoGame.updatePlayerScore(msg.userId, msg.score, msg.addedScore);
        break;

      case "updateTableScore":
        impDominoNav.updateTableScore(msg);
        break;

      case "dominoRoomIsGoing":
        impPopup.openErorPopup(siteLanguage.popups.waitEndGame, true);
        break;

      case "roomIsNotAvailable":
        impPopup.openErorPopup(siteLanguage.popups.roomUnavailable, true);
        break;
    }
  };

  ws.onclose = (info) => {
    // console.log(info);

    // если вебсокет был закрыт изза проблем с интернетом или другими проблемами клиента
    if (info.code == 1006) {
      if (navigator.onLine) {
        const newWs = connectWebsocketFunctions();
        window.ws = newWs;
        location.hash = "#gamemode-choose";
        impNav.pageNavigation(newWs);
        impNav.addHashListeners();
      }
      return;
    }

    // проверяем на reason ответ от вебсокетов
    if (info.reason != "" && info.reason != " ") {
      let infoReason = JSON.parse(info.reason);
      if (infoReason != "" && infoReason.reason == "anotherConnection") {
        return;
      } else {
        if (window.ws) {
          let disconnectMsg = { reason: "createNewWs", page: "mainLotoPage" };
          window.ws.close(1000, JSON.stringify(disconnectMsg));
        }

        // // console.log(infoReason.page);
        switch (infoReason.page) {
          case "mainLotoPage":
            history.replaceState(
              {},
              null,
              `${location.origin}${location.pathname}#gamemode-choose"`
            );
            location.hash = "#loto-menu";

            break;

          case "mainPage":
            history.replaceState(
              {},
              null,
              `${location.origin}${location.pathname}#profile"`
            );
            location.hash = "#gamemode-choose";

            break;

          case "dominoTelephonePage":
            history.replaceState(
              {},
              null,
              `${location.origin}${location.pathname}#gamemode-choose"`
            );
            location.hash = "#domino-menu-telephone";

            break;

          case "dominoTelephonePage4":
            history.replaceState(
              {},
              null,
              `${location.origin}${location.pathname}#gamemode-choose"`
            );
            location.hash = "#domino-menu-telephone4";

            break;

          case "dominoClassicPage":
            history.replaceState(
              {},
              null,
              `${location.origin}${location.pathname}#gamemode-choose"`
            );
            location.hash = "#domino-menu";

            break;

          case "dominoClassicPage4":
            history.replaceState(
              {},
              null,
              `${location.origin}${location.pathname}#gamemode-choose"`
            );
            location.hash = "#domino-menu4";

            break;
          // default:
          //   location.hash = "";

          //   break;
        }

        const newWs = connectWebsocketFunctions();
        window.ws = newWs;
        impNav.pageNavigation(newWs);
        impNav.addHashListeners();
        return;
      }
    } else {
      if (window.ws) {
        let disconnectMsg = { reason: "createNewWs", page: "mainLotoPage" };
        window.ws.close(1000, JSON.stringify(disconnectMsg));
      }
      switch (infoReason.page) {
        case "mainLotoPage":
          location.hash = "#loto-menu";
          break;

        case "mainPage":
          location.hash = "#gamemode-choose";
          break;
        default:
          location.hash = "#gamemode-choose";
          break;
      }
      const newWs = connectWebsocketFunctions();
      window.ws = newWs;
      impNav.pageNavigation(newWs);
      impNav.addHashListeners();
    }
  };

  return ws;
};
