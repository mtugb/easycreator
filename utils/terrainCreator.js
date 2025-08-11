import { BlockTypes, BlockVolume } from "@minecraft/server";
import { playerEcrDataManager } from "./playerDatabase";
import { processingManager } from "./processings";
export let REPLACE_MODES = ['selectedBlock', 'ice', 'snow', 'stone', 'grass', 'dirt', 'stoneAndOre', 'chest'];
// グローバル変数
const blockWaitList = [];
const limit = 100000;
let nn = 0;
// メインのdecay関数
export function decay(player, loc) {
    nn++;
    if (nn >= limit) {
        nn = 0;
        blockWaitList.length = 0;
        return;
    }
    const blockLocation = {
        x: loc.x,
        y: loc.y,
        z: loc.z,
        dimension: player.dimension,
        commander: player
    };
    const existingIndex = blockWaitList.findIndex(item => item.location.x === blockLocation.x &&
        item.location.y === blockLocation.y &&
        item.location.z === blockLocation.z);
    if (existingIndex !== -1) {
        return;
    }
    const checkList = getAdjacentLocations(blockLocation);
    checkList.forEach(e => {
        const block = blockLocation.dimension.getBlock(e);
        if (!block)
            return;
        if (block.typeId === 'minecraft:sand') {
            blockWaitList.push({
                location: e,
                timestamp: Date.now()
            });
        }
    });
}
// ブロックチェックリストの生成
const getAdjacentLocations = (loc) => {
    return [
        { ...loc, x: loc.x + 1 },
        { ...loc, x: loc.x - 1 },
        { ...loc, y: loc.y + 1 },
        { ...loc, y: loc.y - 1 },
        { ...loc, z: loc.z + 1 },
        { ...loc, z: loc.z - 1 }
    ];
};
// ブロック置換関数
export function replaceToStone() {
    if (blockWaitList.length === 0) {
        processingManager.stopHeavyProcessing('terrain_create');
        return;
    }
    ;
    const item = blockWaitList[0];
    blockWaitList.shift();
    let replaceMode = playerEcrDataManager.getValue('replaceMode', item.location.commander);
    if (replaceMode === null) {
        item.location.commander.sendMessage('変換先ブロックが設定されていません');
        return;
    }
    const targetBlock = getTargetBlock(REPLACE_MODES[replaceMode], item.location.commander);
    if (targetBlock) {
        item.location.dimension.fillBlocks(new BlockVolume(item.location, item.location), targetBlock);
        // 次のdecay呼び出しではプレイヤーを渡す必要がある
        decay(item.location.commander, item.location);
    }
}
// ターゲットブロックの取得
function getTargetBlock(mode, player) {
    if (!mode)
        return null;
    switch (mode) {
        case 'selectedBlock':
            return playerEcrDataManager.getValue('clipboard_block', player);
        case 'ice':
            return BlockTypes.get('minecraft:ice') ?? null;
        case 'snow':
            return BlockTypes.get('minecraft:snow') ?? null;
        case 'stone':
            return BlockTypes.get('minecraft:stone') ?? null;
        case 'grass':
            return BlockTypes.get('minecraft:grass') ?? null;
        case 'dirt':
            return BlockTypes.get('minecraft:dirt') ?? null;
        case 'stoneAndOre': {
            const oreList = [
                'minecraft:coal_ore',
                'minecraft:gold_ore',
                'minecraft:iron_ore'
            ];
            const randInt = Math.floor(Math.random() * 6);
            if (randInt <= 2)
                return BlockTypes.get('minecraft:stone') ?? null;
            if (randInt <= 4)
                return BlockTypes.get('minecraft:andesite') ?? null;
            return BlockTypes.get(oreList[Math.floor(Math.random() * oreList.length)]) ?? null;
        }
        case 'chest': {
            const chestLocation = playerEcrDataManager.getValue('chestLocation', player);
            if (!chestLocation) {
                console.error('チェストが登録されていません\nこのアイテムでチェストを破壊して設定しよう');
                return null;
            }
            const chestBlock = player.dimension.getBlock(chestLocation);
            if (!chestBlock) {
                console.error('チェストがnai!');
                return null;
            }
            ;
            const container = chestBlock.getComponent('inventory')?.container;
            if (!container) {
                console.error('インベントリがない!');
                return null;
            }
            ;
            let posssibleBlocks = [];
            for (let i = 0; i < container.size; i++) {
                let slot = container.getSlot(i);
                if (slot.hasItem()) {
                    let item = slot.getItem();
                    let block = BlockTypes.get(item?.typeId ?? '');
                    if (block) {
                        posssibleBlocks.push(block);
                    }
                }
                else {
                    console.log('からっぽ');
                }
            }
            let selectedBlock = posssibleBlocks[Math.floor(Math.random() * posssibleBlocks.length)];
            return selectedBlock;
        }
        default:
            return null;
    }
}
