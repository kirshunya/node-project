// import {    } from "../../../server/backgammons/Utility.js";
import { getRandomInt, localThisProvideComponent, range } from "./Utilities.js";
import { ConnectionStables } from "./WSEP.js";
import { BetsLoaded, WSEventPoolReady } from './syncronous.js';
import { BackgammonsEnterAsVisitorPopup, htmlcontainer, htmlelement, htmltext } from "./htmlcontainer.js";
import { lobbyhubReady } from "./syncronous.js";
import { html, ranged } from "./htmlcontainer.js";
import { openErorPopup } from "../pages/popup.js";
import { getLocalUser } from "../authinterface.js";
class TableElT {
  /** @type {[HTMLElement, HTMLElement]} */
    tableparts = []
    timerlabel
    __playersinfo
    eyelabel
    
    _$players = []
    get players() { return this._$players; }
    set players(players) {
        this.playersinfo.innerHTML = ranged(this._$players = players)/* html */`
                  <div class="domino-room-table-info__players-item">
                      <img src="./img/domino-online-icon.png" alt="" />
                  </div>
        `;

        this.tableparts.map((part, ind)=>
                (part.classList.toggle("filled", ind < players.length),
                  (window.isAdmin == true) && 
                    (part.innerHTML = /* html */`<div class="table-admin__userid-item">${players[ind]?.userId||''}</div>`)
                        )
        )
        return true;
    }
    /** @param {[int, int]} GameID    */
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
        element.addEventListener('click', onclick.bind(null, GameID, this));
    }
    html() { return this.content; }
}
export const BackgammonsLobbyHub = new class __T0BackgammonsLobbyHub {
    /** @type {HTMLElement} */
    htmlview
    /** @type {Array.<Array.<TableElT>>} */
    RoomsMap = [];

    constructor() { lobbyhubReady.resolve(this); }

    show() {
        const _container = document.getElementsByClassName('main__container')[0];
        const container = _container?_container:htmlelement('div', ["main__container","header__padding","footer__padding"]);
        container.replaceChildren(this.htmlview?this.htmlview:this.init())
        return document.getElementsByTagName('main')[0].replaceChildren(container);
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
        const mutobserverCode = `backgsLobby${getRandomInt(-65341, 65341)}`;
        const container = htmlelement('div', 'domino-games games', {name:mutobserverCode}, {mutobserverCode});
        const swipers = [];
        const inited = BetsLoaded.then(bets=>htmlcontainer(
                container, [
                ...Object.entries(bets.BackgammonsBETS).filter(([,a])=>a).map(([betId, betData])=>(this.RoomsMap[betId] = [],
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
                                                            this.RoomsMap[betId][roomId] = new TableElT([betId, roomId])).html()
                                                        )
                                                    ]
                                                ),
                                                htmltext('div', 'swiper-scrollbar domino-room-swiper-scrollbar swiper-scrollbar-horizontal', 
                                                                    '<div class="swiper-scrollbar-drag"></div>')
                                            ]
                                        ),
                                        htmltext('div', "domino-room__info", `
                                            <p class="domino-room-bet__text">
                                                Цена комнаты:
                                            </p>
                                            <p class="domino-room-bet">${betData.bet}₼</p>
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
        function    AddSwiperBehaviour(swiperEl) { return (swipers.push(swiperEl), swiperEl) };
        inited.then(()=>swipers.map(swiper=>new Swiper(swiper, {
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
            })));
        this.__initvals&&this.resetLobbyTable(this.__initvals);
        this.updalist.map(([...args])=>this.setOnlineToTable(...args));
        return this.htmlview;
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
        table.players = players;
        
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
/**
 * 
 * @param {[int, int]} param0 
 * @param {TableElT} param1 
 */
async function onclick([betId, tableId], {players}) {
        // const [room, table] = this;
        // alert([betId, tableId].join(', '));
        const {userId} = getLocalUser();
        if(players.length >= 2) {
            // await (new )
            if(players.filter((player)=>player.userId === userId).length) ConnectionStables.connectToRoom([betId, tableId]);
            else if(await (new BackgammonsEnterAsVisitorPopup()).showOnReady().onAccept) ConnectionStables.connectToRoomAsVisitor([betId, tableId]);
        }
        BetsLoaded.then(({BackgammonsBETS})=>{
            if(getLocalUser().balance < BackgammonsBETS[betId].bet) return openErorPopup('Недостаточно денег на счету');
            return ConnectionStables.connectToRoom([betId, tableId]);
        })
}