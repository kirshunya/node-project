import { API_URL_PART, IS_HOSTED_STATIC } from "../config.js";
import { range, EventProvider, FCPromise } from "./Utilities.js";
import { ConnectionStables } from "./WSEP.js";
import { BetsLoaded, siteLanguageInited } from "./syncronous.js";

export const getPlayerAvatarImg = ({avatar})=>`http${API_URL_PART}${[IS_HOSTED_STATIC ? "/static/avatars/":"/", avatar?avatar:'undefined.jpeg'].join('')}`;
/** @typedef {Array.<string> & { raw:string[] }} stringLiteralArgs */
/**
 * @callback stringToStringLiteral
 * @param {Array.<string> & { raw:string[] }} param0
 * @returns {string}
 */
/** @type {stringToStringLiteral} */
export const html = (htmls) => htmls.join('');
/**
* @callback rangedFooLit
* @param {number|Array} len
* @returns {stringToStringLiteral}
*/
/** @type {rangedFooLit} */
export const ranged = len => (htmls) => range(1, typeof len === 'number' ? len : len.length).map(x => htmls.join('')).join(' ');
/**
 * create Element with this Data
 * @param {string} tag
 * @param {string[]} classList
 * @param {{$attrname:string}[]} attributes
 * @param {{$dataname:string}[]} dataset
 * @param {{$eventname:Function}[]} events
 * @returns
 */
export function htmlelement(tag, classList, attributes, dataset, events, components) {
  const el = document.createElement(tag);
  classList && (typeof classList === 'string')
    ? el.classList.add(...classList.split(' '))
    : el.classList.add(...classList);
  attributes && Object.entries(attributes).map(([name, value]) => el[name] = value);
  dataset && Object.entries(dataset).map(([name, value]) => el.dataset[name] = value);
  events && Object.entries(events).map(([name, callback]) => el.addEventListener(name, callback));
  components && components.map(constructor=>constructor(el));
  return el;
}
/**
 *
 * @param {string} tag
 * @param {string[]} classList
 * @param {string} innerHTML
 * @param {{$attrname:string}[]} attributes
 * @param {{$dataname:string}[]} dataset
 * @param {{$eventname:Function}[]} events
 * @returns
 */
export function htmltext(tag, classList, innerHTML, attributes, dataset, events) {
  const el = htmlelement(tag, classList, attributes, dataset, events);
  el.innerHTML = innerHTML;
  return el;
}
// /**
//  *
//  * @param {HTMLElement} element
//  * @param {{$tag:{classList:string[], attributes:{$attrname:string}[], dataset:{$dataname:string}[], events:{$eventname:Function}[]}}[]} contains
//  */
// function __htmlcontainer(element, contains) {
//   for (const [tag, elinfo] of contains) {
//     /** @type {{classList:string[], attributes:{$attrname:string}[], dataset:{$dataname:string}[], events:{$eventname:Function}[]}} */
//     const { classList, attributes, dataset, events } = elinfo;
//     element.appendChild(htmlelement(tag, classList, attributes, dataset, events));
//   }
//   return element;
// }
/**
 *
 * @param {HTMLElement} element
 * @param {HTMLElement[]} contains
 */
export function htmlcontainer(element, contains) {
  contains.map(child => element.appendChild(child));
  return element;
}

export class showablePopup {
  /** @type {HTMLElement} */
  htmlelement;
  get isOpened() { return document.body.contains(this.htmlelement); }
  onclose = new EventProvider();
  constructor() { window.addEventListener('popstate', ()=>{ if(this.isOpened) this.close(); }) }

  show() { document.body.appendChild(this.htmlelement); }
  close(perm=false) { this.htmlelement.remove(); !perm&&this.onclose.send(); }
  swapPopupToNewPopup(popup) { popup.showOnReady(); this.close(true); }
  showOnReady() { this.ready.then(()=>this.show()); return this; }
}
export class waitingPopup extends showablePopup {
  get avatarsBlock() { return this.htmlelement.querySelector(".domino-waiting-popup-avatars"); }
  get timerBlock() { return this.htmlelement.querySelector(".domino-waiting-popup__timer"); }
  get quitToMenuButton() { return this.htmlelement.querySelector(".domino-waiting-popup__button-room" ); }
  get quitToMainMenu() { return this.htmlelement.querySelector(".domino-waiting-popup__button-games"); }

  constructor(betId, players=[]) {
    super();
    this.firstready = siteLanguageInited.then(async (siteLanguage)=>{
      const bet = (await BetsLoaded).BackgammonsBETS[betId].bet;
      const popupElement = this.htmlelement = document.createElement("div");
      popupElement.classList.add("popup", "domino-waiting-popup-wrapper");
      popupElement.innerHTML = /* html */`
          <div class="popup__body">
            <div class="popup__content domino-waiting-popup">
              <div class="popup__header">
                <div class="popup__timer">
                  <img src="img/timer-icon.png" alt="timer" />
                  <span class="domino-waiting-popup__timer">00:00</span>
                </div>
                <p class="domino-waiting-popup-bet">${bet.toFixed(2)} ₼</p>
              </div>
              <div class="popup__text domino-waiting-popup__text">
                <div class="domino-waiting-popup-avatars">${
                  range(1,2).map((si, ei)=>/* html */`
                    <div class="domino-waiting-popup-avatar-wrapper"> 
                      <div class="domino-waiting-popup-avatar ${players[ei]?``:`loading`}" slot="${si}">
                        ${players[ei]&&/*html*/`<img src="${getPlayerAvatarImg(players[ei])}" alt="">`}
                      </div>
                      <p class="domino-waiting-popup-avatar__text">Search..
                    </div>
                  `).join('<div class="domino-waiting-popup-vs">VS</div>')
                }</div>
                <p>${siteLanguage.popups.findingPlayers}</p>
                <div class="game-mode-banner"><p>
                    ${siteLanguage.popups.gameLable}: <span class="game">Нарды</span> <span class="players">${2}</span> ${siteLanguage.popups.playersLable}
                  </p></div>
              </div>
              <div
                style="
                  display: flex;
                  justify-content: center;
                  gap: 10px;
                  flex-wrap: wrap;
                ">
                <button class="domino-waiting-popup__button domino-waiting-popup__button-room" >
                  ${siteLanguage.popups.leaveRoom}
                </button>
                <button class="domino-waiting-popup__button domino-waiting-popup__button-games">
                  ${siteLanguage.popups.leaveToGameMenu}
                </button>
              </div>
            </div>
          </div>
          `;
      return popupElement;
    });
    this.onclose.subsrcibe(()=>this.exitBackgammons());
    this.ready = Promise.all([
      this.firstready.then(()=>this.initTimer()),
      this.firstready.then(()=>this.initQuitToMainMenuControl()),
      this.firstready.then(()=>this.initQuitToMenuControl())
    ])
  }
  async initTimer() {
    let timerTimeout = null;
    // считаем время которое прошло, startTime - время начала ожидания
    const targetTime = Date.now();
    let nowClientTime 
    try{
      nowClientTime = await NowClientTime();
    } catch(e) {
      nowClientTime = targetTime;
    }
    let distance = nowClientTime - targetTime;

    timerTimeout = this.timerTimeout = setInterval(async () => {
      distance += 200;

      const minutes = Math.floor(distance / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Add leading zeros for formatting
      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");
      if (this.timerBlock) { this.timerBlock.innerHTML = `${formattedMinutes}:${formattedSeconds}`; }
    }, 200);
  }
  initQuitToMenuControl() {
    this.quitToMenuButton.addEventListener("click", ()=>{
      this.exitBackgammons();
      this.close(true);
    });
  }
  initQuitToMainMenuControl() {
    this.quitToMainMenu.addEventListener("click", ()=>{
      this.exitToMain();
      this.close(true);
    });
  }
  exitBackgammons() {
    try {
      ConnectionStables.disconnect();
    } catch {
      impPopup.openErorPopup(siteLanguage.popups.connectionErrorText);
      setTimeout(() => location.reload(), 3000);
    }
    if (window.ws && window.ws.readyState == 1) {
      clearInterval(this.timerTimeout);
    }
  }
  exitToMain() {
    try {
      ConnectionStables.disconnect();
      location.hash = '#gamemode-choose';
    } catch {
      impPopup.openErorPopup(siteLanguage.popups.connectionErrorText);
      setTimeout(() => location.reload(), 3000);
    }
    if (window.ws && window.ws.readyState == 1) {
      clearInterval(this.timerTimeout);
    }
  }
  appendPlayer(player) {
    const avatarBlock = this.avatarsBlock.querySelector(`[slot="${1}"]`);
    avatarBlock.classList.remove("loading");
    avatarBlock.innerHTML = /* html */`
      <img src="${getPlayerAvatarImg(player)}" alt="">
    `;
  }
}
export class BackgammonsLaunchingPopup extends showablePopup {
  constructor(betId, players, timeval=[5000, Date.now()]) {
    super();
    this.firstready = siteLanguageInited.then(async siteLanguage=>{
      const { bet } = (await BetsLoaded).BackgammonsBETS[betId];

      const popupElement = this.htmlelement = document.createElement("div");
      popupElement.classList.add("popup");
      popupElement.innerHTML = `
          <div class="popup__body">
            <div class="popup__content domino-starting-popup">
              <div class="popup__header">
              <p class="domino-waiting-popup-bet">${bet.toFixed(2)} ₼</p>
              </div>
              <div class="domino-waiting-popup-avatars">
              
              </div>
              <div class="popup__text domino-starting-popup__text">
                <p>${siteLanguage.popups.startGameWaiting}</p>
              </div>
              <div class="popup__timer">
                <span class="domino-starting-popup__timer">5</span>
            </div>
            </div>
          </div>
      `;
  
      const avatarsBlock = popupElement.querySelector(
        ".domino-waiting-popup-avatars"
      );
  
      // avatarsBlock.innerHTML = range(1,2).map(si=>`<div class="domino-waiting-popup-avatar loading" slot="${i}"></div>`)
      //                                     .join('<div class="domino-waiting-popup-vs">VS</div>')
      avatarsBlock.innerHTML = players.map((player, i)=>`
                                                  <div class="domino-waiting-popup-avatar" slot="${i+1}">
                                                    <img src="${getPlayerAvatarImg(player)}" alt="">
                                                  </div>
                                            `).join('<div class="domino-waiting-popup-vs">VS</div>')
    })
    this.ready = this.firstready.then(()=>this.initTimer(timeval))
  }
  initTimer({timeval, _timestamp}) {
    const timerElement = this.htmlelement.querySelector(".domino-starting-popup__timer");
    let timeLeft = (timeval - (Date.now() - _timestamp))/1000;

    const timerInterval = setInterval(() => {
      let timeLeft = (timeval - (Date.now() - _timestamp))/1000;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        this.close()
      } else {
        timerElement.innerHTML = `${Math.floor(timeLeft)}`;//?
      }
    }, 100);
  }
}
export class BackgammonsWinPopup extends showablePopup {
  constructor(betId, winner, prize = null) {
    super();
    const self = this;
    this.ready = this.firstready = siteLanguageInited.then(siteLanguage=>{
      const main = document.querySelector(".main__container");
      let popupElement = this.htmlelement = document.createElement("div");
      popupElement.classList.add("popup");
    
      popupElement.innerHTML = `
         <div class="popup">
            <div class="popup__body">
              <div class="popup__content domino-win-popup">
                <button class="popup__close-timer close-popup-timer">10</button>
                <img
                  class="domino-win-popup__img"
                  src="img/domino-winner-image.png"
                  alt=""
                />
    
                <div class="popup__text domino-win-popup__information">
                  <div class="domino-win-popup__sum">${
                    siteLanguage.profilePage.myGamesPage.statsItem.sumWinText
                  } ${prize ? prize : 0} ₼</div>
                  <p class="domino-win-popup__title">
                    ${siteLanguage.popups.gameFinished}
                  </p>
                  <p class="domino-win-popup__winners-text">
                    ${siteLanguage.popups.winners}
                  </p>
                  <p class = "domino-win-popup__winner">${winner.username}</p>
                </div>
              </div>
            </div>
          </div>
      `;
    
      let timerElement = popupElement.querySelector(".close-popup-timer");
    
      // Устанавливаем начальное значение таймера
      let seconds = 10;
    
      // Функция обновления таймера
      function updateTimer() {
        timerElement.textContent = seconds;
        seconds--;
        timerElement.innerHTML = seconds;
    
        if (seconds <= 0) {
          clearInterval(timerInterval);
          timerElement.innerHTML = "0";
          self.close();
        }
      }
    
      let timerInterval = setInterval(updateTimer, 1000);
    });
  }
}

export class BackgammonsLosePopup extends showablePopup {
  constructor(betId, winner) {
    super();
    const self = this;
    this.ready = this.firstready = siteLanguageInited.then(siteLanguage=>{
      let popupElement = this.htmlelement = document.createElement("div");
      popupElement.classList.add("popup");
  
      popupElement.innerHTML = `
        <div class="popup">
          <div class="popup__body">
            <div class="popup__content domino-lose-popup">
            <button class="popup__close-timer close-popup-timer">10</button>
              <div class="popup__text domino-lose-popup__text">
                <p class = "domino-lose-popup__title">${
                  siteLanguage.popups.gameFinished
                }</p>
                <p id="domino-lose-popup-lost" class="domino-lose-popup__title">Нарды</p>
                <p class="domino-lose-popup__winners domino-lose-popup__winners-text">${
                  siteLanguage.popups.winners
                }</p>
                <p class = "domino-win-popup__winner">${winner.username}</p>
                <div class="domino-lose-popup__tiles">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(popupElement);
  
      let timerElement = popupElement.querySelector(".close-popup-timer");
  
      // Устанавливаем начальное значение таймера
      let seconds = 10;
  
      // Функция обновления таймера
      function updateTimer() {
        timerElement.textContent = seconds;
        seconds--;
        timerElement.innerHTML = seconds;
  
        if (seconds <= 0) {
          clearInterval(timerInterval);
          timerElement.innerHTML = "0";
          self.close();
        }
      }
  
      let timerInterval = setInterval(updateTimer, 1000);
    });
  }
}
export class BackgammonsEnterAsVisitorPopup extends showablePopup {
  constructor(betId) {
    super();
    const self = this;
    this.onAccept = FCPromise();
    this.ready = this.firstready = siteLanguageInited.then(siteLanguage=>{
      let popupElement = this.htmlelement = document.createElement("div");
      popupElement.classList.add("popup");
      popupElement.innerHTML = /*html*/`
        <div class="popup">
          <div class="popup__body">
            <div class="popup__content domino-lose-popup">
            <div class="popup__text domino-lose-popup__text">
              <p class = "domino-lose-popup__title">Войти как наблюдатель?</p>
              <p id="domino-lose-popup-lost" class="domino-lose-popup__title">Нарды</p>
              <p class="domino-lose-popup__winners domino-lose-popup__winners-text"></p>
              <div
                style="
                  display: flex; justify-content: center;
                  flex-wrap: wrap; gap: 10px; 
                ">
                  <button class="domino-waiting-popup__button domino-waiting-popup__button-room" >
                    Войти как наблюдатель
                  </button>
                  <button class="domino-waiting-popup__button domino-waiting-popup__button-games">
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      const [enter, exit] = popupElement.getElementsByClassName('domino-waiting-popup__button');
      enter.addEventListener('click', ()=>(this.onAccept.resolve(true),this.close(true)));
      exit.addEventListener('click', ()=>this.close());
      this.onclose(()=>this.onAccept.resolve(false));
      // document.body.appendChild(popupElement);
    });
  }
}