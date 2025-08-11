import { BlockTypes, BlockVolume, Dimension, Player, PlayerBreakBlockAfterEvent, system, Vector3, world } from '@minecraft/server';
import { ecrItems } from './utils/items';
import { showForm } from './utils/formUtils';
import { ecrTagNames, playerEcrDataManager } from './utils/playerDatabase';
import { replaceToStone } from './utils/terrainCreator';
import { processCircleBlockWaitlist } from './utils/circles';
import { ecrCommands, PREFIX } from './utils/commands';
import { delayedFunctionsManager } from './utils/delayedFunctions';

world.afterEvents.itemUse.subscribe(e => {
    if (e.source instanceof Player) {
        const ecrItem = ecrItems[e.itemStack.typeId];
        if (e.source.isSneaking) {
            if (ecrItem) {
                if (ecrItem.onUse_with_sneak) {
                    ecrItem.onUse_with_sneak(e);
                }
            }
        } else {
            if (ecrItem) {
                if (ecrItem.onUse_without_sneak) {
                    ecrItem.onUse_without_sneak(e);
                }
            }
        }
    }
});


world.beforeEvents.playerBreakBlock.subscribe(e => {
    let itemId = getItemInMainHand(e.player);
    if (itemId) {
        const ecrItem = ecrItems[itemId];
        if (ecrItem) {
            if (ecrItem.onBreakBlock_before) {
                ecrItem.onBreakBlock_before(e);
            }
        }
    }
})

world.afterEvents.playerBreakBlock.subscribe(e => {
    let itemId = getItemInMainHand(e.player);
    if (itemId) {
        const ecrItem = ecrItems[itemId];
        if (ecrItem) {
            if (ecrItem.onBreakBlock_after) {
                ecrItem.onBreakBlock_after(e);
            }
        }
    }
})

world.beforeEvents.playerInteractWithBlock.subscribe(e=>{
    let itemId = e.itemStack?.typeId;
    if (itemId) {
        const ecrItem = ecrItems[itemId];
        if (ecrItem) {
            if (ecrItem.playerInteractWithBlock_before) {
                ecrItem.playerInteractWithBlock_before(e);
            }
        }
    }
})

world.afterEvents.chatSend.subscribe(e => {
    if (e.message.startsWith(PREFIX)) {
        const ecrCommand = ecrCommands[e.message.slice(1)];
        if (ecrCommand) {
            ecrCommand.onSend(e.sender);
        }
    }
})

function getItemInMainHand(player: Player) {
    return player.getComponent('minecraft:inventory')?.container.getItem(player.selectedSlotIndex)?.typeId;
}

let maxStackSize = 60;

let ecrAppStarted = false;
// let lastSelectedSlot:number|null = null;

let tick = 0;
system.runInterval(() => {
    for (let l = 0; l < maxStackSize; l++) {
        replaceToStone();
    }
    processCircleBlockWaitlist();
    delayedFunctionsManager.processDelayedFunctions();

    world.getAllPlayers().forEach(player => {
        let lastSelectedSlot = playerEcrDataManager.getValue('lastSelectedSlot', player);
        if (lastSelectedSlot !== player.selectedSlotIndex) {
            let ecrTag = playerEcrDataManager.getValue('tag', player);
            if (ecrTag) {
                cancelEcrFunc(player);
                player.onScreenDisplay.setActionBar('§2' + ecrTagNames[ecrTag] + 'をキャンセルしました')
            }
            playerEcrDataManager.setValue('lastSelectedSlot', player.selectedSlotIndex, player);
        }

        let itemId = getItemInMainHand(player);
        if (itemId === 'ecr:paste' && tick % 4 === 0) {
            let particleVectors = [
                {
                    x: player.location.x + 1,
                    y: player.location.y,
                    z: player.location.z
                },
                {
                    x: player.location.x + 2,
                    y: player.location.y,
                    z: player.location.z
                },
                {
                    x: player.location.x + 3,
                    y: player.location.y,
                    z: player.location.z
                },
                {
                    x: player.location.x + 1,
                    y: player.location.y,
                    z: player.location.z + 1
                }
            ];
            for (const particleVector of particleVectors) {
                player.spawnParticle('minecraft:electric_spark_particle', particleVector)
            }
        }
    });
    tick++;
}, 1)

function cancelEcrFunc(player: Player) {
    playerEcrDataManager.setValue('tag', null, player);
    playerEcrDataManager.setValue('state', 0, player);
    playerEcrDataManager.setValue('height', null, player);
    playerEcrDataManager.setValue('fillMode', 'break', player);
    let brokenBlock = playerEcrDataManager.getValue('brokenBlock', player);
    let xyz = playerEcrDataManager.getValue('xyz', player);
    if (brokenBlock && xyz) {
        let brokenBlockLocation = playerEcrDataManager.getValue('xyz', player);
        player.dimension.fillBlocks(new BlockVolume(xyz, xyz), brokenBlock);
        playerEcrDataManager.setValue('brokenBlock', null, player);
        playerEcrDataManager.setValue('xyz', null, player);
    }
    playerEcrDataManager.setValue('chestLocation', null, player);

}