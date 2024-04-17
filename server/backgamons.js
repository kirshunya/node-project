const { serializable } = require('./backgammons/serializablewtf.js');
module.exports.A0 = class A0 extends serializable {};
const { range, WSListeners, rangebyvals, mapByIndexToVals, sleep } = require('./backgammons/Utility.js');
const { TGame, timestamp } = require('./backgammons/GameRoom.js');
const { ConnectionContext, Debug, makeEvent } = require('./backgammons/Generals.js');
const { User } = require('./models/db-models.js');

console.log(TGame)

const BETsList = require('./../json/bets.json').BackgammonsBETS;
const GamesLobby = new class extends WSListeners  {
    /** @type {TGame[][]} */
    Games = []
    constructor() {
        super('likey');
        this.Games = mapByIndexToVals(BETsList, ([betId,betData])=>{
            return rangebyvals(1, 7, (roomId=>this.createGame([+betId, +roomId])));
        });
        delete this.Games[0];
    }
    createGame(GameID) {
        const Game = new TGame(GameID);
        Game.events.onconnect(()=>this.event('backgammons::lobby::connectionToRoom', {
            GameID, players:Game.Players.json()
        }))
        Game.events.onexit(()=>this.event('backgammons::lobby::connectionToRoom', {
            GameID, players:Game.Players.json()
        }))
        Game.events.onstart(()=>this.event('backgammons::lobby::roomStart', {
            GameID, players:Game.Players.json()
        }))
        Game.events.onfinish(()=>{
            this.event('backgammons::lobby::roomEnd', {
                GameID, players:Game.Players.json()
            })
            setTimeout(()=>this.Games[GameID[0]][GameID[1]]=this.createGame(GameID), 20*1000);
        })
        return Game;
    }
    connect(user, ctx) {
        super.connect(...arguments)
        const rooms = [];
        for(const [betId, betRooms] of Object.entries(this.Games)) {
            rooms[betId] = []
            for(const [_roomId, room] of Object.entries(betRooms)) {
                // console.log(betId, _roomId, room);
                rooms[betId][_roomId] = room?.minjson?.();
            }
        }
        return makeEvent('backgammons::lobbyInit', {rooms})
    }
    disconnect(user, ctx) {}
    /**
     * @param {[int, int]} GameID 
     * @returns {TGame}
     */
    getGameByID(GameID) {
        const [betId, roomId] = GameID;
        if(this.Games[betId][roomId] === undefined)
            this.Games[GameID] = new TGame(); 
        return this.Games[betId][roomId];//probe
    }
}

const WSPipelineCommands = {
    /**
     * 
     * @param {ConnectionContext} ctx 
     * @param {*} msg 
     */
    async ['connectGeneral'](ctx, msg) {
        const {clientId, userId, username} = msg
        const user = await User.findOne({ where: { id: userId } });
        ctx.user = {clientId, userId, username, avatar:user.avatar}
    },
    ['backgammons/openLobby'](ctx, msg) {
        return GamesLobby.connect(ctx.user, ctx, this);
        // console.log("Games", Games);
        // return {
        //     event:  'backgammons::lobbyInit', 
        //     method: 'backgammons::event', 
        //     rooms:   Object.values(Games).map(rooms=>
        //                 Object.values(rooms).map(room=>({
        //                     players: room.Players, 
        //                     RoomState: room.RoomState
        //                 })
        //              )
        // )};
    },
    ['backgammons/timediffs'](ctx, msg) {
        ctx.event('backgammons::timediffs', {diff:msg.timestamp-timestamp()})
    },
    /**
     * Connection to room
     * @param {ConnectionContext} ctx 
     * @param {{GameID:[Number, Number]}} msg 
     */
    ['backgammons/connect'](ctx, msg) {
        // Lobby.UnlistenLobby(ctx, this);

        ctx.GameID = msg.GameID;
        const Game = GamesLobby.getGameByID(ctx.GameID);
        const connres = Game.connect(ctx, this);
        console.log('connres', connres);
        if(connres)
            GamesLobby.event('backgammons::lobby::connectionToRoom', {
                GameID: ctx.GameID, players: Game.RoomState.players
            });
        //'backgammons::connection'
    },
    ['backgammons/disconnt'](ctx, msg) {
        const Game = GamesLobby.getGameByID(ctx.GameID);
        if(Game.disconnect(ctx)) {
            GamesLobby.event('backgammons::lobby::connectionToRoom', {
                GameID:ctx.GameID, players: Game.RoomState.players
            });
            ctx.GameID = null;
        }
    },
    ['chat'](ctx, msg) {
        GamesLobby.getGameByID(ctx.GameID).chat(msg);
    },
    /**
     * 
     * @param {ConnectionContext} ctx 
     * @param {{step:{from:int, to:int, points:int[]}[], code:int}} param1 
     * @returns 
     */
    step(ctx, {step, code}) {
        return GamesLobby.getGameByID(ctx.GameID).stepIfValid(ctx.user, step, code);
    },
    /**
     * 
     * @param {ConnectionContext} ctx 
     * @param {{value:boolean}} param1 
     * @returns 
     */
    autodice(ctx, {value}) {
        GamesLobby.getGameByID(ctx.GameID).setAutostep(ctx.user.userId, value)
        ctx.event('autodiceset', {value})
    },
    /**
     * 
     * @param {ConnectionContext} ctx 
     * @param {{value:boolean}} param1 
     * @returns 
     */
    rollDice(ctx) {
        GamesLobby.getGameByID(ctx.GameID).rollDice(ctx)
    },
    /**
     * deprec
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    get(ctx) {
        const event = 'board';
        const Game = GamesLobby.getGameByID(ctx.GameID);
        return {event, slots: Game.Slots, state: Game.info};
    },
    sendEmoji(ctx, msg) {
        GamesLobby.getGameByID(ctx.GameID).event('emoji', msg);
    },
    sendPhrase(ctx, msg) {
    GamesLobby.getGameByID(ctx.GameID).event('phrase', msg);
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    restart__(ctx) {
        const Game = GamesLobby.getGameByID(ctx.GameID);
        GamesLobby.getGameByID(ctx.GameID).endGame(1, 'restart__', 'end')
        Debug.GAMESCOUNT++;
        Game.event('restart__', {});
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    restartTest(ctx) {
        const Game = GamesLobby.getGameByID(ctx.GameID)
        GamesLobby.getGameByID(ctx.GameID).endGame(1, 'restart__', 'end')
        GamesLobby.Games[++Debug.GAMESCOUNT] = new TGame(undefined, 'test');
        Game.event('restart__', {});
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    restartFlud(ctx) {
        const Game = GamesLobby.getGameByID(ctx.GameID)
        GamesLobby.getGameByID(ctx.GameID).endGame(1, 'restart__', 'end')
        GamesLobby.Games[++Debug.GAMESCOUNT] = new TGame(undefined, 'flud');
        Game.event('restart__', {});
    },
    /**
     * Debug function, turn on/off timer
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    TimersTurnSet(ctx, msg) {
        Debug.TimersTurn = msg.TimersTurn
        console.log('settimers', msg)
        GamesLobby.getGameByID(ctx.GameID).event('TimersTurn', {TimersTurn:Debug.TimersTurn});
    }
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {import('express').Request} req 
 */
module.exports = function(ws, req) {
    console.log('new Connection', new Date())
    ws._socket.setKeepAlive(true);
    const ctx = new ConnectionContext(ws);

    ws.on('message', async function(_msgblob) {
        const msg = JSON.parse(_msgblob);
        try{
            while(!ctx.user&&msg.method!=='connectGeneral') await sleep(100); // кастыльное решение гонки потоков при подключении.
            const response = WSPipelineCommands[msg.method]?.call(ws, ctx, msg);
            response && ctx.send(response);//skips undeifned n' nulls..
        } catch(e) {
            console.error(e);
            ctx.send({msg:'somerror in backgamons', e});
        }
    });
    ws.on('close', function() {
        GamesLobby.disconnect();
        if(ctx.GameID) {
            GamesLobby.getGameByID(ctx.GameID).disconnect(ctx)
        }
    });
}