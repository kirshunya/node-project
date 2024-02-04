import * as impHttp from "../http.js";
import * as impLotoNav from "./loto-navigation.js";
import * as impPopup from "../pages/popup.js";
import * as impAudio from "../audio.js";
import * as impMoveElement from "../move-element.js";

export const getBetByRoomId = (roomId) => {
  let bet;
  switch (roomId) {
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
  return bet;
};

function generateRandomNumbersWithoutRepeats(
  min,
  max,
  count,
  allowZero = false
) {
  if (count > max - min + 1) {
    throw new Error("Can't generate random numbers without repeats");
  }

  let numbers = [];
  while (numbers.length < count) {
    let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(randomNumber)) {
      if (allowZero) {
        numbers.push(randomNumber);
      } else {
        if (randomNumber != 0) {
          numbers.push(randomNumber);
        }
      }
    }
  }

  return numbers;
}

const deleteNumbers = (card) => {
  const newCard = [...card];

  for (let i = 0; i < 3; i++) {
    let row = newCard.slice(i * 9, i * 9 + 9);

    let numbersToDelete = generateRandomNumbersWithoutRepeats(0, 8, 4, true);
    numbersToDelete.forEach((number) => {
      row[number] = " ";
    });

    for (let j = 0; j < 9; j++) {
      newCard[i * 9 + j] = row[j];
    }
  }

  return newCard;
};

export function generateLotoCard() {
  let card = [];

  for (let i = 0; i < 27; i++) {
    card.push(0);
  }

  for (let i = 1; i <= 9; i++) {
    const column = generateRandomNumbersWithoutRepeats(
      i * 10 - 10,
      i * 10 - 1,
      3
    );

    for (let j = 0; j < 3; j++) {
      let index = j * 9 + i - 1;
      card[index] = column[j];
    }
  }

  let isValid = false;
  let newCard;

  while (!isValid) {
    isValid = true;
    newCard = deleteNumbers(card);

    for (let i = 0; i < 9; i++) {
      if (
        newCard[i] == " " &&
        newCard[i + 9] == " " &&
        newCard[i + 18] == " "
      ) {
        isValid = false;
      }
    }

    let rows = [];
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 9; j++) {
        rows.push(newCard[j]);
      }
    }

    // check if each row has 5 numbers
    for (let i = 0; i < 27; i += 9) {
      let row = rows.slice(i, i + 9);
      let count = 0;
      row.forEach((cell) => {
        if (cell != " ") {
          count++;
        }
      });

      if (count != 5) {
        isValid = false;
      }
    }
  }

  // make unique id
  let id = "";
  for (let i = 0; i < 27; i++) {
    if (newCard[i] != " ") {
      id += newCard[i];
    }
  }
  id += new Date().getTime();

  return { newCard, id };
}

export async function openGamePage(
  online = null,
  bet = null,
  bank = null,
  roomId = null,
  jackpot = null,
  isJackpotPlaying = null,
  soundAllowed = null
) {
  let body = document.querySelector("main");
  let siteLanguage = window.siteLanguage;
  body.innerHTML = `  

  <div class="loto-game-room-page">
  <div class="loto-game-room-page-content">
    <div class="room-jackpot">
      <div class="room-jackpot-sum">
        <img src="img/jackpot-icon.png" alt="" /><span>${
          jackpot != null ? Number(jackpot).toFixed(2) : 0
        }</span>
        ₼
      </div>
      <div class="room-jackpot-question">
        <img src="img/question-tag.png" alt="" />
      </div>
    </div>
    <div class="loto-gameinfo__wrapper">
      <div class="loto-room__gameinfo loto-gameinfo">
        <div class="loto-gameinfo__top-row">
          <p class="loto-gameinfo__top-row-item loto-gameinfo__bet">
            ${siteLanguage.lotoGamePage.gameInfo.betText}: <span>${
    bet != null ? bet : 0
  }</span>₼
          </p>
          <p class="loto-gameinfo__top-row-item loto-gameinfo__bank">
            ${siteLanguage.lotoGamePage.gameInfo.bankText}:
            <span>${bank != null ? Number(bank).toFixed(2) : 0}</span>₼
          </p>
          <div class="loto-room-page__exit-wrapper"></div>
        </div>
        <div
          class="loto-gameinfo__bottom-row loto-game-gameinfo__bottom-row"
        >
          <p class="loto-gameinfo__online">
            <img src="img/online-icon.png" alt="" />
            <span>${online != null ? online : 0}</span>
          </p>
          <p class="loto-gameinfo__auto-button active">
            <img src="img/autogame-icon.png" alt="" /><span>${
              siteLanguage.lotoGamePage.gameInfo.autoButtonText
            }</span>
          </p>
          <p class="loto-gameinfo__sounds-button active">
            <img src="img/profile icons/sound.png" alt="" />
          </p>
          <p class="loto-gameinfo__jackpot-block-wrapper"></p>
        </div>
      </div>
    </div>

    <div class="loto-gameinfo__information-left initial">
      ${siteLanguage.lotoGamePage.enjoyGameText}
    </div>

    <div class="loto-game-room__gameprocess"></div>
    <div class="loto-gamemain__body">
      <div class="col-div loto-game-room__main loto-gamemain">
       
      </div>
    </div>
  </div>
</div>
  `;

  impMoveElement.moveElement(
    "loto-game-room-page-content",
    "room-jackpot",
    "loto-gameinfo__wrapper",
    "loto-gameinfo__jackpot-block-wrapper",
    768
  );

  if (
    soundAllowed &&
    soundAllowed == true &&
    localStorage.getItem("sounds-game") == "true"
  ) {
    impAudio.setGameSoundsAllowed(true);
    impAudio.setMenuSoundsAllowed(true);
    localStorage.setItem("sounds-menu", true);
    localStorage.setItem("sounds-game", true);
  } else {
    impAudio.setGameSoundsAllowed(false);
    impAudio.setMenuSoundsAllowed(false);
    localStorage.setItem("sounds-menu", false);
    localStorage.setItem("sounds-game", false);
  }

  if (isJackpotPlaying && isJackpotPlaying == true) {
    impLotoNav.animateJackpot();
  }
  let isJackpotWon = localStorage.getItem("jackpotWon");

  if (isJackpotWon) {
    isJackpotWon = JSON.parse(isJackpotWon);
    if (isJackpotWon == true) {
      showJackpotWon();
    }
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

  const jackpotInformationButton = document.querySelector(
    ".room-jackpot-question"
  );

  jackpotInformationButton.addEventListener("click", function () {
    impPopup.openJackpotInfoPopup();
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

  // убираем навигацию сайта
  let footer = document.querySelector("#footer");
  if (footer && !footer.classList.contains("d-none")) {
    footer.classList.add("d-none");
  }
  // показываем билеты
  let userCards = await impHttp.getTickets();
  userCards = userCards.data;

  showPreviousCasks();
  showUserTickets(userCards, roomId);

  // добавляем функционал на кнопку "авто игра"
  const autoButton = document.querySelector(".loto-gameinfo__auto-button");
  if (autoButton) {
    autoButton.addEventListener("click", () => {
      if (autoButton.classList.contains("active")) {
        autoButton.classList.remove("active");
        localStorage.setItem("auto-play", false);
      } else {
        autoButton.classList.add("active");
        localStorage.setItem("auto-play", true);
      }
    });
  }

  let autoPlay = localStorage.getItem("auto-play");
  if (autoPlay == "true") {
    autoButton.classList.add("active");
  } else {
    autoButton.classList.remove("active");
  }
}

export function showJackpotWon(winner, sum) {
  const jackpotSum = document.querySelector(".room-jackpot-sum");
  if (jackpotSum) {
    // jackpotSum.innerHTML = `выигран!`;
    jackpotSum.innerHTML = `${
      siteLanguage.profilePage.myGamesPage.statsItem.winJackpotText.split(" ")[
        siteLanguage.profilePage.myGamesPage.statsItem.winJackpotText.split(" ")
          .length - 1
      ]
    }!`;
  }
}

export function showUserTickets(tickets, roomId) {
  // удаляем все старые
  let oldTickets = document.querySelectorAll(".bought-ticket");
  oldTickets.forEach((item) => {
    item.remove();
  });

  if (tickets.length == 0) {
    return;
  }
  let prevTicketsInfo = localStorage.getItem("ticketsInfo");
  if (!prevTicketsInfo) {
    localStorage.setItem("ticketsInfo", JSON.stringify([]));
  }
  // создаем новые
  let boughtTicketsCounter = 0;
  tickets.forEach((ticket) => {
    if (ticket.gameLevel == roomId) {
      boughtTicketsCounter++;
      let cells = JSON.parse(ticket.card);
      let id = ticket.id;
      let ticketStatus = ticket.isActive;
      let ticketsBody = document.querySelector(".loto-gamemain");
      if (ticketsBody) {
        let ticket = document.createElement("ul");
        ticket.classList.add("loto-gamemain__ticket", "bought-ticket");
        if (ticketStatus == false) {
          ticket.classList.add("unavailable");
        }
        ticket.setAttribute("id", id);
        ticket.setAttribute("choosedCasks", JSON.stringify([]));
        ticket.setAttribute("mustBeChoosed", JSON.stringify([]));
        ticket.setAttribute("unavailableCasks", JSON.stringify([]));

        prevTicketsInfo = localStorage.getItem("ticketsInfo");
        let prevTicketInfo = JSON.parse(prevTicketsInfo).find(
          (item) => item.ticketId == ticket.id
        );

        cells.forEach((cell) => {
          let ticketCell = document.createElement("li");
          ticketCell.classList.add("ticket-cell");
          if (prevTicketInfo) {
            if (prevTicketInfo.choosedCasks.includes(+cell)) {
              ticketCell.classList.add(
                "active",
                localStorage.getItem("cask-color") || ""
              );
            }
            if (prevTicketInfo.unavailableCasks.includes(+cell)) {
              ticketCell.classList.add("unavailable");
            }
            if (prevTicketInfo.mustBeChoosedCasks.includes(+cell)) {
              ticketCell.classList.add("droped");
            }
          }
          ticketCell.innerHTML = cell;
          ticket.appendChild(ticketCell);
        });
        ticketsBody.appendChild(ticket);
      }

      let ticketInfo = {
        ticketId: ticket.id,
        isActive: ticket.isActive,
        mustBeChoosedCasks: [],
        choosedCasks: [],
        unavailableCasks: [],
      };

      //создаем тикет в локал сторейдж
      let ticketsInfo = JSON.parse(localStorage.getItem("ticketsInfo"));
      if (!ticketsInfo.find((item) => item.ticketId == ticket.id)) {
        ticketsInfo.push(ticketInfo);
        localStorage.setItem("ticketsInfo", JSON.stringify(ticketsInfo));
      }
    }
  });

  let roomTicketCouner = document.querySelector(".loto-gamecontrolls__counter");
  if (roomTicketCouner) {
    let counterValue = roomTicketCouner.querySelector(
      ".loto-gamecontrolls__counter__value"
    );
    counterValue.innerHTML = boughtTicketsCounter || 1;
  }
}

export function showUserTicketsInLobby(tickets, roomId) {
  tickets.forEach((ticket) => {
    if (ticket.gameLevel == roomId) {
      let cells = JSON.parse(ticket.card);
      let id = ticket.id;
      let ticketsBody = document.querySelector(".loto-gamemain");
      if (ticketsBody) {
        let ticket = document.createElement("ul");
        ticket.classList.add("loto-gamemain__ticket", "bought-ticket");
        ticket.setAttribute("id", id);
        cells.forEach((cell) => {
          let ticketCell = document.createElement("li");
          ticketCell.classList.add("ticket-cell");
          ticketCell.innerHTML = cell;
          ticket.appendChild(ticketCell);
        });
        ticketsBody.appendChild(ticket);
      }
    }
  });
}

export function createCask(ws, cask, caskNumber, pastCasks) {
  let gameprocessBlock = document.querySelector(".loto-game-room__gameprocess");
  if (gameprocessBlock) {
    let caskBlock = document.createElement("div");

    impAudio.playNumber(cask);
    caskBlock.classList.add("loto-game-room__cask");
    caskBlock.innerHTML = cask;

    let caskNumberBlock = document.createElement("span");
    caskNumberBlock.innerHTML = caskNumber;
    caskNumberBlock.classList.add("cask-number");

    localStorage.setItem("pastCasks", JSON.stringify(pastCasks));

    // показываем последних 6 касок если они есть после того как прийдет новая
    if (pastCasks.length > 0 && gameprocessBlock) {
      gameprocessBlock.innerHTML = "";
      for (let i = 0; i < 5; i++) {
        let caskBlock = document.createElement("div");
        caskBlock.classList.add("loto-game-room__cask");
        const number = pastCasks[pastCasks.length - 6 + i];
        if (number) {
          caskBlock.innerHTML = number;
          gameprocessBlock.appendChild(caskBlock);
        }
      }
    }

    // заполняем выпавшие бочки в билетах при перезаходе
    colorDropedCasks(pastCasks);

    // убираем все бочки что старее 5
    if (gameprocessBlock.children.length > 5) {
      gameprocessBlock.removeChild(gameprocessBlock.children[0]);
    }
    // убираем все цвета с бочек
    gameprocessBlock
      .querySelectorAll(".loto-game-room__cask")
      .forEach((cask) => {
        cask.classList.remove("active");
      });
    // удаляем предидущик номера бочки
    let allOldCasks = document.querySelectorAll(".cask-number");
    allOldCasks.forEach((oldCaskNum) => {
      if (oldCaskNum) {
        oldCaskNum.remove();
      }
    });
    // Устанавливаем желтый цвет только для последней вставленной бочки
    caskBlock.classList.add("active");
    caskBlock.appendChild(caskNumberBlock);
    gameprocessBlock.appendChild(caskBlock);

    // сохраняем билеты в локал сторадж
    // saveTickets();

    // получаем состояние кнопки авто
    let buttonAuto = document.querySelector(".loto-gameinfo__auto-button");
    if (buttonAuto) {
      if (buttonAuto.classList.contains("active")) {
        colorCask(cask, pastCasks);
      } else if (!buttonAuto.classList.contains("active")) {
        checkChoosedCasks(ws, pastCasks);
        selectCaskByFinger(pastCasks);
      }
    }
  }
}

function checkChoosedCasks(ws, pastCasks) {
  let ticketsBody = document.querySelector(".loto-game-room__main");
  if (ticketsBody) {
    let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    tickets.forEach((ticket) => {
      let ticketCells = ticket.querySelectorAll(".ticket-cell");
      ticketCells.forEach((cell) => {
        if (!cell.classList.contains("droped")) {
          if (pastCasks.includes(Number(cell.innerHTML))) {
            cell.classList.add("droped");
            let mustBeChoosed = ticket.getAttribute("mustBeChoosed");
            ticket.setAttribute(
              "mustBeChoosed",
              JSON.stringify([
                ...JSON.parse(mustBeChoosed),
                Number(cell.innerHTML),
              ])
            );
          }
        } else {
          // если число не отмечено и оно есть в mustbechoosed, при том что оно так же есть в pastcasks без последних 7, значит ставим крестик и билет не активен
          const pastCasksWithoutLastSeven = pastCasks.slice(0, -6);
          if (
            pastCasksWithoutLastSeven.includes(Number(cell.innerHTML)) &&
            !cell.classList.contains("active")
          ) {
            const unavailableCasks =
              JSON.parse(ticket.getAttribute("unavailableCasks")) || [];

            if (!unavailableCasks.includes(+cell.innerHTML)) {
              ticket.setAttribute(
                "unavailableCasks",
                JSON.stringify([...unavailableCasks, +cell.innerHTML])
              );
              cell.classList.add("unavailable");

              let ticketsInfo = JSON.parse(
                localStorage.getItem("ticketsInfo") || "[]"
              );

              if (ticketsInfo) {
                ticketsInfo
                  .find((item) => item.ticketId == ticket.getAttribute("id"))
                  .unavailableCasks.push(+cell.innerHTML);

                localStorage.setItem(
                  "ticketsInfo",
                  JSON.stringify(ticketsInfo)
                );
              }
            }
            if (!ticket.classList.contains("unavailable")) {
              ticket.classList.add("unavailable");
              let ticketId = ticket.getAttribute("id");

              ws.send(
                JSON.stringify({
                  method: "cancelCard",
                  cardId: ticketId,
                })
              );
            }
          }
        }
      });
    });
  }
}

function selectCaskByFinger(pastCasks) {
  let ticketsBody = document.querySelector(".loto-game-room__main");
  if (ticketsBody) {
    // удалить все евент листенеры с билетов
    let pastTickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    let listeners = [];
    pastTickets.forEach((ticket, index) => {
      let ticketCells = ticket.querySelectorAll(".ticket-cell");
      ticketCells.forEach((cell) => {
        cell.removeEventListener("click", listeners[index]);
      });
    });

    // добавить новый евент листенер на билеты
    let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    tickets.forEach((ticket) => {
      let ticketCells = ticket.querySelectorAll(".ticket-cell");
      ticketCells.forEach((cell) => {
        let listener = colorThisCask(cell, pastCasks, ticket);
        listeners.push(listener);
        cell.addEventListener("click", listener);
      });
    });
  }

  function colorThisCask(cell, pastCasks, ticket) {
    return function (event) {
      let thisCellNumber = Number(cell.innerHTML);
      if (
        pastCasks.includes(thisCellNumber) &&
        !cell.classList.contains("unavailable")
      ) {
        if (!cell.classList.contains("active")) {
          impAudio.playSuccess();
        }
        cell.classList.add("active", localStorage.getItem("cask-color") || "");
        // обновляем все выбраные бочки
        let allActiveCasks = ticket.querySelectorAll(".ticket-cell.active");
        const activeCaskNumbers = [];
        for (let i = 0; i < allActiveCasks.length; i++) {
          let activeCaskNumber = allActiveCasks[i].innerHTML;
          activeCaskNumbers.push(Number(activeCaskNumber));
        }

        ticket.setAttribute("choosedcasks", JSON.stringify(activeCaskNumbers));
        let ticketsInfo = JSON.parse(
          localStorage.getItem("ticketsInfo") || "[]"
        );
        if (ticketsInfo) {
          ticketsInfo
            .find((item) => item.ticketId == ticket.getAttribute("id"))
            .choosedCasks.push(cask);

          localStorage.setItem("ticketsInfo", JSON.stringify(ticketsInfo));
        }
      }
    };
  }
}

function colorCask(cask, pastCasks) {
  let ticketsBody = document.querySelector(".loto-game-room__main");
  if (ticketsBody) {
    let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    let ticketsInfo = JSON.parse(localStorage.getItem("ticketsInfo") || "[]");

    // заполнение новой выпавшей циферки
    tickets.forEach((ticket) => {
      let ticketCells = ticket.querySelectorAll(".ticket-cell");

      ticketCells.forEach((cell) => {
        if (
          !cell.classList.contains("active") &&
          !cell.classList.contains("unavailable")
        ) {
          if (cask == Number(cell.innerHTML)) {
            impAudio.playSuccess();
            cell.classList.add(
              "active",
              localStorage.getItem("cask-color") || ""
            );
            let allActiveCasks = ticket.querySelectorAll(".ticket-cell.active");
            ticket.setAttribute("choosedcasks", allActiveCasks.length);

            if (ticketsInfo) {
              ticketsInfo
                .find((item) => item.ticketId == ticket.getAttribute("id"))
                .choosedCasks.push(cask);

              localStorage.setItem("ticketsInfo", JSON.stringify(ticketsInfo));
            }
          }
        }
      });
    });
  }
}

export function checkWin(
  winners,
  bank,
  winnersAmount,
  isJackpotWon,
  jackpotData,
  winnersData
) {
  let winnersIds = winners;
  let ticketsBody = document.querySelector(".loto-game-room__main");
  if (ticketsBody) {
    let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
    let winTickets = 0;
    tickets.forEach((ticket) => {
      let ticketId = ticket.getAttribute("id");
      if (winnersIds.includes(ticketId)) {
        winTickets++;
      }
    });

    const wonSum = (bank / winnersAmount) * winTickets;

    let jackpotWonMessage = "";
    if (isJackpotWon) {
      jackpotWonMessage =
        siteLanguage.profilePage.myGamesPage.statsItem.jackpotWasWon;
    } else {
      jackpotWonMessage =
        siteLanguage.profilePage.myGamesPage.statsItem.jackpotWasNotWon;
    }

    if (winTickets > 0) {
      impAudio.playLoading();
      impPopup.openEndGamePopup(
        `${siteLanguage.profilePage.myGamesPage.statsItem.congrats} ${(
          bank / winnersData.length
        ).toFixed(2)} ₼!`,
        200,
        winnersData,
        bank,
        isJackpotWon,
        jackpotData
      );
      return;
    } else {
      impAudio.playLoading();
      impPopup.openEndGamePopup(
        siteLanguage.profilePage.myGamesPage.statsItem.lose,
        400,
        winnersData,
        bank,
        isJackpotWon,
        jackpotData
      );
    }
  }
}

async function colorDropedCasks(pastCasks) {
  const page = document.querySelector(".loto-game-room-page");

  if (!page.classList.contains("auto-filled")) {
    page.classList.add("auto-filled");

    let ticketsBody = document.querySelector(".loto-game-room__main");
    const { data: ticketsData } = await impHttp.getTickets();

    if (ticketsBody) {
      let ticketsInfo = JSON.parse(localStorage.getItem("ticketsInfo") || "[]");

      let tickets = ticketsBody.querySelectorAll(".loto-gamemain__ticket");
      // заполнение старых цифр которые сейчас не заполнены
      tickets.forEach((ticket) => {
        const ticketData = ticketsData.find(
          (item) => item.id == ticket.getAttribute("id")
        );
        if (ticketData.isActive == false) {
          ticket.classList.add("unavailable");
        }
        let ticketCells = ticket.querySelectorAll(".ticket-cell");
        const unavailableCasks =
          JSON.parse(ticket.getAttribute("unavailableCasks")) || [];
        ticketCells.forEach((cell) => {
          if (
            ticketData.isActive == true &&
            !cell.classList.contains("active") &&
            !cell.classList.contains("unavailable")
          ) {
            if (pastCasks.includes(Number(cell.innerHTML))) {
              if (
                !unavailableCasks.includes(+cell.innerHTML) &&
                ticketData.isActive == true
              ) {
                if (ticketsInfo) {
                  if (
                    !ticketsInfo
                      .find(
                        (item) => item.ticketId == ticket.getAttribute("id")
                      )
                      .choosedCasks.includes(+cell.innerHTML)
                  ) {
                    ticketsInfo
                      .find(
                        (item) => item.ticketId == ticket.getAttribute("id")
                      )
                      .choosedCasks.push(+cell.innerHTML);
                  }

                  localStorage.setItem(
                    "ticketsInfo",
                    JSON.stringify(ticketsInfo)
                  );
                }

                cell.classList.add(
                  "active",
                  localStorage.getItem("cask-color") || ""
                );
              }
              let allActiveCasks = ticket.querySelectorAll(
                ".ticket-cell.active"
              );
              ticket.setAttribute("choosedcasks", allActiveCasks.length);
            }
          }
        });
      });
    }
  }
}

function showPreviousCasks() {
  let pastCasks = localStorage.getItem("pastCasks");
  if (pastCasks) {
    pastCasks = JSON.parse(pastCasks);
  } else return;

  const gameprocessBlock = document.querySelector(
    ".loto-game-room__gameprocess"
  );

  if (gameprocessBlock && gameprocessBlock.innerHTML == "") {
    for (let i = 0; i < 6; i++) {
      let caskBlock = document.createElement("div");
      caskBlock.classList.add("loto-game-room__cask");
      const number = pastCasks[pastCasks.length - 6 + i];
      caskBlock.innerHTML = number;
      if (i == 5) {
        caskBlock.classList.add("active");
        let caskNumberBlock = document.createElement("span");
        caskNumberBlock.innerHTML = pastCasks.length;
        caskNumberBlock.classList.add("cask-number");
        caskBlock.appendChild(caskNumberBlock);
      }
      if (number) {
        gameprocessBlock.appendChild(caskBlock);
      }
    }
  }
}
