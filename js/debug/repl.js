
const importBackgammons = pathpart=>new Promise(async resolve=>
    resolve(await import('/js/modules/backgammons/'+pathpart+'.js'))
);
const Modules = setOnResolve({
    WSEP: importBackgammons('WSEP'),
    provider: importBackgammons('GameLogicsPro'),
    Configs: importBackgammons('Configurations'),
});
Promise.all(Modules._promises).then(()=>console.log('repl Modules loaded'));
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