import { world } from "@minecraft/server";
import { playerEcrDataManager } from "./playerDatabase";

interface CopiedStructure {
    id: string,
    name: string
}

export let structureManager = {
    structures: [] as CopiedStructure[],
    subscribe(name: string): string {
        let id = this.createRandomId();
        this.structures.push({
            id, name
        });
        console.log(this.structures);
        return id;
    },
    unSubscribe(): boolean {
        return false;
    },
    createRandomId(): string {
        return Math.random().toString(32).substring(2)
    },
    getFormOptions():string[] {
        console.log(structureManager.structures);
        return Array.from(structureManager.structures).map(({id, name})=>{
            return `§2${name}§7 (${id})§r`;
        })
    }
}