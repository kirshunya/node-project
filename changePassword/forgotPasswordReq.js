import * as impHttp from "../js/modules/http.js";
let html = document.querySelector("html");

export async function sendMailRequest() {
  let forgotPasswordPopup = document.querySelector(".changePasswordPopup");
  let forgotPasswordPopupContent =
    forgotPasswordPopup.querySelector(".popup__content");
  let siteLanguage = window.siteLanguage;
  let popupButton = document.querySelector(".popup__button");

  let allErrors = forgotPasswordPopup.querySelectorAll("._error");
  allErrors.forEach((item) => {
    item.classList.remove("_error");
  });

  let textError = forgotPasswordPopup.querySelector(".popup__text-error");
  if (textError) {
    textError.innerHTML = "";
  }

  let input = forgotPasswordPopup.querySelector(".change-password-mail-input");
  if (!input) {
    return;
  }
  let email = input.value;

  if (email && validateEmail(email)) {
    let preloader = document.createElement("div");
    preloader.classList.add("popup-preloader");
    forgotPasswordPopupContent.appendChild(preloader);
    let responce = await impHttp.changeUserPasswordEmailRequest(email);
    if (responce.status == 200) {
      input.value = "";

      if (popupButton) {
        popupButton.remove();
      }

      // делаем надпись что форма отправлена
      let sendedBlock = document.createElement("div");
      sendedBlock.classList.add("popup__sent-status");
      sendedBlock.innerHTML = siteLanguage.popups.sent;
      forgotPasswordPopupContent.appendChild(sendedBlock);
      preloader.remove();

      // forgotPasswordPopup.remove();
    } else {
      preloader.remove();
      input.classList.add("_error");
      if (responce?.data?.message == "ERR_EMAIL_NOT_FOUND" && textError) {
        textError.innerHTML = `${siteLanguage.popups.errorEmailNotFound}`;
      }
    }
  } else {
    input.classList.add("_error");
    if (textError) {
      textError.innerHTML = `${siteLanguage.popups.errorInFields}`;
    }
  }
}

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
