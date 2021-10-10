import { Adapter, ICommand } from "./shared";

export enum EDirection {
  left = "left",
  up = "up",
  right = "right",
  down = "down",
}
export enum ERotate {
  left = "left",
  right = "right",
}

abstract class RotateWorker<T extends ERotate> {
  constructor(protected directionCommand: T) {}
  abstract getNewDirection(currentDirection: EDirection): EDirection;
  itsRotate(directionCommand: ERotate) {
    return this.directionCommand === directionCommand;
  }
}

class LeftRotateWorker extends RotateWorker<ERotate.left> {
  constructor() {
    super(ERotate.left);
  }
  getNewDirection(currentDirection: EDirection): EDirection {
    switch (currentDirection) {
      case EDirection.left:
        return EDirection.down;
      case EDirection.up:
        return EDirection.left;
      case EDirection.right:
        return EDirection.up;
      case EDirection.down:
        return EDirection.right;
    }
  }
}

class RightRotateWorker extends RotateWorker<ERotate.right> {
  constructor() {
    super(ERotate.right);
  }
  getNewDirection(currentDirection: EDirection): EDirection {
    switch (currentDirection) {
      case EDirection.left:
        return EDirection.up;
      case EDirection.up:
        return EDirection.right;
      case EDirection.right:
        return EDirection.down;
      case EDirection.down:
        return EDirection.left;
    }
  }
}
const rotateWorker = [new LeftRotateWorker(), new RightRotateWorker()];

export interface IRotable {
  getDirection(): EDirection;
  changeDirection(newDirection: EDirection);
  setDirection(newDirection: EDirection);
}

export class RotateAdapter extends Adapter implements IRotable {
  constructor(obj: UObject, private rotate?: ERotate) {
    super(obj, "direction");
  }
  setDirection(newDirection: EDirection) {
    this.obj[this.fieldKey] = newDirection;
    return this;
  }
  getDirection(): EDirection {
    const direction: EDirection = this.obj[this.fieldKey];
    if (direction === undefined || direction === null) {
      throw "direction not found";
    }
    return direction;
  }
  changeDirection() {
    let currentDirecion = this.getDirection();
    const currentRWorker = rotateWorker.find((dw) => dw.itsRotate(this.rotate));
    if (!currentRWorker) {
      throw `rotate worker not found. rotate is ${this.rotate}`;
    }
    currentDirecion = currentRWorker.getNewDirection(currentDirecion);
    this.setDirection(currentDirecion);
  }
}

export class RotateCommand implements ICommand {
  constructor(private directionAdapter: RotateAdapter) {}
  execute(): void {
    this.directionAdapter.changeDirection();
  }
}
