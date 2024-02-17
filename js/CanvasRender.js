var scaleFactor = 1.3;
var indent = 14;

class Checker {
    constructor(img, slot) {
        this.img = img;
        this.slot = slot;
    }
}

class Slot {
    checkers = [];

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
        whitecheckerpicurl: `img/blackcell4.png`, 
        blackcheckerpicurl: `img/whitecell4.png`,
        ghostcheckerpicurl: `img/checker-white.png`, 
        gameboardpic: `img/bcbg.png`
    }
}
const [initWidth, initHeight] = [360, 480];
const BoardWidth = 1600;
const BoardHeight = 1850;
const BordersByX = [43,100,40];
const BordersByY = [56,0,-112];
const slotWidth = (BoardWidth - BordersByX.reduce((acc,n)=>acc+n))/12;
const slotHeight = (BoardHeight - BordersByY.reduce((acc,n)=>acc+n))/2;
const BoardSidesSize = [712, 712];

const slotMargin = -10;
const checkerSize = slotWidth - slotMargin*2;
let StaticImg 

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
                                                : BottomY  -  stepY*CheckerIndex;
const {whitecheckerpicurl, blackcheckerpicurl, 
    ghostcheckerpicurl, gameboardpic} = $PageSnapshotData.Graphics
class BoardCanvas {
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
            const PromisesOfCreatingPictures = Promise.all(GSlots.map((slot,slotIndex)=>{
                    self.slots[slotIndex] = new Slot();
                    const pic = slot.Colour === "white" ? whitecheckerpicurl : blackcheckerpicurl;
                    return range(0,slot.Count)
                            .map(checkerIndex=>self.createImg(pic, slotIndex, checkerIndex));
                }).flat(1))
            const PromiseOfCreatingDroppedPictures = Promise.all(GDropped.map((Count, teamLeft)=>{
                    const droppedPic = teamLeft===0?whitecheckerpicurl:blackcheckerpicurl;
                    const droppedTeam = teamLeft===0? "whiteOver" : "blackOver";
                    return range(0, Count)
                            .map(checkerIndex=>self.createImg(droppedPic, droppedTeam, checkerIndex))
                }).flat(1));
            const ValidatingCheckersLayouting = arr=>arr.map(([CheckerIMG, slotIndex, checkerIndex])=>{
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
        let isOver = to === "whiteOver" || to === "blackOver";
        let checker = null
        if (from !== "whiteOver" && from !== "blackOver")  checker = this.slots[from].getRemoveLast();
        else checker = dropped[from === "whiteOver" ? 0 : 1].getRemoveLast();
        let checkerIndex = isOver ? this.dropped[to === "whiteOver" ? 0 : 1].count()
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
        else dropped[to === "whiteOver" ? 0 : 1].add(checker);
    }
    
    posXFromIndex(index) {
        return posX(index,) * scaleFactor;
        if (index === "whiteOver") return 272.5 * scaleFactor + 34.3 * 6 * scaleFactor;
        if (index === "blackOver") return 193.5 * scaleFactor - 34.3 * 6 * scaleFactor;
        if (index >= 0 && index < 6) return 444 * scaleFactor - 34.3 * index * scaleFactor;
        if (index >= 6 && index < 12) return 193.5 * scaleFactor - 34.3 * (index - 6) * scaleFactor;
        if (index >= 12 && index < 18) return 22 * scaleFactor + 34.3 * (index - 12) * scaleFactor;
        if (index >= 18 && index < 24) return 272.5 * scaleFactor + 34.3 * (index - 18) * scaleFactor;
    }
    posYFromIndex(index, checkerIndex, indentTop, indentDown) {
        return posY(index, checkerIndex) * scaleFactor;
        if (index === "blackOver" || index >= 0 && index < 12) return 24 * scaleFactor + 10 * checkerIndex * scaleFactor + indentTop;
        if (index === "whiteOver" || index >= 12 && index < 24) return 349 * scaleFactor - 10 * checkerIndex * scaleFactor + indentDown;
    }
    showGUI(fromSlot) { //TODO: rebase
        for (let ghost of this.enabledGhosts) this.canvas.remove(ghost.img);
        let availableKeys = this.gc.moveFrom(fromSlot).keys;
        for (let key of availableKeys) {
            if (key === 'whiteOver' || key === 'blackOver') {
                let team = key === 'whiteOver' ? 0 : 1;
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
                    if (slotIndex !== "whiteOver" && slotIndex !== "blackOver")
                        self.showGUI(checkerFromImg.slot);
                });
                if (slotIndex !== "whiteOver" && slotIndex !== "blackOver")
                    self.slots[slotIndex].checkers[checkerIndex]=checkerFromImg;
                else
                    self.dropped[slotIndex === "whiteOver" ? 0 : 1].add(checkerFromImg);
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
        let image;
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
//             moveChecker(team === 0 ? "whiteOver" : "blackOver", team === 0 ? 0 : 12);
//         }
//     }
// }
