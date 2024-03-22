//some utilities
const { performance } = require('perf_hooks');
const timestamp = ()=>Date.now();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const range = (from, len) => [...Array(len).keys()].map(x => x + from);//make iterator with Array methods?
const adv0_range = (from, len, vals) => range(from,len).map((i)=>vals[i]||vals?.null());
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const randdice = ()=>[getRandomInt(1,6), getRandomInt(1,6)];
const Timer = class {
    /**
     * do some on calc 
     * @param {()=>{}} oncomplete 
     * @param {()=>{}} onreject handle some if sended into .cancel(...) method and if reurns some, return this to cancel
     */
    constructor(times, oncomplete, onreject=(...args)=>{}) {
        this.reject = false;
        this.waiting = false;
        this.waited = null;
        this.onreject = onreject;
        setTimeout(()=>onTimeout.call(this), times);
        function onTimeout() {
            if(this.reject) return;
            if(this.waiting) this.waited = oncomplete;
            else oncomplete()
        }
    }
    cancel(...args) {
        this.reject = false;
        return this.onreject(...args);
    }
    await() {
        this.waiting = true;
    }
    resume() {
        this.waiting = true;
        if(this.reject) return;
        this.waited?.();
    }
}

const CONSTANTS = {
    WHITEID: 1,
    BLACKID: 2,
    RoomStates:{Waiting:0, Started:1},
}
var GAMESCOUNT = 0;
var TimersTurn = 'on';
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
    /** @type {{userId:int, username:string, team:int}[]} */
    Players = [];
    /** @type {Timer} */
    curTimer = new Timer(0, ()=>{});
    constructor(GameID) {
        super(GameID);
        this.Slots = adv0_range(0, 24, { 18:[15,1], 11:[15,2], null:()=>[0,0] });
        // this.Slots = adv0_range(0, 24, { 0:[15,1], 12:[15,2], null:()=>[0,0] });
        this.Drops = {};
        this.info = {
            ActiveTeam: CONSTANTS.WHITEID,
            Dices: [1,1]
        }
        this.times = [0,0];
    }
    connect(user, ctx, ws) {
        // const __u = {user.}
        super.connect(user, ctx, ws);
        console.log('TimersTurn', TimersTurn);
        ctx.event('backgammons::connection::self', {
            GAMESCOUNT, TimersTurn:TimersTurn, deb1:'test',
                    slots: this.Slots, 
                    dropped: this.Drops,
                    state: this.info, 
                    colour: 0,
                    players:this.Players,
                    RoomState:this.RoomState,
                    dominoRoomId:this.GameID[0],
                    tableId:this.GameID[1],
                    GameState:this.RoomState,
                    debug:Object.keys(this.Connections),
                    times: this.times,
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
    connectPage() {

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
        // const TempSlots = adv0_range(0, 24, {null:()=>[0,0]});
        this.curTimer.await();//time to check is step success 
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
        this.curTimer.cancel();//if succes step
        this.curTimer.resume();
        const prevstate = this.info;
        this.event('step', {step, prevstate, newstate: this.nextState(), code});//if success step
        if(this.Drops['whiteover'] === 15 || this.Drops['blackover'] === 15) {
            this.endGame(ActiveTeam, 'Players dropped all checkers', 'win')
        }
        return {result:'success'};
    }
    endGame(WinnerTeam, msg, code) {
        if(!TimersTurn&&code === 'timer') return; //debig
        this.event('end', {winner: WinnerTeam, msg, code});
        GAMESCOUNT++;
    }
    nextState() {
        const {ActiveTeam} = this.info;
        const nextTeamDict = {
            [CONSTANTS.WHITEID]: CONSTANTS.BLACKID,
            [CONSTANTS.BLACKID]: CONSTANTS.WHITEID
        }
        const nextTeam = nextTeamDict[ActiveTeam];
        const timesIndex = {
            [CONSTANTS.WHITEID]: 0,
            [CONSTANTS.BLACKID]: 1
        }
        this.times[timesIndex[ActiveTeam]] = 0
        this.times[timesIndex[nextTeam]] = timestamp();
        this.curTimer.cancel();
        this.curTimer = new Timer(60*1000, ()=>
                this.endGame(ActiveTeam/* in context this is OpponentTeam */, 'Time end', 'timer'));
        return this.info = {
            ActiveTeam: nextTeam,
            Dices: randdice()
        }
    }
    slot(index) {
        if(index === 'blackover' || index === 'whiteover') {
            const Drop = this.Drops;
            return {
                add(ColourID) {
                    Drop[index] = 1 + (Drop[index]?Drop[index]:0);
                },
                take() {console.log('error: tried to access to Drop.take()')}
            }
        }
        const Slot = this.Slots[index];
        const refToArr = new (class {
            ref
            constructor(ref) { this.ref = ref; }
            get Colour() {
                return this.ref[1]
            }
            set Colour(value) {
                return this.ref[1] = value;
            }
            get Count() {
                return this.ref[0]
            }
            set Count(value) {
                return this.ref[0] = value;
            }
        })(Slot)
        return {
            add(ColourID) {
                if(refToArr.Count++===0)
                    refToArr.Colour = ColourID;
            },
            take(ColourID) {
                refToArr.Colour = (--refToArr.Count===0)?0:ColourID;
            }
        }
    }
}
const BETsList = [0.5, 1, /*3, 5, 10*/];
const GamesLobby = new class {
    Games = [new TGame()];//probe
    constructor() {}

    getGameByID() {
        if(this.Games[GAMESCOUNT] === undefined)
            this.Games[GAMESCOUNT] = new TGame(); 
        return this.Games[GAMESCOUNT];//probe
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

        const GameID = [dominoRoomId, tableId];
        const Game = GamesLobby.getGameByID(GameID);

        Game.connect(ctx.user, ctx, this);
        //'backgammons::connection'
    },
    step(ctx, {step, code}) {
        return GamesLobby.getGameByID(ctx.GameID).stepIfValid(step, code);
    },
    get(ctx) {
        const event = 'board';
        const Game = GamesLobby.getGameByID(ctx.GameID);
        return {event, slots: Game.Slots, state: Game.info};
    },
    restart__(ctx) {
        // const lastGame = ctx.Game;
        // const Game = ctx.Game = Games[ctx.RoomID] = new TGame();
        // Game.Listeners = lastGame.Listeners;
        // this.Games[GAMESCOUNT];
        GAMESCOUNT++;
        ctx.event('restart__', {});
    },
    TimersTurnSet(ctx, msg) {
        TimersTurn = msg.TimersTurn
        console.log('settimers', msg)
        GamesLobby.getGameByID(ctx.GameID).event('TimersTurn', {TimersTurn});
    }
}

var fs = require('fs');
module.exports = function(ws, req) {
    // fs.writeFile('/test.log', 'connection', console.log.bind(console));
    console.log('new Connection')
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