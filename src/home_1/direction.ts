import { BaseAdapter, IAdapter, IVector } from "./models";

export interface IDirectionAdapter extends IAdapter<IVector> {
  rotateDirection?: IVector;
}

export class DirectionAdapter
  extends BaseAdapter<IVector>
  implements IDirectionAdapter
{
  constructor(obj: object, public rotateDirection?: IVector) {
    super(obj, "direction");
  }
}
