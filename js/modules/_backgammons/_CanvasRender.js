import { range, $myeval, ondom, sleep, black, EventProvider } from "./_Utilities.js";
import { BoardConstants, refToArr, slotinfo, TState } from "./_BoardConstants.js";
const { WHITE, BLACK, EMPTY } = BoardConstants; 

var scaleFactor = 1.3;
var indent = 14;
fabric.isWebglSupported(fabric.textureSize);
class Checker {
    /**@type {fabricImage} */ 
    img
    /**@type {Slot} */ 
    slot
    /**@type {int} */
    /**
     * 
     * @param {fabricImage} img 
     * @param {int} slot 
     */
    constructor(img, slot, colour) {
        this.img = img;
        this.slot = slot;
        this.colour = colour
    }
}

class Slot {
    /** @type {int} */
    index
    /** @type {Checker[]} */
    checkers = [];

    constructor(si) {this.index = si}

    last() {
        return this.checkers[this.checkers.length-1];
    }

    /** @param {Checker} checker  */
    add(checker) {
        this.checkers.map(({img})=>img.lockMovementX = img.lockMovementY = true);
        this.checkers.push(checker);
        checker.slot = this;
    }

    get(checkerIndex){
        return this.checkers[checkerIndex];
    }

    getRemoveLast() {
        if (this.checkers.length < 1) return false;
        const ret = this.checkers.pop();
        const newlast = this.checkers[this.checkers.length-1];
        if (newlast) 
            newlast.img.lockMovementX = newlast.img.lockMovementY = false;
        return ret;
    }

    count() {
        return this.checkers.length;
    }
}
const genStaticImgClass = (scF)=>class {
    constructor(attributes, staticpos=false) {
        return Object.assign({
            hasControls: false,
            lockMovementX: staticpos,
            lockMovementY: staticpos,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockScalingFlip: false,
            selectable: true,
            hasBorders: false,
            // scaleX: checkerSize/66 * scaleFactor,
            // scaleY: checkerSize/66 * scaleFactor,
            scaleX: scF,
            scaleY: scF,
        }, attributes)
    }
}
// const range = (from, len) => [...Array(len).keys()].map(x => x + from);
const $PageSnapshotData = {
    Graphics: {
        // whitecheckerpicurl: `img/checker-white.png`, 
        // blackcheckerpicurl: `img/checker-black.png`,
        whitecheckerpicurl: `img/backgammons/blackcell4.png`, 
        blackcheckerpicurl: `img/backgammons/whitecell4.png`,
        ghostcheckerpicurl: `img/backgammons/ghost-checker.png`, 
        gameboardpic: `img/backgammons/tiny/bcbg.jpg`
    }
}
//Выделить в отдельный класс позиционирования и масштабирования
    const [initWidth, initHeight] = [360, 480];
    const BoardWidth = 1600;
    const BoardHeight = 1900;
    const BordersByX = [43,90,40];
    const BordersByY = [56,0,56];
    const slotWidth = (BoardWidth - BordersByX.reduce((acc,n)=>acc+n))/12;
    const slotHeight = (BoardHeight - BordersByY.reduce((acc,n)=>acc+n))/2;
    const BoardSidesSize = [712, 712];

    const slotMargin = 0;
    const checkerSize = slotWidth - slotMargin*2;
    const checkerScale = checkerSize/66;
    let StaticImg = genStaticImgClass(checkerScale)

    const stepY = checkerSize / 2.5;
    const TopY = BordersByY[0];
    const BottomY = BoardHeight - BordersByY[2]// - checkerSize; 
    const LeftX = BordersByX[0];
    const __posX$ = (slotIndex) => LeftX + slotWidth*slotIndex + ((slotIndex > 5)?BordersByX[1]:0)-1;
    const __posX = (slotIndex) => {
        const slotSize = (BoardSidesSize[+(slotIndex>6)] + slotMargin)/6;
        const LeftX = slotIndex<6?BordersByX[0]:BordersByX[0]+BoardSidesSize[0]+BordersByX[1];
        return LeftX + (slotSize)*(slotIndex%6);
    }
    const posX = (slotIndex) => __posX(slotIndex < 12 ? 11 - slotIndex : slotIndex - 12);
    const posY = (slotIndex, CheckerIndex) => (slotIndex<12)
                                                    ? TopY  +  stepY*CheckerIndex
                                                    : BottomY  -  stepY*CheckerIndex - checkerSize;

const BoardSizesInfo = (()=>{
    const BoardParts = [43, 712, 100, 712, 43];
    
    return {
    }
})()
const [whitetay, blacktay] = ['./img/backgammons/whitetay.png', './img/backgammons/blacktay.png'];
const {whitecheckerpicurl, blackcheckerpicurl, 
    ghostcheckerpicurl, gameboardpic} = $PageSnapshotData.Graphics
const CHECKERS_TEXTURES = [ghostcheckerpicurl, whitecheckerpicurl, blackcheckerpicurl]
/**
 * for jsDoc
 */
class fabricImage {
    //properties
    width
    height

    //other
    /** @type {[]} */
    filters
    /** applyFilters */
    applyFilters() {}
    /**
     * set Z
     * @param {int} Z 
     * @returns {fabricImage} this
     */
    moveTo(Z){}
    /**
     * accept Coords Changes
     * @param {boolean} skipCornesopt "skip calculation of oCoords."
     * @returns {fabricImage} this
     */
    setCoords(skipCornesopt){}
}
export var board = {};
export var canva = {};
export var drop = {}
class CanvasFunctions {
    initWidth = initWidth
    /**
     * @param {string} CanvasName 
     */
    constructor(CanvasName) {
        this.canvas = new fabric.Canvas(CanvasName, {
                preserveObjectStacking: true,
                selection : false,
                controlsAboveOverlay:true,
                centeredScaling: true,
                allowTouchScrolling: true // скроллинг страницы касанием по канвасу
            });
    }
    /** @param {string} imgSrc @returns {Promise.<fabricImage>} */
    async setbackground(imgSrc) {
        const callRender = this.canvas.renderAll.bind(this.canvas);
        return new Promise(resolve=>
                fabric.Image.fromURL(imgSrc, 
                        bgImg=>(this.canvas.setBackgroundImage(bgImg, callRender, {}), resolve(bgImg))
        ));
    }
    enterContentToViewBox(newWidth, newHeight=undefined, realWidth = BoardWidth, realHeight=BoardHeight) {
        const {canvas} = this;
        if(!newHeight) 
            newHeight = newWidth/realWidth*realHeight
        

        canvas.setWidth(newWidth);
        canvas.setHeight(newHeight);
        canvas.setZoom(newWidth/realWidth);
    }
    /**
     * 
     * @param {string} texture 
     * @param {{left, top}} additional 
     * @returns {Promise.<fabricImage>}
     */
    installImg(texture, additional, movement=false) {//TODO: rebase
        const self = this;
        return new Promise(resolve=>fabric.Image.fromURL(texture, function (rawImg) {
                // console.log(additional)
                const img = rawImg.set(new StaticImg(additional, !movement));
                self.canvas.add(img)
                resolve(img);
            }));
    }
}
class TopDropLunk extends CanvasFunctions {
    _count = 0
    _effects = []
    _effectsRejects = []
    pic = ghostcheckerpicurl
    /** @type {Promise.<fabricImage>} Initialization Promise */
    readyPromise
    constructor(Prefix, count=0) {
        super(`${Prefix}DropLunk`);
        const dropcanvas = this.canvas;
        const DropLunkContainer = document.getElementById(`${Prefix}Pan`).getElementsByClassName('line')[0];
        const DropLunkCC = document.getElementById(`${Prefix}Pan`).getElementsByClassName('DropLunk')[0]
        const resize = ()=>{
            dropcanvas.setWidth(DropLunkCC.width = DropLunkContainer.clientWidth);
            dropcanvas.setHeight(DropLunkCC.height = DropLunkContainer.clientHeight);
            dropcanvas.setZoom((DropLunkContainer.clientHeight)/66/2)
        }
        window.addEventListener('resize', resize);
        ondom.then(resize);

        // this.installImg('./img/backgammons/boardlot.png',  {scaleX:2.75, scaleY:2.75, top:Prefix==="Bottom"?-13:0 });
        const pic = this.pic = {Top:whitecheckerpicurl, Bottom:blackcheckerpicurl}[Prefix];//TODO
        this.readyPromise = ondom.then(()=>{
            Promise.all([...Array(count).keys()].map((i)=>this.installImg(pic, {left:20+i*50, top:3})))
                   .then(arr=>arr.map((img, i)=>img.moveTo(i).setCoords()));
        this._count = count;
            // this.installImg(whitecheckerpicurl, {left: 250, top: 3}).then(img=>img.moveTo(3)).then(img=>img.setCoords())
            // this.installImg(whitecheckerpicurl, {left: 310, top: 3}).then(img=>img.moveTo(2)).then(img=>img.setCoords())
            // this.installImg(ghostcheckerpicurl, {left: 380, top: 3}).then(img=>img.moveTo(1)).then(img=>img.setCoords())
        })
    }
    count() {
        return this._count
    }
    /**
     * 
     * @param {[int[]]|[[Number], [Number]]} points 
     * @returns {Promise.<Number>}
     */
    accept(points) {
        return new Promise(async(resolve, reject)=>{
            const resolver = val=>()=>(resolve(val), this.resolver=null)
            const Rect = new fabric.Rect({
                width:this.canvas.getWidth()/this.canvas.getZoom(),
                height:this.canvas.getHeight()/this.canvas.getZoom(),
                fill: 'rgba(225,225,100,.53)',
                selectable: false,
                lockMovementX: true,
                lockMovementY: true,
                
            });
            this.canvas.add(Rect); this._effects.push(Rect);
            // if(typeof points)
            if(points.length - 1) {
                const [firstVariant, secondVariant] = points
                this.createDice(firstVariant[0], 0).then(resolver(0), reject)
                this.createDice(secondVariant[0], 1).then(resolver(1), reject)
            } else {
                this.createDice(points[0][0], 0).then(resolver(-1), reject)
            }
            Rect.on('mousedown', points.length?resolver(points.reduce((acc,pm)=>acc<pm?acc:pm)):resolver(-1));
            this.resolver = points.length?resolver(points.reduce((acc,pm)=>acc<pm?acc:pm)):resolver(-1);
        })

    }
    append() {
        const index = this._count++;
        return this.installImg(this.pic, {left:20+index*45, top:3})
                .then(img=>img.moveTo(index).setCoords());
    }
    createDice(diceNumber, shiftType=0) {
        return this.installImg(`/img/backgammons/dices${diceNumber}.png`, {
            left: shiftType===0 ?this.canvas.getWidth()
                                :this.canvas.getWidth()+this.canvas.getHeight()*3,
            top: 2, scaleX:128/328, scaleY:128/328,
            hoverCursor: 'pointer',
        }).then(dice=>{
            this._effects.push(dice);
            this.canvas.bringToFront(dice);
            return new Promise((resolve, reject)=>{
                this._effectsRejects.push(reject);
                dice.on("mousedown", ()=>resolve());
            });
        });
    }
    clear() {
        const {_effects, _effectsRejects} = this;
        this._effects = []
        this._effectsRejects = [];
        _effects.map(effect=>this.canvas.remove(effect));
        _effectsRejects.map(rej=>rej());
        this.resolver=null;
    }
}
// BoardPresentation -> Canvas
// BoardEffects -> Canvas
// BoardLocalsTEMP -> [Board/*Logic*/, Canvas]
/*
 * FRONT::DROPS::Accept([Dices])
 * We can drop with 2 dice(but spend only on of *), but if we chose first dice:
 * * first n second dice cant be used to moving by other checkers -- all good
 * * second dice cant be used to moving other checkers, but first can be used to this -- what should to do?
 * * second dice as first can be used to moving other checkers -- all good
 */
const chbackshift = 27
class BoardCanvasEffects {
    ghost
    /** @type {Checker[]} */
    enabledGhosts = [];
    moving = false
    // eventProviders = {
    //     movechecker: new EventProvider()
    // }
    /** @param {BoardCanvas} BoardCanvas  */
    constructor(BoardCanvas) {
        this.BoardCanvas = BoardCanvas;
        this.selectionChecker.canvasRenderAll = ()=>this.BoardCanvas.canvas.renderAll();
        this.selectionChecker.BoardCanvas = BoardCanvas;
    }
    
    selectionChecker = {
        /** @param {Checker} */
        Checker:null,
        /** @type {Promise.<fabricImage>} */
        backimg:null,
        /** @type {BoardCanvas} */
        BoardCanvas,
        canvasRenderAll:()=>{},
        /** @param {Checker} Checker @param {int} awa 0 - if Checker cannot to move */
        set(Checker, awa) {
            this.reset();
            this.Checker = Checker;
            const {top, left} = Checker.img
            const tayurl = {[WHITE.id]:whitetay, [BLACK.id]:blacktay}[Checker.colour];
            const scale = checkerSize/115*1.1;
            this.backimg = this.BoardCanvas.installImg(tayurl, {
                top:top-chbackshift, 
                left:left-chbackshift, 
                scaleX: scale, 
                scaleY: scale
            }, false)
                    .then(img=>(this.BoardCanvas.canvas.bringToFront(Checker.img), img));
            (!awa)&&this.Checker.img.filters.push(new fabric.Image.filters.BlendColor({
                            color: 'red', 
                            alpha: 0.5, 
                            mode:'tint'
                        }))
            this.Checker.img.applyFilters();
            this.canvasRenderAll();
        },
        reset() {
            if(!this.Checker) return;
            this.backimg.then(img=>this.BoardCanvas.canvas.remove(img));
            this.Checker.img.filters.length = 0;
            this.Checker.img.applyFilters();
            this.canvasRenderAll();
            this.Checker = null;
        }, 
        moveTo({left, top}) {
            this.backimg.then(img=>{
                img.left = left-chbackshift;
                img.top = top-chbackshift;
                img.setCoords();
                this.BoardCanvas.canvas.renderAll();
            })
        },
        bringToFront() {
            // this.Checker&&this.BoardCanvas.canvas.bringToFront(this.Checker)
        },
        animover() {
            return [this.backimg, x=>x-chbackshift, y=>y-chbackshift]
        }
    }
    /**
     * Расстваляет по полю призраки пешек куда человек сможет сделать ход с выбранной пешки
     * @requires this.gc.UserMovesFrom(fromIndex) to get list of accesible slots
     * @requires FRONT::DROPS::Accept([Dices]) to accept drops over
     * @requires this.clearGhosts() on click to ghost we hide other ghost because User *commanded* to Move
     * @requires this.gc.move(fromIndex,toIndex) on click to ghost
     * @requires this.moveChecker(fromIndex,toIndex) on click to ghost
     * @param {int} fromIndex 
     */
    showGhostsCheckersOfAccesibleSlots(fromIndex, onmove) {
        const self = this;
        const BoardCanvas = this.BoardCanvas;
        // for (let ghost of this.enabledGhosts) this.canvas.remove(ghost.img);
        this.clearGhosts();
        /** @type {Array.<[string, (int[]|[Number, Number])]>} */
        const availableKeys = Object.entries(BoardCanvas.gc.UserMovesFrom(fromIndex));
        const ghosts = availableKeys.map(([key, points])=>{
            if (key === WHITE.over || key === BLACK.over) {
                // TODO: DropRegion
                BoardCanvas.drops[key].accept(points).then(()=>move(key), ()=>{});
                // let team = key === WHITE.over ? 0 : 1;
                // this.createGhost(key, this.dropped[team].count(), fromIndex)
                return new Promise(resolve=>resolve());
            }
            // this.createGhost(key, this.slots[key].count(), fromIndex);
            return self.createGhostChecker(key, BoardCanvas.slots[key].count(), move);
        });
        Promise.all(ghosts).then(()=>self.selectionChecker.bringToFront());
        function move(slotIndex) {
            if(self.moving) return;
            if(!self.BoardCanvas.gc.move(fromIndex, slotIndex)) alert('some error in checker move command..');
            self.BoardCanvas.moveChecker(fromIndex, slotIndex);//Стоит ли делать типа список "сделанных ходов но не подтверждённых?"
            self.clearGhosts();
            onmove?.();
        }
        return availableKeys;
    }
    clear() {
        this.clearGhosts();
    }
    clearGhosts() {
        this.yellowCheckersClear()
        this.selectionChecker.reset()
        this.BoardCanvas.drops[WHITE.over].clear()
        this.BoardCanvas.drops[BLACK.over].clear()
        return (this.enabledGhosts.map(([ghostimg])=>this.BoardCanvas.canvas.remove(ghostimg)), this.enabledGhosts.length=0);
    }
    yellowCheckers = []
    /**
     * 
     * @param {[int, int][]} indexes 
     */
    showCheckersWhichCanMove() {
        this.clear()
        this.yellowCheckers = this.BoardCanvas.gc.MovesByDices().map(([awa, index])=>{
            const checker = this.BoardCanvas.slots[index].last();
            checker.img.filters.push(new fabric.Image.filters.BlendColor({
                color: 'yellow', 
                alpha: 0.5, 
                mode:'tint'
            }))
            checker.img.applyFilters();
            return checker;
        })
        this.BoardCanvas.canvas.renderAll();
    }
    yellowCheckersClear() {
        this.yellowCheckers.map(checker=>(checker.img.filters.length=0, checker.img.applyFilters()))
        this.yellowCheckers = [];
        this.BoardCanvas.canvas.renderAll();
    }
    /**
    * @param {int} slotIndex
    * @param {int} checkerIndex 
    * @returns {Promise.<[fabricImage, Number, Number]>}
    */
   createGhostChecker(slotIndex, checkerIndex, onmove) {
       const self = this;
       return self.BoardCanvas.installImg(ghostcheckerpicurl, {
               left: posX(slotIndex),
               top: posY(slotIndex, checkerIndex)
           }).then(img=>{
               img.on('added', () => img.moveTo(checkerIndex));
               img.on('mousedown', ()=>onmove(slotIndex));
               self.BoardCanvas.canvas.bringToFront(img);
               self.enabledGhosts.push([img, slotIndex, checkerIndex]);

               return ([img, slotIndex, checkerIndex]);
           })
    }
    /**
     * 
     * @param {{left:int, top:int}}} param0 
     * @returns {[fabricImage, int, int]} img, slotIndex, checkerIndex
     */
    enteredIntoGhost({left, top, width, height}) {
        const [l, t] = [
            left + width/2,
            top + height/2
        ]
        const VerticalBoundsShift = 70;
        const HorizontalBoundsShift = 70;
        for(const [img, slotIndex, checkerIndex] of this.enabledGhosts) {
            // if(top > img.top && top < img.top + img.height
            //     && left > img.left && left < img.left + img.width)
            //         return [img, slotIndex, checkerIndex]; 
            if(t > img.top-VerticalBoundsShift && t < img.top + img.height+VerticalBoundsShift
                && l > img.left && l < img.left + img.width)
                    return [img, slotIndex, checkerIndex]; 
        }
        for(const [img, slotIndex, checkerIndex] of this.enabledGhosts) {
            // if(top > img.top && top < img.top + img.height
            //     && left > img.left && left < img.left + img.width)
            //         return [img, slotIndex, checkerIndex]; 
            if(t > img.top-VerticalBoundsShift && t < img.top + img.height+VerticalBoundsShift
                && l+HorizontalBoundsShift > img.left && l - HorizontalBoundsShift < img.left + img.width)
                    return [img, slotIndex, checkerIndex]; 
        }
        return null;
    }
}
export class BoardCanvas extends CanvasFunctions {
    /** @type {Slot[]} */
    slots = []
    /** @type {{whiteover:TopDropLunk, blackover:TopDropLunk} */
    drops
    /** @type {{UserMovesFrom, move, MovesByDices}} */
    gc
    /** @type {BoardCanvasEffects} */
    _effects
    /**
     * 
     * @param {[Number, Number][]} GSlots 
     * @param {[Number, Number]} GDropped 
     * @param {{UserMovesFrom:Function, move:Function, UserMovesFrom:Function}} param2 
     */
    constructor(GSlots, GDropped, gc) {
        super('canvas');
        const canvas = canva = this.canvas;

        board = this; //debug
        console.log(`[BoardCanvas]: vars inited`)
        const self = this;
        this.gc = gc; //provides
        this._effects = new BoardCanvasEffects(this);

        // slot = {
        //     Checker -> Slot{}
        //     Checker.onclick -> [Checker.Slot] -> Slot.onclick
        //     Checker.moving -> [Checker.Slot] -> Slot.movings { moving if is head of slot, moving if is User.team === Slot.Colour, moving if is Your step, moving if is can step}
        //     Slots.moveChecker -> Slot.moveToSlot(Slot)
        //     Slot -> CanvasCallBacks
        //      {* SelectionJumper : State of FromImage, Jumps to ToImage and clear FromImage*}
        // }
        this.eventHandlers = {
            /**
             * @param {TState} newstate 
             */
            newstate: newstate=>{

            }
        }

        super.setbackground(gameboardpic);

        this.drops = drop = {
            [WHITE.over]: new TopDropLunk('Top', GDropped[0]),
            [BLACK.over]: new TopDropLunk('Bottom', GDropped[1])
        };
        
        const PromisesOfCreatingPictures = Promise.all(GSlots.map((slotinfo, slotIndex)=>{
                const slot = new refToArr(slotinfo);
                const SlotLet = self.slots[slotIndex] = new Slot(slotIndex);
                return range(0,slot.Count)
                        .map(checkerIndex=>self.createChecker(slot.Colour, SlotLet, checkerIndex).then(
                            ([CheckerObj, slotIndex, checkerIndex])=>{
                                SlotLet.checkers[checkerIndex]=CheckerObj
                                CheckerObj.img.lockMovementX = CheckerObj.img.lockMovementY = checkerIndex !== (slot.Count-1)
                                return [CheckerObj, slotIndex, checkerIndex];
                            }));
            }).flat(1)).then(ValidatingCheckersLayouting);
        // const PromiseOfCreatingDroppedPictures = Promise.all(GDropped.map((Count, teamLeft)=>{
        //         const droppedPic = teamLeft===0?whitecheckerpicurl:blackcheckerpicurl;
        //         const droppedTeam = teamLeft===0? WHITE.over : BLACK.over;
        //         return range(0, Count)
        //                 .map(checkerIndex=>self.createImg(droppedPic, droppedTeam, checkerIndex))
        //     }).flat(1)).then(ValidatingCheckersLayouting);
        /**
         * 
         * @param {[Checker, Number, Number][]} arr 
         * @returns {[Checker, Number, Number][]}
         */
        function ValidatingCheckersLayouting (arr) {
            return (arr.map(([CheckerObj, slotIndex, checkerIndex])=>{
                /** @type {fabricImage} */
                const CheckerIMG = CheckerObj.img;
                CheckerIMG.moveTo(checkerIndex);
                CheckerIMG.set("top", posY(slotIndex, checkerIndex, 0, 0));
                CheckerIMG.setCoords();
            }), arr)
        }

        // function CanvasValidate() {
        //     const width = containerOfBoard.clientWidth;
        //     // const width = window.innerWidth;
        //     if(width < 950) self.GetCanvasAtResoution(width);
        //     else if (width < 1207) self.GetCanvasAtResoution(width - 372);
        //     else if (width) {
        //         const w = width - 506;
        //         const h = document.body.clientHeight - 90 - 37;
        //         self.GetCanvasAtResoution(w > h ? h : w);
        //     }
        // }
        const containerOfBoard = ondom.then(()=>document.getElementsByClassName('domino-game-page__body-wrapper')[0])
        const CanvasValidate = async()=>{
            const width = (await containerOfBoard).clientWidth;
            const pageheight = document.body.clientHeight - 90 - 37;
            const newWidth = width<950?width:width<1207?width-372:maybeHeight(width)>pageheight?widthIfHeight(pageheight):width;
            function maybeHeight(width) {
                return width/BoardWidth*BoardHeight
            }
            function widthIfHeight(height) {
                return height/BoardHeight*BoardWidth
            }
            return this.enterContentToViewBox(newWidth)
        }
        window.addEventListener('resize', ()=>(CanvasValidate(),CanvasValidate()));
        window.addEventListener('load', ()=>sleep(300).then(CanvasValidate(),CanvasValidate()));
        CanvasValidate(); CanvasValidate();
    }
    /** @type {{diceNumber:int, img:fabricImage, remove:Function}} */
    _dices = []
    /**
     * @param {int} firstDice 
     * @param {int} secondDice 
     * @param {*} ActiveTeam 
     */
    createDices(firstDice, secondDice, ActiveTeam) {
        const _dices = this._dices
        _dices.map(Dice => Dice.remove());
        this._dices = [];
        const self = this;
        const scale = 230/130;
        const sideleft = +BordersByX[0]+(ActiveTeam===WHITE.id?BoardSidesSize[0]+BordersByX[1]:0)
        const dicesize = scale*328; const space = -55*2;
        const currentSideSize = BoardSidesSize[ActiveTeam===BLACK.id?1:0]

        class Dice {
            spended = false;
            removed = false;
            imgpromise
            constructor(diceNumber, left) {
                this.diceNumber = diceNumber;
                this.imgpromise = self.installImg(`/img/backgammons/${ActiveTeam===WHITE.id?'wwdice_':'bldice_'}${diceNumber}.png`, {
                    left, top: BoardHeight/2-dicesize/4, scaleX:scale, scaleY:scale,
                    hoverCursor: 'pointer',
                    // shadow: 'green -5px -5px 3px'
                }).then(dice=>{
                    this.img = dice;
                    this.img.rotate(-45)
                    this.img.on('mousedown', ()=>self._effects.showCheckersWhichCanMove())
                    // img.filters.push(fabric.Image.filters.BlackWhite());
                    // this.img.applyFilters();
                    // self.canvas.renderAll();
                    self.canvas.bringToFront(dice);
                    return dice;
                });
            }
            spend() {
                if(this.spended || this.removed) return;
                const Dice = this;
                this.spended = true;
                this.img.filters.push(new fabric.Image.filters.BlendColor({
                                                color: 'yellow', 
                                                alpha: 0.5, 
                                                mode:'tint'
                                            }))
                this.img.applyFilters();
                self.canvas.renderAll();
                sleep(375).then(removeif)//не знаю удалятся ли картинки пока канвас придумает им фильтры
                function removeif() { if(Dice.removed) self.canvas.remove(Dice.img); }
            }
            async remove() {
                this.removed = true;
                this.imgpromise.then(img=>self.canvas.remove(img));
            }
        }

        if(firstDice!==secondDice) {
            const firstDicePos = sideleft - (dicesize/2 + space/2) + currentSideSize/2;
            this._dices.push(new Dice(firstDice, firstDicePos), new Dice(secondDice, firstDicePos+space+dicesize/2))
        } else {
            const firstDicePos = sideleft - 2*(dicesize/2 + space) + currentSideSize/2 + space/4;
            this._dices.push(new Dice(firstDice, firstDicePos),
                             new Dice(firstDice, firstDicePos+space+dicesize/2),
                             new Dice(secondDice, firstDicePos+2*(space+dicesize/2)), 
                             new Dice(secondDice, firstDicePos+3*(space+dicesize/2)))
        }
    }
    setPTS(pts) {
        const _dices = this._dices;
        if(pts.length === 1 && _dices.length === 2)
            _dices.map(Dice=>Dice.diceNumber!==pts[0]&&Dice.spend());
        else if(pts.length === 2 && _dices.length === 2)
            _dices.map(Dice=>Dice.spend());
        else
            _dices.map((Dice, i)=>i<(4-pts.length)&&Dice.spend());
    }
    /**
     * @param {int} Colour 1,2 -- colour, 0 -- ghost
     * @param {Slot} SlotLet 
     * @param {int} checkerIndex 
     * @returns {Promise.<[Checker, Number, Number]>}
     */
    createChecker(Colour, SlotLet, checkerIndex) {
        const self = this;
        const slotIndex = SlotLet.index;
        return this.installImg(CHECKERS_TEXTURES[Colour], {
                left: posX(slotIndex),
                top: posY(slotIndex, checkerIndex)
            }).then(img=>{
                const checkerFromImg = new Checker(img, SlotLet, Colour);
                let startpos = {left:0, top:0};
                img.on('mousedown', () => {
                    const {left, top} = checkerFromImg.img;
                    startpos = {left, top};
                    // if (slotIndex !== WHITE.over && slotIndex !== BLACK.over)
                    const awa = self._effects.showGhostsCheckersOfAccesibleSlots(checkerFromImg.slot.index);
                    if(!img.filters.length) 
                        self._effects.selectionChecker.set(checkerFromImg.slot.last(), awa.length);
                });
                img.on('moving', () => {
                    this._effects.moving = true;
                    checkerFromImg?.abortanim?.();
                    this._effects.selectionChecker.moveTo(img);
                })
                img.on('mouseup', ()=>{
                    this._effects.moving = false;
                    const enteredTo = this._effects.enteredIntoGhost(img);
                    if(enteredTo) {
                        if(!self.gc.move(checkerFromImg.slot.index, enteredTo[1])) alert('some error in checker move command..');
                        self._effects.clearGhosts();
                        self.moveChecker(checkerFromImg.slot.index, enteredTo[1])
                    } else {
                        if(Colour === WHITE.id && img.top < 10 && this.drops[WHITE.over].resolver) {
                            this.drops[WHITE.over].resolver()
                        } else if(Colour === BLACK.id && img.top+img.height > BoardHeight-66 && this.drops[BLACK.over].resolver) {
                            this.drops[BLACK.over].resolver()
                        } else self.moveChecker(checkerFromImg.slot.index,
                                                checkerFromImg.slot.index, false, 
                                                            this._effects.selectionChecker.animover())
                    }
                })

                return ([checkerFromImg, slotIndex, checkerIndex]);
            })
    }
    /**
     * 
     * @param {int} from 
     * @param {int} to 
     */
    moveChecker(from, to, clear=true, umimg) {
        clear&&this._effects.clearGhosts();
        const {canvas} = this;
        let isOver = to === WHITE.over || to === BLACK.over;
        const checker = (from === WHITE.over || from === BLACK.over)
                                        ? alert('moveChecker from Over?? in CanvasRender.js')
                                        : this.slots[from].getRemoveLast()
        
        if(isOver) {
            const drop = this.drops[to];
            const Direction = {[WHITE.over]:-checkerSize, [BLACK.over]:BoardHeight+checkerSize}[to]
            checker.img.animate('left', checker.img.left, {
                duration: 400,
                onChange: canvas.renderAll.bind(canvas)
            })
            checker.img.animate('top', Direction, {
                duration: 400,
                onChange: canvas.renderAll.bind(canvas)
            })
            sleep(400).then(()=>drop.append())
            // drop.append();
        } else {
            const checkerIndex = this.slots[to].count();
            let abort = false;
            const [x, y] = [posX(to), posY(to, checkerIndex, indent, -indent)]
            const list = umimg?[[checker.img, x=>x, y=>y], umimg]:[[checker.img, x=>x, y=>y]]
            for(const [improm, xer, yer] of list){
                (async() => {
                    const img = await improm;
                    img.animate('left', xer(x), {
                        duration: 400,
                        onChange: canvas.renderAll.bind(canvas),
                        abort: ()=>abort
                    })
                    img.animate('top', yer(y), {
                        duration: 400,
                        onChange: canvas.renderAll.bind(canvas),
                        abort: ()=>abort
                    })
                })();
            }
            checker.abortanim = ()=>abort=true;
            checker.slot = to;
            canvas.bringToFront(checker.img)
            this.slots[to].add(checker);
        }
    }
}


// function resetGame(){
//     for (let team = 0; team < 2; team++){
//         let length =  dropped[team].count();
//         for (let checkerIndex = 0; checkerIndex < length; checkerIndex++){
//             moveChecker(team === 0 ? WHITE.over : BLACK.over, team === 0 ? 0 : 12);
//         }
//     }
// }
