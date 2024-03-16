import { sleep, range, JustEnoughEvents, OEPromise } from './Utilities.js';
export const WSEventPool = new JustEnoughEvents();

import { slotinfo } from './BoardConstants.js';
import * as BackgammonMenu from "./LobbyPool.js";
import * as BackgammonGameTable from "./GamePool.js";
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
export const ConnectionStables = {
    Room: new class { // this vals will be filled always when called WSEvents.self.conectionToRoom
        /** @type {[Number, Number]} */
        id = [-1,-1]
        /**@type {RoomCashData} */
        roomCashedData = null
    }
}
/*lotoserviced*/const EventsRoutes = ({
    ["backgammons::connection::self"](msg) {
        const {dominoRoomId, tableId, colour, players } = msg;
        window.location.hash = `backgammon-room-table/${dominoRoomId}/${tableId}`;
        BackgammonGameTable.setGameInitData(msg);
    },
    ["backgammons::lobbyInit"](msg){
        msg.rooms.map((tables, roomId)=>{
            roomId+=1;
            tables.map((table, tableid)=>{
                tableid+=1;
                BackgammonMenu.setOnlineToTable(roomId, tableid, table.players);
            })
        });
    },
    ["backgammons::lobby::connectionToRoom"](msg) {
        const {dominoRoomId, tableId, players} = msg;
        BackgammonMenu.setOnlineToTable(dominoRoomId, tableId, players);
    }
});
Object.entries(EventsRoutes).map(([eventname, CallBack])=>WSEventPool.on(eventname, CallBack));

export function onnewmsg(msg) {
    // EventsRoutes[msg.event]?.(msg);
    WSEventPool.$$send(msg.event, msg);
    // WSEventPool.$$send(msg.event, msg);
}