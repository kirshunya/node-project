const _$123Re = []
class VisitorsTableUI {
    Visitors = [];

    constructor(html, isready, User, Visitors, hostId, ReadyList) {
        const self = this;
        const idre = _$123Re.push({
            setready() {
                return API.ready(isready =! isready)
                    .then(({result})=>self.update(User.id, result)||result)
            },
            start(id) {//handle HTMLElement.dataset.id
                API.ready(id, id)
                    .then(data=>console.log('API.read', data))
            }
        })-1;
        
        this.hostId = hostId;
        this.User = User;
        this.User.isready = false;
        this.table = html.getElementsByTagName('table')[0].children[0];
        
        this.add = ({id,username,team})=>{
            this.Visitors[id] = {id, username, team, row:undefined};
            class ReadyButton {
                constructor() {
                    const isCurrentUser = User.id===id;
                    const Userishost = User.id===hostId;
                    this.toString=[
                            ()=>`<input type="button" value="Готов" onclick="_$123Re[${idre}].setready()" class="cmn-btn px-3 py-1 text-center">`,
                            ()=>'',
                            ()=>`<input type="button" value="Начать"  class="px-3 py-1 text-center ${ReadyList.includes(id)?'cmn-btn ':'btn-dark'}"
                                        onclick="_$123Re[${idre}].start(${id})">`
                                    ][!isCurrentUser + Userishost];
                }
            }
            this.table.insertAdjacentHTML("afterend",
                        `<tr id="PlayerLine${id}" data-id="${id}">
                            <td>${username}</td><td>${
                                id!==hostId?ReadyList.includes(id)?'Готов':'Не готов':'Хост'
                            }</td><td>${
                                new ReadyButton()
                            }</td>
                        </tr>`);
        }
        this.update = (uid, isready)=>{
            const {id} = User;
            const Userishost = User.id===hostId;
            this.get(uid).map(row=>{
                const [username, readylabel, buttoncontainer] = row.children;
    
                readylabel.innerHTML = ['готов','не готов'][+!isready];
        
                if(uid === id) {
                    if(Userishost) return;
                    const [button] = buttoncontainer.children;
                    button.value = ['не готов','готов'][+!isready];
                } else if(Userishost) {
                    const [button] = buttoncontainer.children;
                    button.disabled = !isready;
                    button.classList.toggle('btn-dark', !isready)
                    button.classList.toggle('cmn-btn', isready)
                }
            });
        }
        Visitors.map(this.add.bind(this));
    }
    get(id) {
        if(this.Visitors[id].row===undefined) {
            this.Visitors[id].row = [
                // document.getElementById(`mobilePlayerLine${id}`), 
                document.getElementById(`PlayerLine${id}`)
            ];
        }
        return this.Visitors[id].row;
    }
    getViews() {
        return [
            document.getElementById('mobilePlayersListPresentation'),
            document.getElementById('PlayersListPresentation')
        ]
    }
};
const TEAMS = {
    _WHITE: 1,
    _BLACK: 2,
    WHITE: 'white',
    BLACK: 'black'
}
class GameProccessPresentationUI {//TODO: GameProccessPresentationUI
    constructor(Players, __dices__, team) {//__dices
        // window.addEventListener('load', this.init.bind(this, PageSnapshotData));
        const self = this;
        this.mobile = document.getElementById('mobileGameProccessPresentation')
        this.view = document.getElementById('GameProccessPresentation')
        
        this.views = [[this.mobile, 'mobile'], [this.view, 'view']];
        this.ActivePlayerLabels = [
            ...document.getElementsByClassName('playerstepsoo'),
        ]
        this.DiceLabels = [
            ...document.getElementsByClassName('stepsoo'),
        ]
        const [mobiLeft, mobiMiddle, mobiRight] = this.mobile.children;
        const [Left, Middle, Right] = this.view.children[0].children[0].children;
        Players.map(player=>{
            if(player.team === TEAMS._WHITE) {
                mobiRight.innerHTML = Right.innerHTML =  `<p>Белый</p><p>${player.username}</p><p class="wtimer"></p>`;
            } else if(player.team === TEAMS._BLACK) {
                mobiLeft.innerHTML = Left.innerHTML =  `<p>Чёрный</p><p>${player.username}</p><p class="btimer"></p>`;
            } else alert(`Error, Players[i].team === ${player.team}`);
        });
        self.setDices(__dices__);
        self.setTeamByTeamId(team);
    }
    setDices({UsedPoints, PointsToStep}) {
        const points = [...UsedPoints, ...PointsToStep];
        const pointfac = (function* () {
            for(const point of UsedPoints)
                yield [point, true];
            for(const point of PointsToStep)
                yield [point, false];
            while(1) yield [0, true];
          })
        this.DiceLabels.map(label=>{
            const point = pointfac();
            [...label.children].map(dice=>{
                const pp = point.next().value;
                dice.classList = `dice${pp[0]} ${pp[1]?'-disabled-':''}`
            });
            
        });
    }
    setTeamByTeamId(team) {
        const str = team === 1 ? 'Ход Белых' : 'Ход чёрных';
        this.ActivePlayerLabels.map(label=>label.innerHTML=str);
    }
    getViews() {
        return [
            document.getElementById('mobileGameProccessPresentation'),
            document.getElementById('GameProccessPresentation')
        ]
    }
};
class TimerPresentationUI {
    ticks = 0
    active = false;
    i=0
    constructor(MMT) {
        const self = this;
        this.MMT = MMT*1000;
        // Poll.on('diceroll', this.start.bind(this, 0))
        this.timers = document.getElementsByClassName('timer');
        this.wtimers = document.getElementsByClassName('wtimer');
        this.btimers = document.getElementsByClassName('btimer');
    }
    start(teamId, ticks=0) {
        this.i++;
        this.peerTimer(teamId, this.i, ticks);
    }
    async peerTimer(teamId, i, from=0) {
        function div(val, by){
            return (val - val % by) / by;
        }
        let lastpoint = performance.now();
        // console.log(1);
        while(this.i === i) {
            const curtpoint = performance.now();
            this.ticks = this.MMT - Math.ceil(from*1000+curtpoint-lastpoint);
            const sec = Math.round(this.ticks/1000);
            let mil = Math.round(this.ticks%100/10);
            const print = this.ticks<0
                            ?'finished'
                            :`<span class="text-warning font-weight-bold">${sec}</span>
            <span class="font-weight-bold" style="color:#e3e377">.${mil}</span> s`;
            // mil = mil?mil<10?`${mil}0`:mil:'00';
            [...this.timers, ...([[], this.wtimers, this.btimers][teamId])]
                .map(timer=>timer.innerHTML = print)
            await sleep(30);
        } 
    }
};

// Poll.on('gameStateChanged', ({players, dices})=>{
//     VisitorsTable.getViews().map((view)=>view.classList.toggle('d-none', true));
//     GameProccessPresentation.getViews().map((view)=>{
//         view.classList.toggle('d-none', false);
//         if(view.dataset.flex==="1")
//             view.classList.toggle('d-flex', true);
//     });
// });

function doubleBET() {
    return API.doubleBET();
}
// Poll.on('Doubling', ()=>API.doubleAccept(confirm('Doubling requested; OK-doubling; Cancel-Game Lost;')))
// Poll.on('DoublingAccept', ()=>{
//     [...document.getElementsByName('doubleBET')].map(doubleBET=>doubleBET.outerHTML = '<span>Doubling: x2</span>')
// })
// Poll.on('MatchEnd', ({points, winner})=>alert(`Завершился матч со счётом: ${points.join('|')} победитель ${winner===1?white:black}`));
// Poll.on('GameEnd', ({points, winner})=>alert(`Завершился матч со счётом: ${points.join('|')} победитель ${winner===1?white:black}`));
// Poll.on('MatchEnd', ({points})=>playersWinPoints.innerHTML = points.join(' | '));
// Poll.on('GameEnd', ({points})=>playersWinPoints.innerHTML = points.join(' | '));
