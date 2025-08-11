import { Block, BlockType, BlockVolume, BlockVolumeBase, Dimension, ItemStack, ItemType, ItemUseAfterEvent, Player, PlayerBreakBlockAfterEvent, StructureManager, StructureRotation, StructureSaveMode, Vector3, world } from '@minecraft/server';
import { EcrItem } from './types';
import { showForm } from './formUtils';
import { playerEcrDataManager, structureRotations } from './playerDatabase';
import { decay, REPLACE_MODES } from './terrainCreator';
import { structureManager } from './structures';
import { ModalFormResponse } from '@minecraft/server-ui';
import { createEmptyCircle, createFilledCircle, createOverClockedEmptyCircle } from './circles';
import { processingManager } from './processings';
import { delayedFunctionsManager } from './delayedFunctions';
import { ecrForms } from './forms';

export const ecrItems: Record<string, EcrItem> = {
    'ecr:fill': {
        name: '埋め立て',
        onUse_with_sneak: (e: ItemUseAfterEvent) => {
            showForm(e.source, 'terrain_options');
        },
        onBreakBlock_after: (e: PlayerBreakBlockAfterEvent) => {
            let clipboard_block = playerEcrDataManager.getValue('clipboard_block', e.player);
            if (!clipboard_block) {
                e.player.sendMessage('ブロックが選択されていません');
                e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                return;
            }
            let ecrTag = playerEcrDataManager.getValue('tag', e.player);
            if (ecrTag == null) {
                setStartPosBlock(e.block.location, e.dimension);
                playerEcrDataManager.setValue('xyz', e.block.location, e.player);
                playerEcrDataManager.setValue('tag', 'fill', e.player);
                playerEcrDataManager.setValue('brokenBlock', e.brokenBlockPermutation, e.player);
            } else if (ecrTag == 'fill') {
                setEndPosBlock(e.block.location, e.dimension);
                let xyz = playerEcrDataManager.getValue('xyz', e.player);
                if (xyz) {
                    let options;
                    if (playerEcrDataManager.getValue('fillMode', e.player) === 'break') {
                        options = {}
                    } else if (playerEcrDataManager.getValue('fillMode', e.player) === 'keep') {
                        options = {
                            blockFilter: {
                                includeTypes: ['minecraft:air']
                            }
                        }
                        let previousBrokenBlock = playerEcrDataManager.getValue('brokenBlock', e.player);
                        if (previousBrokenBlock) {
                            e.dimension.fillBlocks(new BlockVolume(xyz, xyz), previousBrokenBlock);
                            e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                        }
                    } else {
                        console.error('重大エラー');
                        playerEcrDataManager.setValue('tag', null, e.player);
                        return;
                    }
                    e.dimension.fillBlocks(new BlockVolume(xyz, e.block.location), clipboard_block, options);
                    playerEcrDataManager.setValue('tag', null, e.player);
                }
            }
        }
    },
    'ecr:enclose': {
        name: '囲む',
        onUse_with_sneak: (e: ItemUseAfterEvent) => {
            showForm(e.source, 'terrain_options');
        },
        onBreakBlock_after: (e: PlayerBreakBlockAfterEvent) => {
            let clipboard_block = playerEcrDataManager.getValue('clipboard_block', e.player);
            if (!clipboard_block) {
                e.player.sendMessage('ブロックが選択されていません');
                e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                return;
            }
            let ecrTag = playerEcrDataManager.getValue('tag', e.player);
            if (ecrTag == null) {
                setStartPosBlock(e.block.location, e.dimension);
                playerEcrDataManager.setValue('xyz', e.block.location, e.player);
                playerEcrDataManager.setValue('tag', 'enclose', e.player);
                playerEcrDataManager.setValue('brokenBlock', e.brokenBlockPermutation, e.player);
            } else if (ecrTag == 'enclose') {
                setEndPosBlock(e.block.location, e.dimension);
                let xyz = playerEcrDataManager.getValue('xyz', e.player);
                if (xyz) {
                    let options;
                    if (playerEcrDataManager.getValue('fillMode', e.player) === 'break') {
                        options = {}
                    } else if (playerEcrDataManager.getValue('fillMode', e.player) === 'keep') {
                        options = {
                            blockFilter: {
                                includeTypes: ['minecraft:air']
                            }
                        }
                        let previousBrokenBlock = playerEcrDataManager.getValue('brokenBlock', e.player);
                        if (previousBrokenBlock) {
                            e.dimension.fillBlocks(new BlockVolume(xyz, xyz), previousBrokenBlock);
                            e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                        }
                    } else {
                        console.error('重大エラー');
                        playerEcrDataManager.setValue('tag', null, e.player);
                        return;
                    }
                    e.dimension.fillBlocks(new BlockVolume(xyz, { x: xyz.x, y: e.block.location.y, z: e.block.location.z }), clipboard_block, options);
                    e.dimension.fillBlocks(new BlockVolume(xyz, { x: e.block.location.x, y: e.block.location.y, z: xyz.z }), clipboard_block, options);
                    e.dimension.fillBlocks(new BlockVolume({ x: e.block.location.x, y: xyz.y, z: xyz.z }, e.block.location), clipboard_block, options);
                    e.dimension.fillBlocks(new BlockVolume({ x: xyz.x, y: xyz.y, z: e.block.location.z }, e.block.location), clipboard_block, options);
                    playerEcrDataManager.setValue('tag', null, e.player);
                }
            }
        }
    },
    'ecr:pole': {
        name: '柱',
        onUse_with_sneak: (e: ItemUseAfterEvent) => {
            showForm(e.source, 'pillar_height');
        },
        onBreakBlock_after: (e: PlayerBreakBlockAfterEvent) => {
            let clipboard_block = playerEcrDataManager.getValue('clipboard_block', e.player);
            if (!clipboard_block) {
                e.player.sendMessage('ブロックが選択されていません');
                e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                return;
            }
            let height = playerEcrDataManager.getValue('height', e.player);
            const brokenBlock = e.brokenBlockPermutation;
            e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), brokenBlock);
            if (!height) {
                showForm(e.player, 'pillar_height');
                e.player.sendMessage('柱の高さの設定は§6右クリック+スニーク§rで行えます。');
                return;
            }


            e.dimension.fillBlocks(new BlockVolume(
                { x: e.block.location.x, y: e.block.location.y + 1, z: e.block.location.z },
                { x: e.block.location.x, y: e.block.location.y + height, z: e.block.location.z }
            ), clipboard_block);
        }
    },
    'ecr:spoit': {
        name: 'スポイト',
        onBreakBlock_after(e) {
            playerEcrDataManager.setValue('clipboard_block', e.brokenBlockPermutation, e.player);
            e.player.sendMessage('ブロック「' + e.brokenBlockPermutation.type.id + '」を選択しました');
            e.player.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
        },
        onUse_with_sneak(e) {
            showForm(e.source, 'clipboard_specials');
        },
    },
    'ecr:shovel': {
        name: '地形生成ツール',
        onUse_with_sneak(e) {
            showForm(e.source, 'replace_mode');
        },
        onUse_without_sneak(e) {
            e.source.runCommand('fill ^-3^^5 ^3^3^7 sand')
        },
        onBreakBlock_after(e) {
            if (processingManager.checkIfHeavyProcessing()) {
                e.player.sendMessage('現在ほかの重たい処理（円の生成や地形生成など）が行なわれているため実行できません');
                return;
            }
            e.player.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);

            if (e.brokenBlockPermutation.type.id === 'minecraft:sand') {
                let replaceMode = playerEcrDataManager.getValue('replaceMode', e.player);
                if (replaceMode === null) {
                    e.player.sendMessage('変換先ブロックが設定されていません');
                    return;
                }
                let replaceModeString = REPLACE_MODES[replaceMode];
                if (replaceModeString === 'chest') {
                    console.log('チェスト')
                    let chestLocation = playerEcrDataManager.getValue('chestLocation', e.player);
                    if (!chestLocation) {
                        console.error('チェストの場所が見当たりません')
                        return;
                    }
                    // e.dimension.runCommand(`tickingarea remove ecrArea`);
                    // e.dimension.runCommand(`tickingarea add ${chestLocation.x} ${chestLocation.y} ${chestLocation.z} ${chestLocation.x} ${chestLocation.y} ${chestLocation.z} ecrArea`);
                }
                processingManager.startHeavyProcessing('terrain_create');
                decay(e.player, e.block.location);
            }
        },
        onBreakBlock_before(e) {
            if (e.block.typeId === 'minecraft:chest') {
                e.cancel = true;
                playerEcrDataManager.setValue('chestLocation', e.block.location, e.player);
                e.player.sendMessage('チェストを登録しました');
            }
        },
    },
    'ecr:copy': {
        name: 'コピー',
        onBreakBlock_after(e) {
            let ecrTag = playerEcrDataManager.getValue('tag', e.player);
            if (ecrTag == null) {
                setStartPosBlock(e.block.location, e.dimension);
                playerEcrDataManager.setValue('xyz', e.block.location, e.player);
                playerEcrDataManager.setValue('tag', 'copy', e.player);
                playerEcrDataManager.setValue('brokenBlock', e.brokenBlockPermutation, e.player);
            } else if (ecrTag == 'copy') {
                setEndPosBlock(e.block.location, e.dimension);
                let xyz = playerEcrDataManager.getValue('xyz', e.player);
                if (!xyz) {
                    e.player.sendMessage('エラー：コピー座標開始のxyzが見つかりません');
                    return;
                }
                let previousBrokenBlock = playerEcrDataManager.getValue('brokenBlock', e.player);
                if (previousBrokenBlock) {
                    e.dimension.fillBlocks(new BlockVolume(xyz, xyz), previousBrokenBlock);
                    e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                }
                world.structureManager.delete('ecr:test');
                showForm(e.player, 'stack_copy_save', (player, result) => {
                    if (result.canceled) {
                        return;
                    }
                    if (result instanceof ModalFormResponse) {
                        let name = result.formValues?.[0];
                        if (typeof name !== 'string' || !name) {
                            name = new Date().toLocaleTimeString();
                        }
                        let id = structureManager.subscribe(name);
                        world.structureManager.createFromWorld('ecr:' + id, e.dimension, xyz, e.block.location, {
                            includeBlocks: true,
                            includeEntities: false,
                            saveMode: StructureSaveMode.Memory
                        })
                        playerEcrDataManager.setValue('tag', null, e.player);
                    }
                })
            }
        },
    },
    'ecr:paste': {
        'name': 'ペースト',
        onBreakBlock_after(e) {
            if (structureManager.structures.length === 0) {
                e.player.sendMessage('§2コピーされた建築がありません。\nコピーアイテムをつかってコピーしてみよう！');
                e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                return;
            }
            showForm(e.player, 'stack_copy_paste', (player, result) => {
                if (result instanceof ModalFormResponse) {
                    let selectedIndex = result.formValues?.[0];
                    if (typeof selectedIndex !== 'number') {
                        return;
                    }
                    playerEcrDataManager.setValue('copySavedIndex', selectedIndex, player);
                    let rotationIndex = result.formValues?.[1];
                    if (typeof rotationIndex !== 'number') {
                        return;
                    }
                    world.structureManager.place('ecr:' + structureManager.structures[selectedIndex].id, e.dimension, e.block.location, {
                        rotation: structureRotations[rotationIndex]
                    });
                }
            });
        }
    },
    'ecr:circle_empty': {
        'name': '中がカラの円を生成',
        onBreakBlock_after(e) {
            e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
            let clipboard_block = playerEcrDataManager.getValue('clipboard_block', e.player);
            if (!clipboard_block) {
                e.player.sendMessage('§2ブロックが選択されていません');
                return;
            }
            if (processingManager.checkIfHeavyProcessing()) {
                e.player.sendMessage('現在ほかの重たい処理（円の生成や地形生成など）が行なわれているため実行できません');
                console.log(processingManager.heavyProcessings.circle_create);
                console.log(processingManager.heavyProcessings.terrain_create);
                return;
            }
            showForm(e.player, 'circle_create', (player, result: ModalFormResponse) => {
                if (result.canceled) {
                    return;
                }
                let isCircleEmptyOverClock = playerEcrDataManager.getValue('circleEmptyOverClock', player);
                let createRequiredCircle = isCircleEmptyOverClock ? createOverClockedEmptyCircle : createEmptyCircle;
                let radius = result.formValues?.[0];
                if (typeof radius === 'string') {
                    let checkIfNumber = /^[0-9]+$/;
                    if (checkIfNumber.test(radius)) {
                        radius = Number(radius);
                        if (radius > 40 && !isCircleEmptyOverClock) {
                            player.sendMessage('§2 40ブロック以上の半径にはできません\n§rスニーク＋右クリックからオーバークロックモードに変更することで可能になります。');
                            return;
                        }
                        processingManager.startHeavyProcessing('circle_create');
                        createRequiredCircle(e.block.location, radius, player);
                    } else {
                        player.sendMessage('入力した半径が有効な数字ではありません');
                    }
                } else if (typeof radius === 'number') {
                    createRequiredCircle(e.block.location, radius, player);
                } else {
                    player.sendMessage('§4想定外のエラーです');
                }

            });
        },
        onUse_with_sneak(e) {
            showForm(e.source, 'circle_empty_setting');
        }
    },
    'ecr:circle_filled': {
        'name': '中が埋まったの円を生成',
        onBreakBlock_after(e) {
            e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
            let clipboard_block = playerEcrDataManager.getValue('clipboard_block', e.player);
            if (!clipboard_block) {
                e.player.sendMessage('§2ブロックが選択されていません');
                return;
            }
            if (processingManager.checkIfHeavyProcessing()) {
                e.player.sendMessage('現在ほかの重たい処理（円の生成や地形生成など）が行なわれているため実行できません');
                return;
            }
            showForm(e.player, 'circle_create', (player, result: ModalFormResponse) => {
                if (result.canceled) {
                    return;
                }
                processingManager.startHeavyProcessing('circle_create');
                let radius = result.formValues?.[0];
                if (typeof radius === 'string') {
                    let checkIfNumber = /^[0-9]+$/;
                    if (checkIfNumber.test(radius)) {
                        radius = Number(radius);
                        createFilledCircle(e.block.location, radius, player);
                    } else {
                        player.sendMessage('入力した半径が有効な数字ではありません');
                    }
                } else if (typeof radius === 'number') {
                    createFilledCircle(e.block.location, radius, player);
                } else {
                    player.sendMessage('§4想定外のエラーです');
                }

            });
        }
    },
    'ecr:palette': {
        name: 'アイテムパレット',
        onBreakBlock_before(e) {
            e.cancel = true;
            if (e.block.typeId !== 'minecraft:chest') {
                e.player.sendMessage('チェストではありません');
            }
            const container = e.block.getComponent('inventory')?.container;
            if (!container) {
                console.error('インベントリがない!');
                return null
            };
            let posssibleItems: ItemStack[] = [];
            for (let i = 0; i < 8; i++) {
                let slot = container.getSlot(i);
                if (slot.hasItem()) {
                    let item = slot.getItem();
                    if (item)
                        posssibleItems.push(item);
                }
            }
            let playerInventory = e.player.getComponent('minecraft:inventory');
            let currentItemIndex = 0;
            for (let i = 0; i < 8; i++) {
                let item = playerInventory?.container.getItem(i);
                if (!item || item.typeId !== 'ecr:palette') {
                    delayedFunctionsManager.subscribe(5, () => {
                        playerInventory?.container.setItem(i, posssibleItems[currentItemIndex++]);
                    })
                }
            }
        }
    },
    'ecr:naname': {
        name: '斜め建築',
        onBreakBlock_after: (e: PlayerBreakBlockAfterEvent) => {
            let clipboard_block = playerEcrDataManager.getValue('clipboard_block', e.player);
            if (!clipboard_block) {
                e.player.sendMessage('ブロックが選択されていません');
                e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                return;
            }
            let ecrTag = playerEcrDataManager.getValue('tag', e.player);
            if (ecrTag == null) {
                setStartPosBlock(e.block.location, e.dimension);
                playerEcrDataManager.setValue('xyz', e.block.location, e.player);
                playerEcrDataManager.setValue('tag', 'naname', e.player);
                playerEcrDataManager.setValue('brokenBlock', e.brokenBlockPermutation, e.player);
            } else if (ecrTag == 'naname') {
                setEndPosBlock(e.block.location, e.dimension);
                let xyz = playerEcrDataManager.getValue('xyz', e.player);
                if (xyz) {
                    if (Math.abs(e.block.x - xyz.x) > 40 || Math.abs(e.block.z - xyz.z) > 40) {
                        e.player.sendMessage('縦横それぞれ40ブロック以上には設定できません');
                        e.player.sendMessage('開始地点に「１」ブロックが残されているので、そこから何回かに分けて行なってください。');
                        let previousBrokenBlock = playerEcrDataManager.getValue('brokenBlock', e.player);
                        if (previousBrokenBlock) {
                            // e.dimension.fillBlocks(new BlockVolume(xyz, xyz), previousBrokenBlock);
                            e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), e.brokenBlockPermutation);
                            playerEcrDataManager.setValue('tag', null, e.player);
                        }
                        return;
                    }
                    const nanamePotantials = new Set<Vector3>();
                    const vector = { x: e.block.x - xyz.x, z: e.block.z - xyz.z }
                    const length = Math.sqrt(vector.x ** 2 + vector.z ** 2);
                    const unitVector = { x: vector.x / length, z: vector.z / length }
                    for (let i = 0; i <= length; i++) {
                        const x = xyz.x + unitVector.x * i;
                        const z = xyz.z + unitVector.z * i;
                        nanamePotantials.add({ x: Math.round(x) + 0.5, y: xyz.y, z: Math.round(z) + 0.5 });
                    }
                    nanamePotantials.forEach(nanamePos => {
                        e.dimension.fillBlocks(new BlockVolume(nanamePos, nanamePos), clipboard_block)
                    });
                    e.dimension.fillBlocks(new BlockVolume(e.block.location, e.block.location), clipboard_block)
                    playerEcrDataManager.setValue('tag', null, e.player);
                }
            }
        }
    },
    'ecr:easy_creator': {
        name: 'イージークリエイターの本',
        onUse_without_sneak(e) {
            showForm(e.source, 'ecr_book');
        },
    },
    'ecr:ukijima': {
        name: '浮島メーカー',
        onUse_without_sneak(e) {
            e.source.sendMessage('まだ開発中です...もう少しお待ちください。');
            // showForm(e.source, 'ecr_book', e=>{

            // });
        },
    }
};

function setStartPosBlock(location: Vector3, dimension: Dimension) {
    dimension.runCommand(`setblock ${location.x} ${location.y} ${location.z} ecr:first`)
}

function setEndPosBlock(location: Vector3, dimension: Dimension) {
    dimension.runCommand(`setblock ${location.x} ${location.y} ${location.z} ecr:second`)
}
