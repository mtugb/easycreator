export let structureManager = {
    structures: [],
    subscribe(name) {
        let id = this.createRandomId();
        this.structures.push({
            id, name
        });
        console.log(this.structures);
        return id;
    },
    unSubscribe() {
        return false;
    },
    createRandomId() {
        return Math.random().toString(32).substring(2);
    },
    getFormOptions() {
        console.log(structureManager.structures);
        return Array.from(structureManager.structures).map(({ id, name }) => {
            return `§2${name}§7 (${id})§r`;
        });
    }
};
