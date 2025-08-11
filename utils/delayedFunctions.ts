interface DelayedFunction {
    id: string,
    lastTick: number,
    func(): void
}


export let delayedFunctionsManager = {
    delayedFunctions: [] as DelayedFunction[],
    subscribe(lastTick:number, func:()=>void) {
        if (lastTick <= 0) {
            console.error('lastTick <= 0になっている')
            return;
        }
        let id = Math.random().toString(32).substring(2);
        this.delayedFunctions.push({
            id, lastTick, func
        })
    },
    unsubscribe(id:string) {
        this.delayedFunctions = this.delayedFunctions.filter(delayedFunction=>{
            return delayedFunction.id !== id
        })
     },
    processDelayedFunctions() {
        this.delayedFunctions.forEach(delayedFunction=>{
            if (delayedFunction.lastTick === 0) {
                delayedFunction.func();
                this.unsubscribe(delayedFunction.id);
            }
            delayedFunction.lastTick--;
        })
    }
}