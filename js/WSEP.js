export const WSEventPool = new JustEnoughEvents();
import * as BackgammonMenu from "./LobbyPool.js";
import * as BackgammonGameTable from "./GamePool.js";

const EventsRoutes = ({
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
    WSEventPool.$$send(msg.event, msg);
}