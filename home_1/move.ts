import { Adapter, ICommand, IVector } from "./shared";
import { VelocityAdapter } from "./velocity";

export interface IMovableAdapter {
  getPosition(): IVector;
  setPosition(newValue: IVector): IMovableAdapter;
}

export class MovableAdapter extends Adapter implements IMovableAdapter {
  constructor(obj: UObject) {
    super(obj, "position");
  }

  public getPosition(): IVector {
    const position: IVector = this.obj[this.fieldKey];
    if (position === undefined || position === null) {
      throw "position not found";
    }
    return position;
  }

  public setPosition(newValue: IVector): MovableAdapter {
    this.obj[this.fieldKey] = newValue;
    return this;
  }
}
export class MoveCommand implements ICommand {
  constructor(
    private moveAdapter: MovableAdapter,
    private velocityAdapter: VelocityAdapter
  ) {}
  execute(): void {
    const currentPosition = this.moveAdapter.getPosition();
    const currentVelocity = this.velocityAdapter.getVelocity();
    this.moveAdapter.setPosition({
      x: currentPosition.x + currentVelocity.x,
      y: currentPosition.y + currentVelocity.y,
    });
  }
}
