import { ondom, getRandomInt, EventProvider, sleep } from './Utilities.js';
import { WSEventPool, ConnectionStables, WSRoom } from './WSEP.js'
// import { GameModel, GameControllerCtxWithGmEntries } from './GameLogicsPro.js';
import { GameProvider } from './GameLogicsPro.js';
import { BoardConstants } from './BoardConstants.js';
const timestamp = ()=>Date.now();
var GameInitData = null;
export function setGameInitData(data) {
    GameInitData = data;
}
export function ShowGameTable(localUser) {
    const main = document.getElementsByTagName('main')[0];
    // let localUser = JSON.parse(localStorage.getItem("user"));
    main.innerHTML = `
    <div class="main__container footer__padding">
      <section class="domino-game-page domino-game-page-classic" id="domino-game-page">
        <div class="domino-games__container">
          <style>
            #TopPan, #BottomPan {
              font-size: smaller;
              max-width: 640px;
            }
            @media only screen and (min-width: 487px) {
              #TopPan, #BottomPan {
                font-size: small;
              }
            }
            @media only screen and (min-width: 640px) {
              #TopPan, #BottomPan {
                font-size: medium;
              }
            }
            @media only screen and (min-width: 1010px) {
              #TopPan, #BottomPan {
                font-size: smaller;
              }
            }
            @media only screen and (min-width: 1280px) {
              #TopPan, #BottomPan {
                font-size: larger;
              }
            }
            .ddt {
              display: flex;
              align-items: stretch !important;
              flex-direction: column;
              margin-top: 5rem !important;
              justify-content: center;
            }
            /* media  */
            /* .ddt > * {
              display: flex;
              flex-direction: column;
            } */
            #TopPan {
              display: flex;
              flex-wrap: nowrap;
              flex-direction: row;
              width: 100%;
            }
            #BottomPan {
              display: flex;
              flex-wrap: nowrap;
              flex-direction: row;
              width: 100%;
            }
            .ProfCol {
              color: white;
              display: flex;
              flex-grow: 9;
              flex-direction: column;
              align-items: center;
              justify-content: flex-end;

            }
            .TopLink .ProfCol, .TopLink .pcontrs {
              flex-direction: column-reverse;
            }
            .TopLink .line {
              border-radius: 5pt;
            }
            .line {
              background-image: url('./img/backgammons/boardlot.png');
              background-size: 100% 100%;
            /*   -webkit-background-size: cover;
            //   -moz-background-size: cover;
            //   -o-background-size: cover;
            //   background-size: cover;*/
            }
            #TopPan .pcontrs {
              margin-left: 1em;
            }
            .TopLink .timer {
              background: linear-gradient(180deg, #295788 0%, #295788 43%, rgba(126, 37, 81, 0) 97%);
            }
            .BottomLink .timer {
              background: linear-gradient(1deg, #295788 0%, #295788 43%, rgba(126, 37, 81, 0) 97%);
            }
            #TopPan .pcontrs .buttons {
              background-color: #572351;
            }
            #TopPan .pcontrs .buttons > * {
            }
            #BottomPan .pcontrs .buttons > * {
              background-color: #a8dcae;
              margin: 1em;
              width: 5em;
              height: 5em;
            }
            #TopPan .pcontrs .buttons {
              margin-left: 0.3em;
            }
            #BottomPan .pcontrs .buttons {
              margin-right: 0.3em;
            }
            #BottomPan .pcontrs {
              margin-right: 1rem;
              align-items: flex-end;
            }
            .timer {
              width: 60%;
              text-align: center;
              font-size: 2.75em;
              background: rgb(52,79,195);
              color: white;
            }
            .prof {
              display: flex;
              flex-direction: row;
              padding: 1em;
              background-color: #572351;
              border-radius: 9pt;
              width: 100%;
            }
            .profrows {
              display: flex;
              flex-direction: column;
              margin-left: 1em;
              margin-right: 1em;
            }
            .profrows .Nickname {
              flex-grow: 1;
              font-size: 2em;
            }
            .pcontrs {
              display: flex;
              flex-grow: 7;
              flex-direction: column;
              justify-content: flex-end;
              align-content: center;
              align-items: flex-start;
            }
            .pcontrs .buttons {
              display: flex;
              flex-direction: row;
              border-radius: 6pt;
              /* background-color: #a8dcae; */
            }
            .buttons > * {
              margin-left: 0.25em;
              margin-right: 0.25em;
              width: 4em;
              height: 4em;
              /* background-color: #572351; */
              /* background-color: #a8dcae; */
              border-radius: 6pt;
              background-size: 70%;
              background-repeat: no-repeat;
              background-position: center center;
              filter:invert(1);
            }
            .pcontrs .line {
            /*   background-color: #ac964b; */
              width: 100%;
              height: 3.2em;
              border-top-left-radius: 5pt;
              border-top-right-radius: 5pt;
              display: flex;
              width: 100%;
            }
            .line > * {
              height: 100%;
              padding: 0.65em;
            }
            .line > .dp::after {
              content: ' ';
              width: 100%;
              height: 100%;
              display: block;
              background-color: #951743;
              border-radius: 7pt;
            }
            .turkeyFlag {
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center center;
              background-image: url('img/tr-lang.png');
              display: inline-block;
              min-width: 1em;
              height: 1em;
            }
            .ddt.horize {
              flex-direction: row;
            }
            .rightcol {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              margin-left: 1rem;
              max-width: 640px;
            }
            .tabspaces {
              flex-grow: 1;
            }
            .domino-game-page__body-wrapper, .ddt, .domino-game-page__body-wrapper.ddt {
              margin-left: 0!important;
              margin-right: 0!important;
            }
            .ddt {
              margin-top: 0px!important;
            }
            .stimer {                         
                position: absolute;
                width: 4.1rem;
                height: 4.1rem;
                display: table-cell;
                text-align: center;
                line-height: 4.1rem;
                background-color: #282b30cc;
                font-size: 2.89rem;
            }
            }
          </style>
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
                  <div style="background-image: url('img/dice.png');"></div>
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
                  <div style="background-image: url('img/icons8-smile-chat-100.png');"></div>
                  <div style="background-image: url('img/chat50.png');"></div>
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
    (async()=>{
        while(!ConnectionStables.Room) await sleep(100);
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
class Timer {
  constructor(Element, value) {
      const TLabel = Element.getElementsByClassName('timer')[0];
      const TIcon = Element.getElementsByClassName('stimer')[0];
      let [userTime, tsamp] = value;
      let loadstamp
      let diff = 0;
      function labelTlabel() {
        const seconds = userTime - diff;
        const minuts = Math.floor(Math.abs(seconds)/60);
        const seconds60 = Math.abs(seconds%60);
        TLabel.innerHTML = `${seconds<0?'-':''}${minuts}:${seconds60<10?`0${seconds60}`:seconds60}`
      }
      function labelTIcon(seconds) {
        TIcon.innerHTML = seconds;
      }
      this.enable = (enable, init=false)=>{
        TIcon.style.display = enable?'block':'none';
        if(diff&&!init) {
          userTime-=diff;
          loadstamp = diff = 0;
        }
      }
      this.label = (newval=undefined)=>{
          if(typeof newval === 'number') tsamp = newval;
          const seconds = tsamp?Math.floor((timestamp()-tsamp)/1000):0;
          const secs = 60-seconds;
          const _diff = secs<0?secs:0;
          if(_diff&&!loadstamp) loadstamp = timestamp();
          if(loadstamp) diff = Math.floor((timestamp() - loadstamp)/1000)+2;
          labelTIcon(secs)
          labelTlabel()
      }
      labelTlabel(0);
  }
}
let ncode = 'np';
const gencode = ()=>ncode = getRandomInt(-65000, 65000);
export function InitGame(GameInitData, localUser, ws) {
    const {slots, dropped, players, state} = GameInitData;
    const req = msg=>ws.send(JSON.stringify(msg));
    const sendstep = async(step)=>req({method:'step', step, code:gencode()});

    const Drops = [[0,0], ...Object.entries(GameInitData.dropped)]
            .reduce((acc, [overname, overcount])=>(acc[+(overname===BoardConstants.BLACK.over)]=overcount, acc));
    const gp = new GameProvider({ User:localUser, Slots:slots, sendstep, Drops });
    const { GameCanvas } = gp;
    /** @type {Timer[]} */
    let TimersByTeam
    /** @type {int} */
    let activetimerind;

    document.getElementById('TopPan')
                .getElementsByClassName('buttons')[0]
                    .children[0]
                        .addEventListener('click', req.bind(null, {method:'restart__'}));

    // WSEventPool.on('backgammons::GameStarted', ({players, state})=>GameStart(players, state.ActiveTeam, state.Dices, [0, 0]))
    ConnectionStables.Room.onGameStarted.then(({players, state, slots})=>GameStart(players, state.ActiveTeam, state.Dices, GameInitData.times)) 
    // if(ef) GameStart(ef.players, ef.state.ActiveTeam, ef.state.Dices);
    // if(ef) GameStart(ef.players, GameInitData.state.ActiveTeam, GameInitData.state.Dices, GameInitData.times);//debug----TODO
    function GameStart([firstPlayer, secondPlayer], ActiveTeam, Dices, times) {
        if(localUser.userId === 2)
            localUser.team = [BoardConstants.WHITE, BoardConstants.BLACK][ActiveTeam-1];
        gp.eventHandlers.start({ActiveTeam, Dices}, [firstPlayer, secondPlayer]);
        
        const [whiteplayer, blackplayer] = firstPlayer.team === 1 ? [firstPlayer, secondPlayer] : [secondPlayer, firstPlayer];
        TimersByTeam = InitUI(whiteplayer, blackplayer, times);
        startTimer(ActiveTeam)
    }
    WSEventPool.on('step', ({step, prevstate, newstate, code})=>{
            if(localUser.userId === 2)
                localUser.team = [BoardConstants.WHITE, BoardConstants.BLACK][newstate.ActiveTeam-1];//debug
            setActiveTimer(newstate.ActiveTeam);
            code !== ncode && gp.eventHandlers.step(step, newstate)
                           || gp.eventHandlers.ustep(step, newstate)
                    GameCanvas.createDices(newstate.Dices[0], newstate.Dices[1], [BoardConstants.WHITE, BoardConstants.BLACK][newstate.ActiveTeam-1].id);
        });
    WSEventPool.on('end', ({winner})=>{
        alert(`Победа ${winner===BoardConstants.WHITE.id?'Белого':'Чёрного'} Игрока!`);
        window.location.reload();
    })
    WSEventPool.on('restart__', ({})=>{
        alert(`Кто-то нажал на рестарт игры`);
        window.location.reload();
    })
    function InitUI(user, opponent, [whiteval, blackval]) {
        document.getElementById('TopPan')
                .getElementsByClassName('Nickname')[0].innerHTML = user.username;
        document.getElementById('BottomPan')
                .getElementsByClassName('Nickname')[0].innerHTML = opponent.username;
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
    // WSEventPool.on('step', ({step, prevstate, newstate, code})=>{
    //     if(code !== ncode) step.map(({from,to})=>{
    //             gm.Slots[to].add(gm.Slots[from].take(prevstate.ActiveTeam));
    //             canva.moveChecker(from, to);
    //         })
    //     GameState._set(newstate.ActiveTeam, newstate.Dices);
    //     canva.createDices(newstate.Dices[0], newstate.Dices[1], [white, black][newstate.ActiveTeam-1]);
    // });
}

// WSEventPool.fon('board').then(
//     event=>{
        // const dropped = [];
        // const {slots} = event;
//         
//         
        // gc._set(event.state.ActiveTeam, event.state.Dices);

//         WSEventPool.on('restart', ()=>window.location.reload());
//         
//         //Tabulations
//         const [mobile, pc] = Array(2).keys();
//         let state = mobile;
//         //initials..
//         const vg = document.getElementsByClassName('domino-game-page__body-wrapper')[0];
//         const TopPan = document.getElementById(`TopPan`);
//         const BottomPan = document.getElementById(`BottomPan`);
//         const righcol = document.getElementsByClassName('rightcol')[0];
//         const ddt = document.getElementsByClassName('ddt')[0];
//         const canvas = document.getElementsByClassName('canvas-container')[0];
//         const space = document.getElementsByClassName('tabspaces')[0];
    
//         function PaginationValidate() {
//             const width = vg.clientWidth;
//             if(width < 950 && state !== mobile) {
//                 state = mobile;
//                 ddt.classList.toggle('horize', state);
//                 ddt.replaceChildren(...[
//                     TopPan, canvas, BottomPan, righcol
//                 ])
//             } else if(width >= 950 && state !== pc) {
//                 state = pc;
//                 ddt.classList.toggle('horize', state);
//                 righcol.replaceChildren(...[
//                     TopPan, space, BottomPan
//                 ])
//             }
//         }
//         PaginationValidate();
//         window.addEventListener('resize', PaginationValidate);
//     }
// );