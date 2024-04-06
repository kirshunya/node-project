import { range } from "./Utilities.js";

export function setOnlineToTable(roomId, tableId, players) {
    // const playerMode = getPlayerMode();
  
    // const hash = window.location.hash.split("/");
    // const gameMode = hash[0] == "#domino-menu" ? "CLASSIC" : "TELEPHONE";
  
    const hash = window.location.hash;
    // let gameMode = "CLASSIC";
    // //  hash[0] == "#domino-menu" ? "CLASSIC" : "TELEPHONE";
  
    // if (hash.includes("domino-menu-telephone")) {
    //   gameMode = "TELEPHONE";
    // } else {
    //   gameMode = "CLASSIC";
    // }
  
    // check if user is on right page
    // if (
    //   (!hash.includes("domino-menu") &&
    //     !hash.includes("domino-menu-telephone")) ||
    //   playerMode !== msg.playerMode ||
    //   gameMode.toUpperCase() !== msg.gameMode.toUpperCase()
    // ) {
    //   return;
    // }

    const tableBlock = document.querySelector(
        `.domino-room[dominoRoomId="${roomId}"] .domino-room-content__table[tableId="${tableId}"]`
    );
    if (!tableBlock) return;
    const playersOnline = tableBlock.querySelector(
        ".domino-room-table-info__players"
    );
    if (playersOnline) {
        let peopleItems = playersOnline.querySelectorAll(
            ".domino-room-table-info__players-item"
        );
  
        let roomHalfs = tableBlock.querySelectorAll(".domino-room-table-part");
    
        playersOnline.innerHTML += `
            <div class="domino-room-table-info__players-item">
            <img src="./img/domino-online-icon.png" alt="" />
            </div>
        `;
  
        peopleItems = playersOnline.querySelectorAll(
            ".domino-room-table-info__players-item"
        );
    
        for (let i = 0; i < players.length; i++) {
            let roomHalf = roomHalfs[i];
            if (roomHalf) {
                roomHalf.classList.add("filled");
                if (window.isAdmin == true && i == peopleItems.length - 1) {
                roomHalf.innerHTML = `<div class="table-admin__userid-item">${/*players[i].userId//msg.userId*/1}</div>`;
                }
            }
        }
  
      // playersOnline.innerHTML = Number(playersOnline.innerHTML) + 1;
    }
}

export function openBackgammonsMenuPage() {
    const main__container = document.createElement("div");
    main__container.classList.add(
      "main__container",
      "header__padding",
      "footer__padding"
    );
    const main = document.getElementsByTagName('main')[0];
    main.innerHTML = '';
    const Rooms = formTwoPlayersMenu(main, main__container, 'CLASSIC');
}
function formTwoPlayersMenu(main, main__container, gameMode='CLASSIC') {
    //   const siteLanguage = window.siteLanguage;
        const gamesBlock = document.createElement("div");
        gamesBlock.classList.add("domino-games", "games");
        
        const roomsBet = [
            { id: 1, bet: 0.5 },
            { id: 2, bet: 1 },
        ];
        const roomsHtml = roomsBet.map((room) => ` <div
        class="domino-room domino-room-players-2 domino-room-mode-${gameMode.toLowerCase()}"
        dominoRoomId="${+room.id}"
      >
        <div class="domino-room-header">
          <img
            class="domino-room-header__img"
            src="./img/loto-room-card-logo.png"
            alt=""
          />
          <p class="domino-room-header__title">
            ${
              gameMode == "CLASSIC"
                ? siteLanguage.dominoRoomsMenu.classic
                : siteLanguage.dominoRoomsMenu.telephone
            }
          </p>
          <div class="domino-room-header__rules">
            <img src="./img/domino-menu-quest.png" alt="" />
          </div>
        </div>
        <div class="domino-room-content">
          <div class="swiper domino-room-content__tables-swiper">
            <div class="swiper-wrapper domino-room-content__tables">
                ${
                    range(1,7).map(i=>`<div class="domino-room-content__table swiper-slide" tableId="${i}">
                      <div class="domino-room-content__table-image">
                        <div class="domino-room-table-half domino-room-table-part"></div>
                        <div class="domino-room-table-half domino-room-table-part"></div>
                      </div>
                      <div class="domino-room-content__table-info">
                        <p class="domino-room-table-info__timer">00:00</p>
                        <div class="domino-room-table-info__players"></div>
                      </div>
                    </div>`).join('\n\r')
                }
            </div>
            <div class="swiper-scrollbar domino-room-swiper-scrollbar"> </div>
          </div>
          <div class="domino-room__info">
            <p class="domino-room-bet__text">
              ${siteLanguage.dominoRoomsMenu.gamePrice}:
            </p>
            <p class="domino-room-bet">${room.bet.toFixed(2)}₼</p>
            <p class="domino-room-duration">
              <span
                >${
                //   gameMode == "CLASSIC" ?
                     siteLanguage.dominoRoomsMenu.classicDurationLabel
                    // : siteLanguage.dominoRoomsMenu.telephoneDurationLabel
                }</span
              >
              <span>${siteLanguage.dominoRoomsMenu.gameDuration}</span>
            </p>
          </div>
        </div>
      </div>`
        ).join('\n\r');
    
        gamesBlock.innerHTML = roomsHtml;
        main__container.appendChild(gamesBlock);
        main.appendChild(main__container);
        
        // создаем сладеры для елементов
        var swiper = new Swiper(".domino-room-content__tables-swiper", {
                slidesPerView: 4,
                // centeredSlides: true,
                spaceBetween: 20,
                grabCursor: true,
                slidesPerView: 3,
                allowTouchMove: true,
                scrollbar: {
                el: ".swiper-scrollbar",
                hide: false,
                draggable: true,
            },
            breakpoints: {
                // когда ширина экрана >= 320px
                320: {
                    spaceBetween: 10,
                    slidesPerView: 3,
                },
                // когда ширина экрана >= 480px
                480: {
                    spaceBetween: 20,
                    slidesPerView: 3,
                },
            },
        });
    
    //   const dominoRulesButtons = document.querySelectorAll(
    //     ".domino-room-header__rules"
    //   );
    //   if (dominoRulesButtons) {
    //     dominoRulesButtons.forEach((dominoRulesButton) => {
    //       dominoRulesButton.addEventListener("click", function () {
    //         impPopup.openRulesInfoPopup(gameMode);
    //       });
    //     });
    //   }
        const rooms = [...document.querySelectorAll(".domino-room")];
        rooms.map((room) => {
            const tables = [...room.querySelectorAll(".domino-room-content__table")];
            const dominoRoomId = +room.getAttribute("dominoRoomId");
            return {
                [dominoRoomId]: tables.map((table) => {
                const tableId = +table.getAttribute("tableId");
                table.addEventListener("click", onclick.bind([room, table], [dominoRoomId, tableId]));
                return {[tableId]:table};
            })};
        });
}
function onclick([dominoRoomId, tableId]) {
    const [room, table] = this;
    alert(dominoRoomId);
    window.ws.send(
      JSON.stringify({
        method: "backgammons/connect",
        GameID: [dominoRoomId, tableId]
      })
    );
}