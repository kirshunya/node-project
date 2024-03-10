export const BoardConstants = {
    WHITE: {
        id: 1,
        name: 'white',
        over: 'whiteover'
    },
    BLACK: {
        id: 2,
        name: 'black',
        over: 'blackover'
    },
    EMPTY: {
        id: 0,
        name: 'EMPTY',
        over: 'EMPTYover'
    },
    MAP: {
        whiteend: 24,
        blackend: 12,
        lastPostionNumber: 23
    },
    CHECKERS: {
        first: 1,
        empty: 0
    },
    GAMESTATE:{
        Waiting: 1,
        GameStarted:1
    }
}
export class refToArr {
    ref
    constructor(ref) { this.ref = ref; }
    get Colour() {
        return this.ref[1]
    }
    set Colour(value) {
        return this.ref[1] = value;
    }
    get Count() {
        return this.ref[0]
    }
    set Count(value) {
        return this.ref[0] = value;
    }
}
export class slotinfo {
    constructor(Count, Colour) {
        return [Count, Colour];
    }
}
export class Slot {
    index
    refToArr
    Sloter

    constructor(ref, index, Sloter) {
        this.refToArr = new refToArr(ref);
        this.index = +index;
        this.Sloter = Sloter;
    }
    ismy() {
        return this.refToArr.Colour===this.Sloter.User?.team.id;
    }
    isempty() {
        return this.refToArr.Count===BoardConstants.CHECKERS.empty;
    }
    permPushChecker(colour) {
        if(++this.refToArr.Count === 1)
            this.refToArr.Colour = colour;
    }
    permTakeChecker() {
        const colour = this.refToArr.Colour;
        if(--this.refToArr.Count === 0)
            this.refToArr.Colour = BoardConstants.EMPTY;
        return colour;
    }
    permMoveTo(toIndex) {
        this.Sloter[toIndex].permPushChecker(this.permTakeChecker());
    }
    /**
     * 
     * @param {int} point 
     * @returns {Slot}
     */
    next(point=1) {
        const blackEndShift = 12
        const blackStartShift = -12
        // 24 -> MaxSlotIndex
        // +12 -> blackStartShiftReturning
        const {User} = this.Sloter
        function up(from, point) {
            const isBlack = User.team.id === BoardConstants.BLACK.id;
            const pos = +from + +(isBlack&&((from<BoardConstants.MAP.blackend)?blackEndShift:blackStartShift)) + point;
            
            //validating
            const isover = pos > BoardConstants.MAP.lastPostionNumber;

            const index = isover?User.team.over:isBlack?(pos+12)%24:pos;
            
            return {pos, isover, index};
        }
        const {pos, isover, index} = up(this.index, point);
        return this.Sloter[index];
    }
    down() {
        const blackEndShift = 12
        const blackStartShift = -12
        const {User} = this.Sloter;
        function down(from, point=-1) {
            const isBlack = User.team.id === BoardConstants.BLACK.id;
            const pos = +from + +(isBlack&&((from<BoardConstants.MAP.blackend)?blackEndShift:blackStartShift)) + +point;
            
            //validating
            const isover = pos < 0;

            const index = isover?User.team.over:isBlack?(pos+12)%24:pos;
            
            return {pos, isover, index};
        }
        const {pos, isover, index} = down(this.index);
        return isover?this.Sloter.emptyslot:this.Sloter[index];
    }
}
export class DropSlot {
    index
    count = BoardConstants.CHECKERS.empty
    isover=true
    constructor(index) {
        this.index = index;
    }

    permPushChecker() {
        this.count++;
    }
    ismy() {
        return false;
    }
}