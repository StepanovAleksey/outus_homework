import { IDirectionAdapter } from "../home_1/direction";
import { ICommand, IVector } from "../home_1/models";
import { VelocityAdapter } from "../home_1/velocity";

/**
 * @todo не у верен что правильно понял как менять вектор скорости, написал пока так
 */
export class ChangeVelocityComamnd implements ICommand {
  constructor(
    private directionAdapter: IDirectionAdapter,
    private velocityAdapter: VelocityAdapter
  ) {}
  execute(): void {
    const direction = this.directionAdapter.getValue();
    const velocity = this.velocityAdapter.getValue();
    const newVelocity: IVector = {
      x: direction.x + velocity.x,
      y: direction.y + velocity.y,
    };
    this.velocityAdapter.setValue(newVelocity);
  }
}
