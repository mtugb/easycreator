export class PlayerEcrDataManager {
    constructor() {
        this.database = {};
    }
    setTag(tag, player) {
        this.database[player.id].tag = tag;
        this.database[player.id].state = 0;
    }
    delTag(player) {
        delete this.database[player.id].tag;
    }
    setXyz(xyz, player) {
        this.database[player.id].xyz = xyz;
    }
    delXyz(player) {
        delete this.database[player.id].xyz;
    }
    setState(state, player) {
        this.database[player.id].state = state;
    }
    delState(player) {
        delete this.database[player.id].state;
    }
}
