const { CONSTANTS, Debug, TUser, TPlayer, TState, ConnectionContext } = require("./Generals");

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

class SharedRoom0 {
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
        this.Connections[rikey] = ({user, ctx, ws, send:(...args)=>ctx.send(...args)});
        this.event('backgammons::connection', user, 'add ignoreList and send current user..');//? player:visitor
        console.log(rikey, this.Connections[rikey]);
    }
    disconnect(user, ctx, ws) {
        delete this.Connections[ctx.rikey];
    }
    event(event, obj) {
        const msg = Object.assign(obj, {event, method:'backgammons::event'});
        console.log(`sending`, msg, Object.values(this.Connections))
        Object.values(this.Connections).map(async(ctx)=>ctx.send(msg));
    }
}
const Debugger = new TPlayer(2, 'Debby', -1);
module.exports.TGame = class TGame extends SharedRoom0 {
    /** @type {TPlayer[]} */
    Players = [
        new TPlayer(0, 'Jimmy', CONSTANTS.BLACKID),
        new TPlayer(1, 'Missy', CONSTANTS.WHITEID)
    ];
    /** @type {Timer} */
    curTimer = new Timer(0, ()=>{});
    /** @type {TState} */
    info = {
        ActiveTeam: CONSTANTS.WHITEID,
        Dices: [1, 1]
    }
    /** @type {[Number, Number]} */
    times = [0, 0];
    /** @type {[Number, Number][]} */
    Slots = adv0_range(0, 24, { 0:[15,1], 12:[15,2], null:()=>[0,0] });
    // this.Slots = adv0_range(0, 24, { 0:[15,1], 12:[15,2], null:()=>[0,0] });
    /** @type {{whiteover:Number, blackover:Number}} */
    Drops = {
        whiteover: 0,
        blackover: 0
    };
    constructor(GameID) {
        super(GameID);
    }
    connect(user, ctx, ws) {
        // const __u = {user.}
        super.connect(user, ctx, ws);
        console.log('TimersTurn', Debug.TimersTurn);
        ctx.event('backgammons::connection::self', {
            GameID: this.GameID, GAMESCOUNT:Debug.GAMESCOUNT, 
                    
                    state: this.info, 
                    slots: this.Slots, 
                    dropped: this.Drops,

                    RoomState:this.RoomState,
                    GameState:this.RoomState,
                    players:this.Players,
                    
                    ['TimersTurn']:(Debug.TimersTurn?'on':'off'),
                    times: this.times,

                    debug:Object.keys(this.Connections),
        });
        if(this.RoomState === CONSTANTS.RoomStates.Waiting)
            this.startGame()
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
        // const cc = this.Players[0].team = getRandomInt(1,2);
        // this.Players[1].team = 1+!(cc-1);
        this.info = {
            ActiveTeam: CONSTANTS.WHITEID,
            Dices: randdice()
        }
        this.event('backgammons::GameStarted', {slots: this.Slots, state: this.info, players:this.Players});
        this.RoomState = CONSTANTS.RoomStates.Started;
    }
    /**
     * 
     * @param {int} userId 
     * @returns {TPlayer}
     */
    getPlayerByID(userId) {
        /*Debug*/
        if(userId === 2) 
            return Debugger;
        for(const player of this.Players) 
            if(player.userId === userId) return player
        return null;
    }
    /**
     * 
     * @param {TUser} user 
     * @param {[{from,to,points}]} step 
     * @param {int} code 
     */
    stepIfValid(user, step, code) {
        const {ActiveTeam, Dices} = this.info;
        this.curTimer.await();//time to check step to success 
        
        const player = this.getPlayerByID(user.userId);
        if(!player) return (console.log('nope', this.Players), {result:'nope', user, player})
        


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
        if(!Debug.TimersTurn&&code === 'timer') return; //debig
        this.event('end', {winner: WinnerTeam, msg, code});
        Debug.GAMESCOUNT++;
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