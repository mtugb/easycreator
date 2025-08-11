import { BlockPermutation, Dimension, Player, Vector3 } from "@minecraft/server";
import { playerEcrDataManager } from "./playerDatabase";

export class ChestLocation {
    constructor(public target: Vector3, public dimension: Dimension) { }

    equals(other: ChestLocation): boolean {
        return this.target.x === other.target.x &&
            this.target.y === other.target.y &&
            this.target.z === other.target.z &&
            this.dimension.id === other.dimension.id;
    }
}
