import * as impAuth from "./authorization.js";
import * as impHttp from "../http.js";
import * as impPopup from "./popup.js";
import * as impAdminNav from "./admin-navigation.js";
import * as impDominoNav from "../domino/domino-navigation.js";
import * as impAudio from "../audio.js";
import * as impLeaders from "./leaders.js";
import * as impAuthInterface from "../authinterface.js";
import * as impRoomsControl from "./rooms-control.js";
import { API_URL_PART, IS_HOSTED_STATIC } from "../config.js";
let preloader = document.querySelector(".page-preloader");

export async function openProfilePage() {
  let preloader = document.querySelector(".page-preloader");
  let header = document.querySelector("header");
  let main = document.querySelector(".main__container");
  let siteLanguage = window.siteLanguage;
  if (main) {
    main.innerHTML = `
      <section class="profile-page">
          <div class="profile-page__header">
          <div class="profile-avatar"><img src="img/profile.png" alt="user" id="userAvatar" /></div>
              
            <h2>user</h2>
          </div>
  
          <div class="profile__buttons">
            <a class="profile__button profile__balance-button">
              <img src="img/profile icons/balance.png" alt="balance" />
              <p>${siteLanguage.profilePage.mainButtons.balanceBtnText}:</p>
              <span class="profile__balance"> <span>0</span> ₼ </span>
              <img
                src="img/profile icons/plus.png"
                alt="balance"
                class="curpointer"
              />
            </a>
            <a class="profile__button curpointer">
              <img src="img/profile icons/profile.png" alt="balance" />
              <div class="profile__button-text profile-details">
                <p>${
                  siteLanguage.profilePage.mainButtons.profileBtnText.title
                }</p>
                <span>${
                  siteLanguage.profilePage.mainButtons.profileBtnText
                    .description
                }</span>
              </div>
              <img
                src="img/profile icons/chevron-right.png"
                alt="ДЕТАЛИ ПРОФИЛЯ"
              />
            </a>
            <a class="profile__button curpointer profile__change-password-button">
              <img src="img/profile icons/password.png" alt="balance" />
              <p>${siteLanguage.profilePage.mainButtons.passwordBtnText}</p>
              <img
                src="img/profile icons/chevron-right.png"
                alt="${siteLanguage.profilePage.mainButtons.passwordBtnText}"
              />
            </a>
           
            <a class="profile__button curpointer game-history">
              <img src="img/profile icons/games.png" alt="balance" />
              <p>${siteLanguage.profilePage.mainButtons.mygamesBtnText}</p>
              <img src="img/profile icons/chevron-right.png" alt="ИГРЫ" />
            </a>
            <a class="profile__button curpointer user-bonuses">
              <img src="img/profile icons/balance.png" alt="БОНУСЫ" />
              <p>${siteLanguage.profilePage.mainButtons.bonusesBtnText}</p>
              <img src="img/profile icons/chevron-right.png" alt="БОНУСЫ" />
            </a>
          
            
            <a class="profile__button  user-cask-color">
              <div class="text-block">${
                siteLanguage.profilePage.mainButtons.casksBtnText
              }</div>
                <div class="casks-block">
                  <img src="img/profile icons/tiktok.png" style="width: 35px;height: 35px;cursor:pointer;">
                  <img src="img/profile icons/telegram.png" style="width: 35px;height: 35px;cursor:pointer;">
                  <img src="img/profile icons/instagram.png" style="width: 35px;height: 35px;cursor:pointer;">
              </div>
            </a>
            ${
              (await impAuth.isAdmin())
                ? `
                <a class="profile__button payments">
                  <img src="img/profile icons/balance.png" />
                  <p>ВЫПЛАТЫ</p>
                  <img
                    src="img/profile icons/chevron-right.png"
                    alt="ВЫПЛАТЫ"
                  />
                </a>                
                
                <a class="profile__button admin">
                  <img src="img/profile icons/profile.png" />
                  <p>АДМИН-ПАНЕЛЬ</p>
                  <img
                    src="img/profile icons/chevron-right.png"
                    alt="АДМИН-ПАНЕЛЬ"
                  />
                </a>

                <a class="profile__button room-management">
                  <img src="img/profile icons/balance.png" />
                  <p>УПРАВЛЕНИЕ КОМНАТАМИ</p>
                  <img
                    src="img/profile icons/chevron-right.png"
                    alt="УПРАВЛЕНИЕ КОМНАТАМИ"
                  />
                </a>   
                `
                : ``
            }
          </div>
          <div class="profile-page__footer">
            <button class="logout">
              <p>${siteLanguage.profilePage.mainButtons.logoutBtnText}</p>
              <img src="img/logout.png" alt="logout" />
            </button>
          </div>
        </section>
    `;

    let userAvatar = document.querySelector("#userAvatar");

    const user = JSON.parse(localStorage.getItem("user"));
    if (user.avatar) {
      userAvatar.src = `http${API_URL_PART}/${
        IS_HOSTED_STATIC ? "static/avatars/" : ""
      }${user.avatar}`;
    }

    // убираем хедер

    header.classList.add("d-none");
    main.classList.remove("header__padding");

    // добавляем навигацию сайта
    let footer = document.querySelector("#footer");
    if (footer && footer.classList.contains("d-none")) {
      footer.classList.remove("d-none");
      main.classList.add("footer__padding");
    }
    // let userInfo = await getProfileInfo();

    let localUser = localStorage.getItem("user");

    if (localUser) {
      localUser = JSON.parse(localUser);
    }

    if (!localUser) {
      location.hash = "#";
      return;
    }
    if (!preloader.classList.contains("d-none")) {
      preloader.classList.add("d-none");
    }

    // вставляем ник и баланс
    let profilePage = document.querySelector(".profile-page");
    let usernameBlock = profilePage.querySelector(".profile-page__header h2");
    usernameBlock.innerHTML = localUser.username;

    let usernameBalance = profilePage.querySelector(".profile__balance span");
    usernameBalance.innerHTML = localUser.balance.toFixed(2);

    const profileDetailsButton = document.querySelector(".profile-details");
    profileDetailsButton.addEventListener("click", async function () {
      preloader.classList.remove("d-none");
      await openUserDetails();
      // убираем навигацию сайта
      let footer = document.querySelector("#footer");
      if (footer && !footer.classList.contains("d-none")) {
        footer.classList.add("d-none");
        main.classList.remove("footer__padding");
      }
      preloader.classList.add("d-none");
    });

    const balanceButton = document.querySelector(".profile__balance-button");
    balanceButton.addEventListener("click", async function () {
      // preloader.classList.remove("d-none");
      // await openBalance();
      preloader.classList.remove("d-none");
      location.hash = "#deposit";
    });

    const changePasswordButton = document.querySelector(
      ".profile__change-password-button"
    );
    changePasswordButton.addEventListener("click", function () {
      openChangePasswordForm();
      // убираем навигацию сайта
      let footer = document.querySelector("#footer");
      if (footer && !footer.classList.contains("d-none")) {
        footer.classList.add("d-none");
        main.classList.remove("footer__padding");
      }
    });

    const gameHistoryButton = document.querySelector(".game-history");
    gameHistoryButton.addEventListener("click", async () => {
      preloader.classList.remove("d-none");
      await openUserGames();
      preloader.classList.add("d-none");
    });

    const bonusesButton = document.querySelector(".user-bonuses");
    bonusesButton.addEventListener("click", async () => {
      await openUserBonuses();

      preloader.classList.add("d-none");
    });

    const logoutButton = document.querySelector(".logout");
    logoutButton.addEventListener("click", async function () {
      await impHttp.logout();
      localStorage.setItem("token", "");
      // открываем форму регистрации для анимации
      const registration = document.querySelector(".registration");
      registration.classList.add("opened");
      // и потом у нас перезагружаеться страница
      location.reload();
    });

    // payments
    const paymentsButton = document.querySelector(".payments");
    if (paymentsButton) {
      paymentsButton.addEventListener("click", async () => {
        openPayments();
      });
    }

    // room management
    const roomManagementButton = document.querySelector(".room-management");
    if (roomManagementButton) {
      roomManagementButton.addEventListener("click", async () => {
        await impRoomsControl.openRoomManagement();
      });
    }

    // admin
    const adminButton = document.querySelector(".profile__button.admin");
    if (adminButton) {
      adminButton.addEventListener("click", async () => {
        await impAdminNav.redirectToAdminPage();
      });
    }
  }
}

export async function openBalance() {
  let siteLanguage = window.siteLanguage;

  const main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  let footer = document.querySelector("#footer");

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  if (!localUser) {
    return;
  }
  if (!header.classList.contains("d-none")) {
    header.classList.add("d-none");
    main.classList.remove("header__padding");
  }
  // удаляем навигацию сайта
  if (footer && !footer.classList.contains("d-none")) {
    footer.classList.add("d-none");
    main.classList.remove("footer__padding");
  }
  main.innerHTML = `
  <section class="profile-page bg-white deposit">
    <div class="profile-page__header">
      <img src="img/logo-red.png" alt="Luxary games" />
    </div>

    <div class="profile-page__card">
      <p class="profile-page__card-username">${localUser.username}</p>
      <p class="profile-page__card-balance"><span>${localUser.balance.toFixed(
        2
      )}</span> ₼</p>
      <div class="profile-page__card-buttons">
        <button style="font-size: 18px;" class="profile-page__card-button deposit red">${
          siteLanguage.depositMenuPage.depositButton
        }</button>
        <button style="font-size: 18px;" class="profile-page__card-button withdraw yellow">${
          siteLanguage.depositMenuPage.withdrawButton
        }</button>
      </div>
    </div>
    <div class="profile-page__footer black">
      <button class="go-back go-back-black">
        <p>${siteLanguage.depositMenuPage.returnBtnText}</p>
        <img src="img/logout-black.png" alt="logout" />
      </button>
    </div>
  </section>
  `;

  const depositButton = document.querySelector(
    ".profile-page__card-button.deposit"
  );
  depositButton.addEventListener("click", async function () {
    await openDeposit();
  });

  const withdrawButton = document.querySelector(
    ".profile-page__card-button.withdraw"
  );
  withdrawButton.addEventListener("click", async function () {
    await openWithdraw();
  });
  const goBackButton = document.querySelector(".go-back");
  goBackButton.addEventListener("click", function () {
    location.hash = "#profile";
    // openProfilePage();
  });
}

async function openDeposit() {
  let siteLanguage = window.siteLanguage;
  const main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  // let userInfo = await getProfileInfo();
  if (!localUser) {
    return;
  }
  main.classList.remove("footer__padding");
  main.innerHTML = `
  <section class="profile-page deposit">
    <div class="deposit__content">
      <div class="button__credit-cards">
        <div class="button__credit-card">
          <img src="img/visa-mastercard.png" alt="cards" />
          <div class="credit-card__text">
            ${siteLanguage.depositPage.depositInformationText}
          </div>
        </div>
      </div>

      <div class="deposit__form">
        <h2 class="deposit__form-username">${localUser.username}</h2>
        <div class="deposit__form-money">
          <h2>${siteLanguage.depositPage.depositSumText}: </h2>
          <div class="deposit__form-content">
            <input class="deposit__form-sum" placeholder="0" type="number"  />
            <span>₼</span>
            <div class="deposit__form-ready-sums">
              <button class="deposit__form-ready-sum">
                5
              </button>
              <button class="deposit__form-ready-sum">
                25
              </button>
              <button class="deposit__form-ready-sum">
                50
              </button>
              <button class="deposit__form-ready-sum">
                100
              </button>
              <button class="deposit__form-ready-sum">
                250
              </button>
            </div>
          </div>
        </div>
        <div class="deposit__form-wrapper">
        <p class="deposit__form-minimum">${siteLanguage.depositPage.alertText}: 2.00₼</p>
        <button class="deposit__form-button">${siteLanguage.depositPage.depositButtonText}<span style="margin-left: 7px; font-weight: 600;">0$</span></button>
        </div>
      </div>
    </div>

    <div class="profile-page__footer">
      <button class="go-back">
        <p>${siteLanguage.depositPage.returnBtnText}</p>
        <img src="img/logout.png" alt="logout" />
      </button>
    </div>
  </section>
  `;

  const currencyRate = await impHttp.getCurrencyRate();
  const dollarRate = currencyRate.data.rate || 1.705;

  const sumInput = document.querySelector(".deposit__form-sum");

  sumInput.addEventListener("input", () => {
    sumInput.value = sumInput.value.replace(/[^0-9]/g, "");
    sumInput.value = sumInput.value.slice(0, 4);
  });

  const readySumButtons = document.querySelectorAll(".deposit__form-ready-sum");

  readySumButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sumInput = document.querySelector(".deposit__form-sum");
      sumInput.value = button.innerText;
      dollarsSum.innerHTML = (+button.innerText / +dollarRate).toFixed(2) + "$";
    });
  });

  const dollarsSum = document.querySelector(".deposit__form-button span");

  sumInput.addEventListener("input", () => {
    dollarsSum.innerHTML = (+sumInput.value / +dollarRate).toFixed(2) + "$";
  });

  const depositButton = document.querySelector(".deposit__form-button");
  depositButton.addEventListener("click", async function () {
    const sumInput = document.querySelector(".deposit__form-sum");
    const sum = parseFloat(sumInput.value);
    if (isNaN(sum)) {
      impPopup.open(siteLanguage.popups.enterSum);
      return;
    }
    if (+sum < 2) {
      impPopup.open(siteLanguage.popups.minimumSum);
      return;
    }
    const result = await impHttp.deposit(sum);
    if (result.status == 200) {
      impPopup.open(siteLanguage.popups.depositSuccess);
      impAuthInterface.updateBalance(result.data.balance);
      location.hash = "#profile";
    } else {
      impPopup.open(siteLanguage.profilePage.myGamesPage.statsItem.errorText);
    }
  });
  const goBackButton = document.querySelector(".go-back");
  goBackButton.addEventListener("click", function () {
    openBalance();
  });
}

async function openWithdraw() {
  let siteLanguage = window.siteLanguage;
  const main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }
  main.innerHTML = `
  <section class="withdraw-page withdraw">
  <div class="withdraw-page__container">
    <form class="withdraw-page_form withdraw-form">
      <div class="withdraw-form__card-item">
        <img src="img/card.png" alt="" class="withdraw-form__card-item-img">
        <div class="card-item__number">#### **** **** ####</div>
        <div class="card-item__holder">
          <div class="card-item__holder-text">Card Holder</div>
          <div class="card-item__holder-name">Name Name</div>
        </div> 
        <div class="card-item__expires">
          <div class="card-item__expires-text">Expires</div>
          <div class="card-item__expires-date"><span class="mm">MM</span> / <span class="yy">YY</span></div>
        </div>
      </div>

      <div class="withdraw-form__item">
        <label for="withdraw-form-card-number">${siteLanguage.withdrawPage.cardNumberText}</label>
        <input id="withdraw-form-card-number" type="tel" autocomplete="cc-number">
      </div>
      <div class="withdraw-form__item">
        <label for="withdraw-form-card-name">${siteLanguage.withdrawPage.cardHolderText}</label>
        <input id="withdraw-form-card-name" type="text" autocomplete="cc-name">
      </div>
      <div class="withdraw-form__item row">
        <label>${siteLanguage.withdrawPage.cardExpiresText}</label>
        <div class="date-input">
          <input placeholder="ММ" maxlength="2" id="withdraw-form-card-month" type="number" autocomplete="cc-exp-month">
          / 
          <input placeholder="ГГГГ" maxlength="4" id="withdraw-form-card-year" type="number" autocomplete="cc-exp-year">
        </div>
      </div>
      <div class="withdraw-form__item">
        <label for="withdraw-form-sum">${siteLanguage.withdrawPage.cardSumText}</label>
        <input id="withdraw-form-sum"  maxlength="4" pattern="[0-9]{4}" max="1000" type="tel" autocomplete = 'off'>
      </div>
      <p class="withdraw-form-p">${siteLanguage.withdrawPage.alertText}: 20₼</p>
      <button class="withdraw-form__item-button">${siteLanguage.withdrawPage.withdrawButtonText}</button>

      <button class="go-back">
        <p>${siteLanguage.withdrawPage.returnBtnText}</p>
        <img src="img/logout.png" alt="logout" />
      </button>
    </form>
  </div>
  <div class="withdraw-page__footer"></div>
</section>
  `;

  const withdrawFormSum = document.querySelector("#withdraw-form-sum");
  withdrawFormSum.addEventListener("input", () => {
    // make 4 digits max and max value 1000
    withdrawFormSum.value = withdrawFormSum.value.replace(/[^0-9]/g, "");
    withdrawFormSum.value = withdrawFormSum.value.slice(0, 4);
    if (withdrawFormSum.value > 1000) {
      withdrawFormSum.value = 1000;
    }
  });

  const goBackButton = document.querySelector(".withdraw-page .go-back");
  goBackButton.addEventListener("click", function (e) {
    e.preventDefault();
    openBalance();
  });

  let withdrawButton = document.querySelector(
    ".withdraw-page .withdraw-form__item-button"
  );

  const cardInput = document.querySelector("#withdraw-form-card-number");
  const cardNumberOnCard = document.querySelector(
    ".withdraw-form__card-item .card-item__number"
  );

  cardInput.addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{4})/g, "$1 ");
    value = value.trim();
    value = value.slice(0, 19);

    cardNumberOnCard.innerText = value;
    e.target.value = value;
  });

  const usrnameInput = document.querySelector("#withdraw-form-card-name");
  const usrnameInputOnCard = document.querySelector(
    ".withdraw-form__card-item .card-item__holder-name"
  );

  usrnameInput.addEventListener("input", (e) => {
    // allow only latin symbols and one white space between words
    e.target.value = e.target.value.replace(/[^a-zA-Z ]/g, "");
    e.target.value = e.target.value.replace(/(\s{2,})/g, " ");

    let value = e.target.value;
    usrnameInputOnCard.innerText = value;
    e.target.value = value;
  });

  const cardExpiresMMOnCard = document.querySelector(
    ".card-item__expires-date .mm"
  );

  const monthInput = document.querySelector("#withdraw-form-card-month");
  monthInput.addEventListener("input", (e) => {
    let value = e.target.value;
    if (value.length > 2) {
      monthInput.value = monthInput.value.slice(0, 2);
    } else {
      cardExpiresMMOnCard.innerHTML = value;
      e.target.value = value;
    }
  });

  const cardExpiresYYOnCard = document.querySelector(
    ".card-item__expires-date .yy"
  );
  const yearInput = document.querySelector("#withdraw-form-card-year");
  yearInput.addEventListener("input", (e) => {
    let value = e.target.value;
    if (value.length > 4) {
      yearInput.value = yearInput.value.slice(0, 4);
    } else {
      cardExpiresYYOnCard.innerHTML = value;
      e.target.value = value;
    }
  });

  const sumInput = document.querySelector("#withdraw-form-sum");
  sumInput.addEventListener("input", () => {
    // allow only float numbers with 2 digits after dot
    sumInput.value = sumInput.value.replace(/[^0-9.]/g, "");
    sumInput.value = sumInput.value.replace(/(\..*)\./g, "$1");
    sumInput.value = sumInput.value.replace(/(\.[0-9][0-9])./g, "$1");
  });

  withdrawButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const withdrawInput = document.querySelector("#withdraw-form-sum");
    let withdrawAmount = withdrawInput.value;

    if (withdrawAmount < 20) {
      impPopup.openErorPopup(`${siteLanguage.withdrawPage.alertText} 20₼`);
      return;
    }

    let errorsCounter = 0;
    // сбрасываем ошибки
    let errors = document.querySelectorAll(".withdraw-page .error");
    errors.forEach((error) => {
      error.classList.remove("error");
    });

    // парсим номер карты
    let cardNumber = document.querySelector(
      ".withdraw-page #withdraw-form-card-number"
    );
    let cardNumberValue = cardNumber.value;

    if (cardNumberValue.length != 19) {
      cardNumber.classList.add("error");
      errorsCounter++;
    }
    if (!isValidCreditCardNumber) {
      cardNumber.classList.add("error");
      errorsCounter++;
    }

    if (!isValidCreditCard(cardNumberValue)) {
      cardNumber.classList.add("error");
      errorsCounter++;
    }

    // парсим имя владельца на латинеце
    let cardName = document.querySelector(
      ".withdraw-page #withdraw-form-card-name"
    );
    let cardNameValue = cardName.value;
    if (!/^[a-zA-Z]+$/.test(cardNameValue) && cardNameValue.length < 3) {
      cardName.classList.add("error");
      errorsCounter++;
    }

    // проверка мм\гг
    let cardDateBlock = document.querySelector(".withdraw-page .date-input");
    let cardMM = document.querySelector(
      ".withdraw-page #withdraw-form-card-month"
    );
    let cardMMValue = cardMM.value;
    let cardYY = document.querySelector(
      ".withdraw-page #withdraw-form-card-year"
    );
    let cardYYValue = cardYY.value;
    if (
      cardMMValue > 12 ||
      cardYYValue < 2023 ||
      cardMMValue > 12 ||
      cardYYValue > 2099 ||
      cardMMValue.length < 1 ||
      cardYYValue.length < 4 ||
      cardMMValue.length > 2 ||
      cardYYValue.length > 4
    ) {
      cardDateBlock.classList.add("error");
      errorsCounter++;
    }
    if (withdrawAmount == "" || withdrawAmount == null || withdrawAmount == 0) {
      errorsCounter++;
    }

    if (errorsCounter == 0) {
      let response = await impHttp.createPayout(
        withdrawAmount,
        cardNumberValue,
        cardNameValue,
        `${cardMMValue}/${cardYYValue}`
      );
      if (response.data.message == "ERR_NOT_ENOUGH_BALANCE") {
        impPopup.openErorPopup(siteLanguage.popups.notEnoughMoney);
        return;
      }

      if (response.status == 200) {
        impPopup.open(`${siteLanguage.popups.withdrawInfoPopup}`);
        impAuthInterface.updateBalance(response.data.balance);

        cardName.value = "";
        cardYY.value = "";
        cardMM.value = "";
        cardNumber.value = "";
        withdrawInput.value = "";
        cardNumberOnCard.innerHTML = "#### **** **** ####";
        usrnameInputOnCard.innerHTML = "Name Name";
        cardExpiresMMOnCard.innerHTML = "MM";
        cardExpiresYYOnCard.innerHTML = "YY";
      }
    } else {
      impPopup.openErorPopup(siteLanguage.popups.incorrectFields);
    }
  });
}

function isValidCreditCardNumber(cardNumber) {
  // Шаблон для Visa и MasterCard: начинается с 4 или 5, и имеет 16 цифр
  var cardPattern = /^(4|5)\d{19}$/;

  return cardPattern.test(cardNumber);
}

function isValidCreditCard(cardNumber) {
  // Удаляем пробелы из номера карты и переводим его в строку
  cardNumber = cardNumber.replace(/\s/g, "");

  // Проверяем, что номер карты состоит только из цифр и имеет длину 13-19 символов
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false;
  }

  // Преобразуем номер карты в массив цифр и инвертируем его
  const digits = cardNumber.split("").map(Number).reverse();

  // Рассчитываем контрольную сумму с учетом алгоритма Луна
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = digits[i];

    // Удваиваем каждую вторую цифру, начиная с последней
    if (i % 2 === 1) {
      digit *= 2;

      // Если результат больше 9, вычитаем 9
      if (digit > 9) {
        digit -= 9;
      }
    }

    // Суммируем все цифры
    sum += digit;
  }

  // Карта валидна, если сумма делится на 10 без остатка
  return sum % 10 === 0;
}

async function openUserDetails() {
  let siteLanguage = window.siteLanguage;

  let localUser = localStorage.getItem("user");
  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  const main = document.querySelector(".main__container");
  main.innerHTML = `
  <section class="profile-page">
  <div class="profile-page__header">
    <div class="profile-avatar">
      <button class="profile-avatar__close">X</button>
      <img id = "userAvatarPreview" src="img/profile.png" alt="user" />
    </div>
    <input
      type="file"
      id="avatarFileInput"
      name="avatarFileInput"
      accept=".png, .jpg, .svg"
    />
  <p class="profile-page__header-subtitle">Сменить аватар</p>
  </div>
  <div class="profile__buttons">
    <div class="profile-info__form">
      <p class="username-label">
        ${siteLanguage.profilePage.profileDetailsPage.usernameText}
      </p>
      <input
        type="text"
        placeholder="${localUser.username}"
        class="form-body__input username-input"
        disabled
      />
      <p class="name-label">
        ${siteLanguage.profilePage.profileDetailsPage.nameText}
      </p>
      <input
        type="text"
        placeholder="${localUser.name}"
        class="form-body__input password-input"
      />
      <p class="email-label">
        ${siteLanguage.profilePage.profileDetailsPage.emailText}
      </p>
      <input
        type="text"
        placeholder="${localUser.email}"
        class="form-body__input email-input"
      />
    </div>
    <button class="profile__save">
      ${siteLanguage.profilePage.profileDetailsPage.saveButtonText}
    </button>
    <div class="profile__buttons m20">
      <a class="profile__button curpointer change-language">
        <img src="img/profile icons/lang.png" />
        <p>
          ${siteLanguage.profilePage.profileDetailsPage.changeLanguageBtnText}
        </p>
        <img src="img/profile icons/chevron-right.png" alt="СМЕНИТЬ ЯЗЫК" />
      </a>
      <a class="profile__button curpointer transactions">
        <img src="img/profile icons/dep.png" />
        <p>
          ${siteLanguage.profilePage.profileDetailsPage.transactionsBtnText}
        </p>
        <img src="img/profile icons/chevron-right.png" alt="ТРАНЗАКЦИИ" />
      </a>
      <a class="profile__button user-cask-color">
        <div class="text-block">
          ${siteLanguage.profilePage.mainButtons.casksBtnText}
        </div>
        <div class="casks-block">
          <div
            color="default"
            color-code="#F6BA9E"
            class="setting-cask default"
          ></div>

          <div color="red" color-code="#FF5F5F" class="setting-cask red"></div>
          <div
            color="purple"
            color-code="#C870FF"
            class="setting-cask purple"
          ></div>
        </div>
      </a>
    </div>

    <div class="profile-page__footer">
      <button class="go-back">
        <p>${siteLanguage.profilePage.profileDetailsPage.returnBtnText}</p>
        <img src="img/logout.png" alt="logout" />
      </button>
    </div>
  </div>
</section>

  `;
  let thisPage = document.querySelector(".profile-page");

  const nameInput = thisPage.querySelector(
    ".profile-info__form input.password-input"
  );
  const emailInput = thisPage.querySelector(
    ".profile-info__form input.email-input"
  );
  const fileInput = thisPage.querySelector("#avatarFileInput");
  let userAvatarPreview = thisPage.querySelector("#userAvatarPreview");

  const user = JSON.parse(localStorage.getItem("user"));
  if (user.avatar) {
    userAvatarPreview.src = `http${API_URL_PART}/${
      IS_HOSTED_STATIC ? "static/avatars/" : ""
    }${user.avatar}`;
  }

  if (fileInput) {
    fileInput.addEventListener("change", async function (e) {
      let imageFromInput = await getFileFromInput(fileInput);
      if (imageFromInput == null) {
        return;
      }
      if (userAvatarPreview) {
        userAvatarPreview.src = imageFromInput;
      }
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      const response = await impHttp.setUserAvatar(formData);
      if (response.status == 200) {
        let newUser = {
          username: response.data.username,
          balance: response.data.balance,
          name: response.data.name,
          userId: response.data.id,
          email: response.data.email,
          avatar: response.data.avatar,
          isAdmin: response.data.isAdmin,
          seeDominoClassic: response.data.seeDominoClassic,
          seeDominoTelephone: response.data.seeDominoTelephone,
        };
        localStorage.setItem("user", JSON.stringify(newUser));
      }
    });
  }

  const removeAvatarButton = thisPage.querySelector(".profile-avatar__close");
  if (removeAvatarButton) {
    removeAvatarButton.addEventListener("click", async () => {
      const response = await impHttp.removeUserAvatar();
    });
  }

  const saveButton = thisPage.querySelector(".profile__save");

  saveButton.addEventListener("click", async () => {
    const name = nameInput.value || localUser.name;
    const email = emailInput.value || localUser.email;

    if (!name && !email) {
      impPopup.openErorPopup(siteLanguage.popups.emptyFields);
      return;
    }

    // validate email using regexp
    let isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      impPopup.openErorPopup(siteLanguage.popups.wrongFormat);
      return;
    }

    let response = await impHttp.updateUserData(name, email);

    if (response.status == 200) {
      impPopup.open(siteLanguage.popups.dataSuccess);
      nameInput.value = "";
      emailInput.value = "";
      nameInput.placeholder = response.data.newName;
      emailInput.placeholder = response.data.newEmail;

      const localUser = JSON.parse(localStorage.getItem("user"));
      localUser.name = response.data.newName;
      localUser.email = response.data.newEmail;
      localStorage.setItem("user", JSON.stringify(localUser));
    }

    if (response.status == 400) {
      if (response.data.message == "ERR_EMAIL_ALREADY_EXISTS") {
        impPopup.openErorPopup(siteLanguage.popups.emailExists);
      } else {
        impPopup.openErorPopup(
          siteLanguage.profilePage.myGamesPage.statsItem.errorText
        );
      }
      // // console.log(response.data);
    }
  });

  const changeLanguage = document.querySelector(".profile__button.curpointer");
  changeLanguage.addEventListener("click", function () {
    impPopup.openChangeLanguage();
  });

  const transactionsButtons = document.querySelector(".transactions");
  transactionsButtons.addEventListener("click", async () => {
    await openTransactions();
  });

  // кнопка изменения цвета
  const localCaskColor = localStorage.getItem("cask-color");
  const colors = document.querySelectorAll(".casks-block .setting-cask");
  colors.forEach((color) => {
    color.classList.remove("active");

    if (color.getAttribute("color") == localCaskColor) {
      color.classList.add("active");
    }
  });

  colors.forEach((color) => {
    color.addEventListener("click", () => {
      colors.forEach((color) => color.classList.remove("active"));
      color.classList.add("active");
      localStorage.setItem("cask-color", color.getAttribute("color"));
    });
  });

  // ставим active для кнопки с цветом из localstorage
  const caskColor = localStorage.getItem("cask-color");
  if (caskColor) {
    const cask = document.querySelector(`.setting-cask[color=${caskColor}]`);
    if (cask) {
      cask.classList.add("active");
    }
  }

  const goBackButton = document.querySelector(".go-back");
  goBackButton.addEventListener("click", function () {
    openProfilePage();
  });
}

async function openUserGames() {
  let siteLanguage = window.siteLanguage;
  let main = document.querySelector(".main__container");
  if (main) {
    const { data } = await impHttp.getUserGames();
    const  backgammonGames  = await impHttp.getUserBackgammonGames();
    // const { lotoGames } = data;
    //const { backgammonGames } = data;
    console.log(data);
    console.log(backgammonGames);
    main.innerHTML = `
      <div class="main__container">
        <section class="user-game-history">
          <div class="pader user-game-history-header">
            <div class="user-game-history-header__back">
              <p>${siteLanguage.profilePage.myGamesPage.header.backButtonText}</p>
              <img src="img/logout.png" alt="logout" /></div>
            <h3 class="user-game-history-header__title">${siteLanguage.profilePage.myGamesPage.header.headerTitle}</h3>
          </div>
          <div class="user-game-history__main-wrapper">            
          
          <div class="user-game-history__main">            
          </div>
          </div>
        </section>
      </div>
    `;

    // выйти назад в профиль
    let buttonBack = document.querySelector(".user-game-history-header__back");
    if (buttonBack) {
      buttonBack.addEventListener("click", function () {
        openProfilePage();
      });
    }

    let mainBlock = document.querySelector(".user-game-history__main");
    data.forEach((game, index) => {
      // создаем игру с истории юзера
      game.tickets = JSON.parse(game.tickets);
      game.casks = JSON.parse(game.casks);
      let gameitem = document.createElement("div");
      gameitem.classList.add(
          "user-game__item",
          "game-item",
          `${game.isWinner? "won" : "lose"}`,
          `game-item-${index}`
      );
      gameitem.setAttribute("date", game.createdAt);

      let dateTime = new Date(game.createdAt);
      dateTime = new Date(dateTime.toISOString().toLocaleString());

      const day = ("0" + dateTime.getDate()).slice(-2); // Извлекаем день и добавляем ведущий ноль при необходимости
      const month = ("0" + (dateTime.getMonth() + 1)).slice(-2); // Извлекаем месяц (нумерация месяцев начинается с 0)
      const year = dateTime.getFullYear(); // Извлекаем год

      const hours = ("0" + dateTime.getHours()).slice(-2); // Извлекаем часы и добавляем ведущий ноль при необходимости
      const minutes = ("0" + dateTime.getMinutes()).slice(-2); // Извлекаем минуты и добавляем ведущий ноль при необходимости

      const formattedDate = `${day}.${month}.${year}`; // Форматируем дату в требуемый формат
      const formattedTime = `${hours}:${minutes}`; // Форматируем время в требуемый формат

      gameitem.innerHTML = `
      <div class="game-item__date">
      ${formattedDate} ${formattedTime} 
      </div>
        <div class="game-item__tickets-block">
          <!-- tickets -->
        </div>
        <div class="game-item__row game-item__isWon">
          ${siteLanguage.profilePage.myGamesPage.statsItem.resultText}: <span>${
          game.isWinner
              ? siteLanguage.profilePage.myGamesPage.statsItem.winGameText
              : siteLanguage.profilePage.myGamesPage.statsItem.loseGameText
      }</span>
        </div>
        <div class="game-item__row game-item__winSum">
          ${
          siteLanguage.profilePage.myGamesPage.statsItem.sumWinText
      }: <span>${game.winSum.toFixed(2)}</span> ₼
        </div>
        <div class="game-item__row game-item__last-index">
          ${
          siteLanguage.profilePage.myGamesPage.statsItem.winSumText
      }: <span class="game-item__last-index-num">${game.winIndex}</span>
        </div>
        <div class="game-item__row game-item__jackpotWon">
          ${siteLanguage.profilePage.myGamesPage.statsItem.winJackpotText}:
          <span class="game-item__jackpotWon-status">${
          game.isJackpotWon
              ? siteLanguage.profilePage.myGamesPage.statsItem
                  .jackpotStatusWinText
              : siteLanguage.profilePage.myGamesPage.statsItem
                  .jackpotStatusLoseText
      }</span>
        </div>
        <div class="game-item__row game-item__price">
          ${
          siteLanguage.profilePage.myGamesPage.statsItem.ticketPriceText
      }: <span class="game-item__price-sum">${game.bet.toFixed(2)}</span> ₼
        </div>
        <div class="game-item__row game-item__bet">
          ${
          siteLanguage.profilePage.myGamesPage.statsItem.ticketBetText
      }: <span class="game-item__bet-sum">${(
          game.bet * game.tickets.length
      ).toFixed(2)}</span> ₼
        </div>
        <div class="game-item__row game-item__bank">
          ${
          siteLanguage.profilePage.myGamesPage.statsItem.bankText
      }: <span class="game-item__bank-sum">${game.bank.toFixed(2)}</span> ₼
        </div>
      `;

      mainBlock.insertBefore(gameitem, mainBlock.firstChild);

      let gameItem = document.querySelector(`.game-item-${index}`);
      let ticketsBodyBlock = gameItem.querySelector(
          ".game-item__tickets-block"
      );
      if (ticketsBodyBlock) {
        createHistoryUserTickets(ticketsBodyBlock, data[index].tickets);
      }

      // убираем навигацию сайта
      let footer = document.querySelector("#footer");
      if (footer && !footer.classList.contains("d-none")) {
        footer.classList.add("d-none");
        main.classList.remove("footer__padding");
      }
    });

    const us = localStorage.getItem("user")
    const userData = JSON.parse(us);
    console.log(us);
    console.log(userData.userId);

    backgammonGames.forEach((game, index) => {

      let gameitem = document.createElement("div");
      gameitem.classList.add(
          "user-game__item",
          "game-item",
           game.winnerId == userData.userId? "won" : "lose",
          `game-item-${index}`
      );
      gameitem.setAttribute("date", game.createdAt);
      const { bet } = impDominoNav.getBackgammonRoomBetInfo(game.roomId);

      let dateTime = new Date(game.createdAt);
      dateTime = new Date(dateTime.toISOString().toLocaleString());

      const day = ("0" + dateTime.getDate()).slice(-2); // Извлекаем день и добавляем ведущий ноль при необходимости
      const month = ("0" + (dateTime.getMonth() + 1)).slice(-2); // Извлекаем месяц (нумерация месяцев начинается с 0)
      const year = dateTime.getFullYear(); // Извлекаем год

      const hours = ("0" + dateTime.getHours()).slice(-2); // Извлекаем часы и добавляем ведущий ноль при необходимости
      const minutes = ("0" + dateTime.getMinutes()).slice(-2); // Извлекаем минуты и добавляем ведущий ноль при необходимости

      const formattedDate = `${day}.${month}.${year}`; // Форматируем дату в требуемый формат
      const formattedTime = `${hours}:${minutes}`; // Форматируем время в требуемый формат

      gameitem.innerHTML = `
        <div class="game-item__date">
        ${formattedDate} ${formattedTime}
        </div>
        <p>${siteLanguage.statsPage.menuHeader.gameNardsText}</p>
        <p class="game-item__isWon">${
          siteLanguage.profilePage.myGamesPage.statsItem.game
      } <span> ${
          game.winnerId == userData.userId
              ? siteLanguage.profilePage.myGamesPage.statsItem.won
              : siteLanguage.profilePage.myGamesPage.statsItem.lost
      }!</span></p>
        <p>${siteLanguage.profilePage.myGamesPage.statsItem.room}: ${
          game.roomId
      }</p>
        <p>${siteLanguage.profilePage.myGamesPage.statsItem.bet}: ${bet.toFixed(
          2
      )}₼</p>
        ${
          game.winnerId == userData.userId
              ? `<p>${
                  siteLanguage.profilePage.myGamesPage.statsItem.pureWin
              }: ${2 * game.bet.toFixed(2) + 0.1 * game.bet.toFixed(2)}₼</p>
              <p>${
                  siteLanguage.profilePage.myGamesPage.statsItem.winCommission
              }: ${(game.bet + bet).toFixed(2)}₼</p>
              `
              : `${siteLanguage.profilePage.myGamesPage.statsItem.totalBank}: ${(
                  game.bet * 2 - (0.1 * game.bet)
              ).toFixed(2)}₼`
      }
        <p>${
          siteLanguage.profilePage.myGamesPage.statsItem.roomCommission
      }: 10%</p>
      `;

      mainBlock.insertBefore(gameitem, mainBlock.firstChild);
    });

    // dominoGames.forEach((game, index) => {
    //   let gameitem = document.createElement("div");
    //   gameitem.classList.add(
    //       "user-game__item",
    //       "game-item",
    //       `${game.isWinner ? "won" : "lose"}`,
    //       `game-item-${index}`
    //   );
    //   gameitem.setAttribute("date", game.createdAt);
    //
    //   const { bet } = impDominoNav.getDominoRoomBetInfo(game.roomId);
    //
    //   // "game": "Игра",
    //   // "won": "выиграна",
    //   // "lost": "проиграна",
    //   // "room": "Комната",
    //   // "table": "Стол",
    //   // "playersAmount": "Количество игроков",
    //   // "gameMode": "Режим",
    //   // "classic": "классический",
    //   // "telephone": "телефон",
    //   // "bet": "Ставка",
    //   // "pureWin": "Чистый выигрыш",
    //   // "totalBank": "Общий банк",
    //   // "roomCommission": "Комиссия комнаты"
    //
    //   let dateTime = new Date(game.createdAt);
    //   dateTime = new Date(dateTime.toISOString().toLocaleString());
    //
    //   const day = ("0" + dateTime.getDate()).slice(-2); // Извлекаем день и добавляем ведущий ноль при необходимости
    //   const month = ("0" + (dateTime.getMonth() + 1)).slice(-2); // Извлекаем месяц (нумерация месяцев начинается с 0)
    //   const year = dateTime.getFullYear(); // Извлекаем год
    //
    //   const hours = ("0" + dateTime.getHours()).slice(-2); // Извлекаем часы и добавляем ведущий ноль при необходимости
    //   const minutes = ("0" + dateTime.getMinutes()).slice(-2); // Извлекаем минуты и добавляем ведущий ноль при необходимости
    //
    //   const formattedDate = `${day}.${month}.${year}`; // Форматируем дату в требуемый формат
    //   const formattedTime = `${hours}:${minutes}`; // Форматируем время в требуемый формат
    //
    //   gameitem.innerHTML = `
    //     <div class="game-item__date">
    //     ${formattedDate} ${formattedTime}
    //     </div>
    //     <p>${siteLanguage.statsPage.menuHeader.gameBackgamonsText}</p>
    //     <p class="game-item__isWon">${
    //       siteLanguage.profilePage.myGamesPage.statsItem.game
    //   } <span> ${
    //       game.isWinner
    //           ? siteLanguage.profilePage.myGamesPage.statsItem.won
    //           : siteLanguage.profilePage.myGamesPage.statsItem.lost
    //   }!</span></p>
    //     <p>${siteLanguage.profilePage.myGamesPage.statsItem.room}: ${
    //       game.roomId
    //   }</p>
    //     <p>${siteLanguage.profilePage.myGamesPage.statsItem.table}: ${
    //       game.tableId
    //   }</p>
    //     <p>${siteLanguage.profilePage.myGamesPage.statsItem.playersAmount}: ${
    //       game.playerMode
    //   }</p>
    //     <p>${siteLanguage.profilePage.myGamesPage.statsItem.gameMode}: ${
    //       game.gameMode == "CLASSIC"
    //           ? siteLanguage.profilePage.myGamesPage.statsItem.classic
    //           : siteLanguage.profilePage.myGamesPage.statsItem.telephone
    //   }</p>
    //     <p>${siteLanguage.profilePage.myGamesPage.statsItem.bet}: ${bet.toFixed(
    //       2
    //   )}₼</p>
    //     ${
    //       game.isWinner
    //           ? `<p>${
    //               siteLanguage.profilePage.myGamesPage.statsItem.pureWin
    //           }: ${game.winSum.toFixed(2)}₼</p>
    //           <p>${
    //               siteLanguage.profilePage.myGamesPage.statsItem.winCommission
    //           }: ${(game.winSum + bet).toFixed(2)}₼</p>
    //           `
    //           : `${siteLanguage.profilePage.myGamesPage.statsItem.totalBank}: ${(
    //               bet * game.playerMode
    //           ).toFixed(2)}₼`
    //   }
    //     <p>${
    //       siteLanguage.profilePage.myGamesPage.statsItem.roomCommission
    //   }: 15%</p>
    //   `;
    //
    //   mainBlock.insertBefore(gameitem, mainBlock.firstChild);
    // });

    // sort all games by date
    let games = document.querySelectorAll(".game-item");
    games = [...games];
    games.sort((a, b) => {
      return (
          new Date(b.getAttribute("date")) - new Date(a.getAttribute("date"))
      );
    });
    games.forEach((game) => {
      mainBlock.appendChild(game);
    });
  }
}

function createHistoryUserTickets(parent, tickets) {
  let siteLanguage = window.siteLanguage;
  // ticket = ticket.card;
  tickets.forEach((ticket) => {
    let ticketCard = JSON.parse(ticket.card);
    let ticketBlock = document.createElement("ul");
    ticketBlock.classList.add("loto-gamemain__ticket");
    ticketCard.forEach((cell) => {
      let ticketCell = document.createElement("li");
      ticketCell.classList.add("ticket-cell");
      ticketCell.innerHTML = cell;
      ticketBlock.appendChild(ticketCell);
    });
    parent.appendChild(ticketBlock);
  });
  // let tickets =
  // tickets.forEach(ticket=>{
  //   ticket.forEach(cell=>{
  //     let ticketCell = document.createElement("li");
  //     ticketCell.classList.add("ticket-cell");
  //     ticketCell.innerHTML = cell;
  //     ticket.appendChild(ticketCell);
  //   })
  // })
  // let ticket = document.createElement("ul");
  //   ticket.classList.add("loto-gamemain__ticket");
  //   // ticket.setAttribute("id", ticketId);
  //   cells.forEach((cell) => {
  //     let ticketCell = document.createElement("li");
  //     ticketCell.classList.add("ticket-cell");
  //     ticketCell.innerHTML = cell;
  //     ticket.appendChild(ticketCell);
  //   });
  //   ticketsBody.appendChild(ticket);
}

async function openUserBonuses() {
  let siteLanguage = window.siteLanguage;

  let main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }
  // убираем навигацию сайта
  let footer = document.querySelector("#footer");
  if (footer && !footer.classList.contains("d-none")) {
    footer.classList.add("d-none");
    main.classList.remove("footer__padding");
  }
  main.innerHTML = `
  <div class="change-tokens-page">
  
  <div class="change-tokens-page__container">
    <div class="change-tokens-page-form">
      <div class="change-tokens-page-form__title">
        ${siteLanguage.profilePage.bonusesPage.balanceText}: <span>0</span>
      </div>
      <div class="change-tokens-page-form__info">
        ${siteLanguage.profilePage.bonusesPage.changeCofText}
      </div>
      <div class="change-tokens-page-form__block">
        <div class="change-tokens-page-form__block-row">
          <p>${siteLanguage.profilePage.bonusesPage.pointToChangeText}</p>
          <input type="number" max="9999" maxlength="4" pattern="[0-9]{4}" class="change-tokens-input" />
        </div>
        <div class="change-tokens-page-form__block-row">
          <div class="get-sum-block">  <p>${siteLanguage.profilePage.bonusesPage.pointToGetText}:</p>
            <span>0 ₼</span></div>
        
        <button class="change-tokens-page-form__block-button">${siteLanguage.profilePage.bonusesPage.changeButtonText}</button>

        </div>
      </div>
      <div class="change-tokens-page-form__alert-text">${siteLanguage.profilePage.bonusesPage.alertText}</div>
      <button class="change-tokens-page__exit-button"> 
        <p>${siteLanguage.profilePage.bonusesPage.returnBtnText}</p>
        <img src="img/logout.png" alt="logout" /> 
      </button>
    </div>
    <div class="change-tokens-page-description">${siteLanguage.profilePage.bonusesPage.mainDescription}</div>
  </div>
</div>
  `;

  const changeTokensInput = document.querySelector(".change-tokens-input");
  changeTokensInput.addEventListener("input", () => {
    // make 4 digits max
    changeTokensInput.value = changeTokensInput.value.replace(/[^0-9]/g, "");
    changeTokensInput.value = changeTokensInput.value.slice(0, 4);
  });

  const exitButton = document.querySelector(".change-tokens-page__exit-button");
  exitButton.addEventListener("click", function () {
    openProfilePage();
  });

  const input = document.querySelector(".change-tokens-page-form__block input");
  const balanceSpan = document.querySelector(
    ".change-tokens-page-form__title span"
  );

  const stats = await impHttp.getUserStats();

  if (stats.status == 200) {
    const balance = stats.data.lotoTokensBalance;

    balanceSpan.innerHTML = balance.toFixed(2);
  }

  const result = document.querySelector(
    ".change-tokens-page-form__block-row span"
  );

  input.addEventListener("input", (e) => {
    const value = e.target.value;

    let addedBalance = 0;
    addedBalance += Math.floor(value / 100) / 5;
    const remainder = value % 100;

    if (remainder >= 1 && remainder < 10) {
      addedBalance += 0.02;
    } else if (remainder >= 10 && remainder <= 20) {
      addedBalance += 0.04;
    } else if (remainder > 20 && remainder <= 30) {
      addedBalance += 0.05;
    } else if (remainder > 30 && remainder <= 40) {
      addedBalance += 0.06;
    } else if (remainder > 40 && remainder <= 50) {
      addedBalance += 0.1;
    } else if (remainder > 50 && remainder <= 60) {
      addedBalance += 0.13;
    } else if (remainder > 60 && remainder <= 70) {
      addedBalance += 0.14;
    } else if (remainder > 70 && remainder <= 80) {
      addedBalance += 0.15;
    } else if (remainder > 80 && remainder < 100) {
      addedBalance += 0.17;
    }

    result.innerHTML = `${addedBalance.toFixed(2)} ₼`;
  });

  const exhangeButton = document.querySelector(
    ".change-tokens-page-form__block-button"
  );

  exhangeButton.addEventListener("click", async () => {
    const tokens = input.value;

    if (tokens < 100) {
      impPopup.openErorPopup(siteLanguage.profilePage.bonusesPage.alertText);
      return;
    }

    // if (tokens > balance) {
    //   impPopup.openErorPopup("Недостаточно поинтов для обмена");
    // }

    const response = await impHttp.exchangeTokens(tokens);

    if (response.data.message == "ERR_NOT_ENOUGH_TOKENS") {
      impPopup.openErorPopup(siteLanguage.popups.notEnoughPoints);
      return;
    } else if (response.data.message == "ERR_LESS_100") {
      impPopup.openErorPopup(siteLanguage.profilePage.bonusesPage.alertText);
      return;
    }

    impPopup.open(siteLanguage.popups.pointsSuccess, 200);

    impAuthInterface.updateBalance(response.data.balance);

    const stats = await impHttp.getUserStats();
    if (stats.status == 200) {
      const balance = stats.data.lotoTokensBalance;

      balanceSpan.innerHTML = balance.toFixed(2);
    }
  });
}

export function openChangePasswordForm() {
  let siteLanguage = window.siteLanguage;

  let main = document.querySelector(".main__container");

  // let profilePage = document.createElement("div");
  // profilePage.classList.add(".password-form");
  main.innerHTML = `
  <div class = 'password-form'>
  <div class="password-form-main">
    <div class="password-form-main__block profile-block">
      <div class="password-form-block__section">
        <div class="password-form-block__item">
          <label for="old-password">${siteLanguage.profilePage.changePasswordPage.oldPassText}</label>
          <input type="password" id="old-password" class=""> 
        </div>
        <div class="password-form-block__item">
          <label for="new-password">${siteLanguage.profilePage.changePasswordPage.newPassText}</label>
          <input type="password" id="new-password" class="">
        </div>
        <div class="password-form-block__item">
          <label for="new-password-repeat">${siteLanguage.profilePage.changePasswordPage.repeatNewPassText}</label>
          <input type="password" id="new-password-repeat" class="">
        </div>
        <div class="password-form-block__item password-button change-password">
          <h4>${siteLanguage.profilePage.changePasswordPage.saveBtnText}</h4>
        </div>

        <div class="password-form-block__exit-button">
          <p>${siteLanguage.profilePage.changePasswordPage.returnBtnText}</p>
          <img src="img/logout.png" alt="logout" />
        </div>
      </div>
    </div>
  </div>
  </div>
  `;

  let profilePage = document.querySelector(".password-form");

  // выйти назад в профиль
  let buttonBack = document.querySelector(".password-form-block__exit-button");
  if (buttonBack) {
    buttonBack.addEventListener("click", function () {
      openProfilePage();
    });
  }

  // кнопка изменения пароля
  let changePasswordButton = profilePage.querySelector(".change-password");
  changePasswordButton.addEventListener("click", async function () {
    let oldPassword = document.querySelector("#old-password").value;
    let newPassword = document.querySelector("#new-password").value;
    let newPasswordRepeat = document.querySelector(
      "#new-password-repeat"
    ).value;
    if (newPassword != newPasswordRepeat) {
      impPopup.open(siteLanguage.popups.passwordsNotMatch, 400);
      return;
    }

    let data = {
      password: oldPassword,
      newPassword: newPassword,
    };

    let status = await impHttp.changePassword(data);
    if (status.data == false) {
      impPopup.open(siteLanguage.popups.wrongPassword, 400);
      return;
    }
    impPopup.open(siteLanguage.popups.passwordChangeSuccess, 200);
    openProfilePage();
  });
}
async function openPayments() {
  let siteLanguage = window.siteLanguage;
  const main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }
  main.innerHTML = `
  <section class="admin-withdraw-page admin-withdraw">
    <div class="admin-withdraw__content">
      <div class="admin-withdraw__table">
        <div class="admin-withdraw-table__header table-header">
          <div class="table-header__item">Ник</div>
          <div class="table-header__item">Игры</div>
          <div class="table-header__item">Пополнял</div>
          <div class="table-header__item">Вывод</div>
          <div class="table-header__item">Карта</div>
          <div class="table-header__item">Получатель</div>
          <div class="table-header__item">Срок действия</div>
        </div>
        <div class="admin-withdraw-table__body table-body">
          
        </div>
      </div>
      <button class = 'admin-withdraw-submit-button'>сохранить</button>
    </div>
  </section>
  `;

  const submitButton = document.querySelector(".admin-withdraw-submit-button");
  submitButton.addEventListener("click", async () => {
    const checkboxes = document.querySelectorAll(".item-card-checked");

    const payouts = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        payouts.push(+checkbox.getAttribute("payoutId"));
      }
    });

    // disable checkboxes
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkbox.disabled = true;
      }
    });

    const result = await impHttp.checkPayouts(payouts);
    if (result.status == 200) {
      impPopup.open(siteLanguage.popups.withdrawSuccess);
    } else {
      impPopup.openErorPopup(
        siteLanguage.profilePage.myGamesPage.statsItem.errorText
      );
    }
  });

  const { data: payments } = await impHttp.getPayouts();

  const tableBody = document.querySelector(".table-body");

  payments.forEach((user) => {
    user.payouts.forEach((payout) => {
      const paymentItem = document.createElement("div");
      paymentItem.classList.add("table-body__item", "user-withdraw-item");
      if (payout.checked) {
        paymentItem.classList.add("accepted");
      }
      // // console.log(typeof payout.checked, payout.checked);
      paymentItem.innerHTML = `
        <div class="user-withdraw-item__item item-username">${
          user.username
        }</div>
        <div class="user-withdraw-item__item item-games">${
          user.stat.gameLotoPlayed + user.stat.gameDominoPlayed + user.stat.gameNardsPlayed
        }</div>
        <div class="user-withdraw-item__item item-topup">${
          user.stat.deposited
        }</div>
        <div class="user-withdraw-item__item item-withdraw">${
          payout.withdrawAmount
        }</div>
        <div class="user-withdraw-item__item item-card">${
          payout.cardNumber
        }</div>
        <div class="user-withdraw-item__item item-card-name">${
          payout.cardHolder
        }</div>
        <div class="user-withdraw-item__item item-card-date">${
          payout.validity
        }</div>
        <input class="user-withdraw-item__item item-card-checked" type="checkbox" name="" payoutId=${
          payout.id
        } id="">
      `;

      tableBody.appendChild(paymentItem);

      let flag = paymentItem.querySelector(".item-card-checked");

      flag.addEventListener("input", (e) => {
        if (flag.checked) {
          paymentItem.classList.add("accepted");
        } else {
          paymentItem.classList.remove("accepted");
        }
      });

      if (payout.checked) {
        flag.checked = true;
        flag.disabled = true;
      } else {
        flag.checked = false;
      }
    });
  });
}

async function openTransactions() {
  let siteLanguage = window.siteLanguage;

  let localUser = localStorage.getItem("user");

  if (localUser) {
    localUser = JSON.parse(localUser);
  }

  if (!localUser) {
    return;
  }

  const main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }
  main.innerHTML = `
    <section class="transactions-page">
      <div class="transactions__content">
        <div class="pader user-game-history-header" style="width:100%;margin-bottom:20px;">
          <div class="user-game-history-header__back">
            <p>${siteLanguage.profilePage.bonusesPage.returnBtnText}</p>
            <img src="img/logout.png" alt="logout" /></div>
          <h3 class="user-game-history-header__title">${siteLanguage.profilePage.profileDetailsPage.transactionsBtnText}</h3>
        </div>
        <div class="transactions__table">
          <div class="transactions-table__header">
            <div class="table-header__item">${siteLanguage.profilePage.transactionsPage.tableheader.nickText}</div>
            <div class="table-header__item">${siteLanguage.profilePage.transactionsPage.tableheader.typeText}</div>
            <div class="table-header__item">${siteLanguage.profilePage.transactionsPage.tableheader.sumText}</div>
            <div class="table-header__item">${siteLanguage.profilePage.transactionsPage.tableheader.dateText}</div>
          </div>
          <div class="transactions-table__body">
          </div>
        </div>
      </div>
    </section>
  `;

  let buttonBack = document.querySelector(".user-game-history-header__back");
  if (buttonBack) {
    buttonBack.addEventListener("click", function () {
      openProfilePage();
    });
  }

  const { data: users } = await impHttp.getPayouts();
  // // console.log(users[0]);
  let transactions = [];
  const userId = localUser.userId;
  users.forEach((user) => {
    if (user.id == userId) {
      user?.payouts.forEach((payout) => {
        transactions.push({
          username: user.username,
          type: siteLanguage.profilePage.transactionsPage.tableItem.typeText1,
          sum: payout.withdrawAmount,
          date: new Date(payout.createdAt).toLocaleString("ru-RU"),
        });
      });
      user?.deposits.forEach((deposit) => {
        transactions.push({
          username: user.username,
          type: siteLanguage.profilePage.transactionsPage.tableItem.typeText2,
          sum: deposit.depositAmount,
          date: new Date(deposit.createdAt).toLocaleString("ru-RU"),
        });
      });
    }
  });

  // sort transactions by date
  transactions.sort((a, b) => {
    return Date.parse(b.date) - Date.parse(a.date);
  });

  const tableBody = document.querySelector(".transactions-table__body");

  transactions.forEach((transaction) => {
    const payoutItem = document.createElement("div");
    payoutItem.classList.add("transactions-table__item");
    payoutItem.innerHTML = `
    <p>${transaction.username}</p>
    <p>${transaction.type}</p>
    <p>${transaction.sum}</p>
    <p>${transaction.date}</p>
  `;
    tableBody.appendChild(payoutItem);
  });

  if (transactions.length === 0) {
    tableBody.innerHTML = `<span style='color:#fff'>${siteLanguage.popups.noTransactions}</span>`;
  }
}

async function getProfileInfo() {
  let userInfo = await impAuth.getUser();
  return userInfo;
}

function getManyFilesFromInput(input) {
  let inputButton = input;
  // let prewiewBlock = thisForm.querySelector(".image-preview");
  let files = inputButton.files || inputButton.currentTarget.files;
  let reader = [];
  let image = null;

  for (let i = 0; i < files.length; i++) {
    reader[i] = new FileReader();
    reader[i].readAsDataURL(files[i]);
    reader[i].onload = () => {
      // let img = document.createElement("img");
      // img.classList.add("image-preview__img");
      // img.src = reader[i].result;
      // prewiewBlock.innerHTML = "";
      // prewiewBlock.appendChild(img);

      image = reader[i].result;
      console.log(reader[i].result);
      return reader[i].result;
    };
  }

  return image;
}

async function getFileFromInput(input) {
  let siteLanguage = window.siteLanguage;

  return new Promise((resolve, reject) => {
    let inputButton = input;
    let file = inputButton.files[0];

    if (
      file.type != "image/png" &&
      file.type != "image/jpg" &&
      file.type != "image/jpeg"
    ) {
      impPopup.openErorPopup(siteLanguage.popups.unsupportedExtension);
      return null;
    }

    const maxSizeInBytes = 1.5 * 1024 * 1024; // 2.5 MB в байтах

    if (file.size > maxSizeInBytes) {
      impPopup.openErorPopup(siteLanguage.popups.maxsizefile);
      return;
    }

    let reader = new FileReader();

    reader.onload = (event) => {
      let image = event.target.result;
      resolve(image); // Повертаємо результат у разі успішного завершення читання файлу
    };

    reader.onerror = (error) => {
      reject(error); // У випадку помилки повертаємо об'єкт помилки
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      reject(new Error("Файл не обраний")); // Повертаємо помилку, якщо файл не обраний
    }
  });
}
