import { ondom, getRandomInt, EventProvider, sleep, range, FCPromise } from './Utilities.js';
import { WSEventPool, ConnectionStables, WSRoom, connectWSRoutes } from './WSEP.js'
// import { GameModel, GameControllerCtxWithGmEntries } from './GameLogicsPro.js';
import { GameProvider } from './GameLogicsPro.js';
import { BoardConstants } from './BoardConstants.js';
import { debugPan }  from '../../debug/debugPan.js';
import { BackgammonsLaunchingPopup, BackgammonsLosePopup, BackgammonsWinPopup, getPlayerAvatarImg, html, showablePopup, waitingPopup } from "./htmlcontainer.js";
import { getDominoRoomBetInfo } from '../domino/domino-navigation.js';
import { API_URL_PART, IS_HOSTED_STATIC, timeOffsetHours } from '../config.js';
import { NowClientTime } from '../time.js';
import { Toast } from './Utilities.js';
import { openEmojiPopup, openTextPopup } from './../pages/popup.js';
import { BetsLoaded, fabricsloaded, popupsinited } from './syncronous.js';

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
  constructor(Element, value, _STEPTIME = STEPTIME, red=false) {
      const TLabel = Element.getElementsByClassName('timer')[0];
      const TIcon = Element.getElementsByClassName('stimer')[0];
      TIcon.classList.toggle('red', red);
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
    const betId = GameInitData.GameID[0];
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
    let curState = GameInitData.RoomState, prevState = null;
    const RoomStatesInitRouter = {
      [0](initData) {//Waiting
          //? maybe room closed.
          // location.hash = '#gamemode-choose';
          if(initData.msg === 'restart') return location.hash = '#gamemode-choose';
          showNewPopup(new waitingPopup(betId, [localUser]));
      }, [1](initData) { // Launching
          showNewPopup(new BackgammonsLaunchingPopup(betId, initData.players, initData.timeval));
      }, [2](initData) { // DiceTeamRolling
          if(prevState === 2) new Toast({title:'Переброс камней', text:'У вас камни были одинаковые, поэтому вы перебрасываете', autohide: true})
          /** @type {{players:[]}} */
          const {players, timeval} = initData;
          UsersPanUI.initAvatars(players[0], players[1]);
          const Timers = [
            new Timer(UsersPanUI.userPan, [0, timeval._timestamp], timeval.timeval/1000, initData.red),
            new Timer(UsersPanUI.oppPan,  [0, timeval._timestamp], timeval.timeval/1000, initData.red)
          ];
          Timers.map(timer=>timer.enable(true));
          hidePopups();
          
          resetTimersIntervals(startTogetherTimer(Timers));
          const PlayerTempTeam = players.reduce((p1,p2)=>p1.userId===localUser.userId?BoardConstants.WHITE:p2.userId===localUser.userId?BoardConstants.BLACK:0);
          gp.eventHandlers.diceTeamRollStateStart();
          initData.Dices.map((value, index)=>{
            const tempteam = +index+1
            if(value) gp.eventHandlers.diceTeamRoll(tempteam, +value);
            else if (tempteam === PlayerTempTeam.id) gp.eventHandlers.diceTeamRollsState(PlayerTempTeam, req);
          })

          onChange = ()=>{ Timers.map(timer=>timer.enable(false)); resetTimersIntervals(); }
      }, [3](initData) { // GameStarted
          const localPlayer = __playerById(initData.players)[localUser.userId];
          localUser.team = TeamFromTeamId[+(localPlayer?.team||0)];
          autostep.setdice(((localUser.autodice = localPlayer.autodice), localPlayer.autodice))

          const [firstPlayer, secondPlayer] = initData.players;
          const [whiteplayer, blackplayer] = firstPlayer.team === 1 ? [firstPlayer, secondPlayer] : [secondPlayer, firstPlayer];
          UsersPanUI.initAvatars(whiteplayer, blackplayer);

          const autostepToggler = document.getElementsByClassName('autostep')[0]
          autostepToggler.addEventListener('click', ()=>{
            autostep.dice=!autostep.dice
            autostepToggler.classList.toggle('active', autostep.dice)
            window.ws.send(JSON.stringify({method:'autodice', value:autostep.dice}))
          });
          hidePopups();

          gp.eventHandlers.start(initData, initData.players);
          promisableinitables.SlotsNDropsComplete.resolve([initData.Slots, initData.Drops]);

          TimersByTeam = [
            new Timer(UsersPanUI.userPan, initData.Timers[0]), 
            new Timer(UsersPanUI.oppPan, initData.Timers[1])
          ]; resetTimersIntervals(startTimer(initData.ActiveTeam));

          onChange = ()=>{ TimersByTeam.map(timer=>timer.enable(false)); resetTimersIntervals(); }
      }, [4]({Slots, Drops, players, winner, loser, timeval}) { // Win // here's started timer to emojis send on Win
          if(!prevState) { // если только перезагрузили или открыли страницу
            const [firstPlayer, secondPlayer] = players;
            const [whiteplayer, blackplayer] = firstPlayer.team === 1 ? [firstPlayer, secondPlayer] : [secondPlayer, firstPlayer];
            UsersPanUI.initAvatars(whiteplayer, blackplayer);

            promisableinitables.SlotsNDropsComplete.resolve([Slots, Drops]);
          }
          BetsLoaded.then(({BackgammonsBETS})=>{
            const bet = BackgammonsBETS[betId];
            const comission = bet.comission*2; // comission from 2 players
            const lose = bet.bet;
            const prize = bet.bet - comission; // prize with comission

            if(winner.userId === localUser.userId) showNewPopup(new BackgammonsWinPopup(betId, winner, prize));
            if(loser.userId === localUser.userId) showNewPopup(new BackgammonsLosePopup(betId, winner));
          })

          const Timers = [
            new Timer(UsersPanUI.userPan, [0, timeval._timestamp], timeval.timeval/1000, 'red'),
            new Timer(UsersPanUI.oppPan,  [0, timeval._timestamp], timeval.timeval/1000, 'red')
          ]; startTogetherTimer(Timers);
          onChange = ()=>{ resetTimersIntervals(); }
      },
    }
    RoomStatesInitRouter[curState](GameInitData);
    const WSEventRoutes = {
      ['RoomStateChanged']:({newStateId, stateData})=>{ onChange?.(); prevState = curState; curState = newStateId; RoomStatesInitRouter[newStateId](stateData); }, 
      ['diceTeamRoll']:({value, index})=>gp.eventHandlers.diceTeamRoll(+index+1, +value),
      ['diceTeamRollCompletesLaunching']:({dices, timeval})=>{
        const Timers = [
          new Timer(UsersPanUI.userPan, [0, timeval._timestamp], timeval.timeval/1000, 'red'),
          new Timer(UsersPanUI.oppPan,  [0, timeval._timestamp], timeval.timeval/1000, 'red')
        ];
        resetTimersIntervals(startTogetherTimer(Timers));
      },
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
        // alert(`Победа ${winner===BoardConstants.WHITE.id?'Белого':'Чёрного'} Игрока!`);
        // alert('popup Win');
        // window.hash = '#backgammons-menu';
      }, ['restart__']:()=>{
        alert(`Кто-то нажал на рестарт игры`);
        window.location.reload();
      }, ['emoji']:({userId, emojiId})=>{
        const emojiSRC = `img/emojis/${emojiId}.png`;
        return new Toast({title:`эмодзи от ${userId}`, text:`<img src="${emojiSRC}" style="width:5rem; height:5rem">`});
      }, ['phrase']:({userId, phraseId})=>{
        return new Toast({title:`фраза от ${userId}`, text: window.siteLanguage.dominoPhrases[`phrase${phraseId}`]});
      }
    }
    connectWSRoutes(WSEventRoutes)
    function startTogetherTimer(Timers) {
      Timers.map(timer=>timer.enable(true));
      return setInterval(()=>Timers.map(timer=>timer.label(true)), 200)
    }
    function startTimer(ActiveTeam) {
        setActiveTimer(ActiveTeam, true);
        return setInterval(()=>TimersByTeam[activetimerind].label(), 250);
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
