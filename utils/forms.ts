import { BlockTypes, ItemStack, ItemTypes, Player } from '@minecraft/server';
import { EcrForm } from './types';
import { playerEcrDataManager } from './playerDatabase';
import { ActionFormResponse, ModalFormResponse } from '@minecraft/server-ui';
import { REPLACE_MODES } from './terrainCreator';
import { structureManager } from './structures';

export const ecrForms: Record<string, EcrForm> = {
    terrain_options: {
        id: 'terrain_options',
        type: 'action',
        title: '埋め立てオプション',
        body: '地形を壊さないかどうか\n現在の選択: §2地形を壊す',
        buttons: ['地形を壊す', '地形を保つ'],
        onSubmit: (player: Player, result: any) => {
            const buttonIndex = result.selection;
            if (buttonIndex === 0) {
                player.sendMessage('地形を壊すモードが選択されました');
                ecrForms.terrain_options.body = '地形を壊さないかどうか\n現在の選択: §2地形を壊す';
                playerEcrDataManager.setValue('fillMode', 'break', player)
            } else if (buttonIndex === 1) {
                player.sendMessage('地形を保つモードが選択されました');
                ecrForms.terrain_options.body = '地形を壊さないかどうか\n現在の選択: §2地形を保つ';
                playerEcrDataManager.setValue('fillMode', 'keep', player)
            }
        }
    },
    pillar_height: {
        id: 'pillar_height',
        type: 'modal',
        title: '柱の設定',
        controls: [
            {
                type: 'slider',
                label: '柱の高さ',
                min: 2,
                max: 30,
                step: 1,
                defaultValue: 10
            } as EcrForm.Control
        ],
        onSubmit: (player: Player, result: any) => {
            const height = result.formValues[0];
            playerEcrDataManager.setValue('height', height, player);
            player.sendMessage(`柱の高さを ${height} に設定しました`);
        }
    },
    replace_mode: {
        id: 'replace_mode',
        type: 'modal',
        title: '地形生成の変換設定',
        controls: [
            {
                type: 'dropdown',
                label: '変換先',
                options: [...REPLACE_MODES],
                defaultValue: '@currentReplaceMode'
            }
        ],
        onSubmit(player: Player, result: ModalFormResponse) {
            if (result.canceled) {
                return;
            }
            if (result.formValues && typeof result.formValues[0] === 'number')
                playerEcrDataManager.setValue('replaceMode', result.formValues[0], player);
        },
    },
    // copy_history: {
    //     id: 'copy_history',

    // }
    stack_copy_paste: {
        id: 'stack_copy_paste',
        type: 'modal',
        title: '',
        controls: [
            {
                type: 'dropdown',
                label: '読み込む',
                options: '@func',
                getOption: structureManager.getFormOptions,
                defaultValue: '@copySavedIndex'
            },
            {
                type: 'slider',
                label: '回転',
                min: 0,
                max: 3,
                step: 1,
                defaultValue: 0
            }
        ],
        onSubmit(player: Player, result: ModalFormResponse) {
            let selectedIndex = result.formValues?.[0];
            if (result.canceled) {
                return;
            }
        },
    },
    stack_copy_save: {
        id: 'stack_copy_save',
        type: 'modal',
        title: '',
        controls: [
            {
                type: 'textField',
                label: '保存先',
                defaultValue: '空欄でもOK'
            }
        ],
        onSubmit(player: Player, result: ModalFormResponse) {

        },
    },
    circle_create: {
        id: 'circle_create',
        type: 'modal',
        title: '',
        controls: [
            {
                type: 'textField',
                label: '半径',
                defaultValue: '半角数字でここに入力'
            }
        ],
        onSubmit(player: Player, result: ModalFormResponse) {
            //こっちでは何もしない。
        },
    },
    circle_empty_setting: {
        id: 'circle_empty_setting',
        type: 'modal',
        title: '中身からっぽの円の生成設定',
        controls: [
            {
                type: 'toggle',
                label: 'オーバークロックモード(オンにすると半径が無制限になります)',
                defaultValue: false
            }
        ],
        onSubmit(player: Player, result: ModalFormResponse) {
            //こっちでは何もしない。
            if (this.controls?.[0] && result.formValues && typeof result.formValues[0] === 'boolean') {
                this.controls[0].defaultValue = result.formValues[0];
                console.log(result.formValues[0])
                playerEcrDataManager.setValue('circleEmptyOverClock', result.formValues[0], player);
            } else {
                player.sendMessage('エラー');
            }
        },
    },
    clipboard_specials: {
        id: 'clipboard_specials',
        type: 'action',
        title: '特殊なブロックの選択',
        body: '破壊できないブロックや手に入れにくいブロックなど。要望あればDiscordで言ってくれたら追加します。',
        buttons: ['空気', '水', '溶岩', 'バリアブロック', 'ストラクチャーボイドブロック', 'ライトブロック明るさ15'],
        onSubmit: (player: Player, result: ActionFormResponse) => {
            if (result.canceled) {
                player.sendMessage('キャンセルされました');
                return;
            }
            const blockIds = ['minecraft:air', 'minecraft:water', 'minecraft:lava', 'minecraft:barrier', 'minecraft:structure_void', 'minecraft:light_block_15'];
            const buttonIndex = result.selection;
            if (buttonIndex === undefined) {
                player.sendMessage('ボタンインデックスがありません');
                return;
            }
            let targetBlock = BlockTypes.get(blockIds[buttonIndex]);
            if (targetBlock) {
                playerEcrDataManager.setValue('clipboard_block', targetBlock, player);
            } else {
                player.sendMessage('ブロック取得エラー');
            }
        }
    },
    ecr_book: {
        id: 'ecr_book',
        type: 'action',
        title: 'イージークリエイターの本',
        body: 'ここから操作に必要なツールを入手できます。',
        buttons: [
            'ブロックで埋める',
            '柱を生成',
            '壁で範囲を囲む',
            '円を生成',
            '中が埋まった円を生成',
            '建物をコピー',
            '建物をペースト',
            '地形生成ツール',
            '設定-ブロックを選択'
        ],
        onSubmit: (player: Player, result: ActionFormResponse) => {
            if (result.canceled) {
                player.sendMessage('キャンセルされました');
                return;
            }
            const itemIds = [
                'ecr:fill',
                'ecr:pole',
                'ecr:enclose',
                'ecr:circle_empty',
                'ecr:circle_filled',
                'ecr:copy',
                'ecr:paste',
                'ecr:shovel',
                'ecr:spoit',
            ];
            const buttonIndex = result.selection;
            if (buttonIndex === undefined) {
                player.sendMessage('ボタンインデックスがありません');
                return;
            }
            let targetItem = ItemTypes.get(itemIds[buttonIndex]);
            if (targetItem) {
                let targetItemStack = new ItemStack(targetItem, 1);
                player.getComponent('inventory')?.container.setItem(player.selectedSlotIndex, targetItemStack);
            }
        }
    },
    ukijima: {
        id: 'ukijima',
        type: 'modal',
        title: '浮島メーカー',
        body: '現在の座標を地面の高さとして浮島をつくります。',
        controls: [
            {
                type: 'textField',
                label: '地上の半径',
                defaultValue: '半角数字でここに入力'
            }
        ],
        onSubmit(player: Player, result: ModalFormResponse) {
            //こっちでは何もしない。
        },
    }
};