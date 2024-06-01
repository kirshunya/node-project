import * as impHttpRequests from "../http.js";
import * as impInterface from "../authinterface.js";
import * as impNav from "../navigation.js";
import * as impDominoNav from "../../modules/domino/domino-navigation.js";
// import * as impLotoNav from "./loto-navigation.js";
import * as impWSNavigation from "../ws-navigation.js";
import * as impAdminNav from "./admin-navigation.js";
import * as impPopup from "./popup.js";
import * as impLocalization from "../localize.js";

export function registrationForm() {
  // let openFormButtons = document.querySelectorAll(".open-registration");
  let registrationPopup = document.querySelector(".registration");
  // form functions

  let openLoginButton = registrationPopup.querySelector(".open-login");
  if (openLoginButton) {
    openLoginButton.addEventListener("click", function () {
      createLoginForm();
    });
  }

  let openRegistrationButton =
      registrationPopup.querySelector(".open-registration");
  if (openRegistrationButton) {
    openRegistrationButton.addEventListener("click", function () {
      createRegistrationForm();
    });
  }

  const languageSelectButton = document.querySelector(".select-language");
  languageSelectButton.addEventListener("click", function () {
    impPopup.openChangeLanguage();
  });

  // button.addEventListener("click", function () {
  //   if (button.classList.contains("registration-button")) {
  //     if (!button.classList.contains("active")) {
  //       createRegistrationForm();
  //     }
  //   } else if (button.classList.contains("login-button")) {
  //     if (!button.classList.contains("active")) {
  //       createLoginForm();
  //     }
  //   }
  // });
}

export function createRegistrationForm() {
  const siteLanguage = window.siteLanguage;
  // toggler position
  let registrationPopup = document.querySelector(".registration");
  let form = registrationPopup.querySelector(".registration-form");
  let formHeaderText = form.querySelector(".form-header__heading");
  formHeaderText.innerHTML = siteLanguage.authPage.registration.title;
  let errorBlock = form.querySelector(".auth-form-error");
  if (errorBlock) {
    errorBlock.innerHTML = "";
  }
  let formBody = form.querySelector(".form-body");

  formBody.innerHTML = `<div class="form-body-registration">
  <input
    type="text"
    placeholder="${siteLanguage.authPage.registration.usernameText}"
    class="form-body__input username-input"
  />

  <input
    type="text"
    placeholder="${siteLanguage.authPage.registration.nameText}"
    class="form-body__input name-input"
  />

  <input
    type="text"
    placeholder="${siteLanguage.authPage.registration.emailText}"
    class="form-body__input email-input"
  />

  <input
    type="password"
    placeholder="${siteLanguage.authPage.registration.passwordText}"
    class="form-body__input password-input"
  />
  <input
    type="password"
    placeholder="${siteLanguage.authPage.registration.repeatPasswordText}"
    class="form-body__input repeat-password-input"
  />

  <label class="registration-label">
    <input
      type="checkbox"
      class="form-body__checkbox"
      id="registration-age-checkbox"
    />
    <span class="form-body__checkbox-text age">
      ${siteLanguage.authPage.registration.ageAccept}
    </span>
  </label>

  <label class="registration-label">
    <input
      type="checkbox"
      class="form-body__checkbox"
      id="registration-terms-checkbox"
    />
    <span class="form-body__checkbox-text terms">
      ${siteLanguage.authPage.registration.termsAccept} <a href="#conditions" target="_blank" class="form-body__link">${siteLanguage.authPage.registration.termsLink}</a> ${siteLanguage.authPage.registration.and} <a href="#privacy-policy" target="_blank" class="form-body__link">${siteLanguage.authPage.registration.privacyLink}</a>.
    </span>
  </label>

  <button class="form-body__button registration-button">
    ${siteLanguage.authPage.registration.registerButtonText}
  </button>

  <div class="form-body__no-account">
    <a>${siteLanguage.authPage.registration.haveAccount}</a>
    <button class="form-body__registration open-login">
      ${siteLanguage.authPage.registration.loginButtonText}
    </button>
  </div>
</div>`;

  let openLoginButton = registrationPopup.querySelector(".open-login");
  if (openLoginButton) {
    openLoginButton.addEventListener("click", function () {
      createLoginForm();
    });
  }

  let submitButton = registrationPopup.querySelector(".registration-button");
  submitButton.addEventListener("click", async function (e) {
    e.preventDefault();
    let errorBlock = document.querySelector(".auth-form-error");
    errorBlock.innerHTML = "";
    let passwordValue =
        registrationPopup.querySelector(".password-input").value;
    let repeatPasswordValue = registrationPopup.querySelector(
        ".repeat-password-input"
    ).value;

    if (passwordValue != repeatPasswordValue) {
      errorBlock.innerHTML =
          siteLanguage.authPage.registration.repeatPasswordText;
      return;
    }


    let email = registrationPopup.querySelector(".email-input").value;
    let password = registrationPopup.querySelector(".password-input").value;
    let username = registrationPopup.querySelector(".username-input").value;
    let name = registrationPopup.querySelector(".name-input").value;
    if (username.length > 10) {
      // tyt
      errorBlock.innerHTML = siteLanguage.authPage.registration.longUsername;
      return;
    }

    if (password.length <= 6) {
      console.log(password);
      errorBlock.innerHTML = siteLanguage.popups.passwordError;
      return;
    }
    const ageCheckbox = document.querySelector("#registration-age-checkbox");
    const termsCheckbox = document.querySelector(
        "#registration-terms-checkbox"
    );

    if (!ageCheckbox.checked) {
      errorBlock.innerHTML = siteLanguage.popups.confirmAge;
      return;
    }

    if (!termsCheckbox.checked) {
      errorBlock.innerHTML = siteLanguage.popups.confirmTerms;
      return;
    }

    const registerData = {
      username,
      email,
      password,
      name,
    };

    let response = await impHttpRequests.registration(registerData);
    if (response.status == 200) {
      // registrationPopup.classList.remove("opened");
      // alert("Аккаунт создан, войдите в него");
      createLoginForm();
      impPopup.open(siteLanguage.popups.registrationSuccess);
    } else {
      switch (response.data.message) {
        case "ERR_USERNAME_ALREADY_EXISTS":
          errorBlock.innerHTML = siteLanguage.popups.usernameExists;
          break;
        case "ERR_EMAIL_ALREADY_EXISTS":
          errorBlock.innerHTML = siteLanguage.popups.emailExists;
          break;
        case "ERR_VALIDATION":
          errorBlock.innerHTML = siteLanguage.popups.registrationError;
          break;
        case "ERR_INVALID_PASSWORD":
          errorBlock.innerHTML = siteLanguage.popups.passwordError;
          break;
        default:
          errorBlock.innerHTML = siteLanguage.popups.registrationError;
          break;
      }
    }
  });
}

export function createLoginForm() {
  let siteLanguage = window.siteLanguage;
  // toggler position
  let registrationPopup = document.querySelector(".registration");
  let form = registrationPopup.querySelector(".registration-form");
  let formHeaderText = form.querySelector(".form-header__heading");
  formHeaderText.innerHTML = siteLanguage.authPage.login.title;
  const preloader = document.querySelector(".preloader");
  let formBody = form.querySelector(".form-body");

  let errorBlock = form.querySelector(".auth-form-error");
  if (errorBlock) {
    errorBlock.innerHTML = "";
  }

  formBody.innerHTML = `<div class="form-body-login">
  <p class="username-label">${siteLanguage.authPage.login.usernameText}</p>
  <input
    type="text"
    placeholder="${siteLanguage.authPage.login.yourUsername}"
    class="form-body__input username-input"
  />
  <p class="password-label">${siteLanguage.authPage.login.passwordText}</p>
  <input
    type="password"
    placeholder="${siteLanguage.authPage.login.yourPassword}"
    class="form-body__input password-input"
  />
  <button class="form-body__button login-button">${siteLanguage.authPage.login.loginButtonText}</button>
  <div class="form-body__no-account">
    <a>${siteLanguage.authPage.login.noAccount}</a>
    <button class="form-body__registration open-registration">
      ${siteLanguage.authPage.login.registerButtonText}
    </button>
  </div>
  <div class="form-body__forgot-pass">
    <a>${siteLanguage.authPage.login.forgotPassword}</a>
  </div>
</div>`;

  let openRegistrationButton =
      registrationPopup.querySelector(".open-registration");
  if (openRegistrationButton) {
    openRegistrationButton.addEventListener("click", function () {
      createRegistrationForm();
    });
  }

  const openForgotPassButton = document.querySelector(
      ".form-body__forgot-pass"
  );
  openForgotPassButton.addEventListener("click", function () {
    impPopup.openForgotPassPopup();
  });

  let submitButton = registrationPopup.querySelector(".login-button");

  submitButton.addEventListener("click", async function (e) {
    e.preventDefault();
    let username = registrationPopup.querySelector(".username-input").value;
    let password = registrationPopup.querySelector(".password-input").value;
    let loginData = {
      username,
      password,
    };
    let response = await impHttpRequests.login(loginData);
    if (response.status == 200) {
      // show auth interface
      registrationPopup.classList.remove("opened");
      impInterface.showUserInterface(response.data.user);
      let user = {
        username: response.data.user.username,
        balance: response.data.user.balance,
        name: response.data.user.name,
        userId: response.data.user.id,
        email: response.data.user.email,
        avatar: response.data.user.avatar,
        isAdmin: response.data.user.isAdmin,
        seeDominoClassic: response.data.user.seeDominoClassic,
        seeDominoTelephone: response.data.user.seeDominoTelephone,
      };

      localStorage.setItem("user", JSON.stringify(user));
      window.isAdmin = response.data.user.isAdmin;

      if (await isAuth()) {
        let ws = impWSNavigation.connectWebsocketFunctions();
        impNav.addHashListeners(ws);
        // impNav.addHashListenersWS(ws);
        // impNav.addListeners(ws);
        // impNav.addListeners(ws);
        location.hash = "#gamemode-choose";
        impDominoNav.dominoChoosePageListeners();
        impLocalization.translateGameChooseMenu();

        impNav.pageNavigation(ws);
        // проверка на активные игры в лото в даный момент

        let currentGames = await impNav.checkUserCurrentGames();

        switch (currentGames.currGame) {
          case "free":
            if (preloader) {
              preloader.classList.add("d-none");
            }
            break;
          case "loto":
            if (currentGames.gameStarted) {
              location.hash = `#loto-game-${currentGames.roomId}`;
            } else {
              location.hash = `#loto-room-${currentGames.roomId}`;
            }
            const localItemsToClear = JSON.parse(
                localStorage.getItem("localItemsToClear")
            );
            if (localItemsToClear) {
              localItemsToClear.forEach((item) => {
                localStorage.removeItem(item);
              });
              localStorage.removeItem("localItemsToClear");
            }
            // preloader.classList.add("d-none");
            break;
          case "domino":
            window.location.hash = `domino-room-table/${currentGames.roomId}/${
                currentGames.tableId
            }/${
                currentGames.playerMode
            }/${currentGames.gameMode.toUpperCase()}`;
            // preloader.classList.add("d-none");
            break;
        }
      }

      if (response.data.user.isAdmin) {
        impAdminNav.createAdminButton();
      }
    } else {
      const errorBlock = document.querySelector(".auth-form-error");
      errorBlock.innerHTML = siteLanguage.popups.registrationError;
    }
  });
}

export async function isAdmin() {
  let response = await impHttpRequests.getUser();
  if (response.status == 200) {
    if (response.data.isAdmin == true) {
      return true;
    } else return false;
  }
}

export async function getUser() {
  let response = await impHttpRequests.getUser();
  if (response.status == 200) {
    return response.data;
  } else {
    return false;
  }
}

export async function isAuth() {
  let response = await impHttpRequests.checkAuth();

  if (
      (response.status == 200 || response.statusText == "OK") &&
      response.data.username
  ) {
    let registrationPopup = document.querySelector(".registration");
    registrationPopup.classList.remove("opened");
    impInterface.showUserInterface(response.data);
    // console.log(response.data);
    let user = {
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

    localStorage.setItem("user", JSON.stringify(user));
    window.isAdmin = response.data.isAdmin;

    return true;
  } else {
    return false;
  }
}
