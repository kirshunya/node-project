//надо выделить функции finishGame для завершения игры и ведения статистики и startGame, для вычита баланса при старте игры и, возможно, если такое есть в сервисе, вести лог в бд
const { request } = require('express');
const { User, BackgammonsRooms, BackgammonGamesHistory, Stats, GamesSettings } = require('../models/db-models.js');
const { range } = require('./Utility.js');
const { getaWSS } = require('../backgamons.js');
const { Sequelize, Op } = require('sequelize');
const { BackgammonsBETS } = require('./BetsInfo.js');

// ======== UNIFIC ? ========
async function getUser(userId) { return await User.findOne({ where: { id: userId }, }); }
async function getStatsOf(userId) { return await Stats.findOne({ where: { id: userId }, }); }
/** @returns {FLOAT} */
async function getUserBalance(userId) { return (await getUser(userId)).balance; }
async function balanceTransaction(userId, balanceDifferncial) {
  try {
    const _user = await getUser(userId);
    const newbalance = _user.balance + balanceDifferncial;
    await _user.update({
        balance: newbalance,
    });
    sendUpdateBalance(userId, newbalance)
  } catch (e) {
    logInvalidTransaction(userId, balanceDifferncial, e);
  }
}
async function sendUpdateBalance(userId, balance) {
  const aWSS = getaWSS();
  for(const client of aWSS.clients) {
    console.log(client.ctx?.user, userId, client.ctx?.user?.userId === userId);
    if(client.ctx?.user?.userId === userId)
      client.ctx.send({method:'updateBalance', balance})
  }
}
function logInvalidTransaction(userId, balanceDifferncial, e) {
  console.log('INVALID TRANSACTION user --', userId, ' shoul add to balance ', balanceDifferncial, ' exception', e);
}
// ======== SimpleOperations ========
async function logGameStatsToHistory([betId, roomId], startedAt, winnerId, looserId, commision){
  return await BackgammonGamesHistory.create({
      bet: BackgammonsBETS.get(betId).bet
    , betId: betId
    , roomId: roomId
    , startedAt: startedAt
    , commision: commision
    , winnerId: winnerId
    , looserId: looserId
    , finishedAt: new Date
  })
}

async function waitingStartAtRoom([betId, roomId], player1Id){
  const room = await BackgammonsRooms.findOne({where:{betId, roomId}});
  return room.update({ startedWaitingAt: new Date, player1Id: player1Id })
}
async function waitingCancelAtRoom([betId, roomId]) {
  const room = await BackgammonsRooms.findOne({where:{betId, roomId}});
  return room.update({ startedWaitingAt: null, player1Id: null });
}

async function startRoom([betId, roomId], player1Id, player2Id, scene, ActiveTeam, Dices, Drops){
  const startedAt = new Date;
  BackgammonsRooms.findOne({where:{betId, roomId}})
    .then(room=>room.update({ startedAt, player1Id, player2Id, scene, ActiveTeam, Dices, Drops }));
  return startedAt;
}

async function updateRoomScene([betId, roomId], scene, ActiveTeam, Dices, Drops){
  const room = await BackgammonsRooms.findOne({where:{betId, roomId}});
  return room.update({ scene, ActiveTeam, Dices, Drops });
}

async function finishRoom([betId, roomId], ){
  const room = await BackgammonsRooms.findOne({where:{betId, roomId}});
  return room.update({ startedAt: null, startedWaitingAt: null, player1Id: null, player2Id: null, scene: null, ActiveTeam: null, Dices: null, Drops: null });
}

async function RoomInfo([betId, roomId]) {
  return await BackgammonsRooms.findOne({where:{betId, roomId}});
}

async function createRooms(){
  getGameSettingValue('BackgammonsStatus').then((res)=>{
    if(res === null) setGameSettingValue('BackgammonsStatus', {status:'active', code:200});//Я хз чё здесь писать, пхе
  });
  await BackgammonsRooms.destroy({ where: {}, truncate: true })
  return Promise.all(BackgammonsBETS.mapPairs((betInfo, betId)=>(range(1, 7)).map(async roomId=>BackgammonsRooms.create({ betId, roomId }))).flat(3))
}
async function getGameSettingValue(settingName) {
  return GamesSettings.findByPk(settingName).then(({dataValues:{value}})=>value);
}
async function setGameSettingValue(settingName, value) {
  return GamesSettings.upsert({name:settingName, value})
}
// ======== Usefull Operations ========
async function BackgammonsBalanceTravers(winner, loser, betInfo) {
  // const betInfo = BackgammonsBETS.get(betId);
  const comission = betInfo.bet*betInfo.comission*2; // comission from 2 players
  const lose = betInfo.bet;
  const prize = betInfo.bet-comission; // prize with comission
  // get money from loser user
  await balanceTransaction(loser.userId, -lose);
  // send money to winner user
  await balanceTransaction(winner.userId, prize);
  return [betInfo, comission, lose, prize];
}
async function completeGame([betId, roomId], winner, loser, betInfo) {
  const room = await RoomInfo([betId, roomId]);
  const [bet, comission, lose, prize] = await BackgammonsBalanceTravers(winner, loser, betInfo);
  Promise.all([
    getStatsOf(winner.userId), getStatsOf(loser.userId)
  ]).then(([winnerStats, loserStats])=>{
    winnerStats.update({
      moneyNardsWon: winnerStats.moneyNardsWon+prize,
      nardsTokens: winnerStats.nardsTokens+10,
      gameNardsPlayed: winnerStats.gameNardsPlayed+1,
    })
    loserStats.update({
      moneyNardsLost: loserStats.moneyNardsLost+lose,
      nardsTokens: loserStats.nardsTokens+10,
      gameNardsPlayed: loserStats.gameNardsPlayed+1,
    })
  })
  await logGameStatsToHistory([betId, roomId], room.startedAt, winner.userId, loser.userId, comission);
  return finishRoom([betId, roomId]);
}
/** @param {Date} fromdate @returns {{bet: number, comission_sum: number, games_count: int}[]} */
async function getBackgammonsGeneralInfo(fromdate){
  const request = {
    attributes: [
      'bet',
      [Sequelize.fn('sum', Sequelize.col('commision')), 'commision_sum'],
      [Sequelize.fn('count', 'bet'), 'games_count'],
    ],
    group: ['bet'],
  }
  if(fromdate) request.where = { 
    startedAt: { 
      [Op.between]: [new Date(fromdate), new Date(new Date(fromdate).valueOf() + 86350989)] 
    } 
  }
  return (await BackgammonGamesHistory.findAll(request)).map(({dataValues})=>dataValues);
}

module.exports = {
  BackgammonsBalanceTravers, getUser, getUserBalance, getGameSettingValue,
  logGameStatsToHistory, createRooms, getBackgammonsGeneralInfo, completeGame,
  waitingStartAtRoom, waitingCancelAtRoom, startRoom, updateRoomScene, finishRoom, 
};