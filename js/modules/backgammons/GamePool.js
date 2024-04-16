import { ondom, getRandomInt, EventProvider, sleep, range, FCPromise } from './Utilities.js';
import { WSEventPool, ConnectionStables, WSRoom, connectWSRoutes } from './WSEP.js'
// import { GameModel, GameControllerCtxWithGmEntries } from './GameLogicsPro.js';
import { GameProvider } from './GameLogicsPro.js';
import { BoardConstants } from './BoardConstants.js';
import { debugPan }  from '../../debug/debugPan.js';
import { BackgammonsLaunchingPopup, getPlayerAvatarImg, html, showablePopup, waitingPopup } from "./htmlcontainer.js";
import { getDominoRoomBetInfo } from '../domino/domino-navigation.js';
import { API_URL_PART, IS_HOSTED_STATIC, timeOffsetHours } from '../config.js';
import { NowClientTime } from '../time.js';
import { Toast } from './Utilities.js';
import { openEmojiPopup, openTextPopup } from './../pages/popup.js';
import { fabricsloaded, popupsinited } from './syncronous.js';

const TeamFromTeamId = {
  [BoardConstants.EMPTY.id]: BoardConstants.EMPTY,
  [BoardConstants.WHITE.id]: BoardConstants.WHITE,
  [BoardConstants.BLACK.id]: BoardConstants.BLACK
}
popupsinited.then(()=>{
  window.openEmojiPopup = openEmojiPopup;
  window.openPhrasesPopup = openTextPopup;
})

export const timestamp = ()=>Date.now();//moveTo Utilities

var GameInitData = null;//deprec
export function setGameInitData(data) {
    GameInitData = data;
}
export const autostep = {value:true, dice:true, setdice(value) {
  this.dice = value
  const autostepToggler = document.getElementsByClassName('autostep')[0]
  autostepToggler.classList.toggle('active', value)
}};//moveTo configurations.js? + EventProvider to settlement 
export function lightstepbutton(active=true) {
  StepCompletor.classList.toggle('active', active);
  PermStepCompletor.classList.toggle('active');
}//refac
export function ShowGameTable(localUser, GameID) {
    debugPan.install()
    const main = document.getElementsByTagName('main')[0];
    // let localUser = JSON.parse(localStorage.getItem("user"));
    main.innerHTML = html`
    <div class="main__container footer__padding" style="max-width: 100vw">
      <section class="domino-game-page domino-game-page-classic" id="domino-game-page">
        <div class="domino-games__container">
          <div class="domino-game-page__body-wrapper ddt">
            <div id="TopPan" class="BottomLink">
              <div class="ProfCol">
                <div class="timer">1:00</div>
                <div class="prof">
                  <div class="stimer" style="display:none">66</div>
                  <img src="img/avadef.jpeg" style="width:4.1rem; height: 4.1rem; border-radius: 5pt;">
                  <div class="profrows">
                    <span class="Nickname">Hasan</span>
                    <span><span class="turkeyFlag"></span> lvl: 45</span>
                  </div>
                </div>
              </div>
              <div class="pcontrs">
                <div class="buttons">
                  <div style="background-image: url('img/flags.png');"></div>
                  <div style="background-image: url('img/volume.png');
                              background-size: 57%;"></div>
                  <div style="background-image: url('img/dice.png');" class="autostep active"></div>
                </div>
                <div class="line" style="position: relative;">
                  <!-- <div style="flex-grow: 1;" class="dp"></div>
                  <div style="flex-grow: 3;" class="dp"></div> -->
                  <div style="
                    position: absolute;
                    top:0;
                    bottom: 0;
                    margin: 0;
                    padding: 0;
                  " class="DropLunk">
                    <canvas id="TopDropLunk"></canvas>
                  </div>
                </div>
              </div>
            </div>
            <canvas id="canvas"></canvas>
            <script>console.clear()</script>
            <!-- <script src="https://cdn.jsdelivr.net/npm/fabric"></script> -->
            <!-- <script src="js/Utilities.js"></script> -->
            <script src="./js/fabric"></script>
            <script src="js/modules/backgammons/EntryPoint.js" type="module" defer></script>
            <div id="BottomPan" class="TopLink">
              <div class="pcontrs">
                <div class="buttons">
                  <div id="smileChat" onclick="window.openEmojiPopup()" style="background-image: url('img/icons8-smile-chat-100.png');"></div>
                  <div id="phraseChat" onclick="window.openPhrasesPopup()" style="background-image: url('img/chat50.png');"></div>
                </div>
                <div class="line" style="position: relative;">
                  <!-- <div style="flex-grow: 1;" class="dp"></div>
                  <div style="flex-grow: 3;" class="dp"></div> -->
                  <div style="
                    position: absolute;
                    top:0;
                    bottom: 0;
                    margin: 0;
                    padding: 0;
                  " class="DropLunk">
                    <canvas id="BottomDropLunk"></canvas>
                  </div>
                </div>
              </div>
              <div class="ProfCol">
                <div class="timer">1:00</div>
                <div class="prof">
                  <div class="stimer" style="display:none">66</div>
                  <img src="img/avadef.jpeg" style="width:4.1rem; height: 4.1rem; border-radius: 5pt;">
                  <div class="profrows">
                    <span class="Nickname">Hasan</span>
                    <span><span class="turkeyFlag"></span> lvl: 45</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="rightcol">
              <div class="tabspaces"></div>
            </div>
          </div>
        </div>
      </section>
        
    </div>
  `;
    //openBackgammonsWaitingPopup(GameID, localUser);
    (async()=>{
        while(!ConnectionStables.Room) await sleep(100);//what should to do to refac?? send to this function some promise of connection? and should create some clear functiotive..
        InitGame(ConnectionStables.Room.GameInitData, localUser, ws);
    })()
}
// const User = {userId: 0, username: 'debug'};
// const Uspe = (team)=>({userId: User.userId, username: User.username, team})
// let ef = {
//     players: [Uspe(BoardConstants.WHITE.id), Uspe(BoardConstants.BLACK.id)],
//     state: {ActiveTeam: BoardConstants.WHITE.id, Dices: [1,1]}
// };
// window.addEventListener('DOMContentLoaded', 
//     ()=>WSEventPool.on('backgammons::GameStarted', ({players, state})=>ef = {players, state})
// );
/** @type {Number} in seconds*/
const STEPTIME = 25;
class Timer {
  constructor(Element, value, _STEPTIME = STEPTIME) {
      const TLabel = Element.getElementsByClassName('timer')[0];
      const TIcon = Element.getElementsByClassName('stimer')[0];
      let [userTime, tsamp] = value;
      if(tsamp) ConnectionStables.diffsProm.then(diff=>tsamp+=diff);
      let diff = 0;
      function labelTlabel() {
        const seconds = userTime + diff;
        const minuts = Math.floor(Math.abs(seconds)/60);
        const seconds60 = Math.abs(seconds%60);
        TLabel.innerHTML = `${seconds<0?'-':''}${minuts}:${seconds60<10?`0${seconds60}`:seconds60}`
      }
      function labelTIcon(seconds) {
        if(seconds<0) seconds = 0;
        TIcon.innerHTML = seconds;
      }
      this.enable = (enable, init=false)=>{
        TIcon.style.display = enable?'block':'none';
        if(diff&&!init) {
          userTime+=diff;
          diff = 0;
        }
      }
      this.label = (newval=undefined)=>{
          if(typeof newval === 'number') tsamp = newval;
          const seconds = tsamp?Math.floor((timestamp()-tsamp)/1000):0;
          const secs = _STEPTIME-seconds;
                diff = secs<0?secs:0;
          labelTIcon(secs)
          labelTlabel()
      }
      labelTlabel(0);
  }
}
let ncode = 'np';
const gencode = ()=>ncode = getRandomInt(-65000, 65000);
export async function InitGame(GameInitData, localUser, ws) {
    let TimersIntervals = null; const resetTimersIntervals =(interval)=>{ TimersIntervals&&clearInterval(TimersIntervals); return TimersIntervals = interval; }
    let onChange = ()=>{};
    const req = msg=>ws.send(JSON.stringify(msg));
    const sendstep = async(step)=>req({method:'step', step, code:gencode()});
    // GameInitData in Waiting = [waiter, waiter], visiters
    // GameInitData in Launching = [player, player], visiters, timeval = 5
    // GameInitData in DiceTeamRoll = [player, player], visiters, timeval = 20 -> sets Teams
    // GameInitData in GameStarted = [player, player], visiters, Slots, Drops, [timeval = 60, timestamp = 0][2], Dices, ActiveTeam
    // GameInitData in WIN = [player, player], visiters, Slots, Drops, [timeval = 60, timestamp = 0][2], Dices, WinnerTeam
    // const {slots, dropped, players, state} = GameInitData;

    // const Drops = [[0,0], ...Object.entries(GameInitData.dropped)]
    //         .reduce((acc, [overname, overcount])=>(acc[+(overname===BoardConstants.BLACK.over)]=overcount, acc));
    await fabricsloaded;
    
    /** @type {GameProvider} */
    const promisableinitables = {
      playersComplete : FCPromise(),
      SlotsNDropsComplete : FCPromise(),
    }
    const gp = new GameProvider({ User:localUser, sendstep }, promisableinitables);
    
    gp.onRollDicesClick(()=>req({method:'rollDice'}));
    /** @type {Timer[]} */
    let TimersByTeam
    /** @type {int} */
    let activetimerind;
    const UsersPanUI = {
      get userPan() { return document.getElementById('TopPan'); },
      get oppPan() { return document.getElementById('BottomPan') },
      initAvatars(user, opponent) {
          const {userPan, oppPan} = this;
          userPan.getElementsByTagName('img')[0].src = getPlayerAvatarImg(user);
          userPan.getElementsByClassName('Nickname')[0].innerHTML = user.username;
          oppPan.getElementsByTagName('img')[0].src = getPlayerAvatarImg(opponent);
          oppPan.getElementsByClassName('Nickname')[0].innerHTML = opponent.username;
      }
    }

    document.getElementById('TopPan')
              .getElementsByClassName('buttons')[0]
                  .children[0]
                      .addEventListener('click', ()=>confirm('Вы хотите сдаться?')&&req({method:'restart__'}));
    const __playerById = ([firstPlayer, secondPlayer])=>({[firstPlayer.userId]:firstPlayer, [secondPlayer.userId]:secondPlayer});
    /** @type {showablePopup} */
    let elcaPopup = null;
    function showNewPopup(popup) { elcaPopup = elcaPopup?(elcaPopup.swapPopupToNewPopup(popup), popup):popup.showOnReady(); }
    function hidePopups() { elcaPopup&&elcaPopup.close(true); }
    const RoomStatesInitRouter = {
      [0](initData) {//Waiting
          //? maybe room closed.
          // location.hash = '#gamemode-choose';
          if(initData.msg === 'restart') return location.hash = '#gamemode-choose';
          showNewPopup(new waitingPopup(1, [localUser]));
      }, [1](initData) { // Launching
          showNewPopup(new BackgammonsLaunchingPopup(1, initData.players, initData.timeval));
      }, [2](initData) { // DiceTeamRolling
          /** @type {{players:[]}} */
          const {players, timeval} = initData;
          UsersPanUI.initAvatars(players[0], players[1]);
          const Timers = [
            new Timer(UsersPanUI.userPan, [0, timeval._timestamp], timeval.timeval),
            new Timer(UsersPanUI.oppPan,  [0, timeval._timestamp], timeval.timeval)
          ];
          hidePopups();
          Timers.map(timer=>timer.enable(true));
          resetTimersIntervals(setInterval(()=>Timers.map(timer=>timer.label(true)), 200));
          const PlayerTempTeam = players.reduce((p1,p2)=>p1.userId===localUser.userId?BoardConstants.BLACK:p2.userId===localUser.userId?BoardConstants.WHITE:0);
          gp.eventHandlers.diceTeamRollsState(PlayerTempTeam, ()=>req());
          initData.Dices.map((value, index)=>gp.eventHandlers.diceTeamRoll(1+index, +value))
          onChange = ()=>{Timers.map(timer=>timer.enable(false)); resetTimersIntervals(); }
      }, [3](initData) { // GameStarted
          const [firstPlayer, secondPlayer] = initData.players;
          const playerById = __playerById(initData.players)
          localUser.team = TeamFromTeamId[+(playerById[localUser.userId]?.team||0)];
          autostep.setdice(localUser.autodice = playerById[localUser.userId].autodice)
          const [whiteplayer, blackplayer] = firstPlayer.team === 1 ? [firstPlayer, secondPlayer] : [secondPlayer, firstPlayer];
          UsersPanUI.initAvatars(whiteplayer, blackplayer);

          gp.eventHandlers.start(initData, initData.players);
          promisableinitables.SlotsNDropsComplete.resolve([initData.Slots, initData.Drops]);

          // TimersByTeam = [
          //   new Timer(document.getElementById('TopPan'), whiteval), 
          //   new Timer(document.getElementById('BottomPan'), blackval)
          // ]; startTimer(initData.ActiveTeam)
      }, [4](initData) { // Win // here's started timer to emojis send on Win

      },
    }
    RoomStatesInitRouter[GameInitData.RoomState](GameInitData);
    // ConnectionStables.onRoomConnection.then(()=>{
    //   const initData = ConnectionStables.Room.GameInitData;
    //   RoomStatesInitRouter[0](initData);
    // })
    // ConnectionStables.Room.onGameStarted
    //       .then(({players, state, slots})=>
    //           GameStart(players, state.ActiveTeam, state.Dices, GameInitData.times, slots)) 
    // ConnectionStables.Room.onGameStarted.then(()=>elcaPopup.then(popup=>popup.remove()))
    function GameStart([firstPlayer, secondPlayer], ActiveTeam, Dices, times, awaitingTeam) {
        // if(localUser.userId === 2)
        //     localUser.team = [BoardConstants.WHITE, BoardConstants.BLACK][ActiveTeam-1];
        localUser.team = TeamFromTeamId[firstPlayer.userId === localUser.userId
                              ? +firstPlayer.team
                              : secondPlayer.userId === localUser.userId
                                      ? +secondPlayer.team
                                      : 0];

        gp.eventHandlers.start({ActiveTeam, Dices, awaitingTeam}, [firstPlayer, secondPlayer]);
        const cplayer = firstPlayer.userId === localUser.userId?firstPlayer:secondPlayer;
        autostep.setdice(cplayer.autodice)
        
        const [whiteplayer, blackplayer] = firstPlayer.team === 1 ? [firstPlayer, secondPlayer] : [secondPlayer, firstPlayer];
        TimersByTeam = InitUI(whiteplayer, blackplayer, times);
        startTimer(ActiveTeam)
    }
    const WSEventRoutes = {
      ['RoomStateChanged']:({newStateId, stateData})=>{ onChange?.(); RoomStatesInitRouter[newStateId] (stateData); }, 
      ['diceTeamRoll']:({value, index})=>gp.eventHandlers.diceTeamRoll(1+index, value),
      ['step']:({step, prevstate, newstate, code})=>{
        // if(localUser.userId === 2)
        //     localUser.team = [BoardConstants.WHITE, BoardConstants.BLACK][newstate.ActiveTeam-1];//debug
        // setActiveTimer(newstate.ActiveTeam);
        code !== ncode && gp.eventHandlers.step(step, newstate, prevstate)
                       || gp.eventHandlers.ustep(step, newstate, prevstate)
      }, ['state']:({newstate})=>{
        if(localUser.userId === 2)
            localUser.team = [BoardConstants.WHITE, BoardConstants.BLACK][newstate.ActiveTeam-1];//debug
        setActiveTimer(newstate.ActiveTeam);
        gp.eventHandlers.state(newstate)
      }, ['end']:({winner})=>{
        alert(`Победа ${winner===BoardConstants.WHITE.id?'Белого':'Чёрного'} Игрока!`);
        alert('popup Win');
        window.hash = '#backgammons-menu';
      }, ['restart__']:()=>{
        alert(`Кто-то нажал на рестарт игры`);
        window.location.reload();
      }, ['emoji']:({userId, emojiId})=>{
        const emojiSRC = `img/emojis/${emojiId}.png`;
        return new Toast({title:`эмодзи от ${userId}`, text:`<img src="${emojiSRC}" width="5rem" height="5rem">`});
      }, ['phrase']:({userId, phraseId})=>{
        return new Toast({title:`фраза от ${userId}`, text: window.siteLanguage.dominoPhrases[`phrase${phraseId}`]});
      }
    }
    connectWSRoutes(WSEventRoutes)
    function InitUI(user, opponent, [whiteval, blackval]) {
        const autostepToggler = document.getElementsByClassName('autostep')[0]
        // autostepToggler.addEventListener('click', ()=>(autostep.value=!autostep.value, autostepToggler.classList.toggle('active', autostep.value)))
        autostepToggler.addEventListener('click', ()=>{
          autostep.dice=!autostep.dice
          autostepToggler.classList.toggle('active', autostep.dice)
          window.ws.send(JSON.stringify({method:'autodice', value:autostep.dice}))
        })
        const userPan = document.getElementById('TopPan')
                userPan.getElementsByTagName('img')[0].src = user.avatar?user.avatar:'static/avatar/undefined.jpeg';
                userPan.getElementsByClassName('Nickname')[0].innerHTML = user.username;
        const oppPan = document.getElementById('BottomPan')
                oppPan.getElementsByTagName('img')[0].src = opponent.avatar?opponent.avatar:'static/avatar/undefined.jpeg';
                oppPan.getElementsByClassName('Nickname')[0].innerHTML = opponent.username;
        return [
                new Timer(document.getElementById('TopPan'), whiteval), 
                new Timer(document.getElementById('BottomPan'), blackval)
            ]
    }
    function startTimer(ActiveTeam) {
        setActiveTimer(ActiveTeam, true);
        setInterval(()=>TimersByTeam[activetimerind].label(), 250);
    }
    function setActiveTimer(ActiveTeam, isinit=false) {
        const TimerIndByTeam = {
            [BoardConstants.WHITE.id]: 0,
            [BoardConstants.BLACK.id]: 1
        };
        const prevtimer = activetimerind
        activetimerind = TimerIndByTeam[ActiveTeam];
        // TimerByTeam[prevtimer].label(0);
        TimersByTeam[activetimerind].label(isinit?undefined:timestamp());
        TimersByTeam[activetimerind].enable(true, isinit);
        TimersByTeam[prevtimer]?.enable(false, isinit);
        return activetimerind;
    }
}

const isPopupOpened = () => {
  return document.querySelector(".popup") ? true : false;
};
export const openBackgammonsWaitingPopup = async ([betId, roomId], player,) => {
  if (isPopupOpened()) {
    return;
  }
  const siteLanguage = window.siteLanguage;

  const { bet } = getDominoRoomBetInfo(+betId);

  const body = document.querySelector("body");
  let popupElement = document.createElement("div");
  popupElement.classList.add("popup", "domino-waiting-popup-wrapper");
  popupElement.innerHTML = `
  <div class="popup__body">
  <div
    class="popup__content domino-waiting-popup"
  >
    <div class="popup__header">
      <div class="popup__timer">
        <img src="img/timer-icon.png" alt="timer" />
        <span class="domino-waiting-popup__timer">00:00</span>
      </div>
      <p class="domino-waiting-popup-bet">${bet.toFixed(2)} ₼</p>
    </div>
    <div class="popup__text domino-waiting-popup__text">
      <div class="domino-waiting-popup-avatars"></div>
      <p>${siteLanguage.popups.findingPlayers}</p>
      <div class="game-mode-banner">
        <p>
          ${siteLanguage.popups.gameLable}: <span class="game">Нарды</span> <span class="players">${2}</span> ${
    siteLanguage.popups.playersLable
  }
        </p>
      </div>
    </div>
    <div
      style="
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      "
    >
      <button
        class="domino-waiting-popup__button domino-waiting-popup__button-room"
      >
        ${siteLanguage.popups.leaveRoom}
      </button>
      <button
        class="domino-waiting-popup__button domino-waiting-popup__button-games"
      >
        ${siteLanguage.popups.leaveToGameMenu}
      </button>
    </div>
  </div>
</div>
  `;

  const avatarsBlock = popupElement.querySelector(
    ".domino-waiting-popup-avatars"
  );

  avatarsBlock.innerHTML = range(1,2).map(i=>`
        <div class="domino-waiting-popup-avatar-wrapper"> 
          <div class="domino-waiting-popup-avatar loading" slot="${i}">
        </div>
        <p class="domino-waiting-popup-avatar__text">Search..
      </div>
      `).join('<div class="domino-waiting-popup-vs">VS</div>');

  const avatarBlock = avatarsBlock.querySelector(`[slot="${1}"]`);
    avatarBlock.classList.remove("loading");
    avatarBlock.innerHTML = `
      <img src="http${API_URL_PART}${
        [IS_HOSTED_STATIC ? "/static/avatars/":"/", player.avatar?player.avatar:'undefined.jpeg'].join('')
      }" alt="">
    `;

  body.appendChild(popupElement);
  // const popupid = popupElement.dataset.popupid = getRandomInt();
  const popupType = popupElement.dataset.popupType = 'WaitingPopup';
  window.addEventListener('popstate', function() {
    const popup = document.getElementsByClassName('popup')[0];
    // if(popup?.dataset?.popupid === `${popupid}`){
    if(popup?.dataset?.popupType === `${popupType}`){
        window.ws.send(
        JSON.stringify({
          method: "backgammons/disconnt",
          GameID: [betId, roomId],
        })
      );
      popupElement.remove();
      location.hash = '#backgammons-menu';
    }
  })

  let timerTimeout = null;
  // таймер
  const timerBlock = document.querySelector(".domino-waiting-popup__timer");
  // считаем время которое прошло, startTime - время начала ожидания

  const targetTime = Date.now();
  let nowClientTime 
  try{
    nowClientTime = await NowClientTime();
  } catch(e) {
    nowClientTime = targetTime;
  }

  let distance = nowClientTime - targetTime;

  timerTimeout = setInterval(async () => {
    distance += 200;

    const minutes = Math.floor(distance / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Add leading zeros for formatting
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");
    if (timerBlock) {
      timerBlock.innerHTML = `${formattedMinutes}:${formattedSeconds}`;
    }
  }, 200);

  // кнопки выхода
  const quitWainingButton = popupElement.querySelector(
    ".domino-waiting-popup__button-room"
  );

  const quitWaitingToGamesButton = popupElement.querySelector(
    ".domino-waiting-popup__button-games"
  );

  quitWainingButton.addEventListener("click", function () {
    let websocket = window.ws;

    try {
      websocket.send(
        JSON.stringify({
          method: "backgammons/disconnt",
          GameID: [betId, roomId],
        })
      );
      // websocket.send(
      //   JSON.stringify({
      //     method: "leaveDominoTable",
      //     dominoRoomId,
      //     tableId,
      //     playerMode,
      //     gameMode,
      //     userId: +JSON.parse(localStorage.getItem("user")).userId,
      //   })
      // );
    } catch {
      impPopup.openErorPopup(siteLanguage.popups.connectionErrorText);
      setTimeout(() => location.reload(), 3000);
    }
    let localUser = localStorage.getItem("user");
    localUser = JSON.parse(localUser);
    location.hash = '#backgammons-menu';

    if (websocket && websocket.readyState == 1) {
      // // console.log("close ws");
      clearInterval(timerTimeout);
      // websocket.close(
      //   3001,
      //   JSON.stringify({
      //     userId: localUser.userId,
      //     username: localUser.username,
      //     method: "disconnectGame",
      //     page: `backgammons`,
      //   })
      // );
      // websocket.close(
      //   3001,
      //   JSON.stringify({
      //     userId: localUser.userId,
      //     username: localUser.username,
      //     method: "disconnectGame",
      //     page: `domino${gameMode}Page${playerMode == 4 ? "4" : ""}`,
      //   })
      // );
    }
    popupElement.remove();
  });

  quitWaitingToGamesButton.addEventListener("click", function () {
    let websocket = window.ws;
    try {
      websocket.send(
        JSON.stringify({
          method: "backgammons/disconnt",
          // GameID: [betId, roomId],
        })
      );
      // websocket.send(
      //   JSON.stringify({
      //     method: "leaveDominoTable",
      //     dominoRoomId,
      //     tableId,
      //     playerMode,
      //     gameMode,
      //     userId: +JSON.parse(localStorage.getItem("user")).userId,
      //   })
      // );
    } catch {
      impPopup.openErorPopup(siteLanguage.popups.connectionErrorText);
      setTimeout(() => location.reload(), 3000);
    }
    let localUser = localStorage.getItem("user");
    localUser = JSON.parse(localUser);

    if (websocket && websocket.readyState == 1) {
      // // console.log("close ws");
      clearInterval(timerTimeout);

      // websocket.close(
      //   3001,
      //   JSON.stringify({
      //     userId: localUser.userId,
      //     username: localUser.username,
      //     method: "disconnectGame",
      //     page: "mainPage",
      //   })
      // );
    }

    popupElement.remove();
  });
  return popupElement;
};