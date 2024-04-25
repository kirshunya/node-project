//надо выделить функции finishGame для завершения игры и ведения статистики и startGame, для вычита баланса при старте игры и, возможно, если такое есть в сервисе, вести лог в бд
const { User, BackgammonsRooms, BackgammonGameHistory } = require('../models/db-models.js');
const BackgammonsBETS = require('../../json/bets.json').BackgammonsBETS;
async function balanceTravers(winner, loser, betId) {
    const bet = BackgammonsBETS[betId];
    const comission = bet.comission*2; // comission from 2 players
    const lose = bet.bet;
    const prize = bet.bet - comission; // prize with comission

    // get money from loser user
    await balanceTransaction(loser.userId, -lose);
    // send money to winner user
    await balanceTransaction(winner.userId, prize);
}
async function balanceTransaction(userId, balanceDifferncial) {
  try {
    const _user = await getUser(userId)
    await _user.update({
        balance: _user.balance + balanceDifferncial,
    });
    sendUpdateBalance(userId, _user.balance + balanceDifferncial)
  } catch (e) {
    logInvalidTransaction(userId, balanceDifferncial, e);
  }
}
/**
 * @param {int} userId
 * @returns {import('../models/db-models.js').UserModel}
 */
async function getUser(userId) {
  return await User.findOne({ where: { id: userId }, });
}
/** @returns {FLOAT} */
async function getUserBalance(userId) {
  return (await getUser(userId)).balance;
}
async function sendUpdateBalance(userId, balance) {
  // console.log(getaWSS, )
  const aWSS = require('../backgamons.js').getaWSS();
  for(const client of aWSS.clients) {
    console.log(client.ctx?.user, userId, client.ctx?.user?.userId === userId);
    if(client.ctx?.user?.userId === userId)
      client.ctx.send({method:'updateBalance', balance})
  }
}
function logInvalidTransaction(userId, balanceDifferncial, e) {
  console.log('INVALID TRANSACTION user --', userId, ' shoul add to balance ', balanceDifferncial, ' exception', e);
}
module.exports = {
  balanceTravers, getUser, getUserBalance
};

async function logGameStatsToHistory(betId, roomId, startedAt, winnerId, looserId, comission){
  const game = await BackgammonGameHistory.create({ betId: betId
  , startedAt: startedAt
  , comission: comission
  , roomId: roomId
  , bet: BackgammonsBETS[betId]
  , winnerId: winnerId
  , looserId: looserId
  , finishedAt: new Date})
}

async function waitingStartRoom(betId, roomId, player1Id){
  const room = await BackgammonsRooms.find({where:{betId, roomId}});
  room.update({ startedWaitingAt: new Date, player1Id: player1Id })
}

async function startRoom(betId, roomId, player2Id, scene, ActiveTeam, Dices, Drops, TeamsByPlayerId){
  const room = await BackgammonsRooms.find({where:{betId, roomId}});
  room.update({ startedAt: new Date, player2Id: player2Id, scene, ActiveTeam, Dices, Drops, TeamsByPlayerId });
}

async function updateRoomScene(scene, ActiveTeam, Dices, Drops){
  const room = await BackgammonsRooms.find({where:{betId, roomId}});
  room.update({ scene, ActiveTeam, Dices, Drops });
}

async function finishRoom(){
  const room = await BackgammonsRooms.find({where:{betId, roomId}});
  room.update({ startedAt: null, startedWaitingAt: null, player1Id: null, player2Id: null, scene: null, ActiveTeam: null, Dices: null, Drops: null, TeamsByPlayerId: null });
}

async function createRooms(){
  await BackgammonsRooms.destroy({ where: {}, truncate: true })
  for(const [betId, betInfo] of Object.entries(BackgammonsBETS)){
    for (const roomId of range(1, 7)){
      const room = await BackgammonsRooms.create({ betId, roomId })
    }
  }
}

async function findAdminData(){
  return await BackgammonGameHistory.findAll({
    attributes: [
      'bet',
      [sequelize.fn('sum', sequelize.col('commision')), 'commision_sum'],
      [sequelize.fn('count', 'bet'), 'games_count'],
    ],
    group: ['bet'],
  });
}