import { BlockType, BlockTypes, Player } from "@minecraft/server";
import { cencelCircleOverClockCreating } from "./circles";
import { playerEcrDataManager } from "./playerDatabase";

export const PREFIX = '.';
interface EcrCommand {
    onSend(player: Player): void
}
export let ecrCommands: Record<string, EcrCommand> = {
    'test': {
        onSend(player: Player) {
            
        }
    },
    'cancel': {
        onSend(player: Player) {
            cencelCircleOverClockCreating();
        }
    },
    'test2': {
        onSend(player) {
            BlockTypes.getAll().forEach(e=>{
                console.log(e.id)
            })
        }
    }
}