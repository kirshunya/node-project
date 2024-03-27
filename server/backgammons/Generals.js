module.exports.CONSTANTS = {
    WHITEID: 1,
    BLACKID: 2,
    RoomStates:{Waiting:0, Started:1, end:2},
}
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
}
module.exports.TPlayer = class TPlayer {
    /** @type {int} */
    userId
    /** @type {string} */
    username
    /** @type {int} */
    team
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