// const { getLocalUser } = require("../modules/authinterface");

// const { openBackgammonsWaitingPopup } = require("../modules/backgammons/GamePool");

const importBackgammons = pathpart=>new Promise(async resolve=>
    resolve(await import('/js/modules/backgammons/'+pathpart+'.js'))
);
const importMobas = pathpart=>new Promise(async resolve=>
    resolve(await import('/js/modules/'+pathpart+'.js'))
);
const Modules = setOnResolve({
    WSEP: importBackgammons('WSEP'),
    provider: importBackgammons('GameLogicsPro'),
    Configs: importBackgammons('Configurations'),
    LobbyPool: importBackgammons('LobbyPool'),
    GamePool: importBackgammons('GamePool'),
    auth: importMobas('authinterface'),
    utilities: importBackgammons('Utilities'),
});
let getLocalUser;
Promise.all(Modules._promises)
    .then(async()=>console.log('repl Modules loaded')
                 ||(getLocalUser = (await Modules.auth).getLocalUser));
// Promise.all(Modules._promises)
function setOnResolve(AList, additionalPromises = []) {
    // return;
    const out = {}
    additionalPromises.push(...(out._promises = [
            ...Object.entries(AList).map(async ([name, promise])=>{
                out[name] = 'awaiting..';
                if(promise instanceof Promise)
                    return out[name] = await promise;
                else
                    return (out[name] = setOnResolve(promise, additionalPromises));
            }), ...additionalPromises])
    );
    return out;
}
let Toast;
Promise.all(Modules._promises).then(()=>Modules.utilities.Toast)