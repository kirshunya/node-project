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
/** @type { BetsInfoList } */
const BetsInfo = require('./../../json/bets.json');
BetsInfo.BackgammonsBETS.mapPairs = (CB)=>Object.entries(BetsInfo.BackgammonsBETS).map(([betId, BetsInfo])=>CB(BetsInfo, +betId, BetsInfo.BackgammonsBETS));
BetsInfo.BackgammonsBETS.get = (betId)=>BetsInfo.BackgammonsBETS[betId];
module.exports = BetsInfo