

winners.forEach(async (winner) => {
    const winnerUser = await User.findOne({
      where: { id: winner.userId },
    });
    await winnerUser.update({
      balance: winnerUser.balance + prize,
    });
  });
  