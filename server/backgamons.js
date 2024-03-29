const { TGame, timestamp } = require('./backgammons/GameRoom');
const { ConnectionContext, Debug } = require('./backgammons/Generals');

console.log(TGame)
// const timestamp = ()=>Date.now();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// const range = (from, len) => [...Array(len).keys()].map(x => x + from);//make iterator with Array methods?
// const adv0_range = (from, len, vals) => range(from,len).map((i)=>vals[i]||vals?.null());


// const LobbyListeners = {};
// const Lobby = {
//     ListenLobby(ctx, ws) {
//         const {user} = ctx;
//         const likey = ctx.likey = `${user.clientID}-${user.userId}-${getRandomInt(-10,100)}`;
//         // console.log(JSON.stringify(ctx), JSON.stringify(LobbyListeners));
//         LobbyListeners[likey] = ctx;//is safety?
//     },
//     UnlistenLobby(ctx) {
//         delete LobbyListeners[ctx.likey];
//     },
//     event(event, _msg) {
//         const msg = Object.assign(_msg, {event, method:'backgammons::event'});
//         console.log('lobbyevent..', JSON.stringify(LobbyListeners), JSON.stringify(msg));
//         Object.values(LobbyListeners).map(({send})=>send(msg));
//     }
// }

// const BETsList = [0.5, 1, /*3, 5, 10*/];
const GamesLobby = new class {
    /** @type {[TGame]} */
    Games = [new TGame()];//probe
    constructor() {}

    /**
     * 
     * @returns {TGame}
     */
    getGameByID(GameID) {
        if(this.Games[GameID] === undefined)
            this.Games[GameID] = new TGame(); 
        return this.Games[GameID];//probe
    }
}
const WSPipelineCommands = {
    /* this -> ws of connection */
    // auth(ctx, msg) {
    //     const {clientID, userId, username} = msg;
    //     ctx.user = {clientID, userId, username};
    //         /////////////////////<<add auth check by token or pagetoken.. later
    //     this.externalPipes.push(LobbyPipe);
    //     return ctx.user;
    // },
    /**
     * 
     * @param {ConnectionContext} ctx 
     * @param {*} msg 
     */
    ['backgammons/auth'](ctx, msg) {
        const {clientId, userId, username} = msg
        ctx.user = {clientId, userId, username}
    },
    ['backgammons/openLobby'](ctx, msg) {
        ctx.user = {
            clientID: this.clientId,
            username: this.loginUsername,
            userId: this.userId
        }
        Lobby.ListenLobby(ctx, this);
        console.log("Games", Games);
        return {
            event:  'backgammons::lobbyInit', 
            method: 'backgammons::event', 
            rooms:   Object.values(Games).map(rooms=>
                        Object.values(rooms).map(room=>({
                            players: room.Players, 
                            RoomState: room.RoomState
                        })
                     )
        )};
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

        const {GameID} = msg;
        ctx.GameID = Debug.GAMESCOUNT;
        const Game = GamesLobby.getGameByID(ctx.GameID);

        Game.connect(ctx.user, ctx, this);
        //'backgammons::connection'
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
     * deprec
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    get(ctx) {
        const event = 'board';
        const Game = GamesLobby.getGameByID(ctx.GameID);
        return {event, slots: Game.Slots, state: Game.info};
    },
    /**
     * Debug function, restart game
     * @param {ConnectionContext} ctx 
     * @returns 
     */
    restart__(ctx) {
        // const lastGame = ctx.Game;
        // const Game = ctx.Game = Games[ctx.RoomID] = new TGame();
        // Game.Listeners = lastGame.Listeners;
        // this.Games[Debug.GAMESCOUNT];
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
        // const lastGame = ctx.Game;
        // const Game = ctx.Game = Games[ctx.RoomID] = new TGame();
        // Game.Listeners = lastGame.Listeners;
        // this.Games[Debug.GAMESCOUNT];
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
        // const lastGame = ctx.Game;
        // const Game = ctx.Game = Games[ctx.RoomID] = new TGame();
        // Game.Listeners = lastGame.Listeners;
        // this.Games[Debug.GAMESCOUNT];
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

var fs = require('fs');
module.exports = function(ws, req) {
    console.log('new Connection', new Date())
    ws._socket.setKeepAlive(true);
    const ctx = new ConnectionContext(ws);

    ws.on('message', function(_msgblob) {
        const msg = JSON.parse(_msgblob);
        try{
            const response = WSPipelineCommands[msg.method]?.call(ws, ctx, msg);
            response && ctx.send(response);//skips undeifned n' nulls..
        } catch(e) {
            console.error(e);
            ctx.send({msg:'somerror', e});
        }
    });
    ws.on('close', function() {

    });
}