import { ICommand } from "./models";
import { IMovableAdapter } from "./move";
import { IVelocityAdapter } from "./velocity";

export class MoveCommand implements ICommand {
  constructor(
    private moveAdapter: IMovableAdapter,
    private velocityAdapter: IVelocityAdapter
  ) {}
  execute(): void {
    const currentPosition = this.moveAdapter.getValue();
    const currentVelocity = this.velocityAdapter.getValue();
    this.moveAdapter.setValue({
      x: currentPosition.x + currentVelocity.x,
      y: currentPosition.y + currentVelocity.y,
    });
  }
}
