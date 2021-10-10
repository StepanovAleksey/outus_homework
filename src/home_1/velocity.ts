import { Adapter, ICommand, IVector } from "./shared";

export interface IVelocityAdapter {
  getVelocity(): IVector;
  setVelocity(newVelocity: IVector): IVelocityAdapter;
}

export class VelocityAdapter extends Adapter implements IVelocityAdapter {
  constructor(obj: UObject) {
    super(obj, "velocity");
  }
  getVelocity(): IVector {
    const velocity = this.obj[this.fieldKey];
    if (velocity === undefined || velocity === null) {
      throw "velocity not found";
    }
    return this.obj[this.fieldKey];
  }
  setVelocity(newValue: IVector): VelocityAdapter {
    this.obj[this.fieldKey] = newValue;
    return this;
  }
}
