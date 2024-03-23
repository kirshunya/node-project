module.exports.CONSTANTS = {
    WHITEID: 1,
    BLACKID: 2,
    RoomStates:{Waiting:0, Started:1},
}
module.exports.Debug = {
    GAMESCOUNT: 0,
    TimersTurn: 'on'
}
module.exports.ConnectionContext = class ConnectionContext {
    /** @type {userId:int, username:string, clientId:int} */
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