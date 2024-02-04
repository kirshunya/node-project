import * as impHttp from "../http.js";
import * as impLotoGame from "./loto-game.js";
import * as impNav from "../navigation.js";
import * as impPopup from "../pages/popup.js";
import * as impAudio from "../audio.js";
import * as authinterface from "../authinterface.js";
import * as time from "../time.js";

let preloader = document.querySelector(".page-preloader");

let lotoTimer = null;
let timerStarted = false;

// let intervals = [];
// let activeTimers = {
//   room1: null,
//   room2: null,
//   room3: null,
//   room4: null,
//   room5: null,
// };
// let activeFinishTimers = {
//   room1: null,
//   room2: null,
//   room3: null,
//   room4: null,
//   room5: null,
// };

export function setLoader(roomId) {
  const room = document.querySelector(`.loto-room-${roomId}`);
  if (!room.classList.contains("finishing")) {
    const loader = document.createElement("div");
    loader.classList.add("room-loader");
    room.appendChild(loader);
  }
}

export async function openLotoRoom(ws, roomId) {
  const room = document.querySelector(`.loto-room-${roomId}`);
  const loader = room.querySelector(".room-loader");

  roomId = Number(roomId);
  if (!loader) {
    setLoader(roomId);
  }

  // проверка началась ли игра
  let isGameStarted = await impHttp.isGameStarted(roomId);

  if (isGameStarted.data == true) {
    let isPlayerInRoom = await impHttp.isPlayerInRoom(roomId);
    if (isPlayerInRoom.data == true) {
      const bet = impLotoGame.getBetByRoomId(roomId);
      location.hash = `#loto-game-${roomId}`;
    } else {
      location.hash = "";
      impPopup.openErorPopup(siteLanguage.popups.gameStarted);
    }
  } else {
    location.hash = `#loto-room-${roomId}`;
  }
}

export const handleLeftSome = (msg, leftSome) => {
  let block1, block2, block3;
  let siteLanguage = window.siteLanguage;
  const gameContent = document.querySelector(".loto-game-room-page-content");
  const gameProcess = document.querySelector(".loto-game-room__gameprocess");
  block3 = document.querySelector(".left3 span");
  switch (leftSome) {
    case "left1":
      if (msg.left1 > 0) {
        block1 = document.querySelector(".left1");
        block2 = document.querySelector(".left2");
        block3 = document.querySelector(".left3");
        if (block2) {
          block2.remove();
        }
        if (block3) {
          block3.remove();
        }
        const initialBlock = document.querySelector(
          ".loto-gameinfo__information-left.initial"
        );
        if (initialBlock) {
          initialBlock.remove();
        }

        if (!block1) {
          let block = document.createElement("div");
          block.classList.add("loto-gameinfo__information-left", "left1");

          // У COUNT_PLAYERS игроков остался 1 боченок
          // if COUNT_PLAYERS in row, replace it to msg.left1
          block.innerHTML = siteLanguage.lotoGamePage.left1Text.replace(
            "COUNT_PLAYERS",
            "<span>0</span>"
          );

          gameContent.insertBefore(block, gameProcess);
        }
        block1 = document.querySelector(".left1 span");
        block1.innerHTML = msg.left1;
      }

      break;
    case "left2":
      block2 = document.querySelector(".left2");
      if (msg.left2 > 0) {
        block3 = document.querySelector(".left3");
        if (block3) {
          block3.remove();
        }
        const initialBlock = document.querySelector(
          ".loto-gameinfo__information-left.initial"
        );
        if (initialBlock) {
          initialBlock.remove();
        }

        if (!block2) {
          let block = document.createElement("div");
          block.classList.add("loto-gameinfo__information-left", "left2");
          block.innerHTML = siteLanguage.lotoGamePage.left2Text.replace(
            "COUNT_PLAYERS",
            "<span>0</span>"
          );
          // block.innerHTML = `У <span>0</span> карточек осталось 2 номерa`;
          gameContent.insertBefore(block, gameProcess);
        }
        block2 = document.querySelector(".left2 span");
        block2.innerHTML = msg.left2;
      }

      break;
    case "left3":
      if (msg.left3 > 0) {
        const initialBlock = document.querySelector(
          ".loto-gameinfo__information-left.initial"
        );
        if (initialBlock) {
          initialBlock.remove();
          let block = document.createElement("div");
          block.classList.add("loto-gameinfo__information-left", "left3");
          block.innerHTML = siteLanguage.lotoGamePage.left3Text.replace(
            "COUNT_PLAYERS",
            "<span>0</span>"
          );
          // block.innerHTML = `У <span>0</span> карточек осталось 3 номерa`;
          gameContent.insertBefore(block, gameProcess);
        }
        block3 = document.querySelector(".left3 span");
        block3.innerHTML = msg.left3;
      }

      break;
  }
};

export async function startLotoTimer(
  strtedAt,
  activeTimers,
  activeFinishTimers
) {
  // стартуем таймер
  let lobbyPage = document.querySelector(".loto-room-page");
  if (lobbyPage) {
    let timerBlock = document.querySelector(".loto-room-page__timer span");
    const startedAt = new Date(strtedAt).getTime();
    const targetTime = startedAt + 60 * 1000; // 5 minutes in milliseconds
    let nowClientTime = await time.NowClientTime();

    let distance = targetTime - nowClientTime;
    if (lotoTimer != null) {
      clearInterval(lotoTimer);
      lotoTimer = null;
    }
    lotoTimer = setInterval(async () => {
      distance -= 1000;
      if (distance <= 0) {
        clearInterval(lotoTimer);
        lotoTimer = null;
        if (timerBlock) {
          // добавить окно (игра начинается)
          timerBlock.innerHTML = "00:00";
        }
        return;
        // checkLotoQueue(eventSource, roomData, roomId);
      } else {
        const minutes = Math.floor(distance / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Add leading zeros for formatting
        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(seconds).padStart(2, "0");
        if (timerBlock) {
          timerBlock.innerHTML = `${formattedMinutes}:${formattedSeconds}`;
        }
      }
    }, 1000);
  }
}

export function updateAllRoomsOnline(onlineArr) {
  let mainPage = document.querySelector(".games");
  if (mainPage) {
    for (let roomId = 1; roomId <= 5; roomId++) {
      let lotoRoom = mainPage.querySelector(`.loto-room-${roomId}`);
      if (lotoRoom) {
        let lotoRoomOnline = lotoRoom.querySelector(".lobby-room-online span");
        if (lotoRoomOnline) {
          lotoRoomOnline.innerHTML = onlineArr[`room${roomId}`];
        }
      }
    }
  }
}

export function updateAllRoomsBet(betArr) {
  let mainPage = document.querySelector(".games");
  if (mainPage) {
    for (let roomId = 1; roomId <= 5; roomId++) {
      let lotoRoom = mainPage.querySelector(`.loto-room-${roomId}`);
      if (lotoRoom) {
        let lotoRoomBet = lotoRoom.querySelector(".lobby-room-bet span");
        if (lotoRoomBet) {
          const targetBet = betArr[`room${roomId}`];
          const currentBet = parseFloat(lotoRoomBet.innerHTML);

          if (targetBet !== currentBet) {
            animateNumberChange(lotoRoomBet, currentBet, targetBet);
          }
        }
      }
    }
  }
}

export function updateAllRoomsJackpot(jackpots) {
  let mainPage = document.querySelector(".games");
  if (mainPage) {
    for (let roomId = 1; roomId <= 5; roomId++) {
      let lotoRoom = mainPage.querySelector(`.loto-room-${roomId}`);
      if (lotoRoom) {
        let lotoRoomJackpot = lotoRoom.querySelector(".game__room-jackpot-sum");
        if (lotoRoomJackpot) {
          const targetJackpot = jackpots[`room${roomId}`];
          const currentJackpot = parseFloat(lotoRoomJackpot.innerHTML);

          if (targetJackpot !== currentJackpot) {
            animateNumberChange(lotoRoomJackpot, currentJackpot, targetJackpot);
          }
        }
      }
    }
  }
}

export function animateNumberChange(
  element,
  startValue,
  endValue,
  acceleration = 1
) {
  const duration = 2000;
  const framesPerSecond = 60;
  const frameDuration = Math.floor(1000 / framesPerSecond);
  const frames = Math.ceil(duration / frameDuration);
  const increment = ((endValue - startValue) / frames) * acceleration;

  let currentFrame = 0;
  let currentValue = startValue;

  function updateValue() {
    currentFrame++;
    currentValue += increment;
    element.innerHTML = currentValue.toFixed(2);

    if (currentFrame < frames) {
      requestAnimationFrame(updateValue);
    } else {
      element.innerHTML = Number(endValue).toFixed(2);
    }
  }

  updateValue();
}

export function buyTickets(ws, roomId, bet) {
  let siteLanguage = window.siteLanguage;
  let buyButton = document.querySelector(".loto-gamecontrolls__buy");
  if (buyButton) {
    let localUser = localStorage.getItem("user");

    if (localUser) {
      localUser = JSON.parse(localUser);
    }

    buyButton.addEventListener("click", async function () {
      let ticketsCount = document.querySelector(
        ".loto-gamecontrolls__counter__value"
      );

      const isGameStartedRes = await impHttp.isGameStarted(roomId);
      if (isGameStartedRes.data == false) {
        localStorage.setItem("ticketsInfo", JSON.stringify([]));
        localStorage.setItem("pastCasks", JSON.stringify([]));
        localStorage.setItem("jackpotWon", JSON.stringify(false));
      } else return;

      if (ticketsCount && ticketsCount.innerHTML == 0) {
        return;
      }

      let ticketsBody = document.querySelector(".loto-gamemain");
      let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
      const boughtTickets = ticketsBody.querySelectorAll(".bought-ticket");
      if (boughtTickets.length == tickets.length) {
        return;
      }
      let ticketsArray = [];

      // const balance = +document.querySelector(".header__balance").innerHTML;

      let user = localStorage.getItem("user");
      if (user) {
        user = JSON.parse(user);
      }

      const ticketsPrice =
        (+ticketsCount.innerHTML - boughtTickets.length) * bet;
      if (user.balance < ticketsPrice) {
        impPopup.openErorPopup(`${siteLanguage.popups.notEnoughMoney}`);
        return;
      }

      tickets.forEach((ticket) => {
        if (!ticket.classList.contains("bought-ticket")) {
          let ticketCells = ticket.querySelectorAll(".ticket-cell");
          let ticketId = ticket.getAttribute("id");
          let ticketInfo = {};
          let ticketCellsArray = [];
          ticketCells.forEach((cell) => {
            let cellNumber = cell.querySelector(".ticket-cell-number");
            let number = cellNumber.innerHTML;
            ticketCellsArray.push(number);
          });
          ticketInfo.ticketCells = ticketCellsArray;
          ticketInfo.ticketId = ticketId;
          ticketsArray.push(ticketInfo);
        }
      });

      let msg = {
        bet,
        roomId,
        tickets: ticketsArray,
        user: localUser.username,
        userId: localUser.userId,
        method: "buyTickets",
      };

      impAudio.playBuyTicket();
      ws.send(JSON.stringify(msg));
    });
  }
}

export function createTicket(cells, ticketId) {
  let siteLanguage = window.siteLanguage;
  let ticketsBody = document.querySelector(".loto-gamemain");
  if (ticketsBody) {
    let ticketContainer = document.createElement("div");
    let buttons = document.createElement("div");
    buttons.classList.add("ticket-buttons");
    ticketContainer.classList.add("ticket-container");
    let ticket = document.createElement("ul");
    ticket.classList.add("loto-gamemain__ticket");
    ticket.setAttribute("id", ticketId);
    cells.forEach((cell) => {
      let ticketCell = document.createElement("li");
      ticketCell.classList.add("ticket-cell");
      let ticketCellNumber = document.createElement("div");
      ticketCellNumber.classList.add("ticket-cell-number");
      ticketCellNumber.innerHTML = cell;
      ticketCell.appendChild(ticketCellNumber);
      ticket.appendChild(ticketCell);
    });
    let refreshButton = document.createElement("button");
    refreshButton.classList.add("loto-gamemain__ticket__refresh");

    refreshButton.innerHTML = `<img src="img/refresh-ticket.png" alt="" /> ${siteLanguage.lotoRoomPage.tickets.updateText}`;
    refreshButton.addEventListener("click", async function () {
      let ticketData = impLotoGame.generateLotoCard();
      let cells = ticketData.newCard;
      let ticketId = ticketData.id;
      ticket.innerHTML = "";
      cells.forEach((cell) => {
        let ticketCell = document.createElement("li");
        ticketCell.classList.add("ticket-cell");
        let ticketCellNumber = document.createElement("div");
        ticketCellNumber.classList.add("ticket-cell-number");
        ticketCellNumber.innerHTML = cell;
        ticketCell.appendChild(ticketCellNumber);
        ticket.appendChild(ticketCell);
      });
      impAudio.playRefreshTicket();
      ticket.setAttribute("id", ticketId);
    });
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("loto-gamemain__ticket__delete");
    deleteButton.innerHTML = `<img src="img/remove-ticket.png" alt="" /> ${siteLanguage.lotoRoomPage.tickets.deleteText}`;
    deleteButton.addEventListener("click", async function () {
      if (!ticket.classList.contains("bought-ticket")) {
        // check if tickets > 1, then delete
        const tickets = document.querySelectorAll(".loto-gamemain__ticket");
        if (tickets.length > 1) {
          ticketContainer.remove();
          impAudio.playDeleteTicket();
          const counter = document.querySelector(
            ".loto-gamecontrolls__counter__value"
          );
          const counterValue = +counter.innerHTML;
          counter.innerHTML = counterValue - 1;
        }
      }
    });

    buttons.appendChild(refreshButton);
    buttons.appendChild(deleteButton);
    ticketContainer.appendChild(buttons);
    ticketContainer.appendChild(ticket);
    ticketsBody.appendChild(ticketContainer);
  }
}

export async function startMenuTimerLobby(
  timers,
  activeTimers,
  activeFinishTimers
) {
  // get all timers on the page
  let mainPage = document.querySelector(".games");
  if (mainPage) {
    for (let roomId = 1; roomId <= 5; roomId++) {
      let lotoRoom = mainPage.querySelector(`.loto-room-${roomId}`);
      if (lotoRoom) {
        let lotoRoomTimer = lotoRoom.querySelector(
          ".room-left__item-timer-block .timer-block__timer"
        );

        if (timers[`room${roomId}`] == null) {
          if (activeTimers[`room${roomId}`] != null) {
            clearInterval(activeTimers[`room${roomId}`]);
            activeTimers[`room${roomId}`] = null;
          }
          if (lotoRoomTimer) {
            lotoRoomTimer.innerHTML = "00:00";

            lotoRoom.classList.remove("finishing", "starting");
            let lotoRoomTimerText = lotoRoom.querySelector(
              ".room-left__item-timer-block .timer-block__text"
            );
            lotoRoomTimerText.innerHTML =
              siteLanguage.mainPage.gamecards.timerTextWaiting;
          }
        } else {
          let lotoRoomTimerText = lotoRoom.querySelector(
            ".room-left__item-timer-block .timer-block__text"
          );
          lotoRoomTimerText.innerHTML =
            siteLanguage.mainPage.gamecards.timerTextStarting;
          lotoRoom.classList.add("starting");
          let countDownDate =
            new Date(timers[`room${roomId}`]).getTime() + 60000;

          let nowClientTime = await time.NowClientTime();

          let distance = countDownDate - nowClientTime;

          if (activeTimers[`room${roomId}`] != null) {
            clearInterval(activeTimers[`room${roomId}`]);
            activeTimers[`room${roomId}`] = null;
          }
          let timer = setInterval(async function () {
            distance -= 1000;
            if (distance <= 0) {
              clearInterval(activeTimers[`room${roomId}`]);
              activeTimers[`room${roomId}`] = null;

              lotoRoomTimer.innerHTML = "00:00";
            } else if (distance > 0) {
              const minutes = Math.floor(distance / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);

              // Add leading zeros for formatting
              const formattedMinutes = String(minutes).padStart(2, "0");
              const formattedSeconds = String(seconds).padStart(2, "0");
              if (lotoRoomTimer) {
                lotoRoomTimer.innerHTML = `${formattedMinutes}:${formattedSeconds}`;
              }
            }
          }, 1000);
          clearInterval(activeTimers[`room${roomId}`]);
          activeTimers[`room${roomId}`] = timer;
        }
      }
    }
  }
}

export async function startMenuTimerGame(
  timers,
  activeTimers,
  activeFinishTimers
) {
  const siteLanguage = window.siteLanguage;
  // get all timers on the page
  let mainPage = document.querySelector(".games");
  if (mainPage) {
    for (let roomId = 1; roomId <= 5; roomId++) {
      let lotoRoom = mainPage.querySelector(`.loto-room-${roomId}`);
      if (lotoRoom) {
        let lotoRoomTimer = lotoRoom.querySelector(
          ".room-left__item-timer-block .timer-block__timer"
        );

        if (timers[`room${roomId}`] == null) {
          if (activeFinishTimers[`room${roomId}`] != null) {
            clearInterval(activeFinishTimers[`room${roomId}`]);
            activeFinishTimers[`room${roomId}`] = null;
          }
          lotoRoom.classList.remove("finishing", "starting");
          let lotoRoomTimerText = lotoRoom.querySelector(
            ".room-left__item-timer-block .timer-block__text"
          );
          lotoRoomTimerText.innerHTML =
            siteLanguage.mainPage.gamecards.timerTextWaiting;

          if (lotoRoomTimer) {
            lotoRoomTimer.innerHTML = "00:00";
          }
        } else {
          // очищаем интервал если он был
          if (activeFinishTimers[`room${roomId}`] != null) {
            clearInterval(activeFinishTimers[`room${roomId}`]);
            activeFinishTimers[`room${roomId}`] = null;
          }
          // очищаем интервал у таймеров начала ожидания игр
          if (activeTimers[`room${roomId}`] != null) {
            clearInterval(activeTimers[`room${roomId}`]);
            activeTimers[`room${roomId}`] = null;
          }
          //добавляем клас на комнату
          let lotoRoomTimerText = lotoRoom.querySelector(
            ".room-left__item-timer-block .timer-block__text"
          );
          lotoRoomTimerText.innerHTML =
            siteLanguage.mainPage.gamecards.timerTextFinising;
          lotoRoom.classList.add("finishing");

          let countDownDate = new Date(timers[`room${roomId}`]).getTime();

          let nowClientTime = await time.NowClientTime();

          let distance = nowClientTime - countDownDate;

          // запускаем новый интервал
          let timer = setInterval(async function () {
            distance = distance + 1000;
            const minutes = Math.floor(distance / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const formattedMinutes = String(minutes).padStart(2, "0");
            const formattedSeconds = String(seconds).padStart(2, "0");

            if (lotoRoomTimer) {
              lotoRoomTimer.innerHTML = `${formattedMinutes}:${formattedSeconds}`;
            }
          }, 1000);

          clearInterval(activeFinishTimers[`room${roomId}`]);
          activeFinishTimers[`room${roomId}`] = timer;
        }
      }
    }
  }
}

export async function createTickets(msg) {
  let tickets = msg.tickets;
  tickets.forEach((ticket) => {
    let cells = ticket.ticketCells;
    let id = ticket.ticketId;
    let ticketsBody = document.querySelector(".loto-gamemain");
    if (ticketsBody) {
      let ticket = document.createElement("ul");
      ticket.classList.add("loto-gamemain__ticket", "bought-ticket");
      ticket.setAttribute("id", id);
      cells.forEach((cell) => {
        let ticketCell = document.createElement("li");
        ticketCell.classList.add("ticket-cell");
        let ticketCellNumber = document.createElement("div");
        ticketCellNumber.classList.add("ticket-cell-number");
        ticketCellNumber.innerHTML = cell;
        ticketCell.appendChild(ticketCellNumber);
        ticket.appendChild(ticketCell);
      });
      ticketsBody.appendChild(ticket);
    }
  });
}

export function deleteTickets() {
  let ticketsBody = document.querySelector(".loto-gamemain");
  let ticketContainers = ticketsBody.querySelectorAll(".ticket-container");

  ticketContainers.forEach((container) => {
    let ticket = container.querySelector(".loto-gamemain__ticket");
    if (!ticket.classList.contains("bought-ticket")) {
      container.remove();
    }
  });
}

export function deleteTicket() {
  let ticketsBody = document.querySelector(".loto-gamemain");
  let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
  let ticket = tickets[tickets.length - 1];
  const ticketContainer = ticket.parentElement;
  if (ticket) {
    if (!ticket.classList.contains("bought-ticket")) {
      ticketContainer.remove();
      return true;
    }
  }
  return false;
}

export function setBet(data) {
  let lotoGameInfo = document.querySelector(".loto-gameinfo");
  if (lotoGameInfo) {
    let lotoBet = lotoGameInfo.querySelector(".loto-gameinfo__bet");
    lotoBet.querySelector("span").innerHTML = `${data.bet}`;
  }
}

export function updateOnline(online) {
  let lotoGameInfo = document.querySelector(".loto-gameinfo");
  if (lotoGameInfo) {
    let lotoOnline = lotoGameInfo.querySelector(".loto-gameinfo__online");
    lotoOnline.querySelector("span").innerHTML = `${online}`;
  }
}
export function updateBank(bank) {
  let lotoGameInfo = document.querySelector(".loto-room-page");
  if (lotoGameInfo) {
    let lotoBank = lotoGameInfo.querySelector(".loto-gameinfo__bank");
    const targetBank = bank;
    const currentBank = parseFloat(lotoBank.querySelector("span").innerHTML);
    if (targetBank !== currentBank) {
      animateNumberChange(
        lotoBank.querySelector("span"),
        currentBank,
        targetBank
      );
    }
  }
}
export function updatIngameBank(bank) {
  let lotoGameInfo = document.querySelector(".loto-game-room-page");
  if (lotoGameInfo) {
    let lotoBank = lotoGameInfo.querySelector(".loto-gameinfo__bank");
    const targetBank = bank;
    const currentBank = parseFloat(lotoBank.querySelector("span").innerHTML);
    if (targetBank !== currentBank) {
      animateNumberChange(
        lotoBank.querySelector("span"),
        currentBank,
        targetBank
      );
    }
  }
}

export function animateJackpot() {
  let lotoJackpot = document.querySelector(".room-jackpot-sum");
  if (lotoJackpot) {
    lotoJackpot.classList.add("animating");
  }
}

export function updateJackpot(jackpot) {
  let lotoJackpot = document.querySelector(".room-jackpot-sum span");
  if (lotoJackpot) {
    const targetJackpot = jackpot;
    const currentJackpot = parseFloat(lotoJackpot.innerHTML);

    if (targetJackpot !== currentJackpot) {
      animateNumberChange(lotoJackpot, currentJackpot, targetJackpot);
    }
  }
}

export function updatePrevBanks(banks) {
  const games = document.querySelector(".games");
  if (games) {
    const prevBanks = games.querySelectorAll(".game__room-prevbank-sum");
    prevBanks.forEach((prevBank, index) => {
      prevBank.innerHTML = banks[`room${index + 1}`].toFixed(2);
    });
  }
}

export function deleteExitButton() {
  let lotoExitButton = document.querySelector(".loto-room-page__exit");
  if (lotoExitButton) {
    lotoExitButton.remove();
  }
}

export function counterTickets() {
  let counter = document.querySelector(".loto-gamecontrolls__counter");
  if (counter) {
    let counterValue = counter.querySelector(
      ".loto-gamecontrolls__counter__value"
    );

    let counterMinus = counter.querySelector(
      ".loto-gamecontrolls__counter__minus"
    );
    let counterPlus = counter.querySelector(
      ".loto-gamecontrolls__counter__plus"
    );
    counterMinus.removeEventListener("click", addTickets);
    counterPlus.removeEventListener("click", deleteTickets);

    counterMinus.addEventListener("click", deleteTickets);
    counterPlus.addEventListener("click", addTickets);

    function addTickets() {
      if (counterValue.innerHTML < 6) {
        counterValue.innerHTML = +counterValue.innerHTML + 1;
        let ticketData = impLotoGame.generateLotoCard();
        let cells = ticketData.newCard;
        let ticketId = ticketData.id;
        createTicket(cells, ticketId);
        impAudio.playTicket();
      }
    }
    function deleteTickets() {
      if (counterValue.innerHTML > 1) {
        let isDeleted = deleteTicket();
        if (isDeleted == true) {
          counterValue.innerHTML = +counterValue.innerHTML - 1;
          impAudio.playDeleteTicket();
        } else counterValue.innerHTML = +counterValue.innerHTML;
      }
    }
  }
}

export function createClientId() {
  // текущее время в миллисекундах
  const currentTimeMs = Date.now();

  //случайное число для обеспечения уникальности
  const randomValue = Math.floor(Math.random() * 100000);

  // уникальный идентификатор, объединив текущее время и случайное число
  const uniqueId = `${currentTimeMs}-${randomValue}`;

  return uniqueId;
}
