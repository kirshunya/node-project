const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const range = (from, len) => [...Array(len).keys()].map(x => x + from);
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = {
    getRandomInt, range, sleep
};
const OEPromise = ()=>{
    let resolve, reject;
    const promise = new Promise((r,e)=>(resolve=r)&&(reject=e));
    return [promise, (...args)=>resolve(...args), (...args)=>reject(...args)];
}
module.exports.FCPromise = ()=>{
    const [promise, resolve, reject] = OEPromise();
    return Object.assign(promise, {promise, resolve, reject});
}
/**
 * @template T
 */
module.exports.Arrov = class Arrov{
    /** @type {T[]} */
    content = [];
    constructor() {
        return new Proxy(this, new Arrov.__T0Proxier)
    }
    static rangeSet(fromIndex, len) {
        return {
            map:(CB)=>range(fromIndex, len)
                        .map((index, ...args)=>this.content[index] = CB(index, ...args))
        }
    }
    static __T0Proxier = class __T0Proxier {
        get(Arrov, key, Proxier) {
            if(Arrov[key]!==undefined) return Arrov[key]
            const ret = Arrov.content[key];
            return typeof ret === 'function'?ret.bind(Arrov.content):ret
        }
    }
}
module.exports.WSListeners = class WSListeners {
    Connections = {};

    constructor(prefix=rikey) {this.prefix = prefix}
    /**
     * 
     * @param {TUser} user 
     * @param {ConnectionContext} ctx 
     * @param {WebSocket} ws 
     * @returns {string} rikey
     */
    connect(user, ctx, ws) {
        const {prefix} = this
        const rikey = ctx[prefix] = `${user.clientId}-${user.userId}-${getRandomInt(-10,100)}`;
        // this.event('backgammons::connection', user, 'add ignoreList and send current user..');//? player:visitor
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
module.exports.MProvider = class MProvider {
    constructor(Providers = [], _0default = ()=>({e:'method not found'}), musttype = Function) {
        /** @type { Object[] } */
        this.Providers = Providers;
        return Proxy(this, {
            get(MProvider, key, Proxier) {
                for(const provider of MProvider.Providers) {
                    const foo = provider[key];
                    if(foo && (!musttype || typeof foo === musttype)) 
                        return foo;
                }
                return _0default?.();
            },
            set() {
                return false;
            }
        })
    }
}