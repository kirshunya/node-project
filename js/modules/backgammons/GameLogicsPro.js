import { $myeval } from "./Utilities.js";
import { BoardConstants, refToArr, slotinfo, Slot, DropSlot } from './BoardConstants.js';
import { BoardCanvas } from './CanvasRender.js'


const SlotsIterator = (slots, CB)=>(
                                slots = new Proxy(slots, {get:(slots,key)=>slots[key]||[0,0]}), 
                                [...Array(24).keys()].map(index=>CB(slots[index]))
                            );
const { WHITE, BLACK, EMPTY, CHECKERS, MAP } = BoardConstants;
class Board {
    FartherOpponentCheckerPos
    Slots
    Drops
    TEMP = {
        MovesCash: {},
        MovesStack: []
    }
    constructor(BoardInits) {
        const self = this;
        const {User} = BoardInits;
        this.User = User;//need field @team -> BoardConstant[WHITE||BLACK];
        this.Slots = SlotsIterator(BoardInits.Slots, data=>data);

        this.Drops = [
            new DropSlot(EMPTY.id), new DropSlot(WHITE.over), new DropSlot(BLACK.over)
        ];
        let emptyslot
        this.Slots0 = new Proxy({}, {
            /**
             * 
             * @param {*} _t 
             * @param {*} SlotIndex 
             * @param {*} _proxy 
             * @returns {Slot}
             */
            get:(_t, SlotIndex, _proxy) => {
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
    /**
     * 
     * @param {GameState} GameState 
     * @param {int} fromIndex 
     * @returns {{}}
     */
    UserMovesFrom(GameState, fromIndex) {
        const Sloter = this.Slots0;
        const {User} = this;
        const {PTS, ActivePlayer, CurrentStepCash} = GameState;
        const FromSlot = this.Slots0[fromIndex];

        if(ActivePlayer.team.id !== User.team.id) return;
        if(!FromSlot.ismy()) return;
        const TeamFirstSlot = ActivePlayer.team.id===WHITE.id?0:12;
        if(fromIndex===TeamFirstSlot&&GameState.headed) return;

        const AccMoves = {
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
                return this.moves;
            }
        };
        /**
         * 
         * @param {int[]} PTS 
         * @param {Slot} FromSlot 
         * @param {int[]} spendedPoints 
         */
        function StepByStep(PTS, FromSlot, spendedPoints) {
            for(const point of new Set(PTS)) {
                const curSlot = FromSlot.next(point);
                if(curSlot?.isover) {
                    AccMoves.push(curSlot.index, [...spendedPoints, point]); 
                    continue;
                };
                if(curSlot.ismy()||curSlot.isempty()) {
                    const curSpended = [...spendedPoints, point];
                    if((!OpponentIsFarther(curSlot.index))&&sixchecker(curSlot, FromSlot)) continue;
                    AccMoves.push(curSlot.index, curSpended);

                    const nextPTS = [...PTS]; nextPTS.splice(PTS.indexOf(point), 1);
                    if(!nextPTS.length) continue;

                    StepByStep(nextPTS, curSlot, curSpended);
                }
            }
        }
        StepByStep(PTS, FromSlot, []);

        /**
         * 
         * @param {Slot} toSlot 
         * @param {Slot} fromSlot 
         * @returns {boolean} if 6 sequenced checkers
         */
        function sixchecker(toSlot, fromSlot) {//проверять передние клетки
            // const sum = (acc, bool)=>acc+(+bool);
            let curSlot = toSlot;
            let counter = 1;
            for(const _ of Array(5).keys()) {
                curSlot = curSlot.down();
                if(curSlot.ismy()) counter++
                else break;
            }
            curSlot = toSlot;
            for(const _ of Array(5).keys()) {
                curSlot = curSlot.next();
                if(curSlot.ismy()) counter++
                else break;
            }
            return counter>=6;
        }

        /**
         * 
         * @param {int} slotIndex 
         * @returns {boolean}
         */
        function OpponentIsFarther(slotIndex) {
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
            let farther = false;
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
        CurrentStepCash.MovesCash = AccMoves.optimize()
        return CurrentStepCash.MovesCash;
    }
    UserMovesByDice(GameState, Dice) {

    }
    /**
     * 
     * @param {GameState} GameState 
     * @param {{from:int, to:int}} param1 
     */
    UserMove(GameState, {from, to}) {
        const {CurrentStepCash} = GameState;
        if(to === WHITE.over || to === BLACK.over){
            const sum = (acc, num)=>acc+num;
            const points = CurrentStepCash.MovesCash[to].length===1
                                ? CurrentStepCash.MovesCash[to][0]
                                : [[1000],...CurrentStepCash.MovesCash[to]].reduce(
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
        } else CurrentStepCash.MovesStack.push({from, to, points:CurrentStepCash.MovesCash[to]});
        this.Slots0[from].permMoveTo(to);
    }
    UserStepComplete() {

        this.Temp = [];
    }
    CancelLastMove() {

    }
    PermStep(GameState, step) {

    }
}

class GameState {
    Dices
    ActivePlayer
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
    /**
     * @returns {boolean}
     */
    get headed() {
        const headSlotIndex = this.ActivePlayer.team.id===WHITE.id?0:12;
        return this.CurrentStepCash.MovesStack.reduce(
            ({from})=>from===headSlotIndex)//TODO rename 0 and 12
    }
    constructor(GameStateInits) {}

    start(state, players){
        this.GameState = BoardConstants.GAMESTATE.GameStarted;
        this.players = [{},...players].reduce((acc, player)=>
            (acc[player.team] = (player.team = [WHITE, BLACK][player.team-1], player), acc)
        );
        console.log(this.players);
        this.state(state);
    }
    state({ActiveTeam, Dices}) {
        this.CurrentStepCash = {
            MovesStack: [],
            MovesCash: {}
        }
        this.ActivePlayer = this.players[ActiveTeam];
        this.Dices = Dices;
    }
    finish(WinnerTeam) {

    }
}

export class GameProvider {
    /**
     * 
     * @param {{User:{userId,username}, Slots:int[], sendstep:Function, Drops:[Number, Number]}} BoardInits 
     * @param {*} GameStateInits 
     */
    constructor(BoardInits, GameStateInits) {
        const self = this;
        this.Board = new Board(BoardInits);
        this.GameState = new GameState(GameStateInits);
        this.GameCanvas = new BoardCanvas(
            BoardInits.Slots, BoardInits.Drops, {
            UserMovesFrom:(...args)=>this.Board.UserMovesFrom(this.GameState, ...args),
            move: (from, to)=>{
                this.Board.UserMove(this.GameState, {from:+from, to:$myeval(to)})
                if(this.GameState.PTS.length===0)
                    BoardInits.sendstep(this.GameState.CurrentStepCash.MovesStack);
            }
        });
            // range(0,24).map(x=>x!==0?x!==12?[1,1]:[15,2]:[15,1])
            //             .map(([Count, Colour])=>({Count, Colour:Colour!==1?Colour!==2?null:'white':'black'})),

        this.eventHandlers = {
            start(GameStateData, players) {
                self.GameState.start(GameStateData, players);
            },
            step(Step, newGameStateData) {
                self.Board.PermStep(Step, self.GameState);
                self.GameCanvas.step(Step);
                self.GameState.state(newGameStateData);
            },
            ustep(Step, newGameStateData) {
                self.GameState.state(newGameStateData);
            },
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