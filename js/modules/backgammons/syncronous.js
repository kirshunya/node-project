import { FCPromise, RewritablePromiseEmit } from "./Utilities.js";



function log(name) { return ()=>console.log(name); }
export const lobbyhubReady = FCPromise();
lobbyhubReady.then(log('lobbyhub'));
export const WSEventPoolReady = FCPromise();
WSEventPoolReady.then(log('WSEventPool'));
export const popupsinited = FCPromise();
popupsinited.then(log('popups'));
export const siteLanguageInited = new RewritablePromiseEmit();
siteLanguageInited.then(log('siteLanguage'));
/** @returns {Promise.<BetsInfoList>} */
const loadBetsInfo = ()=>fetch("./json/bets.json").then(localize=>localize.json()).then(BetsInfo=>{
    // BetsInfo.BackgammonsBETS = new Map(Object.entries(BetsInfo.BackgammonsBETS));
    BetsInfo._BackgammonsBETS = BetsInfo.BackgammonsBETS;
    BetsInfo.BackgammonsBETS.mapPairs = (CB)=>Object.entries(BetsInfo.BackgammonsBETS)
                                                        .map(([betId, BetsInfo])=>isNaN(+betId)||CB(BetsInfo, +betId, BetsInfo.BackgammonsBETS)).filter(res=>res!==true);
    BetsInfo.BackgammonsBETS.get = (betId)=>BetsInfo.BackgammonsBETS[betId];
    return BetsInfo;
})
export const BetsLoaded = loadBetsInfo();
BetsLoaded.then(bets=>console.log('bets', bets));

function whileundefined(nameCallBack, oncomplete) {
    const periodicChecker = setInterval(()=>{
        try{
            nameCallBack()
                ?(clearInterval(periodicChecker), oncomplete?.())
                :null
        } catch (e) {}
    }, 30);
}

export const fabricsloaded = new Promise(resolve=>whileundefined(()=>fabric, resolve));
fabricsloaded.then(log('fabric'));
export const swipersloaded = new Promise(resolve=>whileundefined(()=>Swiper, resolve));
swipersloaded.then(log('Swiper'));
export const axiosloaded = new Promise(resolve=>whileundefined(()=>axios, resolve));
axiosloaded.then(log('axios'));
/**
 * @typedef BetInfo
 * @property {number} bet
 * @property {number} comission
 */
/**
 * @typedef {{[betId:number]:BetInfo, mapPairs:(CB:(betInfo:BetInfo, betId:number, BetsInfoList:BackgammonsBETSContainer)=>any)=>any[], get(betId:number)=>BetInfo}} BackgammonsBETSContainer
 */
/** 
 * @typedef BetsInfoList
 * @property {BackgammonsBETSContainer} BackgammonsBETS
 * @property {{[betId:number]:BetInfo}} DominoBETS
 */