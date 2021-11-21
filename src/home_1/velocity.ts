import { CheckedAdapter, IAdapter, IVector } from "./models";

export interface IVelocityAdapter extends IAdapter<IVector> {}

export class VelocityAdapter
  extends CheckedAdapter<IVector>
  implements IVelocityAdapter
{
  constructor(obj: object) {
    super(obj, "velocity");
  }
}
