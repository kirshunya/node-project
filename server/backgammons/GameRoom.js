const { serializable } = require("./serializablewtf.js");
const { getRandomInt, FCPromise } = require("./Utility");
const { CONSTANTS, Debug, TUser, TPlayer, TState, ConnectionContext, EventProvider, nextTeamDict, makeEvent } = require("./Generals");
const { balanceTravers, getUserBalance } = require("./aaaa.js");
const { WHITEID, BLACKID } = CONSTANTS;

const timestamp = ()=>Date.now();
module.exports.timestamp = timestamp;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const range = (from, len) => [...Array(len).keys()].map(x => x + from);//make iterator with Array methods?
const adv0_range = (from, len, vals) => range(from,len).map((i)=>vals[i]||vals?.null());
const randdice = ()=>[getRandomInt(1,6), getRandomInt(1,6)];
/** @type {Number} in seconds*/
const USERTIME = 60;
/** @type {Number} in seconds*/
const STEPTIME = 25;
/** @type {Number} in millesecons*/
const SecondInMilliseconds = 1000;

class timersnapshot {
    success = false
    pending = false
    timestamp = timestamp()
    /** @type {Function || undefined} */
    waiting
    /** @returns {Number} spended userTime in seconds*/
    actual() {
        const diff = Math.floor((timestamp() - this.timestamp)/SecondInMilliseconds) - STEPTIME;
        return diff>0?diff:0;
    }
    /** @returns {Number} spended userTime in milliseconds*/
    actualms() {
        const diff = timestamp() - this.timestamp - STEPTIME*SecondInMilliseconds;
        return diff>0?diff:0;
    }
}
/**
 * start to start
 * pause to pause
 * resume to resume or complete timer if not success
 * success to decline completing on resume
 * 
 */
const Timer = class {
    /** @type {int} in seconds*/
    userTime = USERTIME
    /** @type {timersnapshot || null} null if deactive*/
    snap
    onfinish = new EventProvider();
    finished = false;

    constructor(Team) { this.Team = Team; }
    start() {
        const Timer = this;
        const snap = this.snap = new timersnapshot();
        setTimeout(ontimeout, STEPTIME*SecondInMilliseconds);
        function ontimeout() {
            if(snap.success || Timer.__off) return;
            if(snap.pending) snap.waiting = startUserTimer;
            return startUserTimer();
        }
        function startUserTimer() {
            const finish = ()=>(!Timer.finished)&&(Timer.finished=true, Timer.onfinish.send(Timer.Team, Timer, snap))
            if(Timer.finished || Timer.__off) return;
            if(Timer.userTime <= 0 || ((Timer.userTime*SecondInMilliseconds - snap.actualms()) <= 0))
                return finish();
            setTimeout(()=>{
                if(snap.success) return;
                if(snap.pending) return snap.waiting = startUserTimer;
                if(!(snap.actual() >= Timer.userTime))
                    console.log('timer in backgammons/GameRoom.js completed byt userTime bigger than skipped time..',
                                '   || but we finished game(maybe)', ` diff=${snap.actual()}s`, ` userTime = ${Timer.userTime}s`)
                finish();
            }, Timer.userTime*SecondInMilliseconds - snap.actualms())
        }
    }
    off(){
        this.__off = true;
    }
    pause() {
        if(this.snap)
            this.snap.pending = true;
    }
    pauseWhile(CB) {
        this.pause();
        const res = CB();
        this.resume();
        return res;
    }
    resume() {
        if(this.snap?.success||!this.snap) return;
        if(this.snap) this.snap.pending = false;
        this.snap?.waiting?.();
        // if(!this.snap.waiting) console.log('timer in backgammons/GameRoom.js resumed, but not found \'waiting\' callback!')
    }
    success() {
        // console.log('success', this);
        if(!this.snap) return
        this.snap.success = true;
        const userTimerMinus = this.snap.actual();
        this.snap = null;
        this.userTime -= userTimerMinus;
        return userTimerMinus;
    }
    reject() {
        if(this.snap) console.log('in step end timer snap not null??!!')
    }
    /** @returns {[Number, Number]} */
    json() {
        // const diff = this.snap?.actual?.();
        // console.log('json()', this, diff)
        return [this.userTime, this.snap?.timestamp||0 ];
    }
}
class Timers extends serializable {
    /** @type {Number} */
    activetimer = 0;
    /** @type {[Timer, Timer]} */
    timers = [new Timer(CONSTANTS.WHITEID), new Timer(CONSTANTS.BLACKID)]
    onfinish = new EventProvider();
    get curTimer() {
        this.timers.map(({onfinish})=>onfinish((...args)=>this.onfinish.send(...args)))
        return this.timers[this.activetimer];
    }
    set curTimer(ActiveTeam) {
        if(ActiveTeam===null) return this.curTimer.reject();
        this.curTimer.reject();
        this.activetimer = Timers.timersIndexByTeamId[ActiveTeam];
        this.curTimer.start();
        console.log('curTiemr = ', ActiveTeam, Timers.timersIndexByTeamId[ActiveTeam], this.curTimer)
    }
    static timersIndexByTeamId = {
        [CONSTANTS.WHITEID]: 0,
        [CONSTANTS.BLACKID]: 1
    }
    off() { this.timers.map(timer=>timer.off()); }
    json() { return this.timers.map(timer=>timer.json()); }
}

class SharedRoom0 extends serializable { // deprec // TODO: extends from WSListeners
    Connections = {};

    constructor(GameID=[-1,-1]) {
        super();
        this.GameID = GameID; 
    }
    /**
     * 
     * @param {TUser} user 
     * @param {ConnectionContext} ctx 
     * @param {WebSocket} ws 
     */
    connect(user, ctx, ws) {
        const rikey = ctx.rikey = `${user.clientId}-${user.userId}-${getRandomInt(-10,100)}`;
        const _user = {
            userId:user.userId, username:user.username, avatar:user.avatar, team:user.team, autodice:true
        };
        this.event('backgammons::connection', _user, 'add ignoreList and send current user..');//? player:visitor
        this.Connections[rikey] = ({user, ctx, ws, send:(...args)=>ctx.send(...args)});
        console.log(rikey, user);
    }
    disconnect(user, ctx, ws) {
        if(ctx.rikey)
            delete this.Connections[ctx.rikey];
    }
    disconnectAll() {
        this.event('discontAll');
        this.Connections = {};
    }
    event(event, obj={}) {
        const msg = Object.assign(obj, {event, method:'backgammons::event'});
        // console.log(`sending`, msg, Object.values(this.Connections))
        Object.values(this.Connections).map(async(ctx)=>ctx.send(msg));
    }
    chat(msg) {
        this.event('message', {text:msg.text})
    }
}
const {BackgammonsBETS} = require('./../../json/bets.json');
class TGame extends SharedRoom0 {
    // /** @type {TPlayer.PlayersContainer} */
    // Players = new TPlayer.PlayersContainer(this)
    get betId() { return this.GameID[0]; }
    get bet() { return BackgammonsBETS[this.betId].bet; }
    get players() {return this.RoomState.players; }

    RoomState = new WaitingState(this);
    events = new class {
        //Lobby
        onconnect = new EventProvider()
        onexit = new EventProvider()
        //inGame
        onstart = new EventProvider()
        onfinish = new EventProvider()
    }
    /**
     * 
     * @param {[Number, Number]} GameID 
     * @param {'test' || 'flud' || undefined} test 
     */
    constructor(GameID, test) {
        super(GameID);
        // const nextTeamDict = {
        //     [CONSTANTS.WHITEID]: CONSTANTS.BLACKID,
        //     [CONSTANTS.BLACKID]: CONSTANTS.WHITEID
        // }
        // if(test==='test')
        //     this.Slots = adv0_range(0, 24, { 18:[15,1], 6:[15,2], null:()=>[0,0] });
        // if(test==='flud')
        //     this.Slots = adv0_range(0, 24, { 0:[9,1], 12:[14,2], 11:[1,2], 18:[1,1],13:[1,1],14:[1,1],15:[1,1],16:[1,1],17:[1,1],null:()=>[0,0] });
        // this.Timers.onfinish(Team=>this.endGame(nextTeamDict[Team], 'time end', 'timer'))
    }
    /**
     * 
     * @param {int} userId 
     * @param {boolean} value 
     */
    setAutostep(userId, value) {
        const player = this.RoomState?.getPlayerByID?.(userId);
        if(!player) return {result:'nope'};
        player.autodice = value;
        this.event('autodiceset', {userId, value})
    }
    async connect(ctx, ws) {
        super.connect(ctx.user, ctx, ws);
        const res = await this.RoomState.connect?.(ctx);
        ctx.event('backgammons::connection::self', this[serializable.prioritetSerial]());
        return res;
    }
    /** @type {ctxHandlerT<void|true>} */
    disconnect(ctx) {
        super.disconnect(ctx.user, ctx, ctx.ws);
        if(this.RoomState.disconnect?.(ctx)) return (this.event('backgammons::room::disconnect', ctx.user.userId), true);
    }
    /** @param {TeXRoomState} newState */
    upgradeState(newState) {
        this.RoomState = newState;
        this.event('RoomStateChanged', {newStateId: newState.RoomState, stateData:Object.assign(newState.json(), {GameID: this.GameID})});
    }
    // startGame() {
    //     this.Players.rollTeam()
    //     this.info = {
    //         ActiveTeam: CONSTANTS.WHITEID,
    //         Dices: randdice()
    //     }
    //     this.event('backgammons::GameStarted', {slots: this.Slots, state: this.info, players:this.Players.json()});
    //     this.RoomState = CONSTANTS.RoomStates.Started;
    //     this.events.onstart.send()
    // }
    /** @param {ConnectionContext} ctx */
    restart__(ctx) {
        return this.RoomState.restart__?.(...arguments);
    }
    rollDice(ctx) {
        return this.RoomState.rollDice(ctx);
    }
    stepIfValid(user, step, code) {
        return this.RoomState.stepIfValid?.(...arguments);
    }
    json() {
        return Object.assign(this.RoomState.json(), {GameID:this.GameID, RoomState:this.RoomState.RoomState})
    }
    minjson() {
        return [this.RoomState.players, this.RoomState.RoomState]
    }
    // nextState() {
    //     const nextTeam = nextTeamDict[this.info.ActiveTeam];
    //     this.Timers.curTimer = nextTeam;
    //     return this.info = {
    //         ActiveTeam: nextTeam,
    //         Dices: randdice()
    //     }
    // }
    // slot(index) {
    //     if(index === 'blackover' || index === 'whiteover') {
    //         const Drop = this.Drops;
    //         return {
    //             add(ColourID) {
    //                 Drop[index] = 1 + (Drop[index]?Drop[index]:0);
    //             },
    //             take() {console.log('error: tried to access to Drop.take()')}
    //         }
    //     }
    //     const Slot = this.Slots[index];
    //     const refToArr = new (class {
    //         ref
    //         constructor(ref) { this.ref = ref; }
    //         get Colour() {
    //             return this.ref[1]
    //         }
    //         set Colour(value) {
    //             return this.ref[1] = value;
    //         }
    //         get Count() {
    //             return this.ref[0]
    //         }
    //         set Count(value) {
    //             return this.ref[0] = value;
    //         }
    //     })(Slot)
    //     return {
    //         add(ColourID) {
    //             if(refToArr.Count++===0)
    //                 refToArr.Colour = ColourID;
    //         },
    //         take(ColourID) {
    //             refToArr.Colour = (--refToArr.Count===0)?0:ColourID;
    //         }
    //     }
    // }
}
module.exports.TGame = TGame;
class TeXRoomState extends serializable { 
    /** @type {TGame}*/ 
    Room; 
    /** @param {TGame | TeXRoomState} input */
    constructor(input) {
        super();
        // console.log('TeXRoomState init', input);
        if(input instanceof TGame) this.Room = input
        else if(input instanceof TeXRoomState) this.Room = input.Room; 
        else if(input.Room) this.Room = input.Room;
        else this.Room = input;
    }
    /** @param {TeXRoomState} RoomState  */
    upgrade(RoomState) { /* console.log('upgradeState to ', RoomState); */ return this.Room.upgradeState(RoomState); }
}
/** @typedef {(ctx:ConnectionContext)=>any} ctxHandler */
/** @template T @typedef {(ctx:ConnectionContext)=>T} ctxHandlerT */
/** @param {int} rsid */
function RoomState(rsid) { return class RoomState extends TeXRoomState { RoomState = rsid }; };
class WaitingState extends RoomState(0) {
    players = [];
    // /** @param {TeXRoomState} lstate */
    // static fromRestart(lstate) {
    //     return new WaitingState(lstate);
    // } 
    /** @type {ctxHandlerT<void|true>} */
    async connect(ctx) {
        const userbalance = await getUserBalance(ctx.user.userId);
        console.log('userbalance', userbalance);
        if(userbalance < this.Room.bet) { return ctx.event('inConnectionBalanceError', {bet:this.Room.bet, balance:userbalance}); }
        const connres = this.players.push(ctx.user)<=2;
        if(this.players.length >= 2) 
            ((this.players.length = 2), this.upgrade(LaunchingState.fromWaitingState(this)), true);
        return connres;
    }
    /** @type {ctxHandlerT<void|true>} */
    disconnect(ctx) {
        if(this.players.length === 1 && this.players[0].userId === ctx.user.userId) return ((this.players.length = 0), true);
        else console.log('Гонка запросов, сначала апгрейд комнаты до лаунча, а потом дисконнет, это при двух егроках');
    }
    json() { return { RoomState: this.RoomState, players: this.players} }
    updata() { return this.json(); }
}
class TimeVal { // TimeValTiro
    /** @type {Number}  */
    timeval
    /** @param {Number} ms  */
    constructor(ms) { 
        this.timeval = ms;
    }
    /** @param {Number} secs  */
    static SECONDS(secs) { return new TimeVal(secs*1000); }

    start(CB) { // start properties distance ...
        const Timer = this;
        Timer._timestamp = timestamp();//for distance function
        // setTimeout(CB, this.timeval);
        const StopableDecorator = (CB)=>()=>Timer._stopped?null:CB();
        const PausableDecorator = (CB)=>()=>Timer._pause?(Timer._CB = CB):CB();
        setTimeout(StopableDecorator(CB), this.timeval);
        return this;
    }
    stop() { return this._stopped = true; }
    pauseWhile(CB) {
        const Timer = this;
        Timer._pause = true;
        res = CB();
        Timer._pause = false;
        if(Timer._CB) Timer._CB();
        return res;
    }

    value() { return this.timeval; }
    json() { return this; }
    distance() { return this.timeval - (timestamp() - this._timestamp); }
}
class LaunchingState extends RoomState(1) {
    players = [];
    timeval = TimeVal.SECONDS(5);
    getPlayerByID(_userId) { return this.players.filter(({userId})=>userId === _userId)[0]; }

    constructor(upgradable, players) { super(upgradable); this.players = players; this.timeval.start(()=>this.upgrade(DiceTeamRollState.fromLaunchingState(this))); }
    /** @param {WaitingState} wstate  */
    static fromWaitingState(wstate) {
        return new LaunchingState(wstate, wstate.players);
    }
    json() { return {
        RoomState: this.RoomState,
        players: this.players,
        timeval: this.timeval.json()
    }}
    updata() { return { RoomState: this.RoomState, players: this.players, timeval: this.timeval.json() }; }
}
class DiceTeamRollState extends RoomState(2) {
    players = [];
    /** Если кубики брошены, будут записаны здесь @type {[int, int]}*/
    Dices = randdice();
    timeval = TimeVal.SECONDS(30);
    getPlayerByID(_userId) { return this.players.filter(({userId})=>userId === _userId)[0]; }
    
    constructor(upgradable, players) { 
        super(upgradable); 
        this.players = players; 
        // this.timeval.start(this.timerlose());
        // for(const player of players) {
        //     this.rollDice({user:player}, false);
        // }
        if(this.Dices[0] !== this.Dices[1]) this.startNextState();
        else this.restartState()
        console.log('DiceTeamRollState autoroll', this.Dices);
    }
    /** @param {LaunchingState} wstate  */
    static fromLaunchingState(lstate) {
        const [wp, bp] = lstate.players;
        wp.team = WHITEID;
        bp.team = BLACKID;
        return new DiceTeamRollState(lstate, lstate.players);
    }

    timerlose() {
        return ()=>{
            // this.upgrade(new WaitingState(this));
        }
    }
    startNextState() {
        // this.timeval.stop();
        this.timeval = TimeVal.SECONDS(5).start(()=>this.upgrade(GameStarted.fromDiceTeamRollState(this)))
        this.red = 'red';
        this.Room.event('diceTeamRollCompletesLaunching', this.json());
    }
    restartState() {
        this.Dices = randdice();
        this.timeval.stop()
        this.timeval = TimeVal.SECONDS(5).start(()=>{
            // this.timeval = TimeVal.SECONDS(30).start(this.timerlose())
            // this.red = undefined;
            // this.upgrade(this);
            this.upgrade(new DiceTeamRollState(this, this.players))
        })
        this.red = 'red';
        this.Room.event('diceTeamRollCompletesLaunching', this.json());
        
    }
    // rollDice(ctx, event=true) {
    //     for(const [index, player] of Object.entries(this.players)) {
    //         console.log('rollDice', index, player);
    //         console.log('log:', player.userId, ctx.user.userId, this.Dices[index]);
    //         if(+player.userId===+ctx.user.userId&&!this.Dices[index]) {
    //             this.Dices[index] = getRandomInt(1,6)
    //             if(event) this.Room.event('diceTeamRoll', {index, value:this.Dices[index]});
    //         }
    //     }
    //     if(this.Dices.reduce((acc,val)=>acc===val&&!!acc)) 
    //         this.restartState();
    //     if(this.Dices.reduce((acc,val)=>acc!==val&&!!acc&&!!val))
    //         this.startNextState();
    //     return {result:'nope'};
    // }

    json() { return this.updata(); }
    updata() { return { RoomState: this.RoomState, players: this.players, Dices:this.Dices, timeval: this.timeval.json(), red:this.red }; }
}
class GameStarted extends RoomState(3) {
    /** @type {[TPlayer, TPlayer]} */
    players;
    Timers = new Timers;
    Slots = adv0_range(0, 24, { 0:[15,1], 12:[15,2], null:()=>[0,0] });
    Drops = { whiteover: 0, blackover: 0 };
    Dices = GameStarted._rollDices();
    ActiveTeam = WHITEID;

    getPlayerByID(_userId) { return this.players.filter(({userId})=>userId === _userId)[0]; }
    get activeplayer() { return this.players.filter(({team})=>team === this.ActiveTeam)[0]; }
    get opponent() { return this.players.filter(({team})=>team !== this.ActiveTeam)[0]; }

    constructor(upgradable, players, WhiteIsFirstPlayer) { 
        super(upgradable); 
        this.players = players; 
        players.map(player=>player.autodice = true);
        this.ActiveTeam = WhiteIsFirstPlayer?WHITEID:BLACKID;
        this.Timers.onfinish(()=>this.endGame(this.opponent.team, 'timer', 'timer'));
        this.Timers.curTimer = this.ActiveTeam;
        this.Room.events.onstart.send();
    }
    /** @param {DiceTeamRollState} wstate  */
    static fromDiceTeamRollState({Room, players, Dices}) {
        const [d1, d2] = Dices;
        // [players[0].team, players[1].team] = d1 > d2?[WHITEID, BLACKID]:[BLACKID, WHITEID];
        return new GameStarted(Room, players, d1 > d2);
    }

    static _rollDices() { return [getRandomInt(1, 6), getRandomInt(1, 6)]; }
    stepIfValid(user, step, code) {
        const result = this.Timers.curTimer.pauseWhile(()=>{//at the end ifn stopped/successed timer, this will be resumed;
            const {ActiveTeam, Dices} = this;
            
            const player = this.getPlayerByID(user.userId);
            if(!player) return ((console.log('nope', this.Players), {result:'nope', user, player}))
            if(!(player.debugger || player.team === ActiveTeam)) return ((console.log('nope', this.Players), {result:'nope', user, player}))

            //implement GameLogistics here
            step.map(({from, to, points})=>{
                this.slot(from).take(ActiveTeam);
                this.slot(to).add(ActiveTeam);
                // typeof to === 'string' && to = 
            });
            this.Timers.curTimer.success();//if succes step
            return true;
        });
        
        if(result===true) {
            const prevstate = { ActiveTeam:this.ActiveTeam, Dices:this.Dices };
            if(this.Drops['whiteover'] === 15 || this.Drops['blackover'] === 15) {
                this.Room.event('step', {step, prevstate, newstate:this.nextState(false, 'stop'), code})
                this.endGame(this.ActiveTeam, 'Player dropped all chekers', 'win');
            } else this.Room.event('step', {step, prevstate, newstate:this.nextState(), code})
            return {result:'success'};
        } else {
            return {result:'nope'};
        }
    }
    nextState(rollDice=false, stop=false) {
        const Dices = this.Dices = !stop&&(this.opponent.autodice||rollDice)?GameStarted._rollDices():[0, 0];
        const ActiveTeam = this.ActiveTeam = (rollDice||stop)?this.ActiveTeam:nextTeamDict[this.ActiveTeam];

        if(stop) this.Timers.curTimer = null;
        else if(!rollDice) this.Timers.curTimer = ActiveTeam;
        return { Dices, ActiveTeam };
    }
    /** @param {ConnectionContext} ctx  */
    restart__({user}) {
        const [p1, p2] = this.players
        console.log('restart__', this.players, user, ...arguments);
        /** @type {TPlayer[]} */
        const [player, opponent] = (p1.userId === user.userId
             && [p1, p2]) || (p2.userId === user.userId && [p2, p1])
        if(player) {
            this.endGame(opponent.team, 'restart__', 2);
            return {result:'restart__'};
        } 
        return {result:'nope'};
    }
    restartLate() {
        this.Slots = adv0_range(0, 24, { 19:[15,1], 6:[15,2], null:()=>[0,0] });
    }
    restartFlud() {
        const black1 = [1,2];
        this.Slots = adv0_range(0, 24, { 0:[15,1], 12:[9,2], 1:black1, 2:black1, 3:black1, 4:black1, 5:black1, 6:black1, null:()=>[0,0] });
    }
    /** @param {ConnectionContext} ctx  */
    rollDice(ctx) {
        console.log('rollDice');
        if(this.activeplayer.userId !== ctx.user.userId && this.Dices[0]) return {result:'nope'};
        this.Dices = GameStarted._rollDices();
        console.log('rollDice', this.Dices);
        this.Room.event('state', {newstate: this.nextState(true)});
        console.log('rollDice event');
    }
    endGame(WinnerTeam, msg, code) {
        if(!Debug.TimersTurn&&code === 'timer') return; //debig
        if(this.RoomState === CONSTANTS.RoomStates.end) return;
        this.RoomState = CONSTANTS.RoomStates.end;
        this.Room.event('end', {winner: WinnerTeam, msg, code});
        this.Timers.off();
        this.Room.events.onfinish.send();
        const [p1, p2] = this.players;
        const [winner, loser] = p1.team === WinnerTeam ? [p1, p2] : [p2, p1];
        this.upgrade(WinState.fromGameStarted(this, winner, loser))
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
            get Colour() { return this.ref[1]; }
            set Colour(value) { return this.ref[1] = value; }
            get Count() { return this.ref[0] }
            set Count(value) { return this.ref[0] = value; }
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
    json() { return {
        RoomState: this.RoomState,
        ActiveTeam: this.ActiveTeam,
        players: this.players,
        Timers: this.Timers.json(),
        Slots: this.Slots,
        Drops: this.Drops,
        Dices: this.Dices,
    }}
    updata() { return this.json(); }
}
class WinState extends RoomState(4) {
    constructor(lstate, Slots, Drops, winner, loser) {
        super(lstate);
        this.Slots = Slots
        this.Drops = Drops
        this.winner = winner
        this.loser = loser
        this.players = [winner, loser]
        this.timeval = TimeVal.SECONDS(10).start(()=>{
            this.players = [];
            this.Room.disconnectAll();
            this.Room.events.onexit.send();
            this.upgrade(new WaitingState(lstate))
        })

        balanceTravers(winner, loser, this.Room.betId)
    }
    /** @param {GameStarted} lstate */
    static fromGameStarted(lstate, winner, loser) {
        return new WinState(lstate, lstate.Slots, lstate.Drops, winner, loser);
    }
    json() { return {
        Slots:this.Slots,
        Drops:this.Drops,
        players:this.players,
        winner:this.winner,
        loser:this.loser,
        timeval:this.timeval,
    }}
    updata() { return this.json(); }
}