export let processingManager:processingManagerType = {
    heavyProcessings: {
        'terrain_create':false,
        'circle_create':false
    },

    checkIfHeavyProcessing() {
        return Object.keys(processingManager.heavyProcessings).some(key=>this.heavyProcessings[key]);
    },

    startHeavyProcessing(key): void {
        this.heavyProcessings[key] = true;
    },

    stopHeavyProcessing(key): void {
        this.heavyProcessings[key] = false;
    }
};

interface processingManagerType {
    heavyProcessings:Record<string, boolean>,
    checkIfHeavyProcessing(): boolean,
    startHeavyProcessing(key:string): void,
    stopHeavyProcessing(key:string): void
}