const { CONSTANTS, Debug, TUser, TPlayer, TState, ConnectionContext, EventProvider, nextTeamDict } = require("./Generals");
const { getRandomInt, FCPromise } = require("./Utility");

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
    resume() {
        if(this.snap?.success||!this.snap) return;
        this.snap.pending = false;
        this.snap.waiting?.();
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
        const diff = this.snap?.actual?.();
        // console.log('json()', this, diff)
        return [this.userTime, this.snap?this.snap.timestamp:0 ];
    }
}
class Timers {
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
        const timesIndex = {
            [CONSTANTS.WHITEID]: 0,
            [CONSTANTS.BLACKID]: 1
        }
        this.curTimer.reject();
        this.activetimer = timesIndex[ActiveTeam];
        this.curTimer.start();
        // this.curTimer = new Timer(60*1000, ()=>
        //         this.endGame(ActiveTeam/* in context this is OpponentTeam */, 'Time end', 'timer'));
    }
    // get success() {return this.curTimer.success.bind(this.curTimer)}

    off() {
        this.timers.map(timer=>timer.off());
    }

    json() {
        return this.timers.map(timer=>timer.json())
    }
}

class SharedRoom0 { // deprec // TODO: extends from WSListeners
    Connections = {};
    RoomState = CONSTANTS.RoomStates.Waiting;

    constructor(GameID=[-1,-1]) {
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
        this.event('backgammons::connection', user, 'add ignoreList and send current user..');//? player:visitor
        this.Connections[rikey] = ({user, ctx, ws, send:(...args)=>ctx.send(...args)});
        console.log(rikey, user);
    }
    disconnect(user, ctx, ws) {
        delete this.Connections[ctx.rikey];
    }
    event(event, obj) {
        const msg = Object.assign(obj, {event, method:'backgammons::event'});
        // console.log(`sending`, msg, Object.values(this.Connections))
        Object.values(this.Connections).map(async(ctx)=>ctx.send(msg));
    }
}
const Debugger = new TPlayer(2, 'Debby', -1);
module.exports.TGame = class TGame extends SharedRoom0 {
    /** @type {TPlayer[]} */
    Players = new TPlayer.PlayersContainer(this)
    // [
    //     new TPlayer(0, 'Jimmy', CONSTANTS.BLACKID),
    //     new TPlayer(1, 'Missy', CONSTANTS.WHITEID)
    // ];
    Timers = new Timers;
    /** @type {TState} */
    info = {
        ActiveTeam: CONSTANTS.WHITEID,
        Dices: [1, 1]
    }
    /** @type {[Number, Number][]} */
    Slots = adv0_range(0, 24, { 0:[15,1], 12:[15,2], null:()=>[0,0] });
    // this.Slots = adv0_range(0, 24, { 0:[15,1], 12:[15,2], null:()=>[0,0] });
    /** @type {{whiteover:Number, blackover:Number}} */
    Drops = {
        whiteover: 0,
        blackover: 0
    };
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
        const nextTeamDict = {
            [CONSTANTS.WHITEID]: CONSTANTS.BLACKID,
            [CONSTANTS.BLACKID]: CONSTANTS.WHITEID
        }
        if(test==='test')
            this.Slots = adv0_range(0, 24, { 18:[15,1], 6:[15,2], null:()=>[0,0] });
        if(test==='flud')
            this.Slots = adv0_range(0, 24, { 0:[9,1], 12:[14,2], 11:[1,2], 18:[1,1],13:[1,1],14:[1,1],15:[1,1],16:[1,1],17:[1,1],null:()=>[0,0] });
        this.Timers.onfinish(Team=>this.endGame(nextTeamDict[Team], 'time end', 'timer'))
    }
    /**
     * 
     * @param {int} userId 
     * @param {boolean} value 
     */
    setAutostep(userId, value) {
        const player = this.Players.getPlayerByID(userId)
        if(!player) return;
        player.autodice = value;
        this.event('autodiceset', {userId, value})
    }
    chat(msg) {
        this.event('message', {text:msg.text})
    }
    connect(user, ctx, ws) {
        // const __u = {user.}
        super.connect(user, ctx, ws);
        this.events.onconnect.send();
        console.log('TimersTurn', Debug.TimersTurn);
        ctx.event('backgammons::connection::self', {
            GameID: this.GameID, GAMESCOUNT:Debug.GAMESCOUNT, 
                    
                    state: this.info, 
                        awaitingTeam:this.awaitingTeam,
                        awaitingTeamstr:`${this.awaitingTeam}`,
                    //TODO: moveTo TableRecord.
                    slots: this.Slots, 
                    dropped: this.Drops,

                    // moveTo state record
                    RoomState:this.RoomState,
                    GameState:this.RoomState,

                    players:this.Players.json(),
                    // moveTo debug record
                    ['TimersTurn']:(Debug.TimersTurn?'on':'off'),
                    // moveTo state record
                    times: this.Timers.json(),

                    debug: Object.keys(this.Connections),//TODO: disconnections.. //TODO: Lobby anons of GamesEnd
        });
        if(this.Players.isalready()&&!this.Players.getPlayerByID(user.userId))
            this.Players.appendVisitor(user);
        else {
            this.Players.appendPlayer(user);
            if(this.Players.isalready())
                if(this.RoomState === CONSTANTS.RoomStates.Waiting)//__0?
                    this.startGame()
        }

        
        // let rec = this.Players.filter(({userId})=>userId===user.userId)[0];
        // if(rec) {
        //     user.team = rec.team;
        //     return;
        // }
        // if(this.Players.length<2) {
        //     this.Players.push(user);
        //     // Lobby.event('backgammons::lobby::connectionToRoom', {
        //     //     GameID: this.GameID, Players: this.Players.length
        //     // });
        //     if(this.Players.length===2) {//
        //         this.startGame();
        //     }
        // }
    }
    startGame() {
        this.Players.rollTeam()
        this.info = {
            ActiveTeam: CONSTANTS.WHITEID,
            Dices: randdice()
        }
        this.event('backgammons::GameStarted', {slots: this.Slots, state: this.info, players:this.Players.json()});
        this.RoomState = CONSTANTS.RoomStates.Started;
        this.events.onstart.send()
    }
    /**
     * 
     * @param {TUser} user 
     * @param {[{from,to,points}]} step 
     * @param {int} code 
     */
    stepIfValid(user, step, code) {
        const {ActiveTeam, Dices} = this.info;
        this.Timers.curTimer.pause();
        const ret = ret=>(this.Timers.curTimer.resume(), ret);
        // this.curTimer.await();//time to check step to success 
        
        const player = this.Players.getPlayerByID(user.userId);
        if(!player) return ret((console.log('nope', this.Players), {result:'nope', user, player}))
        if(!(player.userId === 2 || player.team === ActiveTeam)) return ret((console.log('nope', this.Players), {result:'nope', user, player}))
        //implement GameLogistics here
        step.map(({from, to, points})=>{
            this.slot(from).take(ActiveTeam);
            this.slot(to).add(ActiveTeam);
            // typeof to === 'string' && to = 
        });
        this.Timers.curTimer.success();//if succes step
        const prevstate = this.info;
        this.event('step', {step, prevstate, code});//if success step
        console.log('dicerolling by ', this.Players.opponent())
        if(this.Players.opponent().autodice) {
            this.event('state', {newstate: this.nextState()});
        } else {
            const nextTeamDict = {
                [CONSTANTS.WHITEID]: CONSTANTS.BLACKID,
                [CONSTANTS.BLACKID]: CONSTANTS.WHITEID
            }
            this.awaitingTeam = this.info.awaitingTeam = nextTeamDict[ActiveTeam]
        }

        if(this.Drops['whiteover'] === 15 || this.Drops['blackover'] === 15) {
            this.endGame(ActiveTeam, 'Players dropped all checkers', 'win')
        } 
        return ret({result:'success'});
    }
    rollDice() {
        this.awaitingTeam = this.info.awaitingTeam = 0;
        this.event('state', {newstate: this.nextState()});
    }
    endGame(WinnerTeam, msg, code) {
        if(!Debug.TimersTurn&&code === 'timer') return; //debig
        if(this.RoomState === CONSTANTS.RoomStates.end) return;
        this.RoomState = CONSTANTS.RoomStates.end;
        this.event('end', {winner: WinnerTeam, msg, code});
        this.Timers.off();
        this.events.onfinish.send();
    }
    nextState() {
        const nextTeam = nextTeamDict[this.info.ActiveTeam];
        this.Timers.curTimer = nextTeam;
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