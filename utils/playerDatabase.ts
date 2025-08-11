import { BlockPermutation, BlockType, Dimension, Player, StructureRotation, Vector3 } from "@minecraft/server";
import { ReplaceMode } from "./terrainCreator";
import { itempaletteChestLocation } from "./types";
import { ChestLocation } from "./itempalette";


//TODO:後でちゃんと理解
type PlayerData = {
    tag: string | null;
    xyz: Vector3 | null;
    state: 0 | 1;
    height: number | null;
    fillMode: 'break' | 'keep';
    brokenBlock: BlockPermutation | null;
    clipboard_block: BlockType | BlockPermutation | null;
    chestLocation: Vector3 | null;
    lastSelectedSlot: number | null;
    usingEcrFunc: boolean;
    replaceMode: number | null;
    copySavedIndex: number | null;
    circleEmptyOverClock: boolean;
    itempaletteChestList: ChestLocation[];
};



export let ecrTagNames: Record<string, string> = {
    fill: '埋め立て',
    enclose: '壁の生成',
    copy: '建築のコピー'
}

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

type PlayerDataKey = keyof PlayerData; // 'tag' | 'xyz' | 'state' | 'height'


export let playerEcrDataManager = {
    database: {} as Record<string, PlayerData>,

    setValue<K extends PlayerDataKey>(key: K, value: PlayerData[K], player: Player) {
        if (!this.database[player.id]) {
            this.initDatabase(player);
        }
        this.database[player.id][key] = value;
    },

    getValue<K extends PlayerDataKey>(key: K, player: Player): PlayerData[K] {
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

    initDatabase(player: Player) {
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
}
