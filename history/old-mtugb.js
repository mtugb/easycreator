import * as server from '@minecraft/server'
import * as ui from '@minecraft/server-ui'
import "./timer.js"
const world = server.world

let xyz = {
    "start": null,
    "end": null
}
let xyz_wall = {
    "start": null,
    "end": null
}
let xyz_copy = {
    "start": null,
    "end": null
}
let state = 0;
let clipboard_block = null
let height = 10;
let rotate_str = '';



let selectRange_keep_block_point_first;
let chestLocation;

// server.system.runInterval(() => {
//     let players = world.getAllPlayers();
//     for (const player of players) {
//         player.sendMessage('HELLO');
//     }
// }, 200);

world.afterEvents.playerJoin.subscribe((ev) => {
    const { player } = ev;
    player.sendMessage(`§6§lイージークリエイター§rが利用できます`)
    let rm_tag_list = [
        'selectBlock', 'selectRange', 'selectRange_keep',
        'selectRange_wall', 'placePole', 'copy', 'paste',
        'chestForStructure'
    ];
    rm_tag_list.forEach(e => {
        if (player.hasTag(e)) {
            player.removeTag(e)
        }
    })
})


let nanamePos = {
    from: null,
    to: null
}
let nanamePotantials = new Set();

world.afterEvents.playerBreakBlock.subscribe((ev) => {
    const { player, block, dimension, brokenBlockPermutation } = ev;
    if (player.hasTag('selectRange')) {
        console.warn('範囲選択前')
        let locate = block.location
        switch (state) {
            case 0:
                console.warn('範囲選択１')
                xyz.start = locate;
                state = 1;
                dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:first`)
                break;
            case 1:
                xyz.end = locate;
                state = 0;
                dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:second`)
                fill(xyz.start, xyz.end, clipboard_block)
                player.removeTag('selectRange');

                break;
        }


        // 壊したブロックの存在しているディメンション
        // const dimension = dimension;
        // ディメンション主体でメッセージを送る
        // dimension.runCommand(`say ${player.name}が${id}を壊しました`);} else {}
    } else if (player.hasTag('selectRange_keep')) {
        let locate = block.location
        switch (state) {
            case 0:
                console.warn('範囲選択前(ブロック保存）1')
                console.warn('範囲選択１')
                xyz.start = locate;
                state = 1;
                selectRange_keep_block_point_first = brokenBlockPermutation.type;
                dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:first`)
                break;
            case 1:
                console.warn('範囲選択前(ブロック保存）2')
                xyz.end = locate;
                state = 0;
                let selectRange_keep_block_point_second = brokenBlockPermutation.type;
                console.warn('範囲選択前(ブロック保存）2.1')
                dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:second`)
                console.warn('範囲選択前(ブロック保存）2.2')
                fill(xyz.start, xyz.end, clipboard_block, { matchingBlock: server.BlockPermutation.resolve('minecraft:air') });
                console.warn('範囲選択前(ブロック保存）2.21')
                world.getDimension('overworld').getBlock(xyz.start).setType(selectRange_keep_block_point_first)
                world.getDimension('overworld').getBlock(xyz.end).setType(selectRange_keep_block_point_second)
                player.removeTag('selectRange_keep');
                console.warn('範囲選択前(ブロック保存）2.3')


                break;
        }


        // 壊したブロックの存在しているディメンション
        // const dimension = dimension;
        // ディメンション主体でメッセージを送る
        // dimension.runCommand(`say ${player.name}が${id}を壊しました`);} else {}
    } else if (player.hasTag('selectBlock')) {
        // 壊したブロックのID
        const id = brokenBlockPermutation;
        fill(block.location, block.location, id)
        clipboard_block = id;
        player.sendMessage(`Successfully block selected to "${id.type.id}".`)
        player.removeTag('selectBlock')
    } else if (player.hasTag('placePole')) {
        const id = brokenBlockPermutation;
        fill(block.location, block.location, id)
        fill(
            { x: block.location.x, y: block.location.y + 1, z: block.location.z },
            { x: block.location.x, y: block.location.y + height, z: block.location.z },
            clipboard_block
        )
        player.sendMessage(`柱の建設が完了しました！`)
        player.removeTag('placePole')
    } else if (player.hasTag('selectRange_wall')) {
        let locate = `${block.location.x} ${block.location.y} ${block.location.z}`
        switch (state) {
            case 0:
                xyz_wall.start = block.location;
                state = 1;
                dimension.runCommand(`setblock ${locate} ecr:first`)
                break;
            case 1:
                xyz_wall.end = block.location;
                state = 0;
                dimension.runCommand(`setblock ${locate} ecr:second`)
                player.removeTag('selectRange_wall');
                fill(xyz_wall.start, { x: xyz_wall.start.x, y: xyz_wall.end.y, z: xyz_wall.end.z }, clipboard_block)
                fill(xyz_wall.start, { x: xyz_wall.end.x, y: xyz_wall.end.y, z: xyz_wall.start.z }, clipboard_block)
                fill({ x: xyz_wall.end.x, y: xyz_wall.start.y, z: xyz_wall.start.z }, xyz_wall.end, clipboard_block)
                fill({ x: xyz_wall.start.x, y: xyz_wall.start.y, z: xyz_wall.end.z }, xyz_wall.end, clipboard_block)

                break;
        }


        // 壊したブロックの存在しているディメンション
        // const dimension = dimension;
        // ディメンション主体でメッセージを送る
        // dimension.runCommand(`say ${player.name}が${id}を壊しました`);} else {}
    } else if (player.hasTag('copy')) {
        let locate = `${block.location.x} ${block.location.y} ${block.location.z}`
        switch (state) {
            case 0:
                rotate_str = '';
                xyz_copy.start = block.location;
                state = 1;
                var id = brokenBlockPermutation;
                fill(block.location, block.location, id)
                player.sendMessage('開始ポイントを設定しました')
                break;
            case 1:
                xyz_copy.end = block.location;
                var id = brokenBlockPermutation;
                fill(block.location, block.location, id)
                dimension.runCommand(`
                    structure save wmk_addon_save ${xyz_copy.start.x} ${xyz_copy.start.y} ${xyz_copy.start.z} ${xyz_copy.end.x} ${xyz_copy.end.y} ${xyz_copy.end.z}
                `)
                player.removeTag('copy');
                state = 0;
                player.sendMessage('終点ポイントを設定しました')
                player.sendMessage('[完了] 建築がコピーされました\nペーストアイテムまたはクリーパの本からペーストできます。')
                break;
        }


        // 壊したブロックの存在しているディメンション
        // const dimension = dimension;
        // ディメンション主体でメッセージを送る
        // dimension.runCommand(`say ${player.name}が${id}を壊しました`);} else {}
    } else if (player.hasTag('paste')) {
        let locate = `${block.location.x} ${block.location.y} ${block.location.z}`
        player.removeTag('paste');
        state = 0;
        dimension.runCommand(`structure load wmk_addon_save ${locate} ${rotate_str}`)
        player.sendMessage('[完了] 建築をペーストしました')
        // 壊したブロックの存在しているディメンション
        // const dimension = dimension;
        // ディメンション主体でメッセージを送る
        // dimension.runCommand(`say ${player.name}が${id}を壊しました`);} else {}
    } else {
        // ev.dimension.createExplosion(player.location, 1)
    }


    if (player.hasTag('naname')) {
        let locate = `${block.location.x} ${block.location.y} ${block.location.z}`
        switch (state) {
            case 0:
                nanamePos.from = block.location;
                state = 1;
                dimension.runCommand(`setblock ${locate} ecr:first`)
                break;
            case 1:
                player.removeTag('naname');
                var id = brokenBlockPermutation;
                fill(block.location, block.location, id)
                nanamePos.to = block.location;
                if (nanamePos.from.y !== nanamePos.to.y) {
                    player.sendMessage('§4§lエラー: 平らにしか設置できません。')
                    break;
                }
                state = 0;
                const vector = { x: nanamePos.to.x - nanamePos.from.x, z: nanamePos.to.z - nanamePos.from.z }
                const length = Math.sqrt(vector.x ** 2 + vector.z ** 2);
                const unitVector = { x: vector.x / length, z: vector.z / length }
                for (let i = 0; i <= length; i++) {
                    const x = nanamePos.from.x + unitVector.x * i;
                    const z = nanamePos.from.z + unitVector.z * i;
                    nanamePotantials.add({ x: Math.round(x) + 0.5, y: nanamePos.from.y, z: Math.round(z) + 0.5 });
                }
                nanamePotantials.forEach(e => {
                    fill(e, e, clipboard_block)
                });
                nanamePos = {
                    from: null,
                    to: null
                }
                nanamePotantials = new Set();
                break;
        }
    }
})

let blockWaitList = [];
let limit = 100000;
let nn = 0;

function decay(loc) {
    let json = JSON.stringify(loc)
    nn++;
    if (nn >= limit || blockWaitList.includes(json)) {
        return;
    }
    console.log(`location ${json}(x:${loc.x}`);

    let checkList = [
        { x: loc.x + 1, y: loc.y, z: loc.z },
        { x: loc.x, y: loc.y + 1, z: loc.z },
        { x: loc.x, y: loc.y, z: loc.z + 1 },
        { x: loc.x - 1, y: loc.y, z: loc.z },
        { x: loc.x, y: loc.y - 1, z: loc.z },
        { x: loc.x, y: loc.y, z: loc.z - 1 }
    ]
    checkList.forEach(e => {
        let dimension = world.getDimension('overworld');
        let block = dimension.getBlock(e)
        if (block.typeId === 'minecraft:sand') {
            blockWaitList.push(JSON.stringify(e))
        }
    })
}

let maxStackSize = 60;
let replaceMode = null;
server.system.runInterval(() => {
    for (let l = 0; l < maxStackSize; l++) {
        replaceToStone();
    }
})

function replaceToStone() {
    if (replaceMode === 'selectedBlock') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, clipboard_block)
            decay(loc);
        }
    }
    if (replaceMode === 'ice') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, 'minecraft:ice')
            decay(loc);
        }
    }
    if (replaceMode === 'snow') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, 'minecraft:snow')
            decay(loc);
        }
    }
    if (replaceMode === 'stone') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, 'minecraft:stone')
            decay(loc);
        }
    }
    if (replaceMode === 'grass') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, 'minecraft:grass')
            decay(loc);
        }
    }
    if (replaceMode === 'dirt') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, 'minecraft:dirt')
            decay(loc);
        }
    }
    if (replaceMode === 'stoneAndOre') {
        if (blockWaitList.length > 0) {
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            const oreList = ['minecraft:coal_ore', 'minecraft:gold_ore', 'minecraft:iron_ore'];
            const randInt = Math.floor(Math.random() * 6)
            let targetBlock;
            if (randInt <= 2) {
                targetBlock = 'minecraft:stone'
            } else if (randInt <= 4) {
                targetBlock = 'minecraft:andesite'
            } else if (randInt === 5) {
                const randInt2 = Math.floor(Math.random() * 6)
                if (randInt2 <= 3) {
                    targetBlock = oreList[0]
                } else if (randInt2 <= 4) {
                    targetBlock = oreList[1]
                }
                else if (randInt2 <= 5) {
                    targetBlock = oreList[2]
                }
            }
            fill(loc, loc, targetBlock)
            decay(loc);
        }
    }
    if (replaceMode === 'chest') {
        if (blockWaitList.length > 0) {
            let dimension = world.getDimension('overworld');
            let container = dimension.getBlock(chestLocation).getComponent('inventory').container
            let inChestBlocks = []
            for (let i = 0; i < container.size; i++) {
                if (container.getItem(i))
                    inChestBlocks.push(container.getItem(i))
            }
            let loc = JSON.parse(blockWaitList[0])
            blockWaitList = blockWaitList.slice(1);
            fill(loc, loc, inChestBlocks[Math.floor(Math.random() * inChestBlocks.length)].typeId)
            decay(loc);
        }
    }
}


world.beforeEvents.chatSend.subscribe((e) => {
    const { message, sender } = e
    switch (message) {
        case '.block': {
            e.cancel = true
            if (clipboard_block) {
                if (clipboard_block instanceof server.BlockPermutation) {
                    const typeId = clipboard_block.getItemStack().typeId.replace('minecraft:', '')
                    sender.sendMessage(`「§2§l ${typeId} §r」を選択中です。`)
                }
            } else {
                sender.sendMessage(`§4ブロックが選択されていません。`)
            }
            break;
        }
        case '.pos': {
            e.cancel = true
            if (sender.hasTag('selectRange')) {
                let locate = sender.location
                let dimension = world.getDimension('overworld');
                switch (state) {
                    case 0:
                        sender.sendMessage('開始位置を設定しました')
                        xyz.start = locate;
                        state = 1;
                        setTimeout(() => {
                            dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:first`)
                        }, 10);
                        break;
                    case 1:
                        sender.sendMessage('終了位置を設定しました')
                        xyz.end = locate;
                        state = 0;
                        setTimeout(() => {
                            dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:second`)
                            fill(xyz.start, xyz.end, clipboard_block)
                            sender.removeTag('selectRange');
                        }, 10);
                        break;
                }
            } else if (sender.hasTag('selectRange_keep')) {
                let locate = sender.location
                let dimension = world.getDimension('overworld');
                switch (state) {
                    case 0:
                        sender.sendMessage('開始位置を設定しました')
                        xyz.start = locate;
                        state = 1;
                        selectRange_keep_block_point_first = brokenBlockPermutation.type;
                        setTimeout(() => {
                            dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:first`)
                        }, 10);
                        break;
                    case 1:
                        sender.sendMessage('終了位置を設定しました')
                        xyz.end = locate;
                        state = 0;
                        let selectRange_keep_block_point_second = brokenBlockPermutation.type;
                        setTimeout(() => {
                            dimension.runCommand(`setblock ${locate.x} ${locate.y} ${locate.z} ecr:second`)
                            fill(xyz.start, xyz.end, clipboard_block, { matchingBlock: server.BlockPermutation.resolve('minecraft:air') });
                            world.getDimension('overworld').getBlock(xyz.start).setType(selectRange_keep_block_point_first)
                            world.getDimension('overworld').getBlock(xyz.end).setType(selectRange_keep_block_point_second)
                            sender.removeTag('selectRange_keep');
                        }, 10);
                        break;
                }


                // 壊したブロックの存在しているディメンション
                // const dimension = dimension;
                // ディメンション主体でメッセージを送る
                // dimension.runCommand(`say ${sender.name}が${id}を壊しました`);} else {}
            } else if (sender.hasTag('placePole')) {
                setTimeout(() => {
                    fill(
                        { x: sender.location.x, y: sender.location.y + 1, z: sender.location.z },
                        { x: sender.location.x, y: sender.location.y + height, z: sender.location.z },
                        clipboard_block
                    )
                    sender.sendMessage(`柱の建設が完了しました！`)
                    sender.removeTag('placePole')
                }, 10);
            } else if (sender.hasTag('selectRange_wall')) {
                let locate = `${sender.location.x} ${sender.location.y} ${sender.location.z}`
                let dimension = world.getDimension('overworld');
                switch (state) {
                    case 0:
                        sender.sendMessage('開始位置を設定しました')
                        xyz_wall.start = sender.location;
                        state = 1;
                        setTimeout(() => {
                            dimension.runCommand(`setblock ${locate} ecr:first`)
                        }, 10);
                        break;
                    case 1:
                        sender.sendMessage('終了位置を設定しました')
                        xyz_wall.end = sender.location;
                        state = 0;
                        setTimeout(() => {
                            dimension.runCommand(`setblock ${locate} ecr:second`).then(() => {
                                sender.removeTag('selectRange_wall');
                                fill(xyz_wall.start, { x: xyz_wall.start.x, y: xyz_wall.end.y, z: xyz_wall.end.z }, clipboard_block)
                                fill(xyz_wall.start, { x: xyz_wall.end.x, y: xyz_wall.end.y, z: xyz_wall.start.z }, clipboard_block)
                                fill({ x: xyz_wall.end.x, y: xyz_wall.start.y, z: xyz_wall.start.z }, xyz_wall.end, clipboard_block)
                                fill({ x: xyz_wall.start.x, y: xyz_wall.start.y, z: xyz_wall.end.z }, xyz_wall.end, clipboard_block)
                            })
                        }, 10);
                        break;
                }
            } else if (sender.hasTag('copy')) {
                let locate = `${sender.location.x} ${sender.location.y} ${sender.location.z}`
                let dimension = world.getDimension('overworld');
                switch (state) {
                    case 0:
                        rotate_str = '';
                        xyz_copy.start = sender.location;
                        state = 1;
                        setTimeout(() => {
                            sender.sendMessage('開始ポイントを設定しました')
                        }, 10);
                        break;
                    case 1:
                        xyz_copy.end = sender.location;
                        setTimeout(() => {
                            const copyForm = getCopyForm();
                            copyForm.show(sender);
                            // dimension.runCommand(`
                            //     structure save wmk_addon_save ${xyz_copy.start.x} ${xyz_copy.start.y} ${xyz_copy.start.z} ${xyz_copy.end.x} ${xyz_copy.end.y} ${xyz_copy.end.z}
                            // `)
                            sender.removeTag('copy');
                            state = 0;
                            sender.sendMessage('終点ポイントを設定しました')
                            sender.sendMessage('[完了] 建築がコピーされました\nペーストアイテムまたはクリーパの本からペーストできます。')
                        }, 10);
                        break;
                }
            } else if (sender.hasTag('paste')) {
                let locate = `${sender.location.x} ${sender.location.y} ${sender.location.z}`
                let dimension = world.getDimension('overworld');
                setTimeout(() => {
                    sender.removeTag('paste');
                    state = 0;
                    dimension.runCommand(`structure load wmk_addon_save ${locate} ${rotate_str}`)
                    sender.sendMessage('[完了] 建築をペーストしました')
                }, 10);
            } else {
                sender.sendMessage('§6範囲を選択する前に、アイテムを右クリックしよう！')
            }
        }
    }
})

//アイテムから起動
function getBookForm() {
    let form1 = new ui.ActionFormData()
    form1.title("何をしますか")
    form1.body("下からしたいことを選択")
    form1.button("ブロックで埋める")
    form1.button("柱を生成")
    form1.button("壁で範囲を囲む")
    form1.button("円を生成")
    form1.button("中が埋まった円を生成")
    form1.button("建物をコピー")
    form1.button("建物をペースト")
    form1.button("建物を回転[beta]")
    form1.button("設定", "textures/ui_icons/setting")
    return form1;
}



function getCopyForm() {
    let form = new ui.ActionFormData()
    form.title("保存先を設定")
    form.body("コピーを保存する場所は？")
    form.button("スロット1")
    form.button("スロット2")
    form.button("スロット3")
    return form;
}



function notBlockSelected(player) {
    player.sendMessage(`
ブロックが選択されていません。
イージークリエイター > 設定
> 使用するブロックの変更
からブロックを選択してください。
    `)
}

/**
 * Create empty circle
 * @param {server.Player} player 
 * @returns 
 */
function createEmptyCircle(player) {
    if (!clipboard_block) {
        notBlockSelected(player)
        return false;
    }
    var unknownForm = new ui.ModalFormData()
    unknownForm.textField('半径', '半径をここに入力');
    unknownForm.show(player).then(result => {
        let range = (result.formValues[0])
        // 半角数値チェック
        if (!range.match(/^[0-9]+$/)) {
            console.warn("半角数値ではありません");
            return false;
        }
        range = Number(range)
        let centre = { x: Math.floor(player.location.x) + 0.5, y: Math.floor(player.location.y), z: Math.floor(player.location.z) + 0.5 };

        for (let i = 0; i < 360; i++) {
            let radian = 2 * Math.PI * (i / 360);
            let x = centre.x + Math.cos(radian) * range;
            let z = centre.z + Math.sin(radian) * range;
            let target = { x, y: centre.y, z };
            fill(target, target, clipboard_block);
            // player.sendMessage(`center: x${x}, y${centre.y}, z${z}`);
        }
        player.sendMessage("半径 " + range + " の円を作成しました。")
    })
}

/**
 * Create filled circle
 * @param {server.Player} player 
 * @returns 
 */
function createFilledCircle(player) {
    if (!clipboard_block) {
        notBlockSelected(player)
        return false;
    }
    var unknownForm = new ui.ModalFormData()
    unknownForm.textField('半径', '半径をここに入力', '5');
    unknownForm.show(player).then(result => {
        let range = (result.formValues[0])
        // 半角数値チェック
        if (!range.match(/^[0-9]+$/)) {
            console.warn("半角数値ではありません");
            return false;
        }
        range = Number(range)
        let centre = { x: Math.floor(player.location.x) + 0.5, y: Math.floor(player.location.y), z: Math.floor(player.location.z) + 0.5 };

        for (let r = 0; r <= range; r++) {
            for (let i = 0; i < 360; i++) {
                let radian = 2 * Math.PI * (i / 360);
                let x = centre.x + Math.cos(radian) * r;
                let z = centre.z + Math.sin(radian) * r;
                let target = { x, y: centre.y, z };
                fill(target, target, clipboard_block);
                // player.sendMessage(`center: x${x}, y${centre.y}, z${z}`);
            }
        }
        player.sendMessage("半径 " + range + " の円を作成しました。")
    })
}


world.afterEvents.itemUse.subscribe(function (/** @type {{ itemStack: any; source: any; }} */ e) {
    let item = e.itemStack;
    // console.warn(item.typeId)
    /**
     * @type {server.Player}
     */
    let player = e.source
    if (item.typeId === "ecr:easy_creator") {

        const form1 = getBookForm();
        form1.show(player).then(result => {
            let selection = result.selection
            switch (selection) {
                case 0:
                    if (!clipboard_block) {
                        notBlockSelected(player)
                        return false;
                    }
                    let form4 = new ui.ActionFormData()
                    form4.title("埋め立てオプション")
                    form4.body(`地形を壊さないかどうか`)
                    form4.button(`地形を壊す`)
                    form4.button(`地形を保つ`)
                    form4.show(player).then(res => {
                        let selection2 = res.selection
                        switch (selection2) {
                            case 0:
                                player.addTag('selectRange')
                                player.runCommand('title @s actionbar 範囲の選択スタート')
                                break;
                            case 1:
                                player.addTag('selectRange_keep')
                                player.runCommand('title @s actionbar 範囲の選択スタート(土地保護)')
                                break;
                        }
                    })
                    break;
                case 1:
                    if (!clipboard_block) {
                        notBlockSelected(player)
                        return false;
                    }
                    player.addTag('placePole')
                    player.runCommand('title @s actionbar 柱を立てる場所の下のブロックを壊してください')
                    break;
                case 2:
                    if (!clipboard_block) {
                        notBlockSelected(player)
                        return false;
                    }
                    player.addTag('selectRange_wall')
                    player.runCommand('title @s actionbar 範囲の選択スタート')
                    break;
                case 3:
                    createEmptyCircle(player);
                    break;
                case 4:
                    createFilledCircle(player);
                    break;
                case 5:
                    player.addTag('copy')
                    player.runCommand('title @s actionbar コピーするブロックの範囲の選択スタート')
                    break;
                case 6:
                    player.addTag('paste')
                    player.runCommand('title @s actionbar コピーするブロックの範囲の選択スタート')
                    break;
                case 7:
                    rotate(player);
                    break;
                case 8:
                    let form7 = new ui.ActionFormData()
                    form7.title("設定")
                    form7.body(`ここでいろいろ設定ができます`)
                    form7.button(`使用するブロックの変更`)
                    form7.button(`使用するブロックを空気に変更`)
                    form7.button(`使用するブロックを水に変更`)
                    form7.button(`使用するブロックをライトブロックに変更`)
                    form7.button(`柱の高さを変更`)
                    form7.button(`砂を石に変換する速さを変更`)
                    form7.button(`砂から変換するブロックを変更`)
                    form7.show(player).then(res => {
                        let selection2 = res.selection
                        switch (selection2) {
                            case 0: {
                                player.addTag('selectBlock')
                                player.runCommand('title @s actionbar 使いたいブロックを壊してください')
                                break;
                            }
                            case 1: {
                                let blocks = server.BlockTypes;
                                clipboard_block = blocks.get('minecraft:air');
                                player.sendMessage("置き換えブロックに空気を設定しました");
                                break;
                            }
                            case 2: {
                                let blocks = server.BlockTypes;
                                clipboard_block = blocks.get('minecraft:water');
                                player.sendMessage("置き換えブロックに水を設定しました");
                                break;
                            }
                            case 3: {
                                let blocks = server.BlockTypes;
                                clipboard_block = blocks.get('minecraft:light_block_14');
                                player.sendMessage("置き換えブロックにライトブロック(明るさ14)を設定しました");
                                break;
                            }
                            case 4: {
                                let form2 = new ui.ModalFormData()
                                form2.slider('柱の高さ', 5, 30, 1, height);
                                form2.show(player).then(result => {
                                    height = (result.formValues[0])
                                    player.sendMessage("柱の高さを " + height + " に設定しました")
                                })
                                break;
                            }
                            case 5: {
                                let form2 = new ui.ModalFormData()
                                form2.slider('速さ(早くしすぎると重くなります)', 1, 100, 1, maxStackSize);
                                form2.show(player).then(result => {
                                    maxStackSize = (result.formValues[0])
                                    player.sendMessage("砂を石に変換する速さを " + maxStackSize + " に設定しました")
                                })
                                break;
                            }
                            case 6: {
                                let form6 = new ui.ActionFormData()
                                form6.title("コピーした地形を回転")
                                form6.body(`ここでいろいろ設定ができます`)
                                form6.button(`選択中のブロック`)
                                form6.button(`石`)
                                form6.button(`氷`)
                                form6.button(`雪`)
                                form6.button(`土`)
                                form6.button(`草ブロック`)
                                form6.button(`石と鉱石`)
                                form6.button(`チェスト内ブロックをランダム設置`)
                                form6.show(player).then(res => {
                                    if (res.selection <= 6) {
                                        replaceMode = [
                                            'selectedBlock',
                                            'stone',
                                            'ice',
                                            'snow',
                                            'dirt',
                                            'grass',
                                            'stoneAndOre',
                                        ][res.selection]
                                    } else {
                                        player.sendMessage("送信元のチェストを壊して選択してください")
                                        player.addTag('chestForStructure')
                                        replaceMode = 'chest'
                                    }
                                })
                                break;
                            }
                        }
                    })
                    break;
            }
        })
    }

    if (item.typeId === "ecr:fill") {
        if (!clipboard_block) {
            notBlockSelected(player)
            return false;
        }
        player.addTag('selectRange')
        player.runCommand('title @s actionbar 範囲の選択スタート')
    }

    if (item.typeId === "ecr:enclose") {
        if (!clipboard_block) {
            notBlockSelected(player)
            return false;
        }
        player.addTag('selectRange_wall')
        player.runCommand('title @s actionbar 範囲の選択スタート')
    }

    if (item.typeId === "ecr:spoit") {
        player.addTag('selectBlock')
        player.runCommand('title @s actionbar 使いたいブロックを壊してください')
    }


    if (item.typeId === "ecr:cancel") {
        let rm_tag_list = ['selectBlock', 'selectRange', 'selectRange_keep', 'selectRange_wall', 'placePole', 'copy', 'paste', 'chestForStructure']
        rm_tag_list.forEach(e => {
            if (player.hasTag(e)) {
                player.removeTag(e)
            }
        })
        player.runCommand('title @s actionbar キャンセルされました')
    }

    if (item.typeId === "ecr:pole") {
        if (!clipboard_block) {
            notBlockSelected(player)
            return false;
        }
        player.addTag('placePole')
        player.runCommand('title @s actionbar 柱を立てる場所の下のブロックを壊してください')
    }

    if (item.typeId === "ecr:copy") {
        player.addTag('copy')
        player.runCommand('title @s actionbar コピーするブロックの範囲の選択スタート\n§6[TIP]北（x座標が増えていく方向）に向かって使うと思ったように設置しやすいよ')
    }

    if (item.typeId === "ecr:paste") {
        player.addTag('paste')
        player.runCommand('title @s actionbar ペーストする場所を選んでね\n§6[TIP]北（x座標が増えていく方向）に向かって使うと思ったように設置しやすいよ')
    }

    if (item.typeId === "ecr:shovel") {
        if (player.isSneaking) {
            let form7 = new ui.ActionFormData()
            form7.title("設定")
            form7.body(`ここでいろいろ設定ができます`)
            form7.button(`砂を石に変換する速さを変更`)
            form7.button(`砂から変換するブロックを変更`)
            form7.show(player).then(res => {
                let selection2 = res.selection
                switch (selection2) {
                    case 0: {
                        let form2 = new ui.ModalFormData()
                        form2.slider('速さ(早くしすぎると重くなります)', 1, 100, 1, maxStackSize);
                        form2.show(player).then(result => {
                            maxStackSize = (result.formValues[0])
                            player.sendMessage("砂を石に変換する速さを " + maxStackSize + " に設定しました")
                        })
                        break;
                    }
                    case 1: {
                        let form6 = new ui.ActionFormData()
                        form6.title("地形生成のブロックを選択")
                        form6.body(`ここでいろいろ設定ができます`)
                        form6.button(`選択中のブロック`)
                        form6.button(`石`)
                        form6.button(`氷`)
                        form6.button(`雪`)
                        form6.button(`土`)
                        form6.button(`草ブロック`)
                        form6.button(`石と鉱石`)
                        form6.button(`チェスト内ブロックをランダム設置`)
                        form6.show(player).then(res => {
                            if (res.selection <= 6) {
                                replaceMode = [
                                    'selectedBlock',
                                    'stone',
                                    'ice',
                                    'snow',
                                    'dirt',
                                    'grass',
                                    'stoneAndOre',
                                ][res.selection]
                            } else {
                                player.sendMessage("送信元のチェストを壊して選択してください")
                                player.addTag('chestForStructure')
                                replaceMode = 'chest'
                            }
                        })
                        break;
                    }
                }
            })
        } else {
            player.runCommand('fill ^-3^^5 ^3^3^7 sand')
        }
    }

    if (item.typeId === "ecr:rotate") {
        rotate(player)
    }

    // if (item.typeId === "minecraft:grass") {
    //     let modal = new ui.ActionFormData()
    //     modal.title("アイテム表示")
    //     modal.body({
    //         "translate": "tile.glass.name"
    //     })
    //     modal.button("OK")
    //     modal.show(player)
    // }

    if (item.typeId === "ecr:circle_empty") {
        createEmptyCircle(player);
    }

    if (item.typeId === "ecr:circle_filled") {
        createFilledCircle(player);
    }

    if (item.typeId === "ecr:naname") {
        if (!clipboard_block) {
            notBlockSelected(player)
            return false;
        }
        player.addTag('naname')
        player.runCommand('title @s actionbar 斜め建築モードを有効にしました')
    }

})

let palette_list = [];

world.beforeEvents.playerBreakBlock.subscribe(e => {
    const { block, player } = e
    let items = [];
    let InventoryComponent = block.getComponent('inventory')
    if (block.typeId === 'minecraft:chest') {
        let empty_count = 0;
        if (palette_list.includes(JSON.stringify(block.location))) {
            e.cancel = true;
            player.sendMessage('§6チェストの一行目をホットバーにコピーしました。')

            for (let i = 0; i < 8; i++) {
                const item = InventoryComponent.container.getItem(i)
                items.push(item)
                if (!item) {
                    empty_count++
                }
            }
            if (empty_count === 8) {
                player.sendMessage('§4§lチェストの1行目にブロックを一つ以上配置してください。')
            } else {
                setTimeout(() => {
                    for (let i = 0; i < 8; i++) {
                        player.getComponent('inventory').container.setItem(i, items[i])
                    }
                    const paletteItem = server.ItemTypes.get('ecr:palette');
                    const paletteItemStack = new server.ItemStack(paletteItem, 1);
                    player.getComponent('inventory').container.setItem(8, paletteItemStack);
                }, 15)
            }
        }

        if (player.hasTag('chestForStructure')) {
            e.cancel = true;
            chestLocation = block.location
            player.sendMessage('送信元に設定しました')
            setTimeout(() => {
                player.removeTag('chestForStructure')
            }, 100)
        }
    }

    const eq = player.getComponent("equippable");
    let item = eq.getEquipment(server.EquipmentSlot.Mainhand)
    if (item) {
        if (item.typeId === 'ecr:shovel') {
            e.cancel = true;
            if (replaceMode === null) {
                player.sendMessage("§6まだどのブロックに変換するのか指定されていません。\nしゃがみながら右クリックしてから手順に従って設定してください。")
            } else {
                blockWaitList = [];
                nn = 0;
                decay(block.location)
            }
        }
    }



})

let cool_time = false;
world.beforeEvents.playerInteractWithBlock.subscribe(e => {
    if (cool_time) return;
    cool_time = true
    setTimeout(() => {
        cool_time = false
    }, 10)
    console.error('useon')
    const { itemStack, block, player } = e
    if (itemStack.typeId === "ecr:palette") {
        e.cancel = true;
        if (block.typeId === 'minecraft:chest') {
            if (palette_list.includes(JSON.stringify(block.location))) {
                //すでに登録済みー＞解除
                let form6 = new ui.ActionFormData()
                form6.title("§6§lブロックパレット || 解除")
                form6.body("ブロックパレットにの登録を解除しますか？\n\n")
                form6.button(`§4§l登録解除`)
                form6.button(`やめておく`)
                setTimeout(() => {
                    form6.show(player).then(res => {
                        let selection2 = res.selection
                        switch (selection2) {
                            case 0: {
                                let index = palette_list.indexOf(JSON.stringify(block.location));
                                palette_list.splice(index, 1)
                                player.sendMessage('§6ブロックパレットの登録を解除しました。')
                                break;
                            }
                            case 1: {
                                player.sendMessage('ブロックパレットからの登録解除をキャンセルしました。')
                                break;
                            }
                        }
                    })
                }, 5)
            } else {
                //未登録ー＞登録
                let form6 = new ui.ActionFormData()
                form6.title("§6§lブロックパレット || 登録")
                form6.body("ブロックパレットに登録すると、ワールドを出るまでの間、\nチェストを壊したときに自分のインベントリに追加されるようになります。\n\n")
                form6.button(`ブロックパレットに登録する`)
                form6.button(`やめておく`)
                setTimeout(() => {
                    form6.show(player).then(res => {
                        let selection2 = res.selection
                        switch (selection2) {
                            case 0: {
                                palette_list.push(JSON.stringify(block.location))
                                player.sendMessage('§6ブロックパレットへの登録が完了しました。')
                                break;
                            }
                            case 1: {
                                player.sendMessage('ブロックパレットへの登録をキャンセルしました。')
                                break;
                            }
                        }
                    })
                }, 5)
            }
        } else {
            let form6 = new ui.ActionFormData()
            form6.title("§6§lブロックパレット || 登録したチェスト一覧")
            if (palette_list.length > 0) {
                form6.body("登録したチェストにテレポートできるよ\n\n")
                palette_list.forEach((location, n) => {
                    form6.button(`[${n + 1}つめのチェスト] ${location}`)
                })
                setTimeout(() => {
                    form6.show(player).then(res => {
                        let selection2 = res.selection
                        let targetLocation = palette_list[selection2]
                        player.teleport(JSON.parse(targetLocation))
                    })
                }, 5)
            } else {
                form6.body("まだチェストが登録されていません。チェストをこの杖で右クリックしてブロックパレットに登録しよう！\n\n")
                form6.button('閉じる')
                setTimeout(() => {
                    form6.show(player)
                }, 5)
            }
        }
    }
})

function rotate(player) {
    let form6 = new ui.ActionFormData()
    form6.title("コピーした地形を回転")
    form6.body(`ここでいろいろ設定ができます`)
    form6.button(`最初の向きから 90 度回転する`)
    form6.button(`最初の向きから 180 度回転する`)
    form6.button(`最初の向きから 270 度回転する`)
    form6.button(`最初の向きに戻す`)
    form6.show(player).then(res => {
        let selection2 = res.selection
        switch (selection2) {
            case 0: {
                rotate_str = '90_degrees';
                player.sendMessage("最初の向きから90度回転しました")
                break;
            }
            case 1: {
                rotate_str = '180_degrees';
                player.sendMessage("最初の向きから180度回転しました")
                break;
            }
            case 2: {
                rotate_str = '270_degrees';
                player.sendMessage("最初の向きから270度回転しました")
                break;
            }
            case 3: {
                rotate_str = '';
                player.sendMessage("最初の向きにもどしました")
                break;
            }
        }
    })
}

function fill(start, end, block) {
    let dimension = world.getDimension('overworld');
    dimension.fillBlocks(new server.BlockVolume(start, end), block)
}

let placeWaitingList = [];
// setInterval(() => {
//     let {x, y, z, block} = placeWaitingList;
//     fill(x, y, z, block)
// }, 100);