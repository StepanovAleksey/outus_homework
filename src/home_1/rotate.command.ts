import { IDirectionAdapter } from "./direction";
import { ICommand, IVector } from "./models";

export class RotateCommand implements ICommand {
  constructor(private directionAdapter: IDirectionAdapter) {}
  execute(): void {
    const newDirection = this.getNewDirection();
    this.directionAdapter.setValue(newDirection);
  }
  private getDefaultDirection(): IVector {
    return {
      x: this.directionAdapter.rotateDirection?.x || 0,
      y: this.directionAdapter.rotateDirection?.y || 0,
    };
  }
  private getNewDirection(): IVector {
    const currentDirection = this.directionAdapter.getValue();
    const changeDirection = this.getDefaultDirection();
    return {
      x: currentDirection.x + changeDirection.x,
      y: currentDirection.y + changeDirection.y,
    };
  }
}
