import { $myeval, EventProvider, range } from "./Utilities.js";
import { BoardConstants, refToArr, slotinfo, Slot, DropSlot } from './BoardConstants.js';
import { BoardCanvas } from './CanvasRender.js'
import { autostep, lightstepbutton } from "./GamePool.js";
import { Toast } from "./Utilities.js";
import { fabricsloaded } from "./syncronous.js";


const SlotsIterator = (slots, CB)=>(
                                slots = new Proxy(slots, {get:(slots,key)=>slots[key]||[0,0]}), 
                                [...Array(24).keys()].map(index=>CB(slots[index]))
                            );
const { WHITE, BLACK, EMPTY, CHECKERS, MAP } = BoardConstants;
// for jsDoc
class TCRColour {
    /** @type {int} */
    id
    /** @type {string} */
    name
    /** @type {string} */
    over
}
class Board {
    FartherOpponentCheckerPos
    Slots
    Drops
    TEMP = {
        MovesCash: {},
        MovesStack: []
    }
    onMovesComplete = new EventProvider();
    constructor(BoardInits, [Slots, Drops]) {
        const self = this;
        const {User} = BoardInits;
        this.sendstep = BoardInits.sendstep
        this.User = User;//need field @team -> BoardConstant[WHITE||BLACK];
        this.Slots = SlotsIterator(Slots, data=>data);
        this.eventProviders = {
            showPTS: new EventProvider(),
            rollDicesClick: new EventProvider()
        }

        this.Drops = [
            new DropSlot(EMPTY.id), new DropSlot(WHITE.over, Drops[WHITE.over]), new DropSlot(BLACK.over, Drops[BLACK.over])
        ];
        let emptyslot
        this.Slots0 = new Proxy({}, {
            /**
             * 
             * @param {{}} _t 
             * @param {string|key|number} SlotIndex 
             * @param {Proxy} _proxy 
             * @returns {Slot}
             */
            get:(_t, SlotIndex, _proxy) => {
                // if(slotIndex === 'iterate') return (from, to, CB, team) => {
                //     for()
                // }
                if(SlotIndex === 'User') return User;
                if(SlotIndex === 'emptyslot') return emptyslot;
                if(SlotIndex === WHITE.over) return this.Drops[WHITE.id];
                if(SlotIndex === BLACK.over) return this.Drops[BLACK.id];
                return new Slot(self.Slots[SlotIndex], SlotIndex, _proxy)
            }
        });
        // 0 -> MAP.firstSlotIndex // TODO: change 0 index to unaviable index =D
        emptyslot = new Slot(new slotinfo(CHECKERS.empty, EMPTY.id), 0, this.Slots0);
    }
    AcceptStep(GameState) {
        if(!this.CheckersWhichCanMove(GameState))
            this.StepComplete(GameState.CurrentStepCash.MovesStack, true)
        else new Toast({
            title: false,
            theme: 'warning',
            text: 'Но вы не можете завершить ход!',
            autohide: true,
            interval: 5000
        });
    }
    StepComplete(steps, perm=false) {
        if(perm){
            this.sendstep(steps);
        } else {
            if(autostep.value) {
                this.StepComplete(steps, true)
            } else {
                this.onMovesComplete.send();
            }
        }
    }
    /**
     * 
     * @param {GameState} GameState 
     * @param {int} fromIndex 
     * @returns {{}}
     */
    UserMovesFrom(GameState, fromIndex) {
        const Sloter = this.Slots0;
        const {User} = this;
        const {PTS, ActivePlayer, CurrentStepCash, Dices} = GameState;
        const FromSlot = this.Slots0[fromIndex];
        const headSlotIndex = ActivePlayer.team.id===WHITE.id?0:12;
        const headSlotCheckersCount = this.Slots0[headSlotIndex].refToArr.Count;
        const [f, s] = Dices;
        const fstepapplied = (f===s&&(f===3||f===4||f==6))&&(headSlotCheckersCount===14);
        const isCanToOver = _isCanToOver();
        const CashOfOiFBySlot = {}

        if(ActivePlayer.team.id !== User.team.id) return {};
        if(!FromSlot.ismy()) return {};
        const TeamFirstSlot = ActivePlayer.team.id===WHITE.id?0:12;
        if(!fstepapplied) 
            if(fromIndex===TeamFirstSlot&&GameState.headed) return {};

        const AccMoves = {
            fromIndex,
            moves:{},
            /**
             * 
             * @param {int} toIndex 
             * @param {int[]} Points array of used points
             * @returns {int} -1 if PermanentSetReturnCode
             */
            push(toIndex, Points) {
                const PermanentSetReturnCode = -1
                const {moves} = this;
                if(toIndex !== User.team.over) return (moves[toIndex] = Points, PermanentSetReturnCode);
                else if(moves[toIndex] === undefined) 
                    moves[toIndex] = [];//if isover we should ask user to choose which point he spend to step
                return moves[toIndex].push(Points);
            },
            optimize() {
                // Object.entries(this.moves).map(([toIndex,listOfPointsList])=>{
                //     listOfPointsList.reduce((acc, cur)=>{
                //         if(acc.length < cur.length) return acc;
                //         if(acc.reduce((s,p)=>s+p) < cur.reduce((s,p)=>s+p)) return acc;
                //     });
                // });
                Object.entries(this.moves).map(([toIndex, ListOfPointsList])=>{
                    if(ListOfPointsList.length === 1) return;
                    if(ListOfPointsList[0].length === ListOfPointsList[1].length) return;
                    return this.moves[toIndex] = [
                        ListOfPointsList[0].length < ListOfPointsList[1].length
                                                ? ListOfPointsList[0] 
                                                : ListOfPointsList[1]
                                        ];
                })
                return this.moves;
            }
        };
        /**
         * 
         * @param {int[]} PTS 
         * @param {Slot} FromSlot 
         * @param {int[]} spendedPoints 
         */
        function StepByStep(PTS, FromSlot, SlotCursor=FromSlot, spendedPoints=[]) {
            for(const point of new Set(PTS)) {
                const curSlot = SlotCursor.next(point);
                if(curSlot?.isover) {
                    isCanToOver&&AccMoves.push(curSlot.index, [...spendedPoints, point]); 
                    continue;
                };
                if(curSlot.ismy()||curSlot.isempty()) {
                    const curSpended = [...spendedPoints, point];
                    if((!OpponentIsFarther(curSlot.index))&&sixchecker(curSlot, FromSlot)) continue;
                    AccMoves.push(curSlot.index, curSpended);

                    const nextPTS = [...PTS]; nextPTS.splice(PTS.indexOf(point), 1);
                    if(!nextPTS.length) continue;

                    StepByStep(nextPTS, FromSlot, curSlot, curSpended);
                }
            }
        }
        StepByStep(PTS, FromSlot);

        function _isCanToOver() {
            const isBlack = ActivePlayer.team.id === BLACK.id;
            const from = isBlack?MAP.blackstart:MAP.whitestart;
            const to = isBlack?MAP.blackLastIndexNumber:MAP.whiteLastIndexNumber-6;

            let outerhouse = false;
            // for beauty should use Slot.next(1) from Sloter[0] to Sloter[17] 
            // but we can think this is optimized variant
            if(isBlack) {
                for(let index = from; index <= 23 && !outerhouse; ++index) 
                    outerhouse |= Sloter[index].ismy();
                for(let index = 0; index < 6 && !outerhouse; ++index) 
                    outerhouse |= Sloter[index].ismy();
            } else for(let index = from; index <= to && !outerhouse; ++index) 
                    outerhouse |= Sloter[index].ismy();
            
            
            return !outerhouse;
        }

        /**
         * @TODO upd algol with excluding of slot if u stepFrom
         * @param {Slot} toSlot 
         * @param {Slot} fromSlot 
         * @returns {boolean} if 6 sequenced checkers
         */
        function sixchecker(toSlot, fromSlot) {//проверять передние клетки
            //TODO: upd algol with excluding of slot if u stepFrom
            // const sum = (acc, bool)=>acc+(+bool);
            /** @type {int} */
            const CurrentPlayerTeam = ActivePlayer.team.id;
            /** @type {int} */
            const OpponentPlayerTeam = CurrentPlayerTeam===WHITE?BLACK:WHITE;
            let counter = 1;
            let curSlot = toSlot;
            for(const _ of Array(5).keys()) {
                curSlot = curSlot.down(OpponentPlayerTeam);
                if(curSlot.index == fromSlot.index && !(curSlot.refToArr.Count-1)) break;
                if(curSlot.ismy()) counter++
                else break;
            }
            curSlot = toSlot;
            for(const _ of Array(5).keys()) {
                curSlot = curSlot.next(+1, OpponentPlayerTeam);
                if(curSlot.index == fromSlot.index && !(curSlot.refToArr.Count-1)) break;
                if(curSlot.ismy()) counter++
                else break;
            }
            return counter>=6;
        }
        /**
         * @param {int} slotIndex 
         * @returns {boolean}
         */
        function OpponentIsFarther(slotIndex) {
            if(CashOfOiFBySlot[slotIndex]) return CashOfOiFBySlot[CashOfOiFBySlot];
            /** @type {int} */
            const CurrentPlayerTeam = ActivePlayer.team.id;
            /** @type {int} */
            const OpponentPlayerTeam = CurrentPlayerTeam===WHITE.id?BLACK.id:WHITE.id;

            /** @type {boolean} */
            const isBlack = OpponentPlayerTeam === BoardConstants.BLACK.id;

            const blackEndShift = 12
            const blackStartShift = -12
            /**
             * @param {int} from 
             * @param {int} point 
             */
            function up(from, point) {//TODO: унифицировать функцию в BoardConstants
                const pos = +from + +(isBlack&&((from<BoardConstants.MAP.blackend)?blackEndShift:blackStartShift)) + point;
                
                //validating
                const isover = pos > BoardConstants.MAP.lastPostionNumber;

                const index = isover?'*over':isBlack?(pos+12)%24:pos;
                
                return {pos, isover, index};
            }
            let _index_ = slotIndex;
            while(_index_ < 36) {
                const {pos, isover, index} = up(_index_, +1);
                if(isover) return false;
                /** @type {Slot} */
                const pp = Sloter[index];
                if(pp.refToArr.Colour === OpponentPlayerTeam) return true;
                _index_ = index;
            }
            return false;
        }
        CurrentStepCash.MovesCash = AccMoves
        return AccMoves.optimize();
    }
    CheckersWhichCanMove(GameState) {
        return !![...Array(24).keys()]
                    .map(i=>Object.keys(this.UserMovesFrom(GameState, i)).length)
                    .reduce((acc,k)=>acc+k);
    }
    UserMovesByDice(GameState) {
        return [...Array(24).keys()]
                .map(i=>([Object.keys(this.UserMovesFrom(GameState, i)).length, i]))
                    .filter(([awa, i])=>awa)
    }
    UserMovesByDices(GameState) {
        return [...Array(24).keys()]
                .map(i=>([Object.keys(this.UserMovesFrom(GameState, i)).length, i]))
                    .filter(([awa, i])=>awa)
    }
    /**
     * 
     * @param {GameState} GameState 
     * @param {{from:int, to:int}} param1 
     * @param {int} variantIndex 
     */
    UserMove(GameState, {from, to}, variantIndex) {
        const {CurrentStepCash} = GameState;
        const MovesCash = CurrentStepCash.MovesCash.fromIndex === from
                                                ? CurrentStepCash.MovesCash.moves
                                                : this.UserMovesFrom(GameState, from);
        if(to === WHITE.over || to === BLACK.over){
            const sum = (acc, num)=>acc+num;
            const points = MovesCash[to].length===1
                                ? MovesCash[to][0]
                                : variantIndex
                                    ? map[to][variantIndex]
                                    : [[1000],...MovesCash[to]].reduce(
                                        /**
                                         * 
                                         * @param {int} acc 
                                         * @param {int[]} points
                                         * @returns {int}
                                         */
                                        function(acc, points) {
                                            return acc.reduce(sum) < points.reduce(sum) ? acc : points
                                        });
            CurrentStepCash.MovesStack.push({from, to, points});
        } else CurrentStepCash.MovesStack.push({from, to, points:MovesCash[to]});
        this.Slots0[from].permMoveTo(to);
        this.eventProviders.showPTS.send(GameState.PTS);
        return true;
    }
    UserStepComplete() {

        this.Temp = [];
    }
    CancelLastMove() {

    }
    /**
     * 
     * @param {GameState} GameState 
     * @param {{from:int, to:int|string}[]} step 
     */
    PermStep(GameState, step) {
        step.map(({from, to})=>{
            const FromSlot = this.Slots0[from]
            if(--FromSlot.refToArr.Count===0)
                FromSlot.refToArr.Colour = 0;
            if([WHITE.over, BLACK.over].includes(to)) {
                this.Slots0[to].permPushChecker();
                return;
            }
            const ToSlot = this.Slots0[to]
            if(ToSlot.refToArr.Count++===0)
                ToSlot.refToArr.Colour = GameState.ActivePlayer.team.id;
        })
    }
}

class GameState {
    /**
     * @type {{userId:int, username:string, team:TCRColour}}
     */
    ActivePlayer
    /** @type {[Number, Number]} */
    Dices
    /**
     * @type {{userId:int, username:string, team:TCRColour}[]}
     */
    players

    CurrentStepCash = {
        MovesStack: [],
        MovesCash: {}
    }

    GameState = BoardConstants.GAMESTATE.Waiting;
    get PTS() {
        const [f, s] = this.Dices;
        const sum = (acc, num) => acc + num;
        const clearPTS = f===s?[f, f, s, s]:[f, s];
        const usedPTS = this.CurrentStepCash.MovesStack.map(({points})=>points).flat(10);
        let renewalPTS = clearPTS; let used = false;
        usedPTS.map(point=>{//TODO: переписат до лаконичного использования редьюс
            used = false;
            renewalPTS = renewalPTS.filter(cp=>{
                if(cp===point && !used) {
                    used = true
                    return false
                }
                return true;
            });
        })
        return renewalPTS;
    }
    PermDice(Dice) {
        const GameState = this
        const [f, s] = this.Dices
        if(f===s) return this;
        else return new Proxy(this, {
            get(target, key) {
                if(key === 'PTS'){
                    const usedPTS = GameState.CurrentStepCash.MovesStack.map(({points})=>points).flat(10);
                    return [Dice].filter(Dice=>!usedPTS.includes(Dice));
                }
                return target[key]
            }
        })
    }
    /**
     * @returns {boolean}
     */
    get headed() {
        const headSlotIndex = this.ActivePlayer.team.id===WHITE.id?0:12;
        for(const {from} of this.CurrentStepCash.MovesStack)
            if(from===headSlotIndex) return true;
        return false;
    }
    constructor() {}

    start(state, players, canvas){
        this.GameState = BoardConstants.GAMESTATE.GameStarted;
        this.players = [{},...players].reduce((acc, player)=>
            (acc[player.team] = (player.team = [WHITE, BLACK][player.team-1], player), acc)
        );
        console.log(this.players);
        this.state(state, canvas);
    }
    /**
     * 
     * @param {{ActiveTeam:int, Dices:[Number, Number]}} param0
     */
    state(state, canvas, awaiting=false) {
        const {ActiveTeam, Dices} = state
        this.CurrentStepCash = {
            MovesStack: [],
            MovesCash: {}
        }
        this.ActivePlayer = this.players[ActiveTeam];
        this.Dices = Dices;
        if(!state.awaitingTeam)
            canvas.createDices(Dices[0], Dices[1], [BoardConstants.WHITE, BoardConstants.BLACK][ActiveTeam-1].id);
    }
    finish(WinnerTeam) {

    }
}
function showToast(pts, playername, colour) {
    if(!pts.length) return;
    return new Toast({
        title:"Пропуск хода",
        text:`Игрок <font color="blue">${playername}</font> цвета <font color="darkgreen">[${colour.name}]</font> пропускает ходы: <font color="darkgreen">[${pts.join(', ')}]</font>`,
        autohide:true,
        interval:5000
    })
}
export class GameProvider {
    onRollDicesClick = new EventProvider();
    /**
     * 
     * @param {{User:{userId,username}, Slots:int[], sendstep:Function, Drops:[Number, Number]}} BoardInits 
     * @param {*} GameStateInits 
     */
    constructor(BoardInits, promisesInitList) {
        const self = this;
        const BoardReady = promisesInitList.SlotsNDropsComplete.then((Slots, Drops)=>{
            this.Board = new Board(BoardInits, Slots, Drops);
                
            this.Board.eventProviders.showPTS(pts=>this.GameCanvas.setPTS(pts));
            this.Board.onMovesComplete(()=>{
                lightstepbutton(true);
                self.GameCanvas.eventHandlers.MovesComplete(self.GameState.ActivePlayer.team.id);
            })
        });
        this.GameState = new GameState();
        this.GameCanvas = new BoardCanvas({
            UserMovesFrom:(...args)=>this.Board.UserMovesFrom(this.GameState, ...args),
            move: (from, to)=>{
                const ret = this.Board.UserMove(this.GameState, {from:+from, to:$myeval(to)})
                if((this.GameState.PTS?.length===0 || !this.Board.CheckersWhichCanMove(this.GameState))
                && (self.GameState.ActivePlayer.userId===BoardInits.User.userId || BoardInits.User.userId===2)) {
                    if(this.GameState.PTS?.length) {
                        const [f, s] = self.GameState.Dices
                        showToast(this.GameState.PTS, self.GameState.ActivePlayer.username, self.GameState.ActivePlayer.team)
                    }
                    self.Board.StepComplete(this.GameState.CurrentStepCash.MovesStack)
                }
                return ret;
            },
            // MovesByDices: ()=>self.Board.UserMovesByDices(self.GameState),
            MovesByDices: (Dice)=>self.Board.UserMovesByDices(self.GameState.PermDice(Dice)),
            AcceptStep: ()=>(self.Board.AcceptStep(self.GameState), lightstepbutton(false)),
            rollDices: ()=>this.onRollDicesClick.send()
        }, promisesInitList);
        
        this.eventHandlers = new class {
            diceTeamRollsState(Team) {
                self.GameCanvas.diceTeamRollsState(Team.id);
            }
            diceTeamRoll(Team, Value) {
                self.GameCanvas.createDices(+Value, 0, +Team);
            }
            PermStepByButton() {
                self.Board.StepComplete(self.GameState.CurrentStepCash.MovesStack, true);
            }
            AcceptStep() {
                self.Board.AcceptStep(self.GameState);
            }
            start(GameStateData, players) {
                self.GameState.start(GameStateData, players, self.GameCanvas);
                if(GameStateData.awaitingTeam) {
                    if(GameStateData.awaitingTeam === self.GameState.ActivePlayer.team.id)
                        self.GameCanvas.showAcceptDiceRollLabel(GameStateData.awaitingTeam);
                }
                BoardReady.then(()=>{
                    if(!self.Board.CheckersWhichCanMove(self.GameState)&& (self.GameState.ActivePlayer.userId===BoardInits.User.userId || BoardInits.User.userId===2)) {
                        const [f, s] = self.GameState.Dices
                        showToast(self.GameState.PTS, self.GameState.ActivePlayer.username, self.GameState.ActivePlayer.team)
                        self.Board.StepComplete([]);
                    }
                })
            }
            /**
             * @param {{from, to, points:number[]}[]} Step 
             * @param {{ActiveTeam, Dice}} newGameStateData 
             */
            step(Step, newGameStateData, prevstate) {
                BoardReady.then(()=>{
                    self.Board.PermStep(self.GameState, Step);
                    Step.map(({from, to})=>self.GameCanvas.moveChecker(from, to));
                    jad()
                    function jad() {
                        const [f,s] = prevstate.Dices;
                        const spendedPoints = Step.map(({points})=>points).flat(10);
                        if(f===s && spendedPoints.length!==4) 
                            showToast(range(0, 4 - spendedPoints.length).map(()=>f),
                                        self.GameState.players[prevstate.ActiveTeam].username,
                                        [EMPTY, WHITE, BLACK][prevstate.ActiveTeam])
                        else if(spendedPoints.length !== 2) 
                            showToast([f,s].filter(x=>spendedPoints[0]!==x),
                                        self.GameState.players[prevstate.ActiveTeam].username,
                                        [EMPTY, WHITE, BLACK][prevstate.ActiveTeam])
                    }
                })
                const nextTeamDict = {
                    [WHITE.id]: BLACK.id,
                    [BLACK.id]: WHITE.id
                }
                if(!autostep.dice)
                    self.GameCanvas.showAcceptDiceRollLabel(nextTeamDict[prevstate.ActiveTeam]);
                return true;
            }
            state(newGameStateData) {
                self.GameState.state(newGameStateData, self.GameCanvas);
                BoardReady.then(()=>{
                    if(!self.Board.CheckersWhichCanMove(self.GameState) && (self.GameState.ActivePlayer.userId===BoardInits.User.userId || BoardInits.User.userId===2)) {
                        showToast(self.GameState.PTS, self.GameState.ActivePlayer.username, self.GameState.ActivePlayer.team)
                        self.Board.StepComplete([]);
                    }
                })
                return true;
            }
            ustep(Step, newGameStateData, oldGameData) {
                // self.GameState.state(newGameStateData, self.GameCanvas);
                // if(!self.Board.CheckersWhichCanMove(self.GameState) && (self.GameState.ActivePlayer.userId===BoardInits.User.userId || BoardInits.User.userId===2)) {
                //     showToast(self.GameState.PTS, self.GameState.ActivePlayer.username, self.GameState.ActivePlayer.team)
                //     self.Board.StepComplete([]);
                // }
                // return true;
            }
            end() {

            }
        };
        this.eventProviders = [ 'UserStep' ];
        this.InstantActions = {
            UserStep() {

            }
        }
        
    }
}