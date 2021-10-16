import { BaseAdapter, IAdapter, ICommand } from "../home_1/models";

export interface IFuelAdapter extends IAdapter<number> {
  burnFuel?: number;
}

export class FuelAdapter extends BaseAdapter<number> implements IFuelAdapter {
  constructor(obj: object, public burnFuel?: number) {
    super(obj, "fuel");
  }
}

export class CheckFuelCommand implements ICommand {
  constructor(private fuelAdaptor: IFuelAdapter) {}
  execute(): void {
    if (
      !this.fuelAdaptor.getValue() ||
      this.fuelAdaptor.getValue() < this.fuelAdaptor.burnFuel
    ) {
      throw new Error("fuel is not enough");
    }
  }
}

export class BurnFuelCommand implements ICommand {
  constructor(private fuelAdaptor: IFuelAdapter) {}
  execute(): void {
    this.fuelAdaptor.setValue(
      this.fuelAdaptor.getValue() - this.fuelAdaptor.burnFuel
    );
  }
}
