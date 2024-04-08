import { getRandomInt, localThisProvideComponent, range } from "./Utilities.js";
import { htmlcontainer, htmlelement, htmltext } from "./htmlcontainer.js";
import { html } from "./prophtml.js";

export function setOnlineToTable([roomId, tableId], players) {
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
        `.domino-room[betId="${roomId}"] .domino-room-content__table[tableId="${tableId}"]`
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
export const BackgammonsLobbyHub = new class __T0BackgammonsLobbyHub {
  /** @type {HTMLElement} */
  htmlview
  /** @type {Array.<Array.<__T0BackgammonsLobbyHub.TableElT>>} */
  RoomsMap = [];

  constructor() {}

  show() {
    return document.getElementsByTagName('main')[0].replaceChildren(
      this.htmlview?this.htmlview:this.init()
    );
  }
  static TableElT = class TableElT {
    tableparts = []
    timerlabel
    playersinfo
    eyelabel
    /** @param {[int, int]} GameID  */
    constructor(GameID) {
      /** @type {[int, int]} */
      this.GameID = GameID;
      const element = this.content = htmlcontainer(
        htmlelement('div', 'domino-room-content__table swiper-slide', {tableId:GameID[1]}), [
          this.eyelabel = htmltext('div', 'backgammons-visitor', '<img src="img/backgammons/eyek.png">'),
          htmlcontainer(
            htmlelement('div', 'domino-room-content__table-image'), [
              this.tableparts[0] = htmlelement('div', 'domino-room-table-half domino-room-table-part'),
              this.tableparts[1] = htmlelement('div', 'domino-room-table-half domino-room-table-part')
            ]),
          htmlcontainer(
            htmlelement('div', 'domino-room-content__table-info'), [
              this.timerlabel = htmltext('div', 'domino-room-table-info__timer', '00:00'),
              this.playersinfo = htmlelement('div', 'domino-room-table-info__players')
            ])
        ]
      )
      element.addEventListener('click', onclick.bind(null, GameID));
    }
    html() { return this.content; }
  }
  WSEventsRoute = new class extends localThisProvideComponent('hub') {
    ["backgammons::lobbyInit"]({room}){
      BackgammonsLobbyHub.resetLobbyTable(rooms);
    }
    ["backgammons::lobby::connectionToRoom"]({GameID, players}) {
        BackgammonsLobbyHub.setOnlineToTable(GameID, players);
    }
    ["backgammons::lobby::GameStart"]({GameID}) {
        BackgammonsLobbyHub.visitEnableToggle(GameID, true);
    }
    ["backgammons::lobby::GameEnd"](msg) {
        BackgammonsLobbyHub.setOnlineToTable(GameID, []);
        BackgammonsLobbyHub.visitEnableToggle(GameID, false);
    }
  }
  init() {
    const container = htmlelement('div', ["main__container","header__padding","footer__padding"]);
    const mutobserverCode = `backgsLobby${getRandomInt(-65341, 65341)}`;
    const swipers = [];
    container.replaceChildren(htmlcontainer(
        htmlelement('div', 'domino-games games', {name:mutobserverCode}, {mutobserverCode}), [
          ...range(1,2).map(betId=>(this.RoomsMap[betId] = [],
              htmlcontainer(
                htmlelement(
                    'div', 
                    'domino-room domino-room-players-2 domino-room-mode-classic',
                    { betId }, { betId }, []
                ), [
                  htmlcontainer(
                    htmlelement('div', 'domino-room-header'), [
                      htmlelement('img', 'domino-room-header__img', {src:'./img/loto-room-card-logo.png', alt:' '}),
                      htmltext('p', 'domino-room-header__title', ' Классическая '),
                      htmltext('div', 'domino-room-header__rules', '<img src="./img/domino-menu-quest.png" alt="">'),
                    ]
                  ),
                  htmlcontainer(
                    htmlelement('div', 'domino-room-content'),[
                      htmlcontainer(
                        htmlelement('div', 'swiper domino-room-content__tables-swiper', null, null, null, [AddSwiperBehaviour]), [
                          htmlcontainer(
                            htmlelement('div', 'swiper-wrapper domino-room-content__tables'), [
                              ...range(1,7).map(roomId=>(
                                this.RoomsMap[betId][roomId] = new __T0BackgammonsLobbyHub.TableElT([betId, roomId])).html()
                              )
                            ]
                          )
                        ]
                      ),
                      htmltext('div', "domino-room__info", `
                        <p class="domino-room-bet__text">
                          Цена комнаты:
                        </p>
                        <p class="domino-room-bet">0.50₼</p>
                        <p class="domino-room-duration">
                          <span>Одна игра</span>
                          <span>Длительность игры: 5 минут</span>
                        </p>`
                      )
                    ]
                  )
                ]
            )
          ))
        ]
      ));
    this.htmlview = container;
    function  AddSwiperBehaviour (swiperEl) { return swipers.push(swiperEl) };
    swipers.map(swiper=>new Swiper(swiper, {
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
      }));
    this.__initvals&&this.resetLobbyTable(this.__initvals);
    this.updalist.map(([...args])=>setOnlineToTable(...args));
    return container
  }
  __initvals;
  resetLobbyTable(rooms) {
    if(!this.htmlview) return this.__initvals = rooms
    rooms.map((tables, betId)=>{
      // betId+=1;
      tables.map((table, roomId)=>{
          roomId+=1;
          BackgammonsLobbyHub.setOnlineToTable([betId, roomId], table.players);
      })
    });
  }
  updalist = []
  setOnlineToTable([betId, roomId], players) {
    if(!this.htmlview) return this.updalist.push([...arguments])
    const table = this.RoomsMap[betId][roomId];
  
    table.playersinfo.innerHTML += `
        <div class="domino-room-table-info__players-item">
        <img src="./img/domino-online-icon.png" alt="" />
        </div>
    `;

    table.tableparts.map((part, ind)=>
        part.classList.toggle("filled", ind < players.length)
    )
    // for (let i = 0; i < players.length; i++) {
    //     const roomHalf = table.tableparts[i];
    //     if (roomHalf) {
    //         roomHalf.classList.add("filled");
    //         if (window.isAdmin == true && i == peopleItems.length - 1) {
    //           roomHalf.innerHTML = `<div class="table-admin__userid-item">${/*players[i].userId//msg.userId*/1}</div>`;
    //         }
    //     }
    // }
  }
  visitEnableToggle([betId, roomId], enable) {
    const table = this.RoomsMap[betId][roomId];
    table.eyelabel.firstChild.src = enable
                                        ? 'img/backgammons/eyeh.png'
                                        : 'img/backgammons/eyek.png'
  }
}
export function openBackgammonsMenuPage() {
  return BackgammonsLobbyHub.show()
}
// export function openBackgammonsMenuPage() {
//     const main__container = document.createElement("div");
//     main__container.classList.add(
//       "main__container",
//       "header__padding",
//       "footer__padding"
//     );
//     const main = document.getElementsByTagName('main')[0];
//     main.innerHTML = '';
//     const Rooms = formTwoPlayersMenu(main, main__container, 'CLASSIC');
// }
function formTwoPlayersMenu(main, main__container, gameMode='CLASSIC') {
    //   const siteLanguage = window.siteLanguage;
        const gamesBlock = document.createElement("div");
        gamesBlock.classList.add("domino-games", "games");
        
        const roomsBet = [
            { id: 1, bet: 0.5 },
            { id: 2, bet: 1 },
        ];
        const roomsHtml = roomsBet.map((room) => `
        <div class="domino-room domino-room-players-2 domino-room-mode-${gameMode.toLowerCase()}"
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
    // const [room, table] = this;
    alert(dominoRoomId);
    window.ws.send(
      JSON.stringify({
        method: "backgammons/connect",
        GameID: [dominoRoomId, tableId]
      })
    );
}