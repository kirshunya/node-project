// import {    } from "../../../server/backgammons/Utility.js";
import { getRandomInt, localThisProvideComponent, range } from "./Utilities.js";
import { ConnectionStables } from "./WSEP.js";
import { BetsLoaded, WSEventPoolReady } from './syncronous.js';
import { BackgammonsEnterAsVisitorPopup, htmlcontainer, htmlelement, htmltext } from "./htmlcontainer.js";
import { lobbyhubReady } from "./syncronous.js";
import { html, ranged } from "./htmlcontainer.js";
import { openErorPopup } from "../pages/popup.js";
import { getLocalUser } from "../authinterface.js";
import { addDominoListeners } from "../domino/domino-navigation";
import * as impPopup from "../pages/popup";


const GlobalTimersList = {
    /** @type {{timestamp:int, label:HTMLElement, active:boolean}[]} */
    timers: [],
    timeroff: Symbol('timeroff'),

    startLoop(){
        this.intervalid = setInterval(()=>{
            const timestamp = Date.now();
            this.timers.map((timer, i)=>{
                if(!timer.active) {
                    timer.label.innerHTML = '00:00';
                    return 10+i;
                }
                const diff = timestamp - timer.timestamp;
                const secs = Math.floor(diff / 1000), secs60 = secs % 60;
                const mins = Math.floor(secs / 60), mins60 = mins % 60;
                // const hours = Math.floor(mins / 60);
                timer.label.innerHTML = `${mins60<10?`0${mins60}`:mins60}:${secs60<10?`0${secs60}`:secs60}`;
                return false;
            }).filter(timeractive=>timeractive).map((timerindex, i)=>this.timers.splice(timerindex-10+i,1));
        }, 200);
    },
    pushTimer(timestamp=Date.now(), label) {
        const info = {timestamp, label, active:true};
        this.timers.push(info);
        return info;
    }
}
class TableElT {
    tableparts = []
    timerlabel
    __playersinfo
    eyelabel
    scheme

    _$players = []
    get players() { return this._$players; }
    set players(players) {
        this.playersinfo.innerHTML = ranged(this._$players = players)
            /* html */`
              <div class="domino-room-table-info__players-item">
                  <img src="./img/domino-online-icon.png" alt="" />
              </div>
        `;

        this.tableparts.forEach(part => {
            part.classList.toggle("filled", this._$players.length > part.children.length);
            if (window.isAdmin) {
                part.innerHTML = `<div class="table-admin__userid-item">${this._$players[part.children.length - 1]?.userId || ''}</div>`;
            }
        });
        return true;
    }
    set enable(enable) {
        this.eyelabel.firstChild.src = enable? 'img/backgammons/eyeh.png' : 'img/backgammons/eyek.png';
        return true;
    }
    _timer = null
    set timer(timestamp) {
        if (timestamp === GlobalTimersList.timeroff && this._timer) this._timer.active = false;
        else this._timer = GlobalTimersList.pushTimer(timestamp, this.timerlabel);
        return true;
    }

    constructor(GameID) {
        this.GameID = GameID;
        const element = this.content = htmlcontainer(htmlelement('div', 'domino-room-content__table swiper-slide', {tableId: GameID[1]}), [
            this.eyelabel = htmltext('div', 'backgammons-visitor', '<img src="img/backgammons/eyek.png">'),
            htmlcontainer(htmlelement('div', 'domino-room-content__table-image'), [
                this.tableparts[0] = htmlelement('div', 'domino-room-table-half domino-room-table-part'),
                this.tableparts[1] = htmlelement('div', 'domino-room-table-half domino-room-table-part')
            ]),
            htmlcontainer(htmlelement('div', 'domino-room-content__table-info'), [
                this.timerlabel = htmltext('div', 'domino-room-table-info__timer', '00:00'),
                this.playersinfo = htmlelement('div', 'domino-room-table-info__players')
            ])
        ]);

        const rulesIcon = this.content.querySelector('.domino-room-header__rules img');
        if (rulesIcon) {
            rulesIcon.addEventListener('click', () => {
                console.log('Иконка правил была нажата');
                // Здесь можно добавить дополнительную логику
            });
        }

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
            BackgammonsLobbyHub.updateTable(GameID, players);
        },
        ["backgammons::lobby::roomStart"]({GameID}) {
            BackgammonsLobbyHub.updateTable(GameID, null, true);
        },
        ["backgammons::lobby::roomClosing"]({GameID}) {
            BackgammonsLobbyHub.updateTable(GameID, null, false);
        },
        ["backgammons::lobby::roomEnd"]({GameID}) {
            BackgammonsLobbyHub.updateTable(GameID, [], false, GlobalTimersList.timeroff);
        }
    }
    init() {
        const mutobserverCode = `backgsLobby${getRandomInt(-65341, 65341)}`;
        const container = htmlelement('div', 'domino-games games', {name:mutobserverCode}, {mutobserverCode});
        const swipers = [];
        const inited = BetsLoaded.then(({BackgammonsBETS})=>htmlcontainer(
                container, [
                ...BackgammonsBETS.mapPairs(({bet}, betId)=>(this.RoomsMap[betId] = [],
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
                                            <p class="domino-room-bet">${bet}₼</p>
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
                            //slidesPerView: 3,
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
        this.updalist.map(([...args])=>this.updateTable(...args));
        GlobalTimersList.intervalid||GlobalTimersList.startLoop();
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
                    const [players, state, startedAt] = rinfo;
                    BackgammonsLobbyHub.updateTable([betId, roomId], players, state===3, startedAt);
            })
        });
    }
    updalist = []
    updateTable([betId, roomId], players=null, enable=null, startedAt=undefined) {
        if(!this.htmlview) return this.updalist.push([...arguments])
        const table = this.RoomsMap[betId]?.[roomId];
        if(!table) return console.warn(`table[${betId}][${roomId}] not Found`);
        players&&(table.players = players);
        enable!==null&&(table.enable = enable);
        (enable||startedAt)&&(table.timer = startedAt||Date.now());
    }
    /** @param {TableElT} Table  */
    _setOnlineToTable(Table, players) {
        Table.players = players;
    }
    _visitEnableToggle(Table, enable) {
        Table.eyelabel.firstChild.src = enable  ? 'img/backgammons/eyeh.png'
                                                : 'img/backgammons/eyek.png'
    }
    /** @deprecated */
    setOnlineToTable([betId, roomId], players) { return this._setOnlineToTable([betId, roomId], players); }
    /** @deprecated */
    visitEnableToggle([betId, roomId], enable) { return this._visitEnableToggle([betId, roomId], null, enable); }
}
/** @deprecated */
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
        } else BetsLoaded.then(({BackgammonsBETS})=>{
            if(getLocalUser().balance < BackgammonsBETS.get(betId).bet) return openErorPopup('Недостаточно денег на счету');
            return ConnectionStables.connectToRoom([betId, tableId]);
        })
}