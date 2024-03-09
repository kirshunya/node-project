// import { black, white } from "./Utilities.js";
import { BoardConstants, refToArr, slotinfo } from './BoardConstants.js';
import { BoardCanvas } from './CanvasRender.js'

const SlotsIterator = (slots, CB)=>(
                                slots = new Proxy(slots, {get:(slots,key)=>slots[key]||[0,0]}), 
                                [...Array(24).keys()].map(index=>CB(slots[index]))
                            );
const { WHITE, BLACK, EMPTY, CHECKERS } = BoardConstants;
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

        class Slot {
            index
            refToArr
            Sloter

            constructor(ref, index, Sloter) {
                this.refToArr = new refToArr(ref);
                this.index = index;
                this.Sloter = Sloter;
            }
            ismy() {
                const [count, colour] = this.refToArr;
                return c===User?.colour;
            }
            permPushChecker(colour) {
                if(++this.refToArr.Count === 1)
                    this.refToArr.Colour = colour;
            }
            permTakeChecker() {
                const colour = this.refToArr.Colour;
                if(--this.refToArr.Count === 0)
                    this.refToArr.Colour = EMPTY;
                return colour;
            }
            permMoveTo(toIndex) {
                this.Sloter[toIndex].permPushChecker(this.permTakeChecker());
            }
            next(point) {
                function up(from, point) {
                    const isBlack = gc.CurrentStep.player.team === 2;
                    const pos = from + (isBlack&&(pos<12?24:-12)) + point;
                    
                    //validating
                    const isover = pos > 23;

                    const index = isover?User.team.over:isBlack?(pos+12)%24:pos;
                    
                    return {pos, isover, index};
                }
                const {pos, isover, index} = up(this.index, point);
                return this.Sloter[index];
            }
        }
        class DropSlot {
            index
            count = 0
            isover=true
            constructor(index) {
                this.index = index;
            }

            permPushChecker() {
                this.count++;
            }
        }
        this.Drops = [
            new DropSlot(-1), new DropSlot(WHITE.over), new DropSlot(BLACK.over)
        ];

        this.Slots0 = new Proxy({}, {
            get:(_t, SlotIndex, _proxy) => {
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

        if(ActivePlayer.team.id === User.team.id) return;
        if(!FromSlot.ismy()) return;

        const AccMoves = {
            moves:{},

            push(toIndex, Points) {
                const {moves} = this;
                if(toIndex !== User.team.over) return (moves[toIndex] = Points, -1);
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

        function StepByStep(PTS, FromSlot, spendedPoints) {
            for(const point of new Set(PTS)) {
                const curSlot = FromSlot.next(point);
                if(curSlot?.isover) {
                    AccMoves.push(curSlot.index, [...spendedPoints, point]); 
                    continue;
                };
                if(curSlot.ismy()) {
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

        return AccMoves.optimize();
    }
    UserMovesByDice(GameState, Dice) {

    }
    UserMove(GameState, {from, to}) {
        const {CurrentStepCash} = GameState;
        CurrentStepCash.MovesStack.push({from,to});
        this.Slots0[from].moveTo(to);
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
    constructor(GameStateInits) {
        Object.defineProperty(this, 'PTS', {
            get:(target)=>{
                const [f, s] = target.Dices;
                return f===s?[f, f, s, s]:[f, s];
            }
        })
    }

    start(...data){
        this.GameState = BoardConstants.GAMESTATE.GameStarted;
        this.state(...data);
    }
    state(...data){
        this.CurrentStepCash = {
            MovesStack: [],
            MovesCash: {}
        }
    }
    finish(WinnerTeam) {

    }
}

export class GameProvider {
    constructor(BoardInits, GameStateInits) {
        const self = this;
        this.Board = new Board(BoardInits);
        this.GameState = new GameState(GameStateInits);
        this.GameCanvas = new BoardCanvas(
            BoardInits.Slots, [CHECKERS.empty, CHECKERS.empty], {
            UserMovesFrom:(...args)=>this.Board.UserMovesFrom(this.GameState, ...args),
            move: (...args)=>UserMove(this.GameState, ...args)
        });
            // range(0,24).map(x=>x!==0?x!==12?[1,1]:[15,2]:[15,1])
            //             .map(([Count, Colour])=>({Count, Colour:Colour!==1?Colour!==2?null:'white':'black'})),

        this.eventHandlers = {
            start() {
                
            },
            step(Step, newGameStateData) {
                self.Board.PermStep(Step, self.GameState);
                self.GameCanvas.step(Step);
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