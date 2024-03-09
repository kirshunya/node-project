// import { black, white } from "./Utilities.js";
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
                if(SlotIndex === WHITE.over) return this.Drops[WHITE.id];
                if(SlotIndex === BLACK.over) return this.Drops[BLACK.id];
                return new Slot(self.Slots[SlotIndex], SlotIndex, _proxy)
            }
        });
    }
    UserMovesFrom(GameState, fromIndex) {
        const {User} = this;
        const {PTS, ActivePlayer, CurrentStepCash} = GameState;
        const FromSlot = this.Slots0[fromIndex];

        if(ActivePlayer.team.id !== User.team.id) return;
        if(!FromSlot.ismy()) return;
        if(fromIndex===0&&GameState.headed) return;

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
                    if(1) {/* if 6 пешек одного цвета подряд и противник дальше не зашёл */}
                    AccMoves.push(curSlot.index, curSpended);

                    const nextPTS = [...PTS]; nextPTS.splice(PTS.indexOf(point), 1);
                    if(!nextPTS.length) continue;

                    StepByStep(nextPTS, curSlot, curSpended);
                }
            }
        }
        StepByStep(PTS, FromSlot, []);

        
        function sixchecker(to, from) {
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
        CurrentStepCash.MovesStack.push({from, to, points:CurrentStepCash.MovesCash[to]});
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
    get headed() {
        return this.CurrentStepCash.MovesStack.reduce(
            ({from})=>from===this.ActivePlayer.team.id===WHITE.id?0:12)//TODO rename 0 and 12
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
     * @param {{User, Slots, sendstep:Function}} BoardInits 
     * @param {*} GameStateInits 
     */
    constructor(BoardInits, GameStateInits) {
        const self = this;
        this.Board = new Board(BoardInits);
        this.GameState = new GameState(GameStateInits);
        this.GameCanvas = new BoardCanvas(
            BoardInits.Slots, [CHECKERS.empty, CHECKERS.empty], {
            UserMovesFrom:(...args)=>this.Board.UserMovesFrom(this.GameState, ...args),
            move: (from, to)=>{
                this.Board.UserMove(this.GameState, {from:+from, to:+to})
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