/** @type {ws.Server} */
let aWSS = null;
module.exports.getaWSS = ()=>aWSS;
const { serializable } = require('./backgammons/serializablewtf.js');
const { range, WSListeners, rangebyvals, mapByIndexToVals, sleep } = require('./backgammons/Utility.js');
const { TGame, } = require('./backgammons/GameRoom.js');
const { timestamp } = require("./backgammons/Utility.js");
const { ConnectionContext, Debug, makeEvent } = require('./backgammons/Generals.js');
const { User, GamesSettings } = require('./models/db-models.js');
const { Router } = require('express');
const { getBackgammonsGeneralInfo, createRooms, getGameSettingValue } = require('./backgammons/DataBaseFunctions.js');
const { BackgammonsBETS } = require('./backgammons/BetsInfo.js');

console.log(TGame)

const GamesLobby = new class extends WSListeners {
    /** @type {TGame[][]} */
    Games = []
    constructor() {
        super('likey');
        this.Games = {};
        BackgammonsBETS.mapPairs((betInfo, betId)=>this.Games[betId]=rangebyvals(1, 7, (roomId=>this.createGame([+betId, +roomId]))))
        delete this.Games[0];
    }
    createGame(GameID) {
        const Game = new TGame(GameID);
        Game.events.onconnect(()=>this.event('backgammons::lobby::connectionToRoom', {
            GameID, players:Game.players
        }))
        Game.events.onexit(()=>this.event('backgammons::lobby::connectionToRoom', {
            GameID, players:Game.players
        }))
        Game.events.onstart(()=>this.event('backgammons::lobby::roomStart', {
            GameID, players:Game.players, startedAt:Game.RoomState.startedAt
        }));
        Game.events.onclosing(()=>{
            this.event('backgammons::lobby::roomClosing', {
                GameID, players:Game.players
            })
            // setTimeout(()=>this.Games[GameID[0]][GameID[1]]=this.createGame(GameID), 20*1000);
        });
        Game.events.onfinish(()=>{
            this.event('backgammons::lobby::roomEnd', {
                GameID, players:Game.players
            })
            // setTimeout(()=>this.Games[GameID[0]][GameID[1]]=this.createGame(GameID), 20*1000);
        });
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
            this.Games[GameID] = new TGame(GameID); 
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
    async ['backgammons/connect'](ctx, msg) {
        // Lobby.UnlistenLobby(ctx, this);
        ctx.GameID = msg.GameID;
        const Game = GamesLobby.getGameByID(ctx.GameID);
        const connres = await Game.connect(ctx, this);
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
        GamesLobby.getGameByID(ctx.GameID).event('emoji', Object.assign(msg, {userId:ctx.user.userId, username:ctx.user.username}));
    },
    sendPhrase(ctx, msg) {
        GamesLobby.getGameByID(ctx.GameID).event('phrase', Object.assign(msg, {userId:ctx.user.userId, username:ctx.user.username}));
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    restart__(ctx) {
        const Game = GamesLobby.getGameByID(ctx.GameID);
        return Game.restart__(ctx, 'restart__', 'end')
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    TestLate(ctx) {
        const Game = GamesLobby.getGameByID(ctx.GameID)
        Game.RoomState.restartLate?.()
        Game.event('restart__', {});
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    TestFlud(ctx) {
        const Game = GamesLobby.getGameByID(ctx.GameID)
        Game.RoomState.restartFlud?.()
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
    },
    /**
     * Debug function, turn on/off timer
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    TimersTurn(ctx, msg) {
        Debug.TimersTurn = !Debug.TimersTurn
        console.log('settimers', msg)
        GamesLobby.getGameByID(ctx.GameID).event('TimersTurn', {TimersTurn:Debug.TimersTurn});
    }
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {import('express').Request} req 
 */
function WSSConnection(ws, req) {
    console.log('new Connection', new Date())
    ws._socket.setKeepAlive(true);
    const ctx = ws.ctx = new ConnectionContext(ws);

    ws.on('message', async function(_msgblob) {
        const msg = JSON.parse(_msgblob);
        try{
            while(!ctx.user&&msg.method!=='connectGeneral') await sleep(100); // кастыльное решение гонки потоков при подключении.
            const response = await WSPipelineCommands[msg.method]?.call(ws, ctx, msg);
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
/** @type {Router} */
const UsersRouter = new Router();
/** @type {Router} */
const AdminsRouter = new Router();
AdminsRouter.get('/played-backgammons-games', async function(req, res, next) {
    try{
        console.log('/played-backgammons-games', req.query);
        return res.json(await getBackgammonsGeneralInfo(query.date));
    } catch(e) {
        next(e)
    }
});
AdminsRouter.post('/backgammons-status', async function(req, res, next) {
    try{
        const info = {
            get on() { return {status:'active', code:200}; },
            get off() { return {status:'disabled', code:500}; }
        }[req.query.status];
        setGameSettingValue('BackgammonsStatus', info);
        return res.status(200).json({});
    } catch(e) {
        next(e)
    }
});
AdminsRouter.post('/editBets', async function(req, res, next) {
    try{
        const body = req.body;
        return res.status(200).json({});
    } catch(e) {
        next(e)
    }
});
UsersRouter.get('/backgammons-status', async function(req, res, next) {
    try{
        return getGameSettingValue('BackgammonsStatus').then(statucInfo=>res.json({code:statucInfo.code}));
    } catch(e) {
        next(e)
    }
});
/** 
 * @param {ws.Server} _aWSS
 */
module.exports.WSSConnection = _aWSS=>(aWSS=_aWSS, WSSConnection);
module.exports.UsersRouter = UsersRouter;
module.exports.AdminsRouter = AdminsRouter;
module.exports.createRooms = createRooms;