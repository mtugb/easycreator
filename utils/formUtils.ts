import { Player } from '@minecraft/server';
import { ActionFormData, ActionFormResponse, ModalFormData, ModalFormResponse } from '@minecraft/server-ui';
import { EcrForm } from './types';
import { ecrForms } from './forms';
import { playerEcrDataManager } from './playerDatabase';

interface OnSubmitFuncType {
    (player: Player, result: ModalFormResponse | ActionFormResponse): void
}

export function showForm(player: Player, formId: string, onSubmit?: OnSubmitFuncType): void {
    const ecrForm = ecrForms[formId];
    if (!ecrForm) {
        player.sendMessage(`フォーム "${formId}" が見つかりません`);
        return;
    }

    if (ecrForm.type === 'action') {
        showActionForm(player, ecrForm, onSubmit);
    } else if (ecrForm.type === 'modal') {
        showModalForm(player, ecrForm, onSubmit);
    }
}

function showActionForm(player: Player, ecrForm: EcrForm, onSubmit?: OnSubmitFuncType): void {
    let form = new ActionFormData();
    form.title(ecrForm.title);
    if (ecrForm.body) form.body(ecrForm.body);

    ecrForm.buttons?.forEach(buttonText => {
        form.button(buttonText);
    });

    form.show(player).then(res => {
        if (res.canceled) return;
        ecrForm.onSubmit(player, res);
        onSubmit?.(player, res);
    });
}


function showModalForm(player: Player, ecrForm: EcrForm, onSubmit?: OnSubmitFuncType): void {
    let form = new ModalFormData();
    form.title(ecrForm.title);

    ecrForm.controls?.forEach(control => {
        switch (control.type) {
            case 'slider':
                form.slider(control.label, control.min || 0, control.max || 100, {
                    valueStep: control.step || 1,
                    defaultValue: control.defaultValue || 0
                });
                break;
            case 'textField':
                form.textField(control.label, control.defaultValue || '');
                break;
            case 'toggle':
                form.toggle(control.label, { defaultValue: control.defaultValue || false });
                break;
            case 'dropdown':
                let formOptions: string[];
                if (control.options === '@func') {
                    formOptions = control.getOption?.() ?? [];
                } else {
                    formOptions = control.options ?? [];
                }
                if (typeof control.defaultValue === 'string') {
                    if (control.defaultValue.startsWith('@')) {
                        let uniqueValue: Record<string, any> = {
                            '@currentReplaceMode': playerEcrDataManager.getValue('replaceMode', player),
                            '@copySavedIndex': playerEcrDataManager.getValue('copySavedIndex', player) || 0
                        }
                        form.dropdown(control.label, formOptions.length > 0 ? formOptions : ['まだ登録されていません\nコピーアイテムでコピーしてみよう'], { defaultValueIndex: uniqueValue[control.defaultValue] || 0 });
                        break;
                    }
                }

                form.dropdown(control.label, formOptions || ['エラー：表示できません'], { defaultValueIndex: control.defaultValue || 0 });
                break;
        }
    });

    form.show(player).then(res => {
        if (res.canceled) return;
        ecrForm.onSubmit(player, res);
        onSubmit?.(player, res);
    });
}