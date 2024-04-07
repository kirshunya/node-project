

const debugPanHTML = `<div class="debugPan">debug: 
      <input type="button" id="TimersTurnDebugButton"></input>
      <input type="button" id="ChosePlayerDebugButton" value="player:"></input>
      <input type="button" id="PermStepCompletor" value="Принудительно завершить ход"></input>
      <input type="button" id="StepCompletor" value="Потдвердить ход"></input>
      <input type="button" id="MessageBtn" value="Chat👀">
      <input type="button" id="LateGameRestartButton" value="test lateGame">
      <input type="button" id="FludGameRestartButton" value="test flud">
    </div>
    <style>
      #PermStepCompletor.active, #StepCompletor.active {
        background-color: yellow;
      }
      .debugPan {
        display: none !important
        max-width: 100vw;
        position: fixed;
        bottom: 0;
        right: 0;
        opacity: 0.5;
        font-size: 1.5rem;
        background-color: gray;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: flex-end;
      }
      .debugPan > * {
        margin-right: .2rem;
        margin-top: .1rem;
        margin-bottom: .1rem;
      }
      .debugPan input {
        font-size: 1.5rem;
        border-radius: 5pt;
        padding-left: 0.3rem;
        padding-right: 0.3rem;
      }
      /* .debugPan button::selection {

      } */
    </style>
    <div class="closer">
      <div class="playerChosePanel">
        <div class="players">
          <div class="Jimmy">
            <img src="./img/backgammons/whitecell4.png">
            <span>Jimmy</span>
            <div>:black</div>
          </div>
          <div class="Missi">
            <img src="./img/backgammons/blackcell4.png">
            <span>Missi</span>
            <div>:white</div>
          </div>
          <div class="Debby">
            <img src="./img/backgammons/ghost-checker.png">
            <span>Debby</span>
            <div>:black&white</div>
          </div>
        </div>

        <div class="checkbox">
          <input type="checkbox" id="cash" checked> Save value
        </div>
        <style>
          .closer {
            display: none !important;
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: auto;
            top: 0;
            left: 0;
            background-color: #201a0e50;
          }
          .playerChosePanel {
            width: 300px;
            height: 225px;

            background-color: #572351;
            border-radius: 7pt;
            border: 0.3rem solid #411a3c;
            padding: 1rem;

            position: absolute;
            margin: auto;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            
            color: aliceblue;

            .players {
              display: flex;
              justify-content: space-between;
            }
            .checkbox {
              margin-top: 3rem;
            }
          }
          .Jimmy, .Missi, .Debby {
            display: inline-flex;
            flex-direction: column;
            font-size: large;
            padding: 0.5rem;
            min-height: auto;
          }
          .playerChosePanel > .players > div > img {
            width: 66px;
            height: 66px;
          }
          .playerChosePanel > .players > div > span {
            margin-top: 1rem;
          }
          .playerChosePanel > .players > div > div {
            display: inline;
            font-size: small;
            color: rgb(101, 108, 114);
          }
          .playerChosePanel > .players > div:hover {
            background-color: #501f49ee;
            border-radius: 5pt;
            border: 2px solid #411a3c;
          }
        </style>
      </div>
    </div>`;
export const debugPan = new class {
  install(){
    if(document.getElementsByClassName('debugPan')[0]) return;
    document.body.insertAdjacentHTML('beforeend', debugPanHTML)

    window.addEventListener('DOMContentLoaded', 
              ()=>TimersTurnDebugButton.addEventListener('click', settimer))
    function settimer() {
        if(typeof window.TimersTurn !== 'boolean') return;
        window.ws.send(JSON.stringify({method:'TimersTurnSet', TimersTurn:!window.TimersTurn}));
    }
    LateGameRestartButton.addEventListener('click', ()=>{
        if(confirm('Вы действительно хотите >перезапустить< игру?'))
            window.ws.send(JSON.stringify({method:'restartTest'}))
    })
    FludGameRestartButton.addEventListener('click', ()=>{
        if(confirm('Вы действительно хотите >перезапустить< игру?'))
            window.ws.send(JSON.stringify({method:'restartFlud'}))
    })
    MessageBtn.addEventListener('click', ()=>{
        const text = prompt('Какое сообщение отправить: ')
        if(text)
        window.ws.send(JSON.stringify({method:'chat', text}))
    })
    const Utilities = import('/js/modules/backgammons/Utilities.js')
    let Toast;
    Utilities.then(M=>Toast = M.Toast)


    const EntryPoint = import('/js/modules/backgammons/EntryPoint.js')
    const playerId = localStorage.getItem('playerId');
    /**
     * @return {HTMLElement}
     */
    const pl = name=>document.getElementsByClassName(name)[0];
    if(playerId)
        chosePlayer(playerId)
    function chosePlayer(index) {
        EntryPoint.then(({onplayerchosen})=>{
        onplayerchosen.resolve(+index);
        })
        ChosePlayerDebugButton.value = `player:${['Jimmy', 'Missi', 'Debby'][index]}`
        if(cash.checked)
        localStorage.setItem('playerId', index);
        pl('closer').style.display = 'none'
    }
    ChosePlayerDebugButton.addEventListener('click', ()=>{
        localStorage.removeItem('playerId');
        window.location.reload();
    })
    window.addEventListener('DOMContentLoaded', ()=>{
        Object.entries(['Jimmy', 'Missi', 'Debby'])
            .map(([index, name])=>pl(name).addEventListener('click', ()=>chosePlayer(index)))
    })
  }
}