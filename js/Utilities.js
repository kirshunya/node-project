const $myeval = val=>isNaN(+val)?val:+val;
//my custom utilities
const $with = (ret, args = [ret]) => ({
    $with(r) {
        typeof r === 'function' && (r = r.apply(args))
        return $with(ret, ret = [...args, r])
    },
    $with$ret(r) {
        typeof r === 'function' && (r = r.apply(args))
        return $with(r, ret = [...args, r])
    },
    $ret(cb) {
        return $with(cb.apply(null, args), args)
    },
    $do(cb) {
        cb.apply(null, args);
        return this;
    },
    do(cb) {
        cb.apply(null, args);
        return ret;
    }
})
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const range = (from, len) => [...Array(len).keys()].map(x => x + from);

const API = {
    async __send(mmm, body={}, method='POST') {
        return fetch(`/user/play/backgammon/room/${$PageSnapshotData.gid}/${mmm}`, 
            method==='GET'?undefined:{
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-CSRF-Token": $PageSnapshotData.csrfToken
                },
                credentials: "same-origin",
                body: JSON.stringify(Object.assign(body, {stok: $PageSnapshotData.stok}))
            }).then(data=>data.json());
    },
    async step(Moves) {
        return this.__send('step', {Moves});
    },
    async send(msg) {
        return this.__send('send', msg);
    },
    async ready(isready, id=isready?'yes':'no') {
        return this.__send(`ready/${id}`, undefined, 'POST')
    },
    async pollts(ts) {
        return this.__send(`poll/${ts}`, null, 'GET');
    },
    async doubleBET() {
        return this.__send('double', null, 'POST');
    },
    async doubleAccept(YesOrNo) {
        return this.__send(`double/${YesOrNo?'accept':'Double decline'}`, null, 'POST');
    }
}
class JustEnoughEvents {
    EventListeners = {}
    NamedPromises = []
    NamedPromisesValues = {}

    constructor(initials, NamedPromisesEssentials) {
        this.init(initials);
        if(NamedPromisesEssentials==='*') {
            this.NamedPromises = '*'
        }
    }
    init(initials) {
        initials?.NamedPromises?.map(this.registerNamedPromise.bind(this));
        initials?.linkEventProviders
            &&Object.entries(initials.linkEventProviders)
                .map(async([prefix, jeep])=>this.linkEventProvider(await jeep, prefix));
        typeof initials?.subdo === 'function' && this.init(initials?.subdo?.(this));
    }
    on(event, cb, pause=false) {
        if (!this.EventListeners[event]) this.EventListeners[event] = [];
        if(this.NamedPromises.includes(event) && this.NamedPromisesValues[event]!==undefined) 
            return cb(this.NamedPromisesValues);
        return this.EventListeners[event].push(pause?cb:async(...args)=>cb(...args));
    }
    fon(event) {
        return new Promise(resolve=>this.on(event, (...args)=>resolve(...args)));
    }
    registerNamedPromise(name) {
        this.NamedPromises.push(name);
    }
    linkEventProvider(JEEProvider, prefix=JEEProvider.constructor.name, ...options) {
        JEEProvider.on('~~ExternalProviders', (e,...args)=>this.$$send(`${prefix}.${e}`, ...args))
        this.EventListeners[`${prefix}.**`] = []
        this.NamedPromises.push(...JEEProvider.NamedPromises.map(name=>`${prefix}.${name}`));
        this.NamedPromisesValues = Object.assign(this.NamedPromisesValues, 
            ...Object.entries(JEEProvider.NamedPromisesValues)
                        .map((name, value)=>[`${prefix}.${name}`,value])
                        .map(([name, value])=>({name: value}))
        )
    }
    $send(event, ...args) {
        this.EventListeners[event]?.map(cb => cb(...args));
        this.EventListeners['~~ExternalProviders']?.map(cb => cb(event, ...args))//alias to unnamed '*' event
    }
    $$send(event, ...args) {
        if(this.NamedPromises.includes(event))
            this.NamedPromisesValues[event] = args
        this.EventListeners[event]?.map(cb => cb.apply(null, args));
    }
    $$$send(event, ...args) {
        this.$$send(event, ...args);
        this.$$send('**', event, ...args);
    }
    $$poll(data) {
        this.pollLogs && this.pollLogs.push(data);
        return data;
    }
}
class __PollTs extends JustEnoughEvents {
    ts//document.body.querySelector("[name~=ts][content]").content
    pollLogs = []
    ___lock = false;
    constructor(ts) {
        super();
        this.ts = ts;
        this.on('*', data=>{
                if(+data.ts === +this.ts)
                    console.log('poll: no updates (check Poll.pollLogs)')||this.$$poll(data);
                else
                    console.log('poll: updates:', this.$$poll(data));
                data.updates.map(action=>this.$$$send(action.type, action, ++this.ts));
                this.ts = +data.ts;
            });
        this.on('**', (event, action, ts)=>action?.stok!==$PageSnapshotData.stok
                                        ?this.$$send(`new${action.type}`, action, ts)
                                        :this.$$send(`cur${action.type}`, action, ts));
        this.on('newstep', console.log.bind('handled new step',console));
        this.on('curstep', console.log.bind('handled current step'));
        //redirect to newchatevent
        // PageSnapshotData.Game.ChatMsgActionNames
        //     .map(event=>this.on(event, this.$$$send.bind(this, 'chatevent')));
                //this.on('**') handle this chatevent and check $stok value, if diff sends newchatevent
    }

    async loop() {//poll
        while(1) {
            try {
                const response = API.pollts(this.ts);
                response.then(data => this.$$send('*', data));
                if((await response).error) break;
            } catch(e) {
                console.log(e);
            }
            await sleep(100);
        }
    }
};
//GameConstants..
const [white, black] = ['white', 'black'];
const [steping, completed] = ['steping', 'completed'];
const [GMmove, GMend] = ['GMmove', 'GMend'];

// var gm, gc;
// const Poll = new __PollTs();
// const scripts = new JustEnoughEvents();
// const __Ultra__ = new JustEnoughEvents({});
// const sendstep = async (moves, req=API.step(moves))=>
//                                 req.then(console.log.bind(console, 'sendstep'))&&req;
var sendstep;
