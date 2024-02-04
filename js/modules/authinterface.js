export function showUserInterface(user) {
  let userBlock = document.querySelector(".header__user");
  if (userBlock) {
    // let userName = document.querySelector(".header__name");
    // let userBalance = document.querySelector(".header__balance");
    let userBalances = document.querySelectorAll(".user__balance");

    // userName.innerHTML = user.username;
    userBalances.forEach((userBalance) => {
      if (userBalance) {
        userBalance.innerHTML = user.balance.toFixed(2);
      }
    });
  }
}

export function updateBalance(newBalance) {
  // let userBalance = document.querySelector(".header__balance");
  let userBalances = document.querySelectorAll(".user__balance");
  const localUser = JSON.parse(localStorage.getItem("user"));
  localUser.balance = newBalance;
  localStorage.setItem("user", JSON.stringify(localUser));
  userBalances.forEach((userBalance) => {
    if (userBalance) {
      userBalance.innerHTML = newBalance.toFixed(2);
    }
  });
}
