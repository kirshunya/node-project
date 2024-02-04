import * as impAudio from "./audio.js";

export function openSettingsPage() {
  let main = document.querySelector("main");
  if (main) {
    main.innerHTML = `<div class="main__container">
      <section class="settings-page">
        <div class="settings-page-header">
          <h3 class="settings-page-header__title">Настройки</h3>
        </div>
        <div class="settings-page-main">
          <div class="settings-page-main__block settings-block">
            <div class="settings-block__item settings-item">
              <h4 class="settings-item__title">Цвет выпавших боченков</h4>
              <div class="settings-item__colors">
                <div
                  color="red"
                  color-code="#FF5F5F"
                  class="red active"
                ></div>
                <div color="purple" color-code="#C870FF" class="purple"></div>
                <div color="yellow" color-code="#FCFF51" class="yellow"></div>
              </div>
            </div>

            <div class="settings-block__item settings-item">
              <h4 class="settings-item__title">Звуки</h4>
              <div class="settings-item__sounds">
                <div class="settings-item__sounds-item">
                  <span>Игра</span>
                  <input id="sounds-game" type="checkbox" checked="true" />
                </div>
                <div class="settings-item__sounds-item">
                  <span>Меню</span>
                  <input id="sounds-menu" type="checkbox" checked="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>`;
    loadSettings();
    addListeners();
  }
}

const loadSettings = () => {
  const color = localStorage.getItem("cask-color");
  const soundsGame = localStorage.getItem("sounds-game");
  const soundsMenu = localStorage.getItem("sounds-menu");

  if (color) {
    const colors = document.querySelectorAll(".settings-item__colors div");
    colors.forEach((color) => color.classList.remove("active"));
    colors.forEach((color) => {
      if (color.getAttribute("color-code") === color) {
        color.classList.add("active");
      }
    });
  }

  if (soundsGame) {
    const soundsGameInput = document.querySelector("#sounds-game");
    if (soundsGame == "false") {
      soundsGameInput.checked = false;
    } else {
      soundsGameInput.checked = true;
    }
  }

  if (soundsMenu) {
    const soundsMenuInput = document.querySelector("#sounds-menu");
    if (soundsMenu == "false") {
      soundsMenuInput.checked = false;
    } else {
      soundsMenuInput.checked = true;
    }
  }
};

const addListeners = () => {
  const colors = document.querySelectorAll(".settings-item__colors div");
  colors.forEach((color) => {
    color.addEventListener("click", () => {
      colors.forEach((color) => color.classList.remove("active"));
      color.classList.add("active");
      localStorage.setItem("cask-color", color.getAttribute("color-code"));
    });
  });

  const soundsGame = document.querySelector("#sounds-game");
  const soundsMenu = document.querySelector("#sounds-menu");

  soundsGame.addEventListener("change", () => {
    localStorage.setItem("sounds-game", soundsGame.checked);
    impAudio.setGameSoundsAllowed(soundsGame.checked);
  });

  soundsMenu.addEventListener("change", () => {
    localStorage.setItem("sounds-menu", soundsMenu.checked);
    impAudio.setMenuSoundsAllowed(soundsMenu.checked);
  });
};
