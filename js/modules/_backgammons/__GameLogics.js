class SlotRecord {
    Colour
    Count

    constructor(c = null, n = 0) {
        this.Colour = c
        this.Count = n
    }

    set(c, n) {
        this.Colour = c;
        this.Count = n;
    }
    add(c) {
        this.Colour = c;
        this.Count++;
    }
    take() {
        if (this.Count === 0) throw `Checkers not found..`;
        return $with(this.Colour)
            .do(() => (--this.Count === 0) && (this.Colour = null));
    }
}

class StepRecord {
    player
    Dices
    PointsToStep
    Moves = []
    HEAD = 0

    constructor(player, {Dices, PointsToStep}) {
        this.player = player;
        this.Dices = Dices;
        this.PointsToStep = PointsToStep;
    }

    includes() {
        throw 1324322;
    }

    getUsedPoints() {
        //return this.Moves.flat(1);
        return this.Moves.map(({points}) => points).flat(1);
    }
}
var sendstep;
export class GameModel {
    Slots = []
    Dropped = []
    Steps = []
    ActivePlayers = []
    whiteplayer = null
    blackplayer = null

    constructor(slots, Dropped, _sendstep) {
        this.init(slots);
        this.Dropped = Dropped
        sendstep = _sendstep;
    }

    init(actualSlots){
        this.Slots.push(...actualSlots.map(
            ([count, color]) =>
                new SlotRecord(color ? (color - 1 ? black : white) : null, count)
        ));
        console.log(this.Slots);
    }

    setSlots(newSlots) {
        if(!newSlots) newSlots = range(0,24).map(x=>x!==0?x!==12?[0,0]:[15,2]:[15,1]);
        this.Slots.length = 0;
        this.init(newSlots);
        reinit()//Canvas;
        return newSlots;
        //resetGame();
    }
}

function PositionCtxWithGcGm(gc, gm) {
    const {Slots} = gm;
    return class __PositionT {
        pos//index in the map
        isover = false

        constructor(pos) {
            this.pos = pos;
            // this.player = this.CurrentStep.player;
        }

        canMoveToThis() {//works with index
            if (this.isover) return false;// return gc.GameMode === GMend;
            const c = Slots[this.pos].Colour;
            return c === null || c === (gc.CurrentStep.player.team === 1 ? white : black);
        }

        up(points) {//works with positions
            let pos = this.pos;//this.pos at now is index
            //convert index to position
            if (gc.CurrentStep.player.team === 2) {
                if (pos < 12) pos += 24
                pos -= 12;
            }
            //summing
            pos += points;
            //validating
            const isover = this.isover = pos > 23;
            //convert position to index
            if (gc.CurrentStep.player.team === 2) {
                pos += 12;
                pos %= 24;
            }
            //save value;
            this.pos = pos;
            const self = this;
            return {
                isover,
                ifCanMoveTo(cb) {
                    const isCanMoveTo = self.canMoveToThis();
                    isCanMoveTo && cb(self);
                    return {
                        isCanMoveTo,
                        isover
                    };
                }
            };
        }

        [Symbol.toPrimitive]() {
            return this.pos;
        }
    }
}

export function GameControllerCtxWithGmEntries(gm, sendstep) {
    const {Slots, Dropped} = gm;
    let Position;

    class GameController extends JustEnoughEvents {
        CurrentStep = new StepRecord(null, {
            Dices: [0, 0],
            PointsToStep: [0]
        })
        CurretMove
        StepMode = steping
        GameMode = GMmove

        constructor(User) {
            super();
            Position = PositionCtxWithGcGm(this, gm);
            // __Ultra__.$$send('gc', this);
            this.User = User
        }

        _set(team, dices) {
            this.set(team === 1 ? gm.whiteplayer : gm.blackplayer, dices);
        }

        set(activePlayer, dices) {
            if (typeof activePlayer === 'number') alert('gc.set(...) at 1 argument expected player, handled ' + activePlayer)
            this.CurrentStep = new StepRecord(activePlayer, this._Dice(dices));
        }

        start(players, dices, ActiveTeam=1) {
            gm.players = players;
            gm.User = players.reduce((x, p) => p.id === this.User.id ? p : x)
            gm.whiteplayer = players.reduce((x, p) => p.team === 1 ? p : x);
            gm.blackplayer = players.reduce((x, p) => p.team === 2 ? p : x);
            const activePlayer = ActiveTeam === 1 ? gm.whiteplayer : gm.blackplayer;
            this.CurrentStep = new StepRecord(activePlayer, this._Dice(dices));
        }

        nextPlayer(player = null) {
            if (!player) {
                player = this.CurrentStep?.player === white ? black : white
            }
            //TODO: upgrading from view
            PlayerLabel.innerHTML = `Ход ${player === white ? 'Белых' : 'Чёрных'}`
            return player;
        }

        isTeamCanDrop(team) {
            let isWhite = team === white;
            if(isWhite ? Dropped[0] : Dropped[1])
                return true;
            let count = 0;
            let start = isWhite ? 18 : 6;
            count += gm.Slots.slice(start, start + 6).map((slot) => {
                if (slot.Colour === team) {
                    return slot.Count;
                }
                return 0;
            }).reduce((acc, value) => acc + value);

            return count === (15 - (isWhite ? Dropped[0] : Dropped[1]));
        }

        moveFrom(from) {
            if (this.CurrentStep.player?.team && Slots[from].Colour !== (this.CurrentStep.player.team === 1 ? white : black)) return {keys: []};
            if (this.CurrentStep.player.id !== this.User.id) return {keys: []};
            if (from === (this.CurrentStep.player.team === 1 ? 0 : 12) && this.CurrentStep.HEAD) return {keys: []};
            let teamOver = gm.Slots[from].Colour === white ? 'whiteOver' : 'blackOver';
            const {Dices, PointsToStep, Moves} = this.CurrentStep;
            const [first, second] = Dices;
            const CanMoveTo = {/* id: [pointscost] */};
            const sum = (acc, val)=>acc+val;
            function setCanMoveTo(pos, points) {
                if (CanMoveTo[pos]?.length < points.length || CanMoveTo[pos]?.reduce(sum) < points.reduce(sum)) {
                    // if u spend less by the count of points and sum of they than saved variant
                    return CanMoveTo[pos];
                }
                return CanMoveTo[pos] = points;
            }
            if (first === second) {
                const pts = range(1, 4 - this.CurrentStep.getUsedPoints().length);
                for (let i of pts) {
                    const pos = new Position(from).up(+first * i);
                    const spendedPointsToMove = range(0, i).map(_ => first);
                    if (pos.isover) setCanMoveTo(teamOver, spendedPointsToMove)//CanMoveTo[teamOver] = spendedPointsToMove
                    if (!(pos.ifCanMoveTo(pos => setCanMoveTo(pos, spendedPointsToMove)).isCanMoveTo))
                        break;
                }
            } else {
                const pts = this.PTScheck();
                const Combinable = pts.map(
                        point => {
                            const pos = new Position(from).up(+point)
                            if (pos.isover) setCanMoveTo(teamOver, [point]);//CanMoveTo[teamOver] = point
                            pos.ifCanMoveTo(pos => setCanMoveTo(pos, [point])).isCanMoveTo
                        }
                    ).length !== 0
                    && pts.length === 2;
                if (Combinable) {
                    const pos = new Position(from).up(+first + second);
                    pos.ifCanMoveTo(pos => setCanMoveTo(pos, Dices)).isCanMoveTo
                    if (pos.isover) setCanMoveTo(teamOver, Dices)//CanMoveTo[teamOver] = Dices
                }
            }
            if (!this.isTeamCanDrop(Slots[from].Colour)) delete CanMoveTo[teamOver];
            this.CurretMove = {from, CanMoveTo}
            CanMoveTo.keys = Object.keys(CanMoveTo).map($myeval);
            return CanMoveTo;
        }

        PTScheck() {
            const {PointsToStep} = this.CurrentStep;
            let Moves = this.CurrentStep.getUsedPoints();
            let PTS = [];
            for (const point of PointsToStep) {
                const i = Moves.indexOf(point);
                if (i === -1) PTS.push(point); //если не схожден
                else Moves.splice(i, 1) // если схожден
            }
            return PTS;
        }

        canIMoveSomewhere(team) {
            return Slots.map((slot, i) => [i, slot])
                .filter(([, slot]) => slot.Colour === team)
                .map(([i]) => this.moveFrom(i).keys)
                .filter(keys => keys?.length)
        }

        moveTo(to) {
            const {from, CanMoveTo} = this.CurretMove;
            const {Moves, PointsToStep} = this.CurrentStep;
            const {player} = this.CurrentStep;
            if (CanMoveTo.keys.includes(to)) {
                if (to === 'whiteOver' || to === 'blackOver') {
                    Dropped[(Slots[from].take() === white) ? 0 : 1]++;
                } else Slots[to].add(Slots[from].take());
                if(from === (this.CurrentStep.player.team === 1 ? 0 : 12))
                    this.CurrentStep.HEAD++;
                //upd metrics
                const pushId = Moves.push({from, to, points: CanMoveTo[to]}) - 1;
                const pts = this.PTScheck();
                this.$$send('move', {
                    Move: Moves[pushId],
                    UsedPoints: this.CurrentStep.getUsedPoints(),
                    PointsToStep: pts
                });
                if (!pts.length || !this.canIMoveSomewhere(player.team === 1 ? white : black).length) { //если не осталось ходов
                    this.CurrentMode = completed;
                    this.stepComplete();
                }
                // moveChecker(from, to);
                return this.CurrentStep;
            } else {
                return false;
            }
        }

        move(from, to = null) {
            console.log(this.moveFrom(from));
            if (to !== null)
                return this.moveTo(to);
        }

        stepComplete() {
            sendstep(this.CurrentStep.Moves).then((value) => {
                value.error && alert(`sendstep invalid resp: ${JSON.stringify(value)}`)
                // Steps.push(this.CurrentStep = new StepRecord(
                //     this.nextPlayer(),
                //     this.Dice()
                // ));
            }).catch((value) => {
                console.log(value);
            })
        }

        _Dice(dices) { //deprecated
            // const [first, second] = [
            //     Math.floor(Math.random() * 6) + 1,
            //     Math.floor(Math.random() * 6) + 1
            // ];
            const [first, second] = dices;
            const PointsToStep = first === second
                ? [first, first, first, first]
                : [first, second];

            //TODO: uptading from view builder
            // stepsoo.innerHTML = PointsToStep.join('; ');

            return {
                Dices: [first, second], PointsToStep
            };
        }
    }

    return {GameController};
}

// function changeWinPoints() {
//     document.getElementById("playersWinPoints").textContent = PageSnapshotData.Game.WinPoints[0] + " | " +
//         PageSnapshotData.Game.WinPoints[1];
// }