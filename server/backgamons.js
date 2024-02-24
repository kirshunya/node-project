const { debug } = require("console");
const { constants } = require("crypto");
const { response } = require("express");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const range = (from, len) => [...Array(len).keys()].map(x => x + from);//make iterator with Array methods?
const adv0_range = (from, len, vals) => range(from,len).map((i)=>vals[i]||vals?.null());
const CONSTANTS = {
    WHITEID: 1,
    BLACKID: 2,
    RoomStates:{Waiting:0, Started:1},
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const randdice = ()=>[getRandomInt(1,6), getRandomInt(1,6)];

const LobbyListeners = {};
const Lobby = {
    ListenLobby(ctx, ws) {
        const {user} = ctx;
        const likey = ctx.likey = `${user.clientID}-${user.userId}-${getRandomInt(-10,100)}`;
        // console.log(JSON.stringify(ctx), JSON.stringify(LobbyListeners));
        LobbyListeners[likey] = ctx;//is safety?
    },
    UnlistenLobby(ctx) {
        delete LobbyListeners[ctx.likey];
    },
    event(event, _msg) {
        const msg = Object.assign(_msg, {event, method:'backgammons::event'});
        console.log('lobbyevent..', JSON.stringify(LobbyListeners), JSON.stringify(msg));
        Object.values(LobbyListeners).map(({send})=>send(msg));
    }
}

class SharedRoom0 {
    Connections = {};
    RoomState = CONSTANTS.RoomStates.Waiting;

    constructor(GameID=[-1,-1]) {
        this.GameID = GameID;
    }
    connect(user, ctx, ws) {
        const rikey = ctx.rikey = `${user.clientID}-${user.userId}-${getRandomInt(-10,100)}`;
        this.Connections[rikey] = ({user, ctx, ws, send:ctx.send});
        this.event('backgammons::connection', user, 'add ignoreList and send current user..');//? player:visitor
    }
    disconnect(user, ctx, ws) {
        delete this.Connections[ctx.rikey];
    }
    event(event, obj) {
        const msg = Object.assign(obj, {event, method:'backgammons::event'});

        Object.values(this.Connections).map(async({send})=>send(msg));
    }
}
class TGame extends SharedRoom0 {
    Players = [];
    constructor(GameID) {
        super(GameID);
        this.Slots = adv0_range(0, 24, {0:[15,1], 12:[15,2], null:()=>[0,0]});
        this.info = {
            ActiveTeam: CONSTANTS.WHITEID,
            Dices: [0,0]
        }
    }
    connect(user, ctx, ws) {
        // const __u = {user.}
        super.connect(user, ctx, ws);
        ctx.event('backgammons::connection::self', { 
                    slots: this.Slots, 
                    dropped: [],
                    state: this.info, 
                    colour: 0,
                    players:this.Players,
                    RoomState:this.RoomState,
                    dominoRoomId:this.GameID[0],
                    tableId:this.GameID[1],
                    GameState:this.RoomState,
                    debug:Object.keys(this.Connections)
        });
        let rec = this.Players.filter(({userId})=>userId===user.userId)[0];
        if(rec) {
            user.team = rec.team;
            return;
        }
        if(this.Players.length<2) {
            this.Players.push(user);
            Lobby.event('backgammons::lobby::connectionToRoom', {
                GameID: this.GameID, Players: this.Players.length
            });
            if(this.Players.length===2) {//
                this.startGame();
            }
        }
    }
    startGame() {
        const cc = this.Players[0].team = getRandomInt(1,2);
        this.Players[1].team = 1+!(cc-1);
        this.info = {
            ActiveTeam: CONSTANTS.WHITEID,
            Dices: randdice()
        }
        this.event('backgammons::GameStarted', {slots: this.Slots, state: this.info, players:this.Players});
        this.RoomState = CONSTANTS.RoomStates.Started;
    }
    /**
     * 
     * @param {[{from,to,points}]} step 
     */
    stepIfValid(step, code) {
        const {ActiveTeam, Dices} = this.info;
        const TempSlots = adv0_range(0, 24, {null:()=>[0,0]});
        // const Skin = new Proxy(this.Slots, {
        //     get:(Slots, key)=>{
        //         const [colour, count] = Slots[key];
        //         const [tcolour, tcount] = TempSlots[key]
        //         return [colour||tcolour, count+tcount];
        //     }, set:()=>false
        // });
        // const Rele = new Proxy(Skin, {
        //     get:(Slots, key)=>{

        //     }
        // })
        step.map(({from, to, points})=>{
            this.slot(from).take(ActiveTeam);
            this.slot(to).add(ActiveTeam);
            // typeof to === 'string' && to = 
        });
        const prevstate = this.info;
        this.event('step', {step, prevstate, newstate: this.nextState(), code});
        return {result:'success'};
    }
    nextState() {
        const {ActiveTeam} = this.info;
        const nextTeam = {
            [CONSTANTS.WHITEID]: CONSTANTS.BLACKID,
            [CONSTANTS.BLACKID]: CONSTANTS.WHITEID
        }
        return this.info = {
            ActiveTeam: nextTeam[ActiveTeam],
            Dices: randdice()
        }
    }
    slot(index) {
        const Slot = this.Slots[index];
        const [Count, Colour] = Slot;
        return {
            add(ColourID) {
                if(Colour===0) 
                    Slot[1] = ColourID;
                Slot[0]++;
            },
            take(ColourID) {
                Slot[0]--;
                if(Colour===0) 
                    Slot[1] = 0;
            }
        }
    }
}
const BETsList = [0.5, 1, /*3, 5, 10*/];
const Games = Object.assign({},...Object.keys(BETsList).map(betId=>({
                            [+betId+1]: Object.assign({},...range(1, 7).map(
                                tableid=>({
                                    [tableid]: new TGame([+betId+1, tableid])
                                })
                        ))})));
console.log(Games);
const WSPipelineCommands = {
    /* this -> ws of connection */
    // auth(ctx, msg) {
    //     const {clientID, userId, username} = msg;
    //     ctx.user = {clientID, userId, username};
    //         /////////////////////<<add auth check by token or pagetoken.. later
    //     this.externalPipes.push(LobbyPipe);
    //     return ctx.user;
    // },
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
    ['backgammons/connect'](ctx, {dominoRoomId, tableId}) {
        Lobby.UnlistenLobby(ctx, this);
        ctx.GameID = [dominoRoomId, tableId];
        console.log(JSON.stringify(Object.keys(Games)));
        const Game = ctx.Game = Games[dominoRoomId][tableId];
        Game.connect(ctx.user, ctx, this);
        console.log('connect', Game);
        return;
        //'backgammons::connection'
    },
    step({Game}, {step, code}) {
        return Game.stepIfValid(step, code);
    },
    get({Game}) {
        const event = 'board';
        return {event, slots: Game.Slots, state: Game.info};
    },
    restart(ctx) {
        // const lastGame = ctx.Game;
        // const Game = ctx.Game = Games[ctx.RoomID] = new TGame();
        // Game.Listeners = lastGame.Listeners;
        // Game.send('restart', {slots: Game.Slots, state: Game.info});
    },
}
// const TWSPipelineCommands = ()=>{
//     const wlist = ['auth']
//     const authmsg = ()=>({result:'error', msg:'u need auth'})
//     return new Proxy(WSPipelineCommands, {
//         get:(t,key, proxyer)=>{
//             if(key in wlist) {
//                 return t[key];
//             } else return function(ctx, ...args){
//                 if(ctx.user)
//                     return t[key].call(this, ctx, ...args);
//                 return authmsg;
//             }
//         }
//     })
// }
var fs = require('fs');
const { eventNames } = require("process");
module.exports = function(ws, req) {
    // fs.writeFile('/test.log', 'connection', console.log.bind(console));
    ws._socket.setKeepAlive(true);
    const ctx = {user:{}};
    // const WSPipelineCommands = new TWSPipelineCommands();
    const send = ctx.send = response=>ws.send(JSON.stringify(response));
    const event = ctx.event = (event, response)=>send(Object.assign(response, {event, method:'backgammons::event'}))

    ws.on('message', function(_msgblob) {
        const msg = JSON.parse(_msgblob);
        try{
            const response = WSPipelineCommands[msg.method]?.call(ws, ctx, msg);
            response && send(response);//skips undeifned n' nulls..
        } catch(e) {
            console.error(e);
            send({msg:'somerror', e});
        }
    });
    ws.on('close', function() {

    });
}