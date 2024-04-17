//надо выделить функции finishGame для завершения игры и ведения статистики и startGame, для вычита баланса при старте игры и, возможно, если такое есть в сервисе, вести лог в бд

const { User } = require('../models/db-models');

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
    const _user = await User.findOne({
        where: { id: userId },
    });
    await _user.update({
        balance: _user.balance + balanceDifferncial,
    });
  } catch (e) {
    logInvalidTransaction(userId, balanceDifferncial, e);
  }
}
function logInvalidTransaction(userId, balanceDifferncial, e) {
  console.log('INVALID TRANSACTION user --', userId, ' shoul add to balance ', balanceDifferncial, ' exception', e);
}
module.exports = {
  balanceTravers
};