import * as impHttp from "../http.js";
import * as impPopup from "./popup.js";
import * as impDominoNavigation from "../domino/domino-navigation.js";
import { BetsLoaded } from "../backgammons/syncronous.js";

export function createAdminButton() {
  // create button in profile
  const profilePage = document.querySelector(".profile-page");
  if (profilePage) {
    const profileButtons = profilePage.querySelector(".profile__buttons.m20");
    const exitButton = profilePage.querySelector(".profile-page__footer");
    const adminButton = document.createElement("a");
    adminButton.classList.add("profile__button", "curpointer");
    adminButton.innerHTML = ` <img src="img/profile icons/profile.png" />
    <p>АДМИН-ПАНЕЛЬ</p>
    <img
      src="img/profile icons/chevron-right.png"
      alt="АДМИН-ПАНЕЛЬ"
    />`;

    profileButtons.appendChild(adminButton);
    adminButton.addEventListener("click", () => {
      redirectToAdminPage();
    });
  }
}

function addAdminFunctions() {
  const rooms = document.querySelectorAll(".admin-room");

  rooms.forEach((room) => {
    const botFlag = room.querySelector(".botFlag");
    const botCountInput = room.querySelector(".botCount");
    const ticketCountInput = room.querySelector(".ticketCount");
    const winChanceInput = room.querySelector(".winChance");
    const addBotBtn = room.querySelector(".addBotBtn");
    const roomId = room.getAttribute("roomId");

    if (botFlag.checked == false) {
      botCountInput.disabled = true;
      ticketCountInput.disabled = true;
      winChanceInput.disabled = true;
    }

    addBotBtn.addEventListener("click", () => {
      const botCountInput = room.querySelector(".botCount");
      const ticketCountInput = room.querySelector(".ticketCount");
      const winChanceInput = room.querySelector(".winChance");
      const roomId = room.getAttribute("roomId");
      // validation

      if (
        botCountInput.value < 0 ||
        ticketCountInput.value < 1 ||
        ticketCountInput.value > 6 ||
        winChanceInput.value < 1 ||
        winChanceInput.value > 100
      ) {
        // show popup
        impPopup.open("Ошибка. Введены некорректные данные", 400);
        return;
      }

      setAdminSettings(roomId);
    });

    botFlag.addEventListener("change", function () {
      const isChecked = botFlag.checked;

      botCountInput.disabled = !isChecked;
      ticketCountInput.disabled = !isChecked;
      winChanceInput.disabled = !isChecked;

      room.style.backgroundColor = isChecked ? "white" : "#f7f7f7";
    });
  });
}

export async function redirectToAdminPage() {
  let header = document.querySelector("header");
  let main = document.querySelector("main");
  const footer = document.querySelector("footer");
  footer.classList.add("d-none");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }
  let isCurrGamePage = document.querySelector(".loto-game-room-page");
  let isCurrLobbyPage = document.querySelector(".loto-room-page");

  // check if there is game in progress

  if (isCurrGamePage || isCurrLobbyPage) {
    impPopup.open("Нельзя перейти в админку во время игры", 400);
    return;
  }

  let lotoLeaders = await impHttp.getBotStats("loto");
  let showData = [];
  if (lotoLeaders.status == 200) {
    showData = lotoLeaders.data;
  } else {
    showData = [
      {
        moneyLost: 0,
        moneyWon: 0,
      },
    ];
  }

  let botWinStats = await impHttp.getAdminBotWins();
  let showbotWinStats = { room1: 0, room2: 0, room3: 0, room4: 0, room5: 0 };
  if (botWinStats.status == 200) {
    showbotWinStats = JSON.parse(botWinStats.data);
  }

  main.innerHTML = /* html */`
  <section class="admin">
  <div class="bot-stats">
      <h2>Статистика ботов</h2>
      <p>Денег выиграно: <span id="moneyLotoWon">${showData[0].moneyWon}</span></p>
      <p>Денег проиграно: <span id="moneyLotoLost">${showData[0].moneyLost}</span></p>
      <table>
        <tr>
          <th>Комната</th>
          <th>Количество побед</th>
        </tr>
        <tr>
          <td>Комната 1</td>
          <td>${showbotWinStats.room1}</td>
        </tr>
        <tr>
          <td>Комната 2</td>
          <td>${showbotWinStats.room2}</td>
        </tr>
        <tr>
          <td>Комната 3</td>
          <td>${showbotWinStats.room3}</td>
        </tr>
        <tr>
          <td>Комната 4</td>
          <td>${showbotWinStats.room4}</td>
        </tr>
        <tr>
          <td>Комната 5</td>
          <td>${showbotWinStats.room5}</td>
        </tr>
      </table>
    </div>
  <div class="admin-room" roomId = "1">
    
    <h2>Комната 1</h2>
    <label> <input type="checkbox" class="botFlag botFlag-1" /> Игра с ботами </label>
  
    <label>
      Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-1" />  (по стандарту 4)
    </label>
    
    <label>
      Макс. количество билетов: <input type="number" class="ticketCount ticketCount-1" /> (от 1 до 6)
    </label>
  
    <label>
      Шанс победы, %: <input type="number" class="winChance winChance-1" step="0.01" /> (для команды ботов, от 1 до 100)
    </label>
   
    <label>
      Джекпот:
      <input type="number" class="jackpot jackpot-1" step="0.01" />
    </label>
   
    <label>
      Количество бочек для выигрыша джекпота: 
      <input type="number" class="maxCasksJackpot maxCasksJackpot-1" step="1" />
    </label>
  
    <label> <input type="checkbox" class="canBotWinJackpot canBotWinJackpot-1" /> Бот может выиграть джекпот </label>
    
    <label>
      Шанс победы в джекпоте, %: <input type="number" class="jackpotWinChance jackpotWinChance-1" step="0.01" /> (для команды ботов, от 1 до 100)
    </label>
  
    <label>
      Минимальная сума для активации джекпота: <input type="number" class="minJackpotSum minJackpotSum-1" step="0.01" />
    </label>
 
    <button class="addBotBtn">Сохранить</button>
  </div>

  <div class="admin-room"  roomId = "2">
    <h2>Комната 2</h2>
    <label> <input type="checkbox" class="botFlag botFlag-2" /> Игра с ботами </label>
  
    <label>
      Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-2" /> (по стандарту 4)
    </label>
  
    <label>
      Макс. количество билетов на одного бота: <input type="number" class="ticketCount ticketCount-2" /> (от 1 до 6)
    </label>
  
    <label>
      Шанс победы, %: <input type="number" class="winChance winChance-2" step="0.01" /> (для команды ботов, от 1 до 100%)
    </label>
    
    <label>
      Джекпот:
      <input type="number" class="jackpot jackpot-1" step="0.01" />
    </label>        
    
    <label>
      Количество бочек для выигрыша джекпота: 
      <input type="number" class="maxCasksJackpot maxCasksJackpot-2" step="1" />
    </label>
    
    <label> <input type="checkbox" class="canBotWinJackpot canBotWinJackpot-2" /> Бот может выиграть джекпот </label>
  
    <label>
      Шанс победы в джекпоте, %: <input type="number" class="jackpotWinChance jackpotWinChance-2" step="0.01" /> (для команды ботов, от 1 до 100)
    </label>
    <label>
      Минимальная сума для активации джекпота: <input type="number" class="minJackpotSum minJackpotSum-1" step="0.01" />
    </label>
    
    <button class="addBotBtn">Сохранить</button>
  </div>

  <div class="admin-room" roomId = "3">
    <h2>Комната 3</h2>
    <label> <input type="checkbox" class="botFlag botFlag-3" /> Игра с ботами </label>
  
    <label>
      Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-3" /> (по стандарту 4)
    </label>
 
    <label>
      Макс. количество билетов: <input type="number" class="ticketCount ticketCount-3" /> (от 1 до 6)
    </label>
 
    <label>
      Шанс победы: <input type="number" class="winChance winChance-3" step="0.01" /> (для команды ботов, от 1 до 100%)
    </label>

    <label>
      Джекпот:
      <input type="number" class="jackpot jackpot-1" step="0.01" />
    </label>
 
    <label>
      Количество бочек для выигрыша джекпота: 
      <input type="number" class="maxCasksJackpot maxCasksJackpot-3" step="1" />
    </label>
   
    <label> <input type="checkbox" class="canBotWinJackpot canBotWinJackpot-3" /> Бот может выиграть джекпот </label>
   
    <label>
      Шанс победы в джекпоте, %: <input type="number" class="jackpotWinChance jackpotWinChance-3" step="0.01" /> (для команды ботов, от 1 до 100)
    </label>
    <label>
      Минимальная сума для активации джекпота: <input type="number" class="minJackpotSum minJackpotSum-1" step="0.01" />
    </label>
  
    <button class="addBotBtn">Сохранить</button>
  </div>

<div class="admin-room" roomId = "4">
  <h2>Комната 4</h2>
    <label> <input type="checkbox" class="botFlag botFlag-3" /> Игра с ботами </label>

    <label>
      Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-3" /> (по стандарту 4)
    </label>
 
    <label>
      Макс. количество билетов: <input type="number" class="ticketCount ticketCount-3" /> (от 1 до 6)
    </label>

    <label>
      Шанс победы: <input type="number" class="winChance winChance-3" step="0.01" /> (для команды ботов, от 1 до 100%)
    </label>
  
    <label>
      Джекпот:
      <input type="number" class="jackpot jackpot-1" step="0.01" />
    </label>
    
    <label>
      Количество бочек для выигрыша джекпота: 
      <input type="number" class="maxCasksJackpot maxCasksJackpot-4" step="1" />
    </label>

    <label> <input type="checkbox" class="canBotWinJackpot canBotWinJackpot-4" /> Бот может выиграть джекпот </label>
   
    <label>
      Шанс победы в джекпоте, %: <input type="number" class="jackpotWinChance jackpotWinChance-4" step="0.01" /> (для команды ботов, от 1 до 100)
    </label>
    <label>
      Минимальная сума для активации джекпота: <input type="number" class="minJackpotSum minJackpotSum-1" step="0.01" />
    </label>
    
    <button class="addBotBtn">Сохранить</button>
  </div>

<div class="admin-room" roomId = "5">
  <h2>Комната 5</h2>
    <label> <input type="checkbox" class="botFlag botFlag-3" /> Игра с ботами </label>
    
    <label>
      Макс. количество ботов, 1бот = 1человек: <input type="number" class="botCount botCount-3" /> (по стандарту 4)
    </label>
 
    <label>
      Макс. количество билетов: <input type="number" class="ticketCount ticketCount-3" /> (от 1 до 6)
    </label>
    
    <label>
      Шанс победы: <input type="number" class="winChance winChance-3" step="0.01" /> (для команды ботов, от 1 до 100%)
    </label>
  
    <label>
      Джекпот:
      <input type="number" class="jackpot jackpot-1" step="0.01" />
    </label>
  
    <label>
      Количество бочек для выигрыша джекпота: 
      <input type="number" class="maxCasksJackpot maxCasksJackpot-5" step="1" />
    </label>
   
    <label> <input type="checkbox" class="canBotWinJackpot canBotWinJackpot-5" /> Бот может выиграть джекпот </label>
    
    <label>
      Шанс победы в джекпоте, %: <input type="number" class="jackpotWinChance jackpotWinChance-5" step="0.01" /> (для команды ботов, от 1 до 100)
    </label>
    <label>
      Минимальная сума для активации джекпота: <input type="number" class="minJackpotSum minJackpotSum-1" step="0.01" />
    </label>
    
    <button class="addBotBtn">Сохранить</button>
  </div>
<div class="admin-stats-container-wrapper">
  <div class="admin-stats-container">
    <h2 class="admin-stats-title">Статистика выиграшей пользователей</h2>
  <div class="admin-stats-row admin-stats-header">
    <div class="admin-stats-column name">Имя</div>
    <div class="admin-stats-column won-loto">Выиграно в лото</div>
    <div class="admin-stats-column lost-loto">Проиграно в лото</div>
    <div class="admin-stats-column won-nardy">Выиграно в нарды</div>
    <div class="admin-stats-column lost-nardy">Проиграно в нарды</div>
    <div class="admin-stats-column won-domino">Выиграно в домино</div>
    <div class="admin-stats-column lost-domino">Проиграно в домино</div>
    <div class="admin-stats-column won-money">Выиграно всего</div>
    <div class="admin-stats-column lost-money">Проиграно всего</div>
  </div>
  <div class = "admin-stats-body"></div>
  </div>
</div>
<div class="admin-date-stats-container-wrapper">
    <h2 class="admin-stats-title black">Статистика по дням</h2>
    <input class="admin-date-stats-input" type="date">
    <button style="margin-left: 10px;" class="addBotBtn admin-date-stats-submit">Подтвердить</button>
    <div class="date-stats-table-wrapper">

    <h2>Лото</h2>

    <div class="date-stats-table">
      <div class="date-stats-header">
        <p class="date-stats-item bold">Ставка</p>
        <p class="date-stats-item bold">Количество билетов</p>
        <p class="date-stats-item bold">Собранная комиссия</p>
        <p class="date-stats-item bold">Сколько выигрывали сумму М боты</p>
        <p class="date-stats-item bold">Сколько билетов покупали боты</p>
      </div>
      
        <div class='date-stats-body'>
          <div class="date-stats-item date-stats-item-1">
            <p class="date-stats-field">0.20₼</p>
            <p class="date-stats-field"><span class="date-stats-field-tickets">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-commision">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-wonsum">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-botstickets">0</span></p>
          </div>
          <div class="date-stats-item date-stats-item-2">
            <p class="date-stats-field">0.50₼</p>
            <p class="date-stats-field"><span class="date-stats-field-tickets">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-commision">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-wonsum">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-botstickets">0</span></p>
          </div>
          <div class="date-stats-item date-stats-item-3">
            <p class="date-stats-field">1.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-tickets">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-commision">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-wonsum">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-botstickets">0</span></p>
          </div>
          <div class="date-stats-item date-stats-item-4">
            <p class="date-stats-field">5.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-tickets">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-commision">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-wonsum">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-botstickets">0</span></p>
          </div>
          <div class="date-stats-item date-stats-item-5">
            <p class="date-stats-field">10.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-tickets">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-commision">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-wonsum">0</span>₼</p>
            <p class="date-stats-field"><span class="date-stats-field-botstickets">0</span></p>
          </div>
        </div>
      </div>
    </div>
    <div class="date-stats-table-wrapper">
    <h2>Домино классик</h2>

    <div class="date-stats-domino-classic-table">
      <div class="date-stats-header">
        <p class="date-stats-item bold">Ставка</p>
        <p class="date-stats-item bold">Общее кол-во игроков</p>
        <p class="date-stats-item bold">Собранная комиссия</p>
      </div>
      
        <div class='date-stats-body-domino'>
          <div class="date-stats-item date-stats-item-1">
            <p class="date-stats-field">0.50₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-2">
            <p class="date-stats-field">1.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-3">
            <p class="date-stats-field">3.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-4">
            <p class="date-stats-field">5.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-5">
            <p class="date-stats-field">10.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
        </div>
      </div>
    </div>
    <div class="date-stats-table-wrapper">
      <h2>Домино телефон</h2>

      <div class="date-stats-domino-telephone-table">
        <div class="date-stats-header">
          <p class="date-stats-item bold">Ставка</p>
          <p class="date-stats-item bold">Общее кол-во игроков</p>
          <p class="date-stats-item bold">Собранная комиссия</p>
        </div>
      
        <div class='date-stats-body-domino'>
          <div class="date-stats-item date-stats-item-1">
            <p class="date-stats-field">0.50₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-2">
            <p class="date-stats-field">1.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-3">
            <p class="date-stats-field">3.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-4">
            <p class="date-stats-field">5.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
          <div class="date-stats-item date-stats-item-5">
            <p class="date-stats-field">10.00₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">0</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">0</span>₼</p>
          </div>
        </div>
      </div>
    </div>
    <div class="date-stats-table-wrapper">
      <h2>Нардинские</h2>

      <div class="date-stats-nards-table">
        <div class="date-stats-header">
          <p class="date-stats-item bold">Ставка</p>
          <p class="date-stats-item bold">Кол-во игр</p>
          <p class="date-stats-item bold">Собранная комиссия</p>
        </div>
      
        <div class='date-stats-body-nards'>
          downloading...
        </div>
      </div>
    </div>
  </div>
</div>
</section>
  `;
  await getAdminSettings();
  addAdminFunctions();

  createUsersStatsTable();
  await addDateGamesFunctions();
}

async function createUsersStatsTable() {
  let usersdata = await impHttp.getAllUsersAdminStats();

  if (usersdata.status != 200) {
    return;
  }
  const container = document.querySelector(".admin-stats-body");
  container.innerHTML = "";
  for (let index = 0; index < usersdata.data.length; index++) {
    const userObject = usersdata.data[index];

    let statsRow = document.createElement("div");
    statsRow.classList.add("admin-stats-row");
    statsRow.innerHTML = `<div class="admin-stats-column name">${userObject.username}</div>
    <div class="admin-stats-column won-loto">${userObject.lotoWon}</div>
    <div class="admin-stats-column lost-loto">${userObject.lotoLost}</div>
    <div class="admin-stats-column won-nardy">${userObject.nardsWon}</div>
    <div class="admin-stats-column lost-nardy">${userObject.nardsLost}</div>
    <div class="admin-stats-column won-domino">${userObject.dominoWon}</div>
    <div class="admin-stats-column lost-domino">${userObject.dominoLost}</div>
    <div class="admin-stats-column won-money">${userObject.moneyWon}</div>
    <div class="admin-stats-column lost-money">${userObject.moneyLost}</div>`;
    container.appendChild(statsRow);
  }
}

async function getAdminSettings() {
  let response = await impHttp.getLotoSettings();

  if (response.status == 200) {
    const rooms = document.querySelectorAll(".admin-room");

    rooms.forEach((room) => {
      const botFlag = room.querySelector(".botFlag");
      const botCountInput = room.querySelector(".botCount");
      const ticketCountInput = room.querySelector(".ticketCount");
      const winChanceInput = room.querySelector(".winChance");
      const jackpotInput = room.querySelector(".jackpot");
      const maxCasksJackpot = room.querySelector(".maxCasksJackpot");
      const canBotWinJackpot = room.querySelector(".canBotWinJackpot");
      const jackpotWinChanceInput = room.querySelector(".jackpotWinChance");
      const minJackpotSum = room.querySelector(".minJackpotSum");

      const roomId = room.getAttribute("roomId");

      const roomSettings = response.data.find(
        (item) => item.gameLevel == roomId
      );

      if (roomSettings) {
        botFlag.checked = roomSettings.allowBots;
        botCountInput.value = roomSettings.maxBots;
        ticketCountInput.value = roomSettings.maxTickets;
        winChanceInput.value = roomSettings.winChance;
        jackpotInput.value = roomSettings.jackpot;
        maxCasksJackpot.value = roomSettings.maxCasksJackpot;
        canBotWinJackpot.checked = roomSettings.canBotWinJackpot;
        jackpotWinChanceInput.value = roomSettings.jackpotWinChance;
        minJackpotSum.value = roomSettings.minJackpotSum;
      }
    });
  }
}

async function setAdminSettings(roomId) {
  const room = document.querySelector(`.admin-room[roomId="${roomId}"]`);

  const botFlag = room.querySelector(".botFlag");
  const botCountInput = room.querySelector(".botCount");
  const ticketCountInput = room.querySelector(".ticketCount");
  const winChanceInput = room.querySelector(".winChance");
  const jackpotInput = room.querySelector(".jackpot");
  const maxCasksJackpot = room.querySelector(".maxCasksJackpot");
  const canBotWinJackpot = room.querySelector(".canBotWinJackpot");
  const jackpotWinChanceInput = room.querySelector(".jackpotWinChance");
  const minJackpotSum = room.querySelector(".minJackpotSum");

  const body = {
    allowBots: botFlag.checked,
    maxBots: botCountInput.value,
    maxTickets: ticketCountInput.value,
    winChance: winChanceInput.value,
    jackpot: jackpotInput.value,
    maxCasksJackpot: maxCasksJackpot.value,
    canBotWinJackpot: canBotWinJackpot.checked,
    jackpotWinChance: jackpotWinChanceInput.value,
    minJackpotSum: minJackpotSum.value,
  };

  let response = await impHttp.setLotoSettings(roomId, body);
}

async function addDateGamesFunctions() {
  let dateInput = document.querySelector(".admin-date-stats-input");
  const submitDateButton = document.querySelector(".admin-date-stats-submit");
  dateInput.value = new Date().toISOString().slice(0, 10);

  async function fillTables() {
    // const gamesData = await formDateGameData();
    // insertDataInTable(gamesData);

    // const dominoGamesData = await formDateDominoGameData();
    // insertDominoDataInTables(dominoGamesData);

    const backgammonsGamesData = await formDateBackgammonsGameData();
    insertBackgammonsDataInTables(backgammonsGamesData);
    
  }
  submitDateButton.addEventListener("click", fillTables);
  fillTables()

  async function formDateDominoGameData() {
    dateInput = document.querySelector(".admin-date-stats-input");
    const date = dateInput.value;

    const { data: playedGames } = await impHttp.getPlayedDominoGames();

    const filteredGames = playedGames.filter((game) => {
      const gameDate = new Date(game.createdAt).toISOString().slice(0, 10);
      return gameDate == date;
    });

    const gamesData = {
      CLASSIC: [
        {
          id: 1,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 2,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 3,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 4,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 5,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
      ],
      TELEPHONE: [
        {
          id: 1,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 2,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 3,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 4,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
        {
          id: 5,
          playersAmount: 0,
          commissionTwoPlayers: 0,
          commissionFourPlayers: 0,
        },
      ],
    };

    filteredGames.forEach((filteredGame) => {
      const roomId = filteredGame.roomId;
      const gameData = gamesData[filteredGame.gameMode].find(
        (game) => game.id == roomId
      );
      const { commission } = impDominoNavigation.getDominoRoomBetInfo(roomId);
      gameData.playersAmount += 1;
      if (filteredGame.playerMode == 2) {
        gameData.commissionTwoPlayers += commission;
      } else {
        gameData.commissionFourPlayers += commission;
      }
    });

    return gamesData;
  }

  async function formDateBackgammonsGameData() {
    dateInput = document.querySelector(".admin-date-stats-input");
    const date = dateInput.value;

    const { data: playedGames } = await impHttp.getPlayedBackgammonsGamesByDate(date);

    return playedGames;
  }
  async function formDateGameData() {
    dateInput = document.querySelector(".admin-date-stats-input");
    const date = dateInput.value;
    // 2023-09-19
    const { data: playedGames } = await impHttp.getPlayedGames();

    // фильтруем игры, получая те, которые были сыграны в выбранный день

    const filteredGames = playedGames.filter((game) => {
      // game.createdAt: 2023-09-19T14:55:23.000Z
      const gameDate = new Date(game.createdAt).toISOString().slice(0, 10);
      return gameDate == date;
    });

    const gamesData = [
      { id: 1, ticketsAmount: 0, commission: 0, wonByGame: 0, botsTickets: 0 },
      { id: 2, ticketsAmount: 0, commission: 0, wonByGame: 0, botsTickets: 0 },
      { id: 3, ticketsAmount: 0, commission: 0, wonByGame: 0, botsTickets: 0 },
      { id: 4, ticketsAmount: 0, commission: 0, wonByGame: 0, botsTickets: 0 },
      { id: 5, ticketsAmount: 0, commission: 0, wonByGame: 0, botsTickets: 0 },
    ];

    filteredGames.forEach((filteredGame) => {
      let isGameLost = true;
      filteredGame.usergames.forEach((userGame) => {
        if (userGame.isWinner) {
          isGameLost = false;
        }
        const roomId = getRoomIdByBet(userGame.bet);
        const gameData = gamesData.find((game) => game.id == roomId);

        let ticketsAmount = JSON.parse(userGame.tickets).length;
        gameData.ticketsAmount += ticketsAmount;
        const { commission } = getRoomCommisionInfo(roomId);
        gameData.commission += ticketsAmount * commission;
      });
      const gameData = gamesData.find((game) => game.id == filteredGame.roomId);
      gameData.botsTickets += filteredGame.lotoBotTickets;

      if (isGameLost) {
        filteredGame.usergames.forEach((userGame) => {
          const roomId = getRoomIdByBet(userGame.bet);
          const gameData = gamesData.find((game) => game.id == roomId);
          const { bet } = getRoomCommisionInfo(roomId);
          const winSum = JSON.parse(userGame.tickets).length * bet;
          gameData.wonByGame += winSum;
        });
      }
    });

    return gamesData;
  }
}

function insertDataInTable(gamesData) {
  const tableBody = document.querySelector(".date-stats-body");
  const tableItems = tableBody.querySelectorAll(".date-stats-item");
  tableItems.forEach((item) => {
    const roomId = item.classList[1].split("-")[3];
    const gameData = gamesData.find((game) => game.id == roomId);
    item.querySelector(".date-stats-field-tickets").innerHTML =
      gameData.ticketsAmount;
    item.querySelector(".date-stats-field-commision").innerHTML =
      gameData.commission.toFixed(2);
    item.querySelector(".date-stats-field-wonsum").innerHTML =
      gameData.wonByGame.toFixed(2);
    item.querySelector(".date-stats-field-botstickets").innerHTML =
      gameData.botsTickets;
  });
}

function insertDominoDataInTables(gamesData) {
  for (let i = 1; i <= 2; i++) {
    let gameMode = i == 1 ? "CLASSIC" : "TELEPHONE";
    const table = document.querySelector(
      `.date-stats-domino-${gameMode.toLowerCase()}-table`
    );
    const tableBody = table.querySelector(".date-stats-body-domino");
    const tableItems = tableBody.querySelectorAll(".date-stats-item");
    tableItems.forEach((item) => {
      const roomId = item.classList[1].split("-")[3];
      const gameData = gamesData[gameMode].find((game) => game.id == roomId);
      item.querySelector(".date-stats-field-players").innerHTML =
        gameData.playersAmount;
      item.querySelector(".date-stats-field-earned-commision").innerHTML = `${(
        gameData.commissionTwoPlayers + gameData.commissionFourPlayers
      ).toFixed(2)}`;
    });
  }
}

function getRoomIdByBet(bet) {
  switch (bet) {
    case 0.2:
      return 1;
    case 0.5:
      return 2;
    case 1:
      return 3;
    case 5:
      return 4;
    case 10:
      return 5;
  }
}

function getRoomCommisionInfo(roomId) {
  let commission,
    jackpotAnimationSum,
    bet,
    jackpotPart,
    fullBet = 0,
    tokens;
  switch (roomId) {
    case 1:
      fullBet = 0.2;
      commission = 0.03;
      jackpotPart = 0.01;
      bet = 0.16;
      jackpotAnimationSum = 200;
      tokens = 2;
      break;
    case 2:
      fullBet = 0.5;
      commission = 0.075;
      jackpotPart = 0.025;
      bet = 0.4;
      jackpotAnimationSum = 200;
      tokens = 5;
      break;
    case 3:
      fullBet = 1;
      commission = 0.15;
      jackpotPart = 0.05;
      bet = 0.8;
      jackpotAnimationSum = 250;
      tokens = 10;
      break;
    case 4:
      fullBet = 5;
      commission = 0.75;
      jackpotPart = 0.25;
      bet = 4;
      jackpotAnimationSum = 300;
      tokens = 50;
      break;
    case 5:
      fullBet = 10;
      commission = 1.5;
      jackpotPart = 0.5;
      bet = 8;
      jackpotAnimationSum = 350;
      tokens = 100;
      break;
  }
  return {
    commission,
    jackpotPart,
    bet,
    jackpotAnimationSum,
    fullBet,
    tokens,
  };
}

/** @param {{bet:number, commision_sum:numberm games_count}[]} gamesData  */
async function insertBackgammonsDataInTables(gamesData=[]) {
    const tableBody = document.querySelector(".date-stats-body-nards");
    const loadedBets = gamesData.map(({bet})=>+bet);
    const nullBaseList = (await BetsLoaded).BackgammonsBETS.mapPairs(({bet}, betId, allist)=>{
      if(loadedBets.includes(+bet)) return undefined;
      return {bet, commision_sum:0, games_count:0}
    }).filter(line=>line);
    nullBaseList.push(...gamesData);
    tableBody.innerHTML = nullBaseList.sort(({bet:bet1}, {bet:bet2})=>bet1-bet2).map(({bet, commision_sum, games_count})=>`
          <div class="date-stats-item">
            <p class="date-stats-field">${bet.toFixed(2)}₼</p>
            <p class="date-stats-field"><span class="date-stats-field-players">${games_count}</span></p>
            <p class="date-stats-field"><span class="date-stats-field-earned-commision">${commision_sum.toFixed(2)}</span>₼</p>
          </div>
    `).join(' ');
    // const tableItems = tableBody.querySelectorAll(".date-stats-item");
    // tableItems.forEach((item) => {
    //   const roomId = item.classList[1].split("-")[3];
    //   const gameData = gamesData[gameMode].find((game) => game.id == roomId);
    //   item.querySelector(".date-stats-field-players").innerHTML =
    //     gameData.playersAmount;
    //   item.querySelector(".date-stats-field-earned-commision").innerHTML = `${(
    //     gameData.commissionTwoPlayers + gameData.commissionFourPlayers
    //   ).toFixed(2)}`;
    // });
}