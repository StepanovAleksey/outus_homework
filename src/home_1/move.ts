import { CheckedAdapter, IAdapter, IVector } from "./models";

export interface IMovableAdapter extends IAdapter<IVector> {}

export class MovableAdapter
  extends CheckedAdapter<IVector>
  implements IMovableAdapter
{
  constructor(obj: object) {
    super(obj, "position");
  }
}
