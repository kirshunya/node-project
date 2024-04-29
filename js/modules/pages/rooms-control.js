import { pdom } from "../backgammons/htmlcontainer.js";
import { BetsLoaded } from "../backgammons/syncronous.js";
import * as impHttp from "../http.js";

export async function openRoomManagement() {
  let siteLanguage = window.siteLanguage;
  const main = document.querySelector(".main__container");
  let header = document.querySelector("header");
  if (header.classList.contains("d-none")) {
    header.classList.remove("d-none");
    main.classList.add("header__padding");
  }

  main.innerHTML = /* html */`
  <section class="admin-rooms-controll-page">
    <div class="room-management-room" room="loto">
      <ul class="room-management-bets">
        <li>
          <input class=" loto-page-toggle-input mainRoomCheckbox" type="checkbox" name="loto" room="loto">
          <span>${siteLanguage.roomManagementPage.mainLotoRoom}</span>
        </li>
        <li>
          <input class="room-checkbox loto-page-toggle-input loto-room-checkbox " type="checkbox" name="loto-1" roomId="1">
          <span>${siteLanguage.roomManagementPage.room} 0.20M</span>
        </li>
        <li>
          <input class="room-checkbox loto-page-toggle-input loto-room-checkbox " type="checkbox" name="loto-2" roomId="2">
          <span>${siteLanguage.roomManagementPage.room} 0.50M</span>
        </li>
        <li>
          <input class="room-checkbox loto-page-toggle-input loto-room-checkbox " type="checkbox" name="loto-3" roomId="3">
          <span>${siteLanguage.roomManagementPage.room} 1M</span>
        </li>
        <li>
          <input class="room-checkbox loto-page-toggle-input loto-room-checkbox room-checkbox" type="checkbox" name="loto-4" roomId="4">
          <span>${siteLanguage.roomManagementPage.room} 5M</span>
        </li>
        <li>
          <input class="room-checkbox loto-page-toggle-input loto-room-checkbox " type="checkbox" name="loto-5" roomId="5">
          <span>${siteLanguage.roomManagementPage.room} 10M</span>
        </li>
      </ul>
      <button class="save-button" type="submit">${siteLanguage.roomManagementPage.save}</button>
    </div>
  
    <div class="room-management-room" room="domino-classic">
      <ul class="room-management-bets">
        <li>
          <input class=" domino-classic-page-toggle-input mainDominoClassicRoomCheckbox mainRoomCheckbox" type="checkbox" room="domino-classic" name="mainDominoClassicRoom">
          <span>${siteLanguage.roomManagementPage.mainDominoClassicRoom}</span>
        </li>
        <li>
          <input class="room-checkbox domino-classic-page-toggle-input" roomId="1" type="checkbox" name="domino-classic-1">
          <span>${siteLanguage.roomManagementPage.room} 0.50M</span>
        </li>
        <li>
          <input class="room-checkbox domino-classic-page-toggle-input" roomId="2" type="checkbox" name="domino-classic-2">
          <span>${siteLanguage.roomManagementPage.room} 1M</span>
        </li>
        <li>
          <input class="room-checkbox domino-classic-page-toggle-input" roomId="3" type="checkbox" name="domino-classic-3">
          <span>${siteLanguage.roomManagementPage.room} 3M</span>
        </li>
        <li>
          <input class="room-checkbox domino-classic-page-toggle-input" roomId="4" type="checkbox" name="domino-classic-4">
          <span>${siteLanguage.roomManagementPage.room} 5M</span>
        </li>
        <li>
          <input class="room-checkbox domino-classic-page-toggle-input" roomId="5" type="checkbox" name="domino-classic-5">
          <span>${siteLanguage.roomManagementPage.room} 10M</span>
        </li>
      </ul>
      <button class="save-button" type="submit">${siteLanguage.roomManagementPage.save}</button>
    </div>
  
    <div class="room-management-room" room="domino-telephone">
      <ul class="room-management-bets">
        <li>
          <input class=" mainDominoTelephoneRoomCheckbox mainRoomCheckbox" type="checkbox" name="mainDominoTelephoneRoom" value="mainDominoTelephoneRoom" room="domino-telephone">
          <span>${siteLanguage.roomManagementPage.mainDominoTelephoneRoom}</span>
        </li>
        <li>
          <input class="room-checkbox domino-telephone-room-checkbox" roomId="1" type="checkbox" name="domino-telephone-1">
          <span>${siteLanguage.roomManagementPage.room} 0.50M</span>
        </li>
        <li>
          <input class="room-checkbox domino-telephone-room-checkbox" roomId="2" type="checkbox" name="domino-telephone-2">
          <span>${siteLanguage.roomManagementPage.room} 1M</span>
        </li>
        <li>
          <input class="room-checkbox domino-telephone-room-checkbox" roomId="3" type="checkbox" name="domino-telephone-3">
          <span>${siteLanguage.roomManagementPage.room} 3M</span>
        </li>
        <li>
          <input class="room-checkbox domino-telephone-room-checkbox" roomId="4" type="checkbox" name="domino-telephone-4">
          <span>${siteLanguage.roomManagementPage.room} 5M</span>
        </li>
        <li>
          <input class="room-checkbox domino-telephone-room-checkbox" roomId="5" type="checkbox" name="domino-telephone-5">
          <span>${siteLanguage.roomManagementPage.room} 10M</span>
        </li>
      </ul>
      <button class="save-button" type="submit">${siteLanguage.roomManagementPage.save}</button>
    </div>
    <div class="room-management-room" id="nardsRoomControls" room="nards">
      подгрузка...
    </div>
    <style>
      #nardsRoomControls{
        padding-left: 0.5rem;
        .toggleBackgammons {
          margin-left: 0.5rem;
          &.enable { background-color: green; }
          &.disable {background-color: red; }
        }
        .betPush, .betEditAccess { 
          background-color: green;
          color: white;
        }
        .betEdit { background-color: yellow; }
        .betEditCancel { background-color: orange; }
        .betDelete { background-color: red; }
        button {
          margin-left: 0.5rem;
          padding: 0px 0.3rem;
          opacity: 80%;
          border-radius: 3pt;
          transition: 100ms;
          border-bottom: 1px white solid;
          &:hover {
            opacity: 100%;
          }
        }
        dl {
          input { 
            width: 4rem;
            padding: 0px 0.5rem;
            border-radius: 3pt;
            border: 1px solid blue;
            background-color: #87c1e3;
          }
          &::before {
            content: '•';
            margin-left:0.5rem;
            margin-right:0.5rem;
          }
          
        }
      }
    </style>
  </section>
    `;

  addNardRoomsControls(document.getElementById('nardsRoomControls'));
  await getRoomManagementData();
  // делаем что когда нажимаем основную комнату то блокируются все
  const roomsControlPage = document.querySelector(".admin-rooms-controll-page");

  if (!roomsControlPage) return;
  const mainRoomsButtons =
    roomsControlPage.querySelectorAll(".mainRoomCheckbox");
  // console.log(mainRoomsButtons);
  mainRoomsButtons.forEach((button) => {
    button.addEventListener("change", function () {
      const buttonLi = button.parentNode;
      const buttonParentBlock = buttonLi.parentNode;
      const allCheckboxInParent =
        buttonParentBlock.querySelectorAll(".room-checkbox");
      allCheckboxInParent.forEach((checkbox) => {
        checkbox.checked = button.checked;
      });
    });
  });

  // const roomsControl = {
  //   loto: false,
  //   dominoClassic: true,
  //   dominoTelephone: false,
  //   lotoRooms: [{roomId: 1, isAvailable: false}],
  //   dominoClassicRooms: [{roomId: 2, isAvailable: true}],
  //   dominoTelephoneRooms: [{roomId: 3, isAvailable: false}],
  // };

  // const roomsControl = {
  //   loto: false,
  //   lotoRooms: [],
  // };
  // const roomsControl = {
  //   dominoClassic: false,
  //   dominoClassicRooms: [],
  // };
  // const roomsControl = {
  //   dominoTelephone: false,
  //   dominoTelephoneRooms: [],
  // };

  // вытягиваем поля когда нажимаем кнопку сохранить
  let saveButton = roomsControlPage.querySelectorAll(".save-button");
  saveButton.forEach((button) => {
    if(button.classList.contains('nards')) return;
    button.addEventListener("click", async function () {
      let parent = button.parentElement;
      if (!parent) {
        return;
      }
      let pageAttribute = parent.getAttribute("room");
      // console.log(pageAttribute);

      if (pageAttribute == "loto") {
        let lotoPageCheckbox =
          parent.querySelector(".mainRoomCheckbox")?.checked;
        
        const lotoRoomsCheckbox = parent.querySelectorAll(".room-checkbox");
        const lotoRooms = lotoRoomsCheckbox.map((room) =>({
            roomId: +room.getAttribute("roomId"),
            isAvailable: !room.checked,
          }));

        const roomsControl = {
          loto: !lotoPageCheckbox || false,
          lotoRooms: lotoRooms,
        };
        // console.log(roomsControl);

        let responce = await impHttp.updateRoomsControl(roomsControl, "loto");
        if (responce.status == 200) {
          alert("Комнаты сохранены");
        } else {
          alert("Ошибка сохранения");
        }
      } else if (pageAttribute == "domino-classic") {
        let dominoPageCheckbox =
          parent.querySelector(".mainRoomCheckbox")?.checked;
        let dominoRooms = [];
        let dominoRoomsCheckbox = parent.querySelectorAll(".room-checkbox");
        dominoRoomsCheckbox.forEach((room) => {
          dominoRooms.push({
            roomId: +room.getAttribute("roomId"),
            isAvailable: !room.checked,
          });
        });

        const roomsControl = {
          dominoClassic: !dominoPageCheckbox || false,
          dominoClassicRooms: dominoRooms,
        };

        // console.log(roomsControl);
        let responce = await impHttp.updateRoomsControl(
          roomsControl,
          "domino-classic"
        );
        if (responce.status == 200) {
          alert("Комнаты сохранены");
        } else {
          alert("Ошибка сохранения");
        }
      } else if (pageAttribute == "domino-telephone") {
        let dominoPageCheckbox =
          parent.querySelector(".mainRoomCheckbox")?.checked;
        let dominoRooms = [];
        let dominoRoomsCheckbox = parent.querySelectorAll(".room-checkbox");
        dominoRoomsCheckbox.forEach((room) => {
          dominoRooms.push({
            roomId: +room.getAttribute("roomId"),
            isAvailable: !room.checked,
          });
        });

        const roomsControl = {
          dominoTelephone: !dominoPageCheckbox || false,
          dominoTelephoneRooms: dominoRooms,
        };
        // console.log(roomsControl);
        let responce = await impHttp.updateRoomsControl(
          roomsControl,
          "domino-telephone"
        );
        if (responce.status == 200) {
          alert("Комнаты сохранены");
        } else {
          alert("Ошибка сохранения");
        }
      }
    });
  });
  
}

const getRoomManagementData = async () => {
  // const roomsControl = {
  //   loto: false,
  //   dominoClassic: true,
  //   dominoTelephone: false,
  //   lotoRooms: [{roomId: 1, isAvailable: false}],
  //   dominoClassicRooms: [{roomId: 2, isAvailable: true}],
  //   dominoTelephoneRooms: [{roomId: 3, isAvailable: false}],
  // };

  const { data } = await impHttp.getRoomsControl();
  const roomsControl = data;

  // console.log(data);

  // insert data to checkboxes
  const mainRoomCheckbox = document.querySelector(".loto-page-toggle-input");
  mainRoomCheckbox.checked = !roomsControl.loto;

  const lotoCheckboxes = document.querySelectorAll(".loto-room-checkbox");
  lotoCheckboxes.forEach((checkbox) => {
    const roomId = checkbox.getAttribute("roomId");
    const room = roomsControl.lotoRooms.find((room) => room.roomId == +roomId);
    checkbox.checked = !room.isAvailable;
  });

  const mainDominoClassicRoomCheckbox = document.querySelector(
    ".mainDominoClassicRoomCheckbox"
  );
  mainDominoClassicRoomCheckbox.checked = !roomsControl.dominoClassic;

  const dominoClassicCheckboxes = document.querySelectorAll(
    ".domino-classic-page-toggle-input"
  );
  dominoClassicCheckboxes.forEach((checkbox) => {
    const roomId = checkbox.getAttribute("roomId");
    const room = roomsControl.dominoClassicRooms.find(
      (room) => room.roomId == +roomId
    );
    if (room && checkbox) {
      checkbox.checked = !room.isAvailable;
    }
  });

  const mainDominoTelephoneRoomCheckbox = document.querySelector(
    ".mainDominoTelephoneRoomCheckbox"
  );
  mainDominoTelephoneRoomCheckbox.checked = !roomsControl.dominoTelephone;

  const dominoTelephoneCheckboxes = document.querySelectorAll(
    ".domino-telephone-room-checkbox"
  );
  dominoTelephoneCheckboxes.forEach((checkbox) => {
    const roomId = checkbox.getAttribute("roomId");
    const room = roomsControl.dominoTelephoneRooms.find(
      (room) => room.roomId == +roomId
    );
    if (room && checkbox) {
      checkbox.checked = !room.isAvailable;
    }
  });
};
async function addNardRoomsControls(div) {
  /** @type {{[betId:number]:import("../backgammons/syncronous.js").BetInfo}} */
  const betCash = {};
  (await BetsLoaded).BackgammonsBETS.mapPairs((betInfo, betId)=>betInfo&&(betCash[betId]=betInfo));
  const defaultCommision = betCash[1].comission;//пхе-пхе
  let bckgstatus = (await impHttp.getBackgammonsStatus()).data.code;
  class RoomInfoLine { 
    constructor(betId, bet, comission) { return pdom/*html*/`<dl data-betid=${betId}>Комната <span>${bet}</span>М коммисия ${comission*100}%<button class="betEdit">редактировать</button><button class="betDelete">Удалить</button></dl>`; }
    static asString(betId, bet, comission) { return /*html*/`<dl data-betid=${betId}>Комната <span>${bet}</span>М коммисия ${comission*100}%<button class="betEdit">редактировать</button><button class="betDelete">Удалить</button></dl>` }
  }
  function reprint() {
    div.innerHTML = /*html*/`
      <h3>Нарды<button class="toggleBackgammons">${{200:'Отключить', 500:'Включить'}[bckgstatus]}</button></h3>
      <dt>
          ${Object.entries(betCash).map(([betId, {bet, comission}])=>
              /*html*/`<dl data-betid=${betId}>Комната <span>${bet}</span>М коммисия ${comission*100}%<button class="betEdit">редактировать</button><button class="betDelete">Удалить</button></dl>`).join(' ')}
          <dl><button class="betPush">Добавить комнату</button></dl>
  </dt>
      <button class="save-button nards">Сохранить</button>`
  }
  reprint();

  div.addEventListener('click', /** @param {{target:HTMLElement}} param0 */({target:targetButton})=>{
    const targetLine = targetButton.parentNode;
    const targetLinesList = targetLine.parentNode;
    const betId = targetLine.dataset.betid;
    if(targetButton.classList.contains("toggleBackgammons")) {

    } else if(targetButton.classList.contains("betDelete")) {
      
    } else if(targetButton.classList.contains("betEditAccess")) {
      
    } else if(targetButton.classList.contains("betEditCancel")) {
      
    } else if(targetButton.classList.contains("betEdit")) {
      const inputLineFrag = pdom/* html */`<dl data-betid="${betId}">BET: <input value="${targetLine.getElementsByTagName('span')[0].innerHTML}">M; COMISSION: <input value="${defaultCommision*100}">%<button class="betEditAccess">Сохранить</button><button class="betEditCancel">Отмена</button></dl>`;
      const inputLine = inputLineFrag.firstChild
      //inputLine.children[0].getElementsByClassName('betEditAccess')[0].addEventListener('click', ()=>targetLinesList.replaceChild(new RoomInfoLine(), inputLine));
      inputLine.getElementsByClassName('betEditCancel')[0].addEventListener('click', ()=>targetLinesList.replaceChild(targetLine, inputLine));
      targetLinesList.replaceChild(inputLineFrag, targetLine);
    } else if(targetButton.classList.contains("betPush")) {
      const inputLine = pdom/* html */`<dl>BET: <input>M; COMISSION: <input value="${defaultCommision*100}">%<button class="betEditAccess">Сохранить</button><button class="betEditCancel">Отмена</button></dl>`;
      targetLinesList.replaceChild(inputLine, targetLine);
    }
  })
  function toggleBackgammons() {}
}
