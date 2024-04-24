import { sleep, range, JustEnoughEvents, OEPromise, FCPromise, Toast } from './Utilities.js';
export const WSEventPool = new JustEnoughEvents();
WSEventPoolReady.resolve(WSEventPool);

import { BoardConstants, GameInitData, TGameStartedData, slotinfo } from './BoardConstants.js';
import * as BackgammonMenu from "./LobbyPool.js";
import * as syncronous from "./syncronous.js";
import * as GamePool from "./GamePool.js";
import { getLocalUser } from '../authinterface.js';
import { WSEventPoolReady } from './syncronous.js';
// import { localUser } from './EntryPoint.js';
//TODO: продумать мессаджинг
export const WSEvents = {
    self: {
        connectionToRoom: 'backgammons::connection::self'
    },
    lobby: {
        init: 'backgammons::lobbyInit',
        newConnectionToRoom: 'backgammons::lobby::connectionToRoom',
    },
    room: {

    }
}
class RoomCashData {
    /** @type {Array.<slotinfo>} */
    slots
    /** @type {[Number, Number]} */
    drops
    /** @type {{ActiveTeam:int, Dices:[Number, Number]}} */
    state
}
export class WSRoom {
    /** @type {Promise.<TGameStartedData>} */
    onGameStarted = FCPromise()
    /**
     * 
     * @param {[Number, Number]} id 
     * @param {GameInitData} GameInitData 
     */
    constructor(GameID, GameInitData) {
        this.GameID = GameID;
        this.GameInitData = GameInitData;
        if(GameInitData.RoomState === 3)
            this.onGameStarted.resolve(new TGameStartedData(GameInitData.slots, GameInitData.state, GameInitData.players))
    }
}
export const ConnectionStables = {
    /** @type {WSRoom} */
    _Room: null,
    get Room() { return this._Room; },
    set Room(value) { this._Room = value; this.onRoomConnection.resolve(value); return true; },
    onRoomConnection: {
        value: null,
        CBlist: [],
        then(CB) { if(this.value) CB(); else this.CBlist.push(CB); },
        resolve(value) { this.value = value; value&&this.CBlist.map(CB=>CB(value)); }
    },
    /** @type {Promise.<int>} info about timestamps differentations in client and server*/
    diffsProm: FCPromise(),
    debmess: [],

    connectsended: null,
    connectToRoom([betId, roomId]) {
        location.hash = `#backgammon-room-table/${betId}/${roomId}`;
        if(this.connectsended) return false;
        window.ws.send(
            JSON.stringify({
              method: "backgammons/connect",
              GameID: [betId, roomId]
            })
          );
        return this.connectsended = true;
    },
    connectToRoomAsVisitor([betId, roomId]) {

    },
    disconnect() {
        if(this.Room){
            window.ws.send(
                JSON.stringify({
                method: "backgammons/disconnt",
                })
            );
            // if(location.hash !== '#backgammons-menu') location.hash = '#backgammons-menu';
            window.history.go(-1);
            VisitorLabel.classList.toggle('hidden', true);
            this.connectsended = this.Room = null;
            resetWSEventPool(EventsRoutes, BackgammonMenu.BackgammonsLobbyHub.WSEventsRoute);
        }
    }
}
const EventsRoutes = ({
    ["backgammons::GameStarted"]({players, slots, state}){
        ConnectionStables.Room.onGameStarted.resolve({players, slots, state})
    },
    ['RoomStateChanged']({newStateId, stateData}){ 
        if(newStateId === 3) ConnectionStables.Room.onGameStarted.resolve(stateData) },
    ["backgammons::timediffs"]({diff}) {
        ConnectionStables.diffsProm.resolve(diff);
        console.log('diffs', diff)
    },
    ['inConnectionBalanceError']({bet, balance}) {
        new Toast({
            title: 'Недостаточно денег на счету',
            text: `Чтобы начать игру вам нужно иметь <font color="blue">${bet.toFixed(2)} ₼.</font>, у вас <font color="blue">${balance.toFixed(2)} ₼.</font> ВЫ В РЕЖИМЕ НАБЛЮДАТЕЛЯ`,
            theme: 'danger',
            autohide: true,
            interval: 60000
        })
    },
    ["backgammons::connection::self"](GameInitData) {
        // const {dominoRoomId, tableId, colour, players } = msg;
        const {GameID} = GameInitData
        window.location.hash = `backgammon-room-table/${GameID[0]}/${GameID[1]}`;
        // BackgammonGameTable.setGameInitData(msg);
        ConnectionStables.Room = new WSRoom(GameInitData.GameID, GameInitData);

        // GamePool.InitGame(GameInitData, {userId:0,username:''}, ws)

        window.TimersTurn = ({['on']:true, ['off']:false})[GameInitData.TimersTurn];
        // (async()=>TimersTurnDebugButton.value = `timers: ${window.TimersTurn?'on':'off'}`)()
    },
    async ['TimersTurn']({TimersTurn}){
        window.TimersTurn = TimersTurn
        TimersTurnDebugButton.value = `timers:${TimersTurn?'on':'off'}`
    },
    ['autodiceset']({userId, value}) {
        if(!userId || userId === getLocalUser().userId) GamePool.autostep.setdice(value);
    },
    ['message'](msg) {
        new Toast({
            title: 'Сообщение',
            theme: 'success',
            text: msg.text,
            autohide: true
        })
    }
});
connectWSRoutes(EventsRoutes);
syncronous.lobbyhubReady.then(()=>connectWSRoutes(BackgammonMenu.BackgammonsLobbyHub.WSEventsRoute))
/**
 * 
 * @param  {{[eventname:string]:Function}} routes 
 * @returns 
 */
export function connectWSRoutes(...routes) {
    return routes.map(route=>
        Object.entries(route)
            .map(([eventname, CallBack])=>
                WSEventPool.on(eventname, CallBack.bind(route))))
}
/** @param  {{[eventname:string]:Function}} routes */
function resetWSEventPool(...initRoutes) {
    WSEventPool.EventListeners = {};
    connectWSRoutes(...initRoutes);
}
window.addEventListener('DOMContentLoaded', ()=>{
    const [outbtn] = VisitorLabel.getElementsByClassName('domino-waiting-popup__button')
    outbtn.addEventListener('click', ()=>{
        ConnectionStables.disconnect();
        VisitorLabel.classList.toggle('hidden', true);
    })
});
export function onnewmsg(msg) {
    // EventsRoutes[msg.event]?.(msg);
    WSEventPoolReady.then(()=>WSEventPool.$$send(msg.event, msg));
    // WSEventPool.$$send(msg.event, msg);
}
