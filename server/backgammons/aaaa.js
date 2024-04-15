//надо выделить функции finishGame для завершения игры и ведения статистики и startGame, для вычита баланса при старте игры и, возможно, если такое есть в сервисе, вести лог в бд

winners.forEach(async (winner) => {
    const winnerUser = await User.findOne({
      where: { id: winner.userId },
    });
    await winnerUser.update({
      balance: winnerUser.balance + prize,
    });
  });
  