const { constants } = require("crypto");
const { response } = require("express");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const range = (from, len) => [...Array(len).keys()].map(x => x + from);//make iterator with Array methods?
const adv0_range = (from, len, vals) => range(from,len).map((i)=>vals[i]||vals?.null());
const CONSTANTS = {
    WHITEID: 1,
    BLACKID: 2
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const randdice = ()=>[getRandomInt(1,6), getRandomInt(1,6)];
class SharedRoom0 {
    Listeners = []

    constructor() {}
    sub(send) {
        const record = {send};
        record.id = this.Listeners.push(record);
    }
    send(event, obj) {
        const msg = Object.assign(obj, {event});

        this.Listeners.map(async({send})=>send(msg));
    }
}
class TGame extends SharedRoom0 {
    constructor(GameID=-1) {
        super();
        this.GameID = GameID;
        this.Slots = adv0_range(0, 24, {0:[15,1], 12:[15,2], null:()=>[0,0]});
        this.info = {
            ActiveTeam: CONSTANTS.WHITEID,
            Dices: [1,2]
        }
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
        this.send('step', {step, prevstate, newstate: this.nextState(), code});
        return {result:'success'};
    }
    nextState() {
        const {ActiveTeam} = this.info;
        const nextTeam = {
            [CONSTANTS.WHITEID]: CONSTANTS.BLACKID,
            [CONSTANTS.BLACKID]: CONSTANTS.WHITEID
        }
        console.log(ActiveTeam, nextTeam[ActiveTeam]);
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
const Games = [ new TGame() ];//probe

const WSPipelineCommands = {
    step({Game}, {step, code}) {
        return Game.stepIfValid(step, code);
    },
    get({Game}) {
        const event = 'board';
        return {event, slots: Game.Slots, state: Game.info};
    },
    restart(ctx) {
        const lastGame = ctx.Game;
        const Game = ctx.Game = Games[ctx.GameID] = new TGame();
        Game.Listeners = lastGame.Listeners;
        Game.send('restart', {slots: Game.Slots, state: Game.info});
    }
}
var fs = require('fs');
module.exports = function(ws, req) {
    fs.writeFile('/test.log', 'connection', console.log.bind(console));

    ws._socket.setKeepAlive(true);
    // console.log('Hello');
    const ctx = {
        GameID: 0,//probe
        Game: Games[0], //probe //maybe upgrd to Property or Proxy on Game.. 
    };
    const send = response=>ws.send(JSON.stringify(response));
    ctx.Game.sub(send);
    // ws.send(JSON.stringify(WSPipelineCommands.get.call(ws,ctx,{})));
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