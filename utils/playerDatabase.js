import { StructureRotation } from "@minecraft/server";
export let ecrTagNames = {
    fill: '埋め立て',
    enclose: '壁の生成',
    copy: '建築のコピー'
};
export let structureRotations = [
    StructureRotation.None,
    StructureRotation.Rotate90,
    StructureRotation.Rotate180,
    StructureRotation.Rotate270
];
export let structureRotationNames = [
    '0°',
    '90°',
    '180°',
    '270°'
];
export let playerEcrDataManager = {
    database: {},
    setValue(key, value, player) {
        if (!this.database[player.id]) {
            this.initDatabase(player);
        }
        this.database[player.id][key] = value;
    },
    getValue(key, player) {
        if (!this.database[player.id]) {
            this.initDatabase(player);
        }
        return this.database[player.id][key];
    },
    // hasKey<K extends PlayerDataKey>(key: K, player: Player): boolean {
    //     if (!this.database[player.id]) {
    //         this.initDatabase(player);
    //     }
    //     return key in this.database[player.id];
    // },
    initDatabase(player) {
        // 初期値（仮で空のオブジェクト）
        this.database[player.id] = {
            tag: null,
            xyz: null,
            state: 0,
            height: null,
            fillMode: 'break',
            brokenBlock: null,
            clipboard_block: null,
            chestLocation: null,
            lastSelectedSlot: null,
            usingEcrFunc: false,
            replaceMode: null,
            copySavedIndex: null,
            circleEmptyOverClock: false,
            itempaletteChestList: []
        };
    }
};
