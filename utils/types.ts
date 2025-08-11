import { BlockType, Dimension, ItemStartUseOnAfterEvent, ItemUseAfterEvent, ItemUseOnEvent, Player, PlayerBreakBlockAfterEvent, PlayerBreakBlockBeforeEvent, PlayerInteractWithBlockAfterEvent, PlayerInteractWithBlockBeforeEvent, Vector3 } from '@minecraft/server';

export interface EcrItem {
    name: string,
    onUse_with_sneak?: (e: ItemUseAfterEvent) => void,
    onUse_without_sneak?: (e: ItemUseAfterEvent) => void,
    playerInteractWithBlock_before?: (e:PlayerInteractWithBlockBeforeEvent) => void,
    playerInteractWithBlock_after?: (e:PlayerInteractWithBlockAfterEvent) => void,
    onBreakBlock_after?: (e: PlayerBreakBlockAfterEvent) => void,
    onBreakBlock_before?: (e:PlayerBreakBlockBeforeEvent) => void,
}

export interface EcrForm {
    id: string,
    type: 'action' | 'modal',
    title: string,
    body?: string,
    buttons?: string[],
    controls?: EcrForm.Control[],
    onSubmit: (player: Player, result: any) => void
}

export namespace EcrForm {
    export interface Control {
        type: 'slider' | 'textField' | 'toggle' | 'dropdown',
        label: string,
        min?: number,
        max?: number,
        step?: number,
        defaultValue?: any,
        options?: string[] | '@func',
        getOption?: () => string[];
    }
}

export interface itempaletteChestLocation {
    target: Vector3,
    dimension: Dimension
}