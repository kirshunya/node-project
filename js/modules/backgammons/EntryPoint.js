import { sleep, range, JustEnoughEvents, OEPromise, FCPromise } from './Utilities.js';
import { WSEventPool, onnewmsg } from './WSEP.js';
import * as GamePool from './GamePool.js';
import { API_URL_PART } from './../config.js'
// const siteLanguage = {
//     dominoRoomsMenu:{
//         gamePrice:'Цена комнаты',
//         gameDuration:'Длительность игры 5 минут',
//         classicDurationLabel:'Одна игра',
//         classic: 'Нарды'
//     }
// }
// var canva;
// const API_URL_PART = `://194.87.244.199:5001`

function createClientId() {//impNav.createClientId
    // текущее время в миллисекундах
    const currentTimeMs = Date.now();
  
    //случайное число для обеспечения уникальности
    const randomValue = Math.floor(Math.random() * 100000);
  
    // уникальный идентификатор, объединив текущее время и случайное число
    const uniqueId = `${currentTimeMs}-${randomValue}`;
  
    return uniqueId;
}
WSEventPool.on('backgammons::connection::self', function(GameInitData) {
    // GamePool.ShowGameTable(GameInitData);
    GamePool.InitGame(GameInitData, {userId:0,username:''}, ws)
    window.TimersTurn = ({['on']:true, ['off']:false})[GameInitData.TimersTurn];
    (async()=>TimersTurnDebugButton.value = `timers: ${window.TimersTurn?'on':'off'}`)()
});
WSEventPool.on('TimersTurn', async({TimersTurn})=>{
    window.TimersTurn = TimersTurn
    TimersTurnDebugButton.value = `timers:${TimersTurn?'on':'off'}`
})
WSEventPool.on('backgammons::game::init', function() {
    GamePool.ShowGameTable(GameInitData);
});
const ws = new WebSocket(`ws${API_URL_PART}/backgammons`);
const req = msg=>ws.send(JSON.stringify(msg));
const send = req;
ws.onopen = () => {
    // const localUser = JSON.parse(localStorage.getItem("user"));
    window.ws = ws;
    req({
        clientId: createClientId(),
        // username: localUser.username,
        // userId: localUser.userId,
        username: 'debug',
        userId: 0,
        method: "backgammons/auth",
    });
    req({
        method: "backgammons/connect", dominoRoomId:0, tableId:0
    })
    req({
        method: "backgammons/connectPage", dominoRoomId:0, tableId:0
    })
};
ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data); 
    
    'event' in msg 
        ? WSEventPool.$$send(msg.event, msg, {send})
        : console.log();
};
// const WS = new class {
//     constructor() {
//         const self = this;
//         const [onopen, __onopen] = OEPromise();
//         const [onfirstclose, __onfirstclose] = OEPromise();
//         const [onauth, __onauth] = OEPromise();
//         Object.defineProperties(
//             this, {
//                 onopen: {
//                     get:()=>onopen,
//                     set:()=>false
//                 },
//                 onfirstclose: {
//                     get:()=>onfirstclose,
//                     set:()=>false
//                 },
//                 onauth: {
//                     get:()=>onauth,
//                     set:()=>false
//                 },
//             }
//         );

//         this.onopen.then((args) => {
//             const localUser = JSON.parse(localStorage.getItem("user"));
//             self.req({
//                 clientId: createClientId(),
//                 username: localUser.username,
//                 userId: localUser.userId,
//                 method: "auth",
//             });
//             __onauth();
//         });
//         this.onauth.then((args) => self.req({method: "openLobby"}));

//         const ws = this.ws = new WebSocket(`ws${API_URL_PART}/backgammons`);
//         WS.req = obj=>ws.send(JSON.stringify(obj));
//         ws.onopen = __onopen;
//         ws.onmessage = async (event) => {
//             const msg = JSON.parse(event.data);
            
//             'event' in msg ?
//                 WSEventPool.$$send({send}, msg.event, msg):console.log;
//         };
        
//         ws.onclose = (info) => {
//             // console.log(info);
            
//             // если вебсокет был закрыт изза проблем с интернетом или другими проблемами клиента
//             if (info.code == 1006) {
//                 if (navigator.onLine) {
//                 const newWs = connectWebsocketFunctions();
//                 window.ws = newWs;
//                 location.hash = "#gamemode-choose";
//                 impNav.pageNavigation(newWs);
//                 impNav.addHashListeners();
//                 }
//                 return;
//             }
            
//             // проверяем на reason ответ от вебсокетов
//             if (info.reason != "" && info.reason != " ") {
//                 let infoReason = JSON.parse(info.reason);
//                 if (infoReason != "" && infoReason.reason == "anotherConnection") {
//                 return;
//                 } else {
//                 if (window.ws) {
//                     let disconnectMsg = { reason: "createNewWs", page: "mainLotoPage" };
//                     window.ws.close(1000, JSON.stringify(disconnectMsg));
//                 }
//                 // const newWs = connectWebsocketFunctions();
//                 // window.ws = newWs;
//                 // impNav.pageNavigation(newWs);
//                 // impNav.addHashListeners();
//                 // return;
//                 }
//             } else {
//             //   if (window.ws) {
//             //     let disconnectMsg = { reason: "createNewWs", page: "mainLotoPage" };
//             //     window.ws.close(1000, JSON.stringify(disconnectMsg));
//             //   }
//             //   switch (infoReason.page) {
//             //     case "mainLotoPage":
//             //       location.hash = "#loto-menu";
//             //       break;
            
//             //     case "mainPage":
//             //       location.hash = "#gamemode-choose";
//             //       break;
//             //     default:
//             //       location.hash = "#gamemode-choose";
//             //       break;
//             //   }
//             //   const newWs = connectWebsocketFunctions();
//             //   window.ws = newWs;
//             //   impNav.pageNavigation(newWs);
//             //   impNav.addHashListeners();
//             }
//         };
//         // this.onmessage = {Listens:{}}
//     }
// }

// class DelegateList {
//     list=[];
//     constructor() {
//         const rev = (foo)=>this.new(foo);
//         rev.new = this.new.bind(this);
//         rev.disable = this.disable.bind(this);
//         return rev;
//     }
//     new(foo){
//         const {list} = this;
//         const id = list.push(foo)-1;
//         return (...args)=>list[id]?.(...args);
//     }
//     disable(){this.list = [];}
// }
// class Game {
//     constructor(html, Poll, GameData) {
//         html.classList.toggle('d-none', false);
//         html.classList.toggle('d-flex', true);
//         mobileGameProccessPresentation.classList.toggle('d-none', false);
//         mobileGameProccessPresentation.classList.toggle('d-flex', true);
//         const slots = GameData.board.slots.map(({checkers, team})=>[checkers, team])
//         const dropped = GameData.board.dropped.slice(1);
//         const gm = this.gm = new GameModel(slots, dropped);
//         const {GameController} = GameControllerCtxWithGmEntries(gm);
//         const gc = this.gc = new GameController(GameData.User);
//         const canvas = this.canvas = new BoardCanvas(gm.Slots, dropped, gc);
//         const GameProccesTable = new GameProccessPresentationUI(GameData.ActivePlayers, {
//                                                 UsedPoints: [],
//                                                 PointsToStep: gc._Dice(GameData.dice).PointsToStep
//                                             }, GameData.ActiveTeam);
//         const Timer = new TimerPresentationUI($PageSnapshotData.GameInfo.maxMoveTime);
//         const myd = new DelegateList();
//         this.disable = ()=>{
//             myd.disable();
//             html.classList.toggle('d-none', true);
//             html.classList.toggle('d-flex', false);
//             mobileGameProccessPresentation.classList.toggle('d-none', true);
//             mobileGameProccessPresentation.classList.toggle('d-flex', false);
//         };
//         const Pollon = (event, foo)=>Poll.on(event, myd(foo));
//         Pollon('newstep', ({step, SlotsActualData, team}) => {
//             for (let stepIndex in step){
//                 let oneStep = step[stepIndex];
//                 // if(oneStep.to === 'whiteOver') {
//                 //     ++GameData.board.Dropped[gm.Slots[oneStep.from].take() - 1];
//                 // }
//                 // if(oneStep.to === 'blackOver') {
//                 //     ++GameData.board.Dropped[gm.Slots[oneStep.from].take() - 1];
//                 // }
//                 // else gm.Slots[oneStep.to].add(gm.Slots[oneStep.from].take());
//                 canvas.moveChecker(oneStep.from, oneStep.to);
//             }
//         }, true);
//         Pollon('diceroll', ({team})=>Timer.start(team))
//         Pollon('newstep', ({SlotsActualData, ts, team}) => {
//             console.log(`SlotsActualData, ts = ${ts ? ts : '-'}:`, Object.entries(SlotsActualData));
//             Object.entries(SlotsActualData).map(([i, s]) => {
//                 if(['blackOver', 'whiteOver'].includes(i)) 
//                     return dropped[team-1]++;
//                 gm.Slots[i].Count = s.checkers,
//                 gm.Slots[i].Colour = s.team !== 0 ? s.team === 1 ? white : black : null
//             });
//         });
//         Pollon('diceroll', ({dices, team}) => {
//             gc.CurrentStep = new StepRecord(
//                 team === 1 ? gm.whiteplayer : gm.blackplayer,
//                 gc._Dice(dices));
//             canvas.createDices(dices[0], dices[1], [white, black][team-1]);
//         })
//         Pollon('diceroll', ({dices, team})=>{
//             GameProccesTable.setTeamByTeamId(team);
//             GameProccesTable.setDices({
//                 UsedPoints: [],
//                 PointsToStep: gc._Dice(dices).PointsToStep
//             });
//         });
//         gc.on('move', args=>GameProccesTable.setDices(args))
//         // gc.start(action.players, action.dices);
//         gc.start(GameData.ActivePlayers, GameData.dice);
//         gc._set(GameData.ActiveTeam, GameData.dice);
//         GameData.board.GameStepCounter?Timer.start(GameData.ActiveTeam, GameData.Timer):0;
//         canvas.createDices(GameData.dice[0], GameData.dice[1], [white, black][GameData.ActiveTeam-1]);
//     }
// }
// class WinView {
//     constructor(html) {
//         html.classList.toggle('d-none', false);
//     }
// }
// var curState;
// window.addEventListener('DOMContentLoaded', function () {
//     // window.addEventListener('load', Poll.loop.bind(Poll));
//     const Poll = new __PollTs($PageSnapshotData.ts);
//     curState = {
//         Lobby:()=>new Lobby(window.LobbyTab, Poll, $PageSnapshotData.GameInfo, $PageSnapshotData.Lobby),
//         Game:()=>new Game(window.GameTab, Poll, $PageSnapshotData.Game),
//         Win:()=>new WinView(window.WinPanelTab, $PageSnapshotData.WinView),
//     }[$PageSnapshotData.GameInfo.GameState]();
//     $PageSnapshotData.Game = {
//         board: {
//             slots: range(0,24).map(x=>x!==0?x!==12?[0,0]:[15,2]:[15,1]).map(([checkers, team])=>({checkers, team})),
//             dropped: [15, 0, 0],
//             GameStepCounter: 0,
//             isEnded: false
//         },
//         Timer: 0,
//         User: $PageSnapshotData.User,
//         ActiveTeam: 1,
//         doubling: 1,
//         matchid: 1,
//         winPoints: [0,0,0]
//     }
//     Poll.on('gameStateChanged', action=>{
//         Object.assign($PageSnapshotData.Game, {
//             ActivePlayers: action.players,
//             dice: action.dices
//         })
//         curState.disable();
//         curState = new Game(window.GameTab, Poll, $PageSnapshotData.Game)
//     }, true);
//     Poll.on('MatchEnd', action=>{
//         curState.disable();
//         alert(`Конец матча`);
//         curState = new Game(window.GameTab, Poll, $PageSnapshotData.Game)
//     }, true);
//     Poll.on('GameEnd', action=>{
//         curState.disable();
//         alert(`Конец игры! Победа ${action.winner===1?'белого':'чёрного'}`);
//         curState = new WinView(window.WinPanelTab, {})
//     }, true);
//     Poll.loop();
//     // init();
//     // gc.start();
// })
