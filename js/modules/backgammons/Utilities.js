//my custom utilities
// module.exports = {hello:'world'};
export const $myeval = val=>isNaN(+val)?val:+val;
export const $with = (ret, args = [ret]) => ({
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
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const range = (from, len) => [...Array(len).keys()].map(x => x + from);

const __getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const getRandomInt = (min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => __getRandomInt(Math.ceil(min), Math.floor(max));
/** 
 * @template T
 * @returns {[Promise.<T>, (value: T | PromiseLike<T>) => void, (value: T | PromiseLike<T>) => void]}
 */
export const OEPromise = ()=>{
    let resolve, reject;
    const promise = new Promise((r,e)=>(resolve=r)&&(reject=e));
    return [promise, (...args)=>resolve(...args), (...args)=>reject(...args)];
}
export const FCPromise = ()=>{
    const [promise, resolve, reject] = OEPromise();
    return Object.assign(promise, {promise, resolve, reject, fire:resolve});
}
export class EventProvider {
    constructor() {
        const EventListeners = []
        const subsrcibe = (CB)=>(EventListeners.push(CB), subsrcibe);
        subsrcibe.subsrcibe = subsrcibe
        subsrcibe.send = (...args)=>EventListeners.map(CB=>CB?.(...args));
        return subsrcibe;
    }
}
export class RewritablePromiseEmit {
  value = null
  CallBacks = [];
  ReCalls = [];
  resolve(value) {
    this.value = value;
    while(this.CallBacks.length) 
      this.CallBacks.pop()(value)
    this.ReCalls.map(CB=>CB(value));
  }
  /** принять значение один раз, если `next`=true, то принять следующее обновление. */
  async then(CB, next=false) {
    if(!this.value||next) return new Promise(resolve=>this.CallBacks.push((...args)=>resolve(CB(...args))))
    return CB(this.value);
  }
  /** Слушать обновления на постоянке @returns {Number} listenerId */
  listen(CB) { return this.ReCalls.push(CB)-1; }
}
export class JustEnoughEvents {
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
export const ondom = FCPromise();  window.addEventListener('DOMContentLoaded', ondom.resolve);
export function localThisProvideComponent(keyword) {
  return class localThisProvideComponent {
    constructor(_this) { this[keyword] = _this; }
  }
}
//GameConstants..
export const [white, black] = ['white', 'black'];
export const [steping, completed] = ['steping', 'completed'];
export const [GMmove, GMend] = ['GMmove', 'GMend'];

   /**
   * Toast (https://github.com/itchief/ui-components/tree/master/toast)
   * Copyright 2020 - 2021 Alexander Maltsev
   * Licensed under MIT (https://github.com/itchief/ui-components/blob/master/LICENSE)
   **/
export class Toast {
    /**
     * 
     * @param {{title:string|false, text:string,theme:string, autohide:boolean, interval:int}} params 
     */
    constructor(params) {
      this._title = params['title'] === false ? false : params['title'] || 'Title';
      this._text = params['text'] || 'Message...';
      this._theme = params['theme'] || 'default';
      this._autohide = params['autohide'] && true;
      this._interval = +params['interval'] || 5000;
      this._create();
      this._el.addEventListener('click', (e) => {
        if (e.target.classList.contains('toast__close')) {
          this._hide();
        }
      });
      this._show();
    }
    _show() {
      this._el.classList.add('toast_showing');
      this._el.classList.add('toast_show');
      window.setTimeout(() => {
        this._el.classList.remove('toast_showing');
      });
      if (this._autohide) {
        setTimeout(() => {
          this._hide();
        }, this._interval);
      }
    }
    _hide() {
      this._el.classList.add('toast_showing');
      this._el.addEventListener('transitionend', () => {
        this._el.classList.remove('toast_showing');
        this._el.classList.remove('toast_show');
        this._el.remove();
      }, {
        once: true
      });
      const event = new CustomEvent('hide.toast', {
        detail: {
          target: this._el
        }
      });
      document.dispatchEvent(event);
    }
    _create() {
      const el = document.createElement('div');
      el.classList.add('toast');
      el.classList.add(`toast_${this._theme}`);
      let html = `{header}<div class="toast__body"></div><button class="toast__close" type="button"></button>`;
      const htmlHeader = this._title === false ? '' : '<div class="toast__header"></div>';
      html = html.replace('{header}', htmlHeader);
      el.innerHTML = html;
      if (this._title) {
        el.querySelector('.toast__header').textContent = this._title;
      } else {
        el.classList.add('toast_message');
      }
      el.querySelector('.toast__body').innerHTML = this._text;
      this._el = el;
      if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.classList.add('toast-container');
        document.body.append(container);
      }
      document.querySelector('.toast-container').append(this._el);
    }
   }

export class ToastForEmodji {
    constructor({ text, autohide, interval, targetElement }) {
        this.text = text;
        this.autohide = autohide;
        this.interval = interval;
        this.targetElement = targetElement;
        this.toastElement = this.createToastElement();

        this.show();
        if (this.autohide) {
            setTimeout(() => this.hide(), this.interval);
        }
    }

    createToastElement() {
        const toastDiv = document.createElement('div');
        toastDiv.className = 'toast-for-emodji';
        toastDiv.innerHTML = this.text;
        toastDiv.style.position = 'absolute';
        toastDiv.style.zIndex = 1000; // Ensure it is above other elements

        return toastDiv;
    }

    show() {
        document.body.appendChild(this.toastElement);
        const rect = this.targetElement.getBoundingClientRect();
        this.toastElement.style.left = `${rect.left + window.pageXOffset}px`;
        this.toastElement.style.top = `${rect.top + 10}px`; // Adjust as needed
    }

    hide() {
        if (this.toastElement) {
            document.body.removeChild(this.toastElement);
        }
    }
}

export class ToastForPhrase {
    constructor({ text, autohide, interval, targetElement }) {
        this.text = text;
        this.autohide = autohide;
        this.interval = interval;
        this.targetElement = targetElement;
        this.toastElement = this.createToastElement();

        this.show();
        if (this.autohide) {
            setTimeout(() => this.hide(), this.interval);
        }
    }

    createToastElement() {
        const toastDiv = document.createElement('div');
        toastDiv.className = 'toast-for-emodji';
        toastDiv.innerHTML = this.text;
        toastDiv.style.position = 'absolute';
        toastDiv.style.zIndex = 1000; // Ensure it is above other elements
        toastDiv.style.border = '2px solid #000'; // Граница вокруг тоста
        toastDiv.style.backgroundColor = '#fff'; // Заливка внутри тоста
        toastDiv.style.padding = '10px'; // Отступы внутри тоста для текста
        toastDiv.style.borderRadius = '5px'; // Закругление углов тоста
        return toastDiv;
    }

    show() {
        document.body.appendChild(this.toastElement);
        const rect = this.targetElement.getBoundingClientRect();
        this.toastElement.style.left = `${rect.left + window.pageXOffset}px`;
        this.toastElement.style.top = `${rect.top + 10}px`; // Adjust as needed
    }

    hide() {
        if (this.toastElement) {
            document.body.removeChild(this.toastElement);
        }
    }
}


