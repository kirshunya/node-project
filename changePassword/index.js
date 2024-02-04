import * as impHttp from "../js/modules/http.js";

changePasswordForm();

function createForm() {
  let siteLanguage = window.siteLanguage;

  let wrapper = document.querySelector(".wrapper");
  if (wrapper) {
    wrapper.innerHTML = `
    <div id="changePasswordForm" class="changePassword">
    <div class="changePassword__container">
      <div class="changePassword__content">
        <form class="changePassword__form changePassword-form">
          <h2 class="changePassword-form__title">${siteLanguage.changePasswordPage.dropTitle}</h2>
          <div class="changePassword-form__row">
            <label for="change-password">${siteLanguage.changePasswordPage.newPass}</label>
            <input
              type="password"
              autocomplete="new-password"
              id="change-password"
            />
          </div>
          <div class="changePassword-form__row">
            <label for="change-password-repeat">${siteLanguage.changePasswordPage.samePass}</label>
            <input
              type="password"
              autocomplete="new-password"
              id="change-password-repeat"
            />
          </div>
          <button type="submit" class="changePassword-form__submit">
          ${siteLanguage.changePasswordPage.changePass}
          </button>
        </form>
      </div>
    </div>
  </div>
    `;
  }
}

async function changePasswordForm() {
  let siteLanguage = await getCurrentSiteLang();
  window.siteLanguage = siteLanguage;
  createForm();

  const url = new URL(window.location.href);

  // Получение значения параметра по его имени
  const userResetCode = url.searchParams.get("reset");
  url.search = "";
  history.replaceState({}, document.title, url.href);

  if (!userResetCode) {
    location = location.origin;
    return;
  }

  let form = document.querySelector(".changePassword-form");

  let submitButton = form.querySelector(".changePassword-form__submit");
  if (submitButton) {
    submitButton.addEventListener("click", async function (e) {
      e.preventDefault();

      let allErrors = form.querySelectorAll("._error");
      allErrors.forEach((item) => {
        item.classList.remove("_error");
      });

      let password = document.querySelector("#change-password");
      let newPassword = document.querySelector("#change-password-repeat");
      if (password && newPassword) {
        let siteLanguage = window.siteLanguage;

        let userPassword = password.value;
        let UserNewPassword = newPassword.value;

        if (
          userPassword.length >= 6 &&
          userPassword == UserNewPassword &&
          userPassword != ""
        ) {
          let responce = await impHttp.dropUserPassword(
            userResetCode,
            userPassword
          );
          password.value = "";
          newPassword.value = "";
          if (responce.status == 200 && responce.data.status == 200) {
            let wrapper = document.querySelector(".wrapper");
            wrapper.innerHTML = `
                  <div class="information-form-wrapper">
                    <div class="information-form">
                        <h2 class="information-form__title">${siteLanguage.changePasswordPage.congratulations}</h2>
                        <p class="information-form__text">
                        ${siteLanguage.changePasswordPage.success}
                        </p>
                        <button class="information-form__button">${siteLanguage.changePasswordPage.gotit}</button>
                    </div>
                  </div>`;
            let submitButton = document.querySelector(
              ".information-form__button"
            );
            submitButton.addEventListener("click", function () {
              location.pathname = "";
            });
          } else {
            let wrapper = document.querySelector(".wrapper");
            wrapper.innerHTML = ` 
                  <div class="information-form-wrapper">
                    <div class="information-form">
                        <h2 class="information-form__title">${siteLanguage.changePasswordPage.errorTitle}</h2>
                        <p class="information-form__text">
                        ${siteLanguage.changePasswordPage.failed}
                        </p>
                        <button class="information-form__button"> ${siteLanguage.changePasswordPage.gotit}</button>
                    </div>
                  </div>`;
            let submitButton = document.querySelector(
              ".information-form__button"
            );
            submitButton.addEventListener("click", function () {
              location.pathname = "";
            });
          }
        } else {
          password.classList.add("_error");
          newPassword.classList.add("_error");
        }
      }
    });
  }
}

async function getCurrentSiteLang() {
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

async function loadLocalizationFile() {
  const localize = await fetch("../json/localize.json");
  let localizationFile = await localize.json();
  return localizationFile;
}
