const { getRandomInt } = require("./Utility.js")

const {WHITEID, BLACKID} = module.exports.CONSTANTS = {
    WHITEID: 1,
    BLACKID: 2,
    RoomStates:{Waiting:0, Started:1, end:2},
}
/** @type {{[x : number] : number}} */
const nextTeamDict = module.exports.nextTeamDict = {
    [WHITEID]: BLACKID,
    [BLACKID]: WHITEID
};
module.exports.Debug = {
    GAMESCOUNT: 0,
    TimersTurn: 'on'
}
module.exports.TUser = class TUser {
    /** @type {int} */
    userId
    /** @type {int} */
    clientId
    /** @type {string} */
    username
    /**
     * 
     * @param {int} userId 
     * @param {int} clientId 
     * @param {string} username 
     */
    constructor(userId, clientId, username) {
        this.userId = userId
        this.clientId = clientId
        this.username = username
    }
    // static fromUser(User) {
    //     return new TPlayer
    // }
}
class RoomComponent {
    /** @param {TGame} Game  */
    constructor(Game) { 
        /** @type {TGame} */ 
        this.Game = Game; 
    }
}
module.exports.TPlayer = class TPlayer {
    /** @type {int} */
    userId
    /** @type {string} */
    username
    /** @type {int} */
    team
    /** @type {boolean} */
    autodice = true
    /**
     * 
     * @param {int} userId 
     * @param {string} username 
     * @param {int} team 
     */
    constructor(userId, username, team) {
        this.userId = userId
        this.username = username
        this.team = team
    }
    /**
     * 
     * @param {TUser} user
     * @returns {TPlayer}
     */
    static fromUser(user, team=undefined) {
        return new TPlayer(user.userId, user.username, team)
    }
    static PlayersContainer = class TPlayers extends RoomComponent {
        /** @type {TPlayer[]} */
        list = []
        
        rollTeam() {
            const [fpm, sp] = this.list;
            const acto = [WHITEID, BLACKID][getRandomInt(0,1)];
            fpm.team = acto;
            sp.team = nextTeamDict[acto]
        }
        appendPlayer(User) {
            if(this.isalready()) return 0;
            if(this.getPlayerByID(User.userId)) return 1;
            return this.list.push(TPlayer.fromUser(User));
        }
        getPlayerByID(userId) {
            /*Debug*/
            if(userId === 2) 
                return Debugger;
            for(const player of this.list) 
                if(player.userId === userId) return player
            return null;
        }
        isalready() {
            return this.list.length===2;
        }
        opponent() {
            return this.list.filter(({team})=>team !== this.Game.info.ActiveTeam)[0]
        }
        json() {
            return this.list;
        }
    }
}
module.exports.TState = class TState {
    /** @type {int} */
    ActiveTeam
    /** @type {[Number, Number]} */
    Dices
}
module.exports.ConnectionContext = class ConnectionContext {
    /** @type {TUser} */
    user
    /** @type {WebSocket} */
    ws
    constructor(ws) {
        this.ws = ws
    }

    /** @param {object} response  */
    send(response){
        return this.ws.send(JSON.stringify(response))
    }
    /** @param {string} event $eventname @param {object} response  */
    event(event, response){
        return this.send(Object.assign(response, {event, method:'backgammons::event'}))
    }
}
module.exports.EventProvider = class EventProvider {
    constructor() {
        const EventListeners = []
        const subsrcibe = (CB)=>EventListeners.push(CB);
        subsrcibe.subsrcibe = subsrcibe
        subsrcibe.send = (...args)=>EventListeners.map(CB=>CB?.(...args));
        return subsrcibe;
    }
}