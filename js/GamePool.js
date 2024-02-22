
// WSEventPool.fon('board').then(
//     event=>{
//         let ncode = 'np';
//         const gencode = ()=>ncode = getRandomInt(-65000, 65000);
//         const dropped = [];
//         const {slots} = event;
//         const gm = new GameModel(slots, dropped);
//         const {GameController} = GameControllerCtxWithGmEntries(gm);
//         const gc = new GameController({id:100});
//         document.getElementById('TopPan')
//                     .getElementsByClassName('buttons')[0]
//                         .children[0]
//                             .addEventListener('click', req.bind(null, {method:'restart'}));
//         canva = new BoardCanvas(
//                 gm.Slots,
//                 // range(0,24).map(x=>x!==0?x!==12?[1,1]:[15,2]:[15,1])
//                 //             .map(([Count, Colour])=>({Count, Colour:Colour!==1?Colour!==2?null:'white':'black'})),
//                 [0, 0], gc);
//         gc.start([{id:100, pteam:1, team:1}, {id:100, pteam:2, team:2}], event.state.Dices);
//         canva.createDices(event.state.Dices[0], event.state.Dices[1], [white, black][event.state.ActiveTeam-1]);
//         gc._set(event.state.ActiveTeam, event.state.Dices);
//         WSEventPool.on('step', ({step, prevstate, newstate, code})=>{
//             if(code !== ncode) step.map(({from,to})=>{
//                 gm.Slots[to].add(gm.Slots[from].take(prevstate.ActiveTeam));
//                 canva.moveChecker(from, to);
//             })
//             gc._set(newstate.ActiveTeam, newstate.Dices)
//             canva.createDices(newstate.Dices[0], newstate.Dices[1], [white, black][newstate.ActiveTeam-1]);
//         });
//         WSEventPool.on('restart', ()=>window.location.reload());
//         sendstep = async(step)=>req({method:'step', step, code:gencode()});
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