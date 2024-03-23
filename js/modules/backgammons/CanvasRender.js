import { range, $myeval, ondom, sleep, black } from "./Utilities.js";
import { BoardConstants, refToArr, slotinfo } from "./BoardConstants.js";
const { WHITE, BLACK, EMPTY } = BoardConstants; 

var scaleFactor = 1.3;
var indent = 14;
fabric.isWebglSupported(fabric.textureSize);
class Checker {
    /**@type {fabricImage} */ 
    img
    /**@type {int} */ 
    slot
    /**
     * 
     * @param {fabricImage} img 
     * @param {int} slot 
     */
    constructor(img, slot) {
        this.img = img;
        this.slot = slot;
    }
}

class Slot {
    /** @type {Checker[]} */
    checkers = [];

    /** @param {Checker} checker  */
    add(checker) {
        this.checkers.push(checker);
    }

    get(checkerIndex){
        return this.checkers[checkerIndex];
    }

    getRemoveLast() {
        if (this.checkers.length < 1) return false;
        return this.checkers.pop();
    }

    count() {
        return this.checkers.length;
    }
}
const genStaticImgClass = (scF)=>class {
    constructor(attributes) {
        return Object.assign({
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockScalingFlip: false,
            selectable: false,
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
        gameboardpic: `img/backgammons/bcbg.png`
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
    let StaticImg = genStaticImgClass(checkerSize/66)

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
    installImg(texture, additional) {//TODO: rebase
        const self = this;
        return new Promise(resolve=>fabric.Image.fromURL(texture, function (rawImg) {
                // console.log(additional)
                const img = rawImg.set(new StaticImg(additional));
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
        ondom.then(()=>{
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
            const resolver = val=>()=>resolve(val)
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

export class BoardCanvas extends CanvasFunctions {
    /** @type {Slot[]} */
    slots = []
    /** @type {Checker[]} */
    enabledGhosts = []
    /** @type {TopDropLunk[]} */
    drops
    /** @type {{UserMovesFrom, move}} */
    gc
    /**
     * 
     * @param {[Number, Number][]} GSlots 
     * @param {[Number, Number]} GDropped 
     * @param {{UserMovesFrom:Function, move:Function}} param2 
     */
    constructor(GSlots, GDropped, {UserMovesFrom, move}) {
        super('canvas');
        const canvas = canva = this.canvas;
        board = this;
        console.log(`[BoardCanvas]: vars inited`)
        const self = this;
        this.gc = {UserMovesFrom, move};

        // slot = {
        //     Checker -> Slot{}
        //     Checker.onclick -> [Checker.Slot] -> Slot.onclick
        //     Checker.moving -> [Checker.Slot] -> Slot.movings { moving if is head of slot, moving if is User.team === Slot.Colour, moving if is Your step, moving if is can step}
        //     Slots.moveChecker -> Slot.moveToSlot(Slot)
        //     Slot -> CanvasCallBacks
        //      {* SelectionJumper : State of FromImage, Jumps to ToImage and clear FromImage*}
        // }
        this.selectionChecker.canvasRenderAll = ()=>canvas.renderAll();
        this.shared = {
            /**
             * moves pic
             * @param {fabricImage} subject 
             * @param {int} toX 
             * @param {int} toY 
             * @returns {Promise.<void>} resolves after duration
             */
            movesubject: (subject, toX=undefined, toY=undefined, duration=400)=>{
                subject.animate('left', toX, {
                    duration, onChange: canvas.renderAll.bind(canvas)
                })
                subject.animate('top', toY, {
                    duration, onChange: canvas.renderAll.bind(canvas)
                })
                return sleep(duration);
            },
            /**
             * 
             * @param {[Number, Number][]} positions 
             * @returns 
             */
            resetghosts: (positions)=>{},
            /**
             * work with lightning
             * @param {*} dyns 
             */
            resetDynamics: (dyns) => {}
        }

        super.setbackground(gameboardpic);

        this.drops = drop = {
            [WHITE.over]: new TopDropLunk('Top', GDropped[0]),
            [BLACK.over]: new TopDropLunk('Bottom', GDropped[1])
        };
        // [...Array(24).keys()].map(i=>this.createChecker(1, i, 0));
        // this.createChecker(1, 0, 0);
        // this.createChecker(1, 1, 2);
        
        const PromisesOfCreatingPictures = Promise.all(GSlots.map((slotinfo, slotIndex)=>{
                const slot = new refToArr(slotinfo);
                const SlotLet = self.slots[slotIndex] = new Slot();
                return range(0,slot.Count)
                        .map(checkerIndex=>self.createChecker(slot.Colour, slotIndex, checkerIndex).then(
                            ([CheckerObj, slotIndex, checkerIndex])=>{
                                SlotLet.checkers[checkerIndex]=CheckerObj
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
        const scale = (328/328)*1.2;
        const sideleft = +BordersByX[0]+(ActiveTeam===WHITE.id?BoardSidesSize[0]+BordersByX[1]:0)
        const dicesize = scale*328; const space = 10;
        const currentSideSize = BoardSidesSize[ActiveTeam===BLACK.id?1:0]

        class Dice {
            spended = false;
            removed = false;
            imgpromise
            constructor(diceNumber, left) {
                this.diceNumber = diceNumber;
                this.imgpromise = self.installImg(`/img/backgammons/${ActiveTeam===WHITE.id?'wdice_':'bdice_'}${diceNumber}.png`, {
                    left, top: BoardHeight/2-dicesize/8, scaleX:scale, scaleY:scale,
                    hoverCursor: 'pointer',
                }).then(dice=>{
                    this.img = dice;
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
            const firstDicePos = sideleft - 2*(dicesize/2 + space/2) + currentSideSize/2;
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
    selectionChecker = {
        Checker:null,
        canvasRenderAll:()=>{},
        set(Checker, awa) {
            this.reset();
            this.Checker = Checker;
            this.Checker.img.filters.push(new fabric.Image.filters.BlendColor({
                            color: awa?'yellow':'red', 
                            alpha: 0.5, 
                            mode:'tint'
                        }))
            this.Checker.img.applyFilters();
            this.canvasRenderAll();
        },
        reset() {
            if(!this.Checker) return;
            this.Checker.img.filters.length = 0;
            this.Checker.img.applyFilters();
            this.canvasRenderAll();
            this.Checker = null;
        }
    }
    actualCheckers = {
        Checkers: []
        
    }
    /**
     * @param {int} Colour 1,2 -- colour, 0 -- ghost
     * @param {int} slotIndex 
     * @param {int} checkerIndex 
     * @returns {Promise.<[Checker, Number, Number]>}
     */
    createChecker(Colour, slotIndex, checkerIndex) {
        const self = this;
        return this.installImg(CHECKERS_TEXTURES[Colour], {
                left: posX(slotIndex),
                top: posY(slotIndex, checkerIndex)
            }).then(img=>{
                const checkerFromImg = new Checker(img, slotIndex);
                Colour&&img.on('mousedown', () => {
                    // if (slotIndex !== WHITE.over && slotIndex !== BLACK.over)
                    const awa = self.showGhostsCheckersOfAccesibleSlots(checkerFromImg.slot);
                    if(Colour&&!img.filters.length) 
                        self.selectionChecker.set(checkerFromImg, awa.length);
                });

                return ([checkerFromImg, slotIndex, checkerIndex]);
            })
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
        // for (let ghost of this.enabledGhosts) this.canvas.remove(ghost.img);
        this.clearGhosts();
        /** @type {Array.<[string, (int[]|[Number, Number])]>} */
        const availableKeys = Object.entries(this.gc.UserMovesFrom(fromIndex));
        for (const [key, points] of availableKeys) {
            if (key === WHITE.over || key === BLACK.over) {
                // TODO: DropRegion
                this.drops[key].accept(points).then(()=>move(key), ()=>{});
                // let team = key === WHITE.over ? 0 : 1;
                // this.createGhost(key, this.dropped[team].count(), fromIndex)
                continue;
            }
            // this.createGhost(key, this.slots[key].count(), fromIndex);
            this.createChecker(0, key, this.slots[key].count()).then(
                ([CheckerObj, slotIndex, checkerIndex])=>{
                    CheckerObj.img.on('added', () => CheckerObj.img.moveTo(checkerIndex));
                    CheckerObj.img.on('mousedown', ()=>move(slotIndex));
                    self.canvas.bringToFront(CheckerObj.img);
                    self.enabledGhosts.push(CheckerObj);
                }
            );
        }
        function move(slotIndex) {
            if(!self.gc.move(fromIndex, slotIndex)) alert('some error in checker move command..');
            self.moveChecker(fromIndex, slotIndex);//Стоит ли делать типа список "сделанных ходов но не подтверждённых?"
            self.clearGhosts();
            onmove?.();
        }
        return availableKeys;
    }
    clearGhosts() {
        this.selectionChecker.reset()
        this.drops[WHITE.over].clear()
        this.drops[BLACK.over].clear()
        return this.enabledGhosts.map(ghost=>this.canvas.remove(ghost.img));
    }
    /**
     * 
     * @param {int} from 
     * @param {int} to 
     */
    moveChecker(from, to) {
        this.clearGhosts();
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
            checker.img.animate('left', posX(to), {
                duration: 400,
                onChange: canvas.renderAll.bind(canvas)
            })
            checker.img.animate('top', posY(to, checkerIndex, indent, -indent), {
                duration: 400,
                onChange: canvas.renderAll.bind(canvas)
            })
            checker.slot = to;
            canvas.bringToFront(checker.img)
            this.slots[to].add(checker);
        }
    }
}
export class _BoardCanvas {
    dropped = [new Slot(), new Slot()]
    slots = []
    enabledGhosts = []
    dices = [0,0]

    constructor(GSlots, GDropped, gc) {
        const self = this;
        this.gc = gc;
        Object.assign(this, {whitecheckerpicurl, blackcheckerpicurl, 
            ghostcheckerpicurl, gameboardpic});

        const setBackgroundImage = ()=>new Promise(resolve=>
            fabric.Image.fromURL(gameboardpic, function (bgImg) {
                canvas.setBackgroundImage(bgImg,
                    canvas.renderAll.bind(canvas), {
                        scaleX: canvas.width / bgImg.width,
                        scaleY: canvas.height / bgImg.height
                    });
                bgImg.on("mousedown", () => 
                    self.enabledGhosts.map(ghost=>canvas.remove(ghost.img))
                );//enabledGhosts.map.bind(enabledGhosts, canvas.remove.bind(canvas, Extract.$1.img))
                resolve(bgImg);
            })); 
        
        const vg = document.getElementsByClassName('domino-game-page__body-wrapper');
        // function init() {
        const canvas = this.canvas = new fabric.Canvas('canvas', {preserveObjectStacking: true});
        canvas.setWidth(initWidth);
        canvas.setHeight(initHeight);
        scaleFactor = initWidth/BoardWidth;
        StaticImg = genStaticImgClass(66/checkerSize*0.8);

        let GetCanvasAtResoution;
        const reinit = self.reinit = async function (GSlots, GDropped) {
            canvas.clear();
            const canvasbackimgProm = setBackgroundImage();
            canvas.selection = false;
            //iterates for GameModel.Slots
            const PromisesOfCreatingPictures = Promise.all(GSlots.map((slotinfo, slotIndex)=>{
                    const slot = new refToArr(slotinfo);
                    self.slots[slotIndex] = new Slot();
                    const pic = slot.Colour === WHITE.id ? whitecheckerpicurl : blackcheckerpicurl;
                    return range(0,slot.Count)
                            .map(checkerIndex=>self.createImg(pic, slotIndex, checkerIndex));
                }).flat(1))
            const PromiseOfCreatingDroppedPictures = Promise.all(GDropped.map((Count, teamLeft)=>{
                    const droppedPic = teamLeft===0?whitecheckerpicurl:blackcheckerpicurl;
                    const droppedTeam = teamLeft===0? WHITE.over : BLACK.over;
                    return range(0, Count)
                            .map(checkerIndex=>self.createImg(droppedPic, droppedTeam, checkerIndex))
                }).flat(1));
            const ValidatingCheckersLayouting = arr=>arr.map(([CheckerObj, slotIndex, checkerIndex])=>{
                    /** @type {fabricImage} */
                    const CheckerIMG = CheckerObj.img;
                    CheckerIMG.moveTo(checkerIndex);
                    CheckerIMG.set("top", self.posYFromIndex(slotIndex, checkerIndex, 0, 0));
                    CheckerIMG.setCoords();
                })
            const OnLoad = Promise.all([
                PromisesOfCreatingPictures.then(ValidatingCheckersLayouting), 
                PromiseOfCreatingDroppedPictures.then(ValidatingCheckersLayouting)
            ]);
            return Promise.all([OnLoad, canvasbackimgProm]).then(
                async init => this.canvasbackimg = await canvasbackimgProm
            )
        }
        self.reinit(GSlots, GDropped).then(async init=>{
            function CanvasValidate() {
                const width = vg[0].clientWidth;
                // const width = window.innerWidth;
                if(width < 950) self.GetCanvasAtResoution(width);
                else if (width < 1207) self.GetCanvasAtResoution(width - 372);
                else if (width) {
                    const w = width - 506;
                    const h = document.body.clientHeight - 90 - 37;
                    self.GetCanvasAtResoution(w > h ? h : w);
                }
            }

            CanvasValidate();
            window.addEventListener('resize', CanvasValidate);
        })

        // }
    }
    GetCanvasAtResoution(newWidth) {
        const {canvas, canvasbackimg} = this;
        if (canvas.width != newWidth) {
            var scaleMultiplier = newWidth / canvas.width;
            scaleFactor *= scaleMultiplier
            // console.log('scmulti', scaleMultiplier, scaleFactor);
            var objects = canvas.getObjects();
            for (var i in objects) {
                objects[i].scaleX = objects[i].scaleX * scaleMultiplier;
                objects[i].scaleY = objects[i].scaleY * scaleMultiplier;
                objects[i].left = objects[i].left * scaleMultiplier;
                objects[i].top = objects[i].top * scaleMultiplier;
                objects[i].setCoords();
            }
            canvas.setBackgroundImage(canvasbackimg,
                canvas.renderAll.bind(canvas), {
                    scaleX: canvas.getWidth() * scaleMultiplier / canvasbackimg.width,
                    scaleY: canvas.getHeight() * scaleMultiplier / canvasbackimg.height
                });
            canvas.setWidth(canvas.getWidth() * scaleMultiplier);
            canvas.setHeight(canvas.getHeight() * scaleMultiplier);
            canvas.renderAll();
            canvas.calcOffset();
        }
    }
    moveChecker(from, to) {
        const {canvas, dropped} = this;
        let isOver = to === WHITE.over || to === BLACK.over;
        let checker = null
        if (from !== WHITE.over && from !== BLACK.over)  checker = this.slots[from].getRemoveLast();
        else checker = dropped[from === WHITE.over ? 0 : 1].getRemoveLast();
        let checkerIndex = isOver ? this.dropped[to === WHITE.over ? 0 : 1].count()
            : this.slots[to].count();
        checker.img.animate('left', this.posXFromIndex(to), {
            duration: 400,
            onChange: canvas.renderAll.bind(canvas)
        })
        checker.img.animate('top', this.posYFromIndex(to, checkerIndex, indent, -indent), {
            duration: 400,
            onChange: canvas.renderAll.bind(canvas)
        })
        checker.slot = to;
        canvas.bringToFront(checker.img)
        if(!isOver) this.slots[to].add(checker);
        else dropped[to === WHITE.over ? 0 : 1].add(checker);
    }
    
    posXFromIndex(index) {
        if(typeof $myeval(index) === 'string') {
            return BoardWidth/2*scaleFactor - ((index===BLACK.over)?66:0);
        }
        return posX(index,) * scaleFactor;
        if (index === WHITE.over) return 272.5 * scaleFactor + 34.3 * 6 * scaleFactor;
        if (index === BLACK.over) return 193.5 * scaleFactor - 34.3 * 6 * scaleFactor;
        if (index >= 0 && index < 6) return 444 * scaleFactor - 34.3 * index * scaleFactor;
        if (index >= 6 && index < 12) return 193.5 * scaleFactor - 34.3 * (index - 6) * scaleFactor;
        if (index >= 12 && index < 18) return 22 * scaleFactor + 34.3 * (index - 12) * scaleFactor;
        if (index >= 18 && index < 24) return 272.5 * scaleFactor + 34.3 * (index - 18) * scaleFactor;
    }
    posYFromIndex(index, checkerIndex, indentTop, indentDown) {
        if(typeof $myeval(index) === 'string') {
            return BoardHeight/3*scaleFactor + checkerIndex*33;
        }
        return posY(index, checkerIndex) * scaleFactor;
        if (index === BLACK.over || index >= 0 && index < 12) return 24 * scaleFactor + 10 * checkerIndex * scaleFactor + indentTop;
        if (index === WHITE.over || index >= 12 && index < 24) return 349 * scaleFactor - 10 * checkerIndex * scaleFactor + indentDown;
    }
    showGUI(fromSlot) { //TODO: rebase
        for (let ghost of this.enabledGhosts) this.canvas.remove(ghost.img);
        let availableKeys = Object.keys(this.gc.UserMovesFrom(fromSlot));
        for (let key of availableKeys) {
            if (key === WHITE.over || key === BLACK.over) {
                let team = key === WHITE.over ? 0 : 1;
                this.createGhost(key, this.dropped[team].count(), fromSlot)
                continue;
            }
            this.createGhost(key, this.slots[key].count(), fromSlot);
        }
    }
    createImg(texture, slotIndex, checkerIndex, ) {//TODO: rebase
        const self = this;
        return new Promise(resolve=>
        fabric.Image.fromURL(texture, function (rawImg) {
                let img = rawImg.set(new StaticImg({
                    left: self.posXFromIndex(slotIndex),
                    top: self.posYFromIndex(slotIndex, checkerIndex, 0, 0),
                }));
                let checkerFromImg = new Checker(img, slotIndex);
                img.on('mousedown', () => {
                    if (slotIndex !== WHITE.over && slotIndex !== BLACK.over)
                        self.showGUI(checkerFromImg.slot);
                });
                if (slotIndex !== WHITE.over && slotIndex !== BLACK.over)
                    self.slots[slotIndex].checkers[checkerIndex]=checkerFromImg;
                else
                    self.dropped[slotIndex === WHITE.over ? 0 : 1].add(checkerFromImg);
                self.canvas.add(img)
                resolve([img, slotIndex, checkerIndex]);
            }));
    }
    createGhost(slotIndex, checkerIndex, fromSlot) {//TODO: rebase
        const self = this;
        const {canvas} = this;
        fabric.Image.fromURL(ghostcheckerpicurl, function (rawImg) {
                let img = rawImg.set(new StaticImg({
                    left: self.posXFromIndex(slotIndex),
                    top: self.posYFromIndex(slotIndex, checkerIndex, indent, -indent),
                }));
                let checkerFromImg = new Checker(img, slotIndex);
                img.on('added', () => img.moveTo(checkerIndex));
                img.on('mousedown', () => {
                    self.gc.move(fromSlot, slotIndex);
                    self.moveChecker(fromSlot, slotIndex);
                    for (let ghost of self.enabledGhosts) canvas.remove(ghost.img);
                });
                canvas.add(img);
                canvas.bringToFront(img);
                self.enabledGhosts.push(checkerFromImg);
            });
    }
    diceImageUrl(diceNumber){
        return `/img/dices${diceNumber}.png`;
        return $PageSnapshotData.Graphics[`dice${diceNumber}url`];
    }
    createDice(diceUrl, currentPlayer, diceIndex){ // TODO: приватный метод, не вызывать извне.
        const {canvas, dices} = this;
        let stepBetweenDices = diceIndex * 200 * scaleFactor;
        let whitePosX = BoardWidth/1.7 * scaleFactor + stepBetweenDices;
        let blackPosX = BoardWidth/6 * scaleFactor + stepBetweenDices;
        // let image;
        fabric.Image.fromURL(diceUrl, function (rawImage) {
            let img = rawImage.set(new StaticImg({
                left: currentPlayer === "white" ? whitePosX : blackPosX, // TODO: смени "white" на то, с чем будешь работать.
                top: (BoardHeight/2 - 328/6) * scaleFactor,
                scaleX: 0.7*scaleFactor,
                scaleY: 0.7*scaleFactor,
                hoverCursor: 'pointer'
            }));
    
            dices.push(img);
            canvas.add(img);
            canvas.bringToFront(img);
            image = img;
        })
        //this.animateDice(image);
    }
    createDices(firstDiceNumber, secondDiceNumber, currentPlayer){ // TODO: используй при создании кубиков во время нового хода.
        this.clearDices();
        this.createDice(this.diceImageUrl(firstDiceNumber), currentPlayer, 0);
        this.createDice(this.diceImageUrl(secondDiceNumber), currentPlayer, 1);
    }
    clearDices(){ // TODO: приватный метод.
        for (let dice of this.dices) {
            this.canvas.remove(dice);
        }
        this.dices.length = 0;
    }
    
    animateDice(dice){ // TODO: приватный метод.
        let original = dice.src;
        dice.animate('left', dice.left, {
            duration: 500, // TODO: поменяй длительность анимации.
            onChange: dice.src = this.randomDiceImageUrl()
        })
        dice.src = original;
    }
    
    randomDiceImageUrl(){
        return this.diceImageUrl(getRandomInt(6) + 1);
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
