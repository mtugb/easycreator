import { BlockVolume, world } from "@minecraft/server";
import { playerEcrDataManager } from "./playerDatabase";
import { processingManager } from "./processings";
export function createEmptyCircle(center, radius, player) {
    let clipboard_block = playerEcrDataManager.getValue('clipboard_block', player);
    if (!clipboard_block) {
        return false;
    }
    let centre = { x: Math.floor(center.x) + 0.5, y: Math.floor(center.y), z: Math.floor(center.z) + 0.5 };
    for (let i = 0; i < 360; i++) {
        let radian = 2 * Math.PI * (i / 360);
        let x = centre.x + Math.cos(radian) * radius;
        let z = centre.z + Math.sin(radian) * radius;
        let target = { x, y: centre.y, z };
        player.dimension.fillBlocks(new BlockVolume(target, target), clipboard_block);
    }
    processingManager.stopHeavyProcessing('circle_create');
    console.log(processingManager.heavyProcessings.circle_create);
}
export function createFilledCircle(center, radius, player) {
    let clipboard_block = playerEcrDataManager.getValue('clipboard_block', player);
    if (!clipboard_block) {
        return false;
    }
    let centre = { x: Math.floor(center.x) + 0.5, y: Math.floor(center.y), z: Math.floor(center.z) + 0.5 };
    for (let r = 0; r < radius; r++) {
        createEmptyCircle(center, r, player);
    }
    processingManager.stopHeavyProcessing('circle_create');
}
let circleBlockWaitList = new Set;
export function createOverClockedEmptyCircle(center, radius, player) {
    let clipboard_block = playerEcrDataManager.getValue('clipboard_block', player);
    if (!clipboard_block) {
        return;
    }
    let centre = { x: Math.floor(center.x) + 0.5, y: Math.floor(center.y), z: Math.floor(center.z) + 0.5 };
    const angleIncrement = 360 / (2 * Math.PI * radius);
    for (let i = 0; i < 360; i += angleIncrement) {
        let radian = 2 * Math.PI * (i / 360);
        let newBlockLocation = {
            target: {
                x: Math.floor(centre.x + Math.cos(radian) * radius),
                y: center.y,
                z: Math.floor(centre.z + Math.sin(radian) * radius)
            },
            dimension: player.dimension,
            block: clipboard_block
        };
        circleBlockWaitList.add(newBlockLocation);
    }
}
;
let maxStackSize = 1;
let performedCount = 0;
export function processCircleBlockWaitlist() {
    if (circleBlockWaitList.size === 0) {
        return;
    }
    if (circleBlockWaitList.size === 3) {
        processingManager.stopHeavyProcessing('circle_create');
    }
    world.getPlayers().forEach(player => {
        player.onScreenDisplay.setActionBar(`円の生成: のこり §2${circleBlockWaitList.size - 1}§r ブロック\nチャットに「.cancel」と入力して中断できます。`);
        // player.onScreenDisplay.setActionBar('performedCount: '+performedCount);
    });
    const blockLocation = [...circleBlockWaitList][0];
    const { target, dimension, block } = blockLocation;
    if (performedCount % 2 === 0) {
        dimension.runCommand(`tickingarea add ${target.x} ${target.y} ${target.z} ${target.x} ${target.y} ${target.z} ecrArea`);
    }
    else {
        dimension.fillBlocks(new BlockVolume(target, target), block);
        circleBlockWaitList.delete(blockLocation);
        dimension.runCommand(`tickingarea remove ecrArea`);
    }
    performedCount++;
}
export function cencelCircleOverClockCreating() {
    world.getPlayers().forEach(player => {
        player.sendMessage('円の生成がキャンセルされました');
    });
    processingManager.stopHeavyProcessing('circle_create');
    circleBlockWaitList.clear();
}
