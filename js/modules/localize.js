const loadLocalizationFile = async () => {
  const localize = await fetch("./json/localize.json");
  let localizationFile = await localize.json();
  return localizationFile;
};

export async function getCurrentSiteLang() {
  const language = localStorage.getItem("language");
  let localizationFile = await loadLocalizationFile();
  if (!language) {
    localStorage.setItem("language", "ru");
    return localizationFile.ru;
  }
  switch (language) {
    case "ru":
      return localizationFile.ru;
    case "EN":
      return localizationFile.en;
    case "UA":
      return localizationFile.ua;
    case "AZ":
      return localizationFile.az;
    case "TR":
      return localizationFile.tr;
  }
}

export function translateMainPage() {
  let siteLanguage = window.siteLanguage;
  let mainPage = document.querySelector(".games");
  if (mainPage) {
    let timerBlocks = mainPage.querySelectorAll(".timer-block__text");
    let onlineBlocks = mainPage.querySelectorAll(".lobby-room-online p");
    let prevBankBlocks = mainPage.querySelectorAll(".prev-bank p");
    let priceTextBlocks = mainPage.querySelectorAll(".price-text");
    timerBlocks.forEach((timerBlock) => {
      timerBlock.innerHTML = siteLanguage.mainPage.gamecards.timerTextWaiting;
    });
    onlineBlocks.forEach((onlineBlock) => {
      onlineBlock.innerHTML = `${siteLanguage.mainPage.gamecards.onlineText}: <span>0</span>`;
    });
    prevBankBlocks.forEach((prevBankBlock) => {
      prevBankBlock.innerHTML = `${siteLanguage.mainPage.gamecards.bankText}: <span class="game__room-prevbank-sum">0</span> ₼`;
    });
    priceTextBlocks.forEach((priceTextBlock) => {
      priceTextBlock.innerHTML = `${siteLanguage.mainPage.gamecards.priceText}`;
    });
  }
}

export function translateGameChooseMenu() {
  let siteLanguage = window.siteLanguage;
  let mainPage = document.querySelector(".domino-choose");
  if (mainPage) {
    let lotoButton = mainPage.querySelector(".mode-item__button.mode-loto");
    if (lotoButton) {
      lotoButton.innerHTML = siteLanguage.chooseModeMenu.loto;
    }
    let domnioClassicButton = mainPage.querySelector(
      ".mode-item__button.mode-dom-classic"
    );
    if (domnioClassicButton) {
      domnioClassicButton.innerHTML = siteLanguage.chooseModeMenu.dominoClassic;
    }
    let dominoClassicText = mainPage.querySelector(
      ".choose-mode__item.classic .mode-item__info.game-info"
    );
    if (dominoClassicText) {
      dominoClassicText.innerHTML =
        siteLanguage.chooseModeMenu.dominoClassicLabel;
    }
    let domnioTelephoneButton = mainPage.querySelector(
      ".mode-item__button.mode-dom-telephone"
    );
    if (domnioTelephoneButton) {
      domnioTelephoneButton.innerHTML =
        siteLanguage.chooseModeMenu.dominoTelephone;
    }
    let playersLabel = mainPage.querySelector(".players-info-label");
    if (playersLabel) {
      playersLabel.innerHTML = siteLanguage.chooseModeMenu.players;
    }
    let dominoTelephoneText = mainPage.querySelector(
      ".choose-mode__item.telephone .mode-item__info.game-info"
    );
    if (dominoTelephoneText) {
      dominoTelephoneText.innerHTML = siteLanguage.chooseModeMenu.earnPoints;
    }
    let dominoesPlayersInfo = mainPage.querySelectorAll(
      ".mode-item__info.players-info"
    );
    dominoesPlayersInfo.forEach((info) => {
      info.innerHTML = `<p>2/4</p> <p>${siteLanguage.chooseModeMenu.players}</p>`;
    });
    // domino-choose__button choose-mode__item mode-item classic
    let backgammonButton = mainPage.querySelector(
      ".mode-item__button.mode-dom-backgammons"
    );
    if (backgammonButton) {
      backgammonButton.innerHTML = siteLanguage.chooseModeMenu.backgammon;
    }
    let backgammonChampButton = mainPage.querySelector(
      ".mode-item__button.mode-dom-backgammons-champ"
    );
    if (backgammonChampButton) {
      backgammonChampButton.innerHTML =
        siteLanguage.chooseModeMenu.backgammonSuper;
    }
  }
}

export function translateProfilePage() {
  let siteLanguage = window.siteLanguage;
  let profilePage = document.querySelector(".profile-page");
  if (profilePage) {
    let usernameBlock = profilePage.querySelector(".username-label");
    let nameBlock = profilePage.querySelector(".name-label");
    let emailBlock = profilePage.querySelector(".email-label");
    let saveButtonBlock = profilePage.querySelector(".profile__save");
    let changeLangBlock = profilePage.querySelector(".change-language p");
    let transactionsBlock = profilePage.querySelector(".transactions p");
    let barrelsBlock = profilePage.querySelector(
      ".user-cask-color .text-block"
    );
    let goBackBlock = profilePage.querySelector(".go-back p");
    usernameBlock.innerHTML =
      siteLanguage.profilePage.profileDetailsPage.usernameText;
    nameBlock.innerHTML = siteLanguage.profilePage.profileDetailsPage.nameText;
    emailBlock.innerHTML =
      siteLanguage.profilePage.profileDetailsPage.emailText;
    saveButtonBlock.innerHTML =
      siteLanguage.profilePage.profileDetailsPage.saveButtonText;
    changeLangBlock.innerHTML =
      siteLanguage.profilePage.profileDetailsPage.changeLanguageBtnText;
    transactionsBlock.innerHTML =
      siteLanguage.profilePage.profileDetailsPage.transactionsBtnText;
    barrelsBlock.innerHTML = siteLanguage.profilePage.mainButtons.casksBtnText;
    goBackBlock.innerHTML =
      siteLanguage.profilePage.profileDetailsPage.returnBtnText;
  }
}

export function translateAuthPage() {
  let siteLanguage = window.siteLanguage;
  let authPage = document.querySelector(".registration");
  if (authPage && authPage.classList.contains("opened")) {
    let selectLanguageText = authPage.querySelector(
      ".select-language__text-top"
    );
    selectLanguageText.innerHTML = siteLanguage.authPage.chooseLanguage;

    let selectLanguageTextBottom = authPage.querySelector(
      ".select-language__text span"
    );
    let selectLanguageIcon = authPage.querySelector(
      ".select-language .select-language__img"
    );

    switch (localStorage.getItem("language")) {
      case "ru":
        selectLanguageTextBottom.innerHTML = "Русский";
        selectLanguageIcon.innerHTML = `<img src="./img/ru-lang.png" alt="AZ" />`;
        break;
      case "EN":
        selectLanguageTextBottom.innerHTML = "English";
        selectLanguageIcon.innerHTML = `<img src="./img/en-lang.png" alt="AZ" />`;
        break;
      case "UA":
        selectLanguageTextBottom.innerHTML = "Українська";
        selectLanguageIcon.innerHTML = `<img src="./img/ua-lang.png" alt="AZ" />`;
        break;
      case "AZ":
        selectLanguageTextBottom.innerHTML = "Azərbaycan";
        selectLanguageIcon.innerHTML = `<img src="./img/az-lang.png" alt="AZ" />`;
        break;
      case "TR":
        selectLanguageTextBottom.innerHTML = "Türk";
        selectLanguageIcon.innerHTML = `<img src="./img/tr-lang.png" alt="AZ" />`;
        break;
    }

    let registration = authPage.querySelector(".form-body-registration");
    if (registration) {
      let regTitle = document.querySelector(".form-header__heading");
      regTitle.innerHTML = siteLanguage.authPage.registration.title;
      let username = registration.querySelector(".username-input");
      username.placeholder = siteLanguage.authPage.registration.usernameText;
      let name = registration.querySelector(".name-input");
      name.placeholder = siteLanguage.authPage.registration.nameText;
      let email = registration.querySelector(".email-input");
      email.placeholder = siteLanguage.authPage.registration.emailText;
      let password = registration.querySelector(".password-input");
      password.placeholder = siteLanguage.authPage.registration.passwordText;
      let repeatPassword = registration.querySelector(".repeat-password-input");
      repeatPassword.placeholder =
        siteLanguage.authPage.registration.repeatPasswordText;
      let age = registration.querySelector(".form-body__checkbox-text.age");
      age.innerHTML = siteLanguage.authPage.registration.ageAccept;

      let pivacyAndTerms = registration.querySelector(
        ".form-body__checkbox-text.terms"
      );
      pivacyAndTerms.innerHTML = ` ${siteLanguage.authPage.registration.termsAccept} <a href="#conditions" target="_blank" class="form-body__link">${siteLanguage.authPage.registration.termsLink}</a> ${siteLanguage.authPage.registration.and} <a href="#privacy-policy" target="_blank" class="form-body__link">${siteLanguage.authPage.registration.privacyLink}</a>.`;

      let registerButton = registration.querySelector(
        ".form-body__button.registration-button"
      );
      registerButton.innerHTML =
        siteLanguage.authPage.registration.registerButtonText;

      let haveAccount = registration.querySelector(".form-body__no-account a");
      haveAccount.innerHTML = siteLanguage.authPage.registration.haveAccount;

      let loginButton = registration.querySelector(".open-login");
      loginButton.innerHTML =
        siteLanguage.authPage.registration.loginButtonText;
    }

    let login = authPage.querySelector(".form-body-login");
    if (login) {
      let title = document.querySelector(".form-header__heading");
      title.innerHTML = siteLanguage.authPage.login.title;

      let usernameLabel = login.querySelector(".username-label");
      usernameLabel.innerHTML = siteLanguage.authPage.login.usernameText;
      let passwordLabel = login.querySelector(".password-label");
      passwordLabel.innerHTML = siteLanguage.authPage.login.passwordText;

      let username = login.querySelector(".username-input");
      username.placeholder = siteLanguage.authPage.login.yourUsername;
      let password = login.querySelector(".password-input");
      password.placeholder = siteLanguage.authPage.login.yourPassword;

      let loginButton = login.querySelector(".login-button");
      loginButton.innerHTML = siteLanguage.authPage.login.loginButtonText;

      let noAccount = login.querySelector(".form-body__no-account a");
      noAccount.innerHTML = siteLanguage.authPage.login.noAccount;

      let registerButton = login.querySelector(".form-body__registration");
      registerButton.innerHTML = siteLanguage.authPage.login.registerButtonText;

      let forgotPassButton = login.querySelector(".form-body__forgot-pass a");
      if (forgotPassButton) {
        forgotPassButton.innerHTML = siteLanguage.authPage.login.forgotPassword;
      }
    }
  }
}
