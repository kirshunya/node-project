import * as impAuth from "./modules/pages/authorization.js";
import * as impLotoNav from "./modules/loto/loto-navigation.js";
import * as impWSNavigation from "./modules/ws-navigation.js";
import * as impNav from "./modules/navigation.js";
import * as impHttp from "./modules/http.js";
import * as impAdminNav from "./modules/pages/admin-navigation.js";
import * as impMoveElement from "./modules/move-element.js";
import * as impLocalization from "./modules/localize.js";
import * as impPopup from "./modules/pages/popup.js";
import * as impDominoGame from "./modules/domino/domino-game.js";
import * as impDominoNav from "./modules/domino/domino-navigation.js";
window.ws = null;

// impDominoGame.tablePlacement();

let preloader = document.querySelector(".page-preloader");
let siteLanguage = await impLocalization.getCurrentSiteLang();
window.siteLanguage = siteLanguage;
// impLocalization.translateMainPage();
impLocalization.translateAuthPage();
impLocalization.translateGameChooseMenu();

try {
  impAuth.registrationForm();
  impAuth.createLoginForm();
} catch (e) {}
impNav.applyDefaultSettings();

impNav.addUnauthorizedHashListeners();

window.scrollTo(0, 0);

if (await impAuth.isAuth()) 
{
  preloader.classList.remove("d-none");
  location.hash = "";
  impNav.hideAuthorization();

  if (await impAuth.isAdmin()) {
    impAdminNav.createAdminButton();
  }
  let ws = impWSNavigation.connectWebsocketFunctions();
  // setInterval(() => {
  //   ws.send(JSON.stringify({ method: "ping" }));
  // }, 20000);
  impNav.pageNavigation(ws);
  impNav.addHashListeners(ws);
  // impNav.addHashListenersWS(ws);

  // надо для лото на первой странице
  impNav.addListeners(ws);

  location.hash = "#gamemode-choose";
  impDominoNav.dominoChoosePageListeners();

  window.scrollTo(0, 0);

  preloader.classList.add("d-none");

  let navMenu = document.querySelector(".menu-footer");
  if (navMenu) {
    const navButtons = navMenu.querySelectorAll(".active");
    navButtons.forEach((button) => button.classList.remove("active"));
    let openGamesLobbyBtn = document.querySelector(".open-games-menu");
    openGamesLobbyBtn.classList.add("active");
  }

  impDominoNav.openDominoChoosePage();
} 
// else {
//   console.log("not auth");
// }

// розблокировать чат после f5 а то он будет заблочен
window.isChatBlocked = false;

// если сайт стал офлайн то показываем окно ошибки

window.addEventListener("offline", (event) => {
  let siteLanguage = window.siteLanguage;
  impPopup.openConnectionErorPopup(
    `${siteLanguage.popups.connectionErrorText}`
  );
});

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};
