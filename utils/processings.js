export let processingManager = {
    heavyProcessings: {
        'terrain_create': false,
        'circle_create': false
    },
    checkIfHeavyProcessing() {
        return Object.keys(processingManager.heavyProcessings).some(key => this.heavyProcessings[key]);
    },
    startHeavyProcessing(key) {
        this.heavyProcessings[key] = true;
    },
    stopHeavyProcessing(key) {
        this.heavyProcessings[key] = false;
    }
};
