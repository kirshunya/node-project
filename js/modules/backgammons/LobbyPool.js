// import {  } from "../../../server/backgammons/Utility.js";
import { getRandomInt, localThisProvideComponent, range } from "./Utilities.js";
import { ConnectionStables, WSEventPool, connectWSRoutes } from "./WSEP.js";
import { WSEventPoolReady } from './syncronous.js';
import { htmlcontainer, htmlelement, htmltext } from "./htmlcontainer.js";
import { lobbyhubReady } from "./syncronous.js";
import { html, ranged } from "./htmlcontainer.js";

export const BackgammonsLobbyHub = new class __T0BackgammonsLobbyHub {
  /** @type {HTMLElement} */
  htmlview
  /** @type {Array.<Array.<__T0BackgammonsLobbyHub.TableElT>>} */
  RoomsMap = [];

  constructor() { lobbyhubReady.resolve(this); }

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
  WSEventsRoute = {
    ["backgammons::lobbyInit"]({rooms}){
      BackgammonsLobbyHub.resetLobbyTable(rooms);
    },
    ["backgammons::lobby::connectionToRoom"]({GameID, players}) {
        BackgammonsLobbyHub.setOnlineToTable(GameID, players);
    },
    ["backgammons::lobby::roomStart"]({GameID}) {
        BackgammonsLobbyHub.visitEnableToggle(GameID, true);
    },
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
    this.updalist.map(([...args])=>this.setOnlineToTable(...args));
    return container
  }
  __initvals;
  /**
   * 
   * @param {[any[], int][][]} rooms 
   * @returns 
   */
  resetLobbyTable(rooms) {
    if(!this.htmlview) return this.__initvals = rooms
    rooms.map((tables, betId)=>{
      if(!tables) return;
      tables.map((rinfo, roomId)=>{
          if(!rinfo) return;
          const [players, state] = rinfo;
          BackgammonsLobbyHub.setOnlineToTable([betId, roomId], players);
          BackgammonsLobbyHub.visitEnableToggle([betId, roomId], state === 3); // if GameStarted visitors eyes red
      })
    });
  }
  updalist = []
  setOnlineToTable([betId, roomId], players) {
    if(!this.htmlview) return this.updalist.push([...arguments])
    const table = this.RoomsMap[betId]?.[roomId];
    if(!table) return console.warn(`table[${betId}][${roomId}] not Found`);
  
    table.playersinfo.innerHTML = ranged(players)`
        <div class="domino-room-table-info__players-item">
          <img src="./img/domino-online-icon.png" alt="" />
        </div>
    `;

    table.tableparts.map((part, ind)=>
        (part.classList.toggle("filled", ind < players.length),
         (window.isAdmin == true && i == peopleItems.length - 1) &&
          (roomHalf.innerHTML = `<div class="table-admin__userid-item">${/*players[i].userId//msg.userId*/1}</div>`)
            )
    )
  }
  visitEnableToggle([betId, roomId], enable) {
    const table = this.RoomsMap[betId]?.[roomId];
    if(!table) return console.warn(`table[${betId}][${roomId}] not Found`);
    table.eyelabel.firstChild.src = enable
                                        ? 'img/backgammons/eyeh.png'
                                        : 'img/backgammons/eyek.png'
  }
}
export function openBackgammonsMenuPage() {
  return BackgammonsLobbyHub.show()
}
function onclick([dominoRoomId, tableId]) {
    // const [room, table] = this;
    // alert([dominoRoomId, tableId].join(', '));
    ConnectionStables.connectToRoom([dominoRoomId, tableId]);
}