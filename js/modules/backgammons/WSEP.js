import { sleep, range, JustEnoughEvents, OEPromise, FCPromise, Toast } from './Utilities.js';
export const WSEventPool = new JustEnoughEvents();

import { BoardConstants, GameInitData, TGameStartedData, slotinfo } from './BoardConstants.js';
import * as BackgammonMenu from "./LobbyPool.js";
import * as GamePool from "./GamePool.js";
import { getLocalUser } from '../authinterface.js';
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
        if(GameInitData.RoomState === 1)
            this.onGameStarted.resolve(new TGameStartedData(GameInitData.slots, GameInitData.state, GameInitData.players, GameInitData.awaitingTeam))
    }
}
export const ConnectionStables = {
    /** @type {WSRoom} */
    Room: null,
    /** @type {Promise.<int>} info about timestamps differentations in client and server*/
    diffsProm: FCPromise(),
    debmess: []
}
/*lotoserviced*/const EventsRoutes = ({
    ["backgammons::GameStarted"]({players, slots, state}){
        ConnectionStables.Room.onGameStarted.resolve({players, slots, state})
    },
    ["backgammons::timediffs"]({diff}) {
        ConnectionStables.diffsProm.resolve(diff);
        console.log('diffs', diff)
    },
    ["backgammons::connection::self"](GameInitData) {
        // const {dominoRoomId, tableId, colour, players } = msg;
        const {GameID} = GameInitData
        window.location.hash = `backgammon-room-table/${GameID[0]}/${GameID[1]}`;
        // BackgammonGameTable.setGameInitData(msg);
        ConnectionStables.Room = new WSRoom(GameInitData.GameID, GameInitData);

        // GamePool.InitGame(GameInitData, {userId:0,username:''}, ws)

        window.TimersTurn = ({['on']:true, ['off']:false})[GameInitData.TimersTurn];
        (async()=>TimersTurnDebugButton.value = `timers: ${window.TimersTurn?'on':'off'}`)()
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
Object.entries(EventsRoutes).map(([eventname, CallBack])=>WSEventPool.on(eventname, CallBack.bind(EventsRoutes)));


export function onnewmsg(msg) {
    // EventsRoutes[msg.event]?.(msg);
    WSEventPool.$$send(msg.event, msg);
    // WSEventPool.$$send(msg.event, msg);
}