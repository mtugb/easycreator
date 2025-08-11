import { BlockTypes } from "@minecraft/server";
import { cencelCircleOverClockCreating } from "./circles";
export const PREFIX = '.';
export let ecrCommands = {
    'test': {
        onSend(player) {
        }
    },
    'cancel': {
        onSend(player) {
            cencelCircleOverClockCreating();
        }
    },
    'test2': {
        onSend(player) {
            BlockTypes.getAll().forEach(e => {
                console.log(e.id);
            });
        }
    }
};
