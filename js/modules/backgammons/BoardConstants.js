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