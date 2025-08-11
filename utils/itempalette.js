export class ChestLocation {
    constructor(target, dimension) {
        this.target = target;
        this.dimension = dimension;
    }
    equals(other) {
        return this.target.x === other.target.x &&
            this.target.y === other.target.y &&
            this.target.z === other.target.z &&
            this.dimension.id === other.dimension.id;
    }
}
