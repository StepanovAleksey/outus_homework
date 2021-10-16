import { MovableAdapter } from "../home_1/move";
import { MoveCommand } from "../home_1/move.command";
import { VelocityAdapter } from "../home_1/velocity";
import { BurnFuelCommand, CheckFuelCommand, FuelAdapter } from "./fuel";
import { CommnadException, MacroCommand } from "./models";

test("CheckFuelComamnd test", () => {
  const tank = {};
  new FuelAdapter(tank).setValue(20);

  expect(
    new CheckFuelCommand(new FuelAdapter(tank, 10)).execute()
  ).toBeUndefined();

  expect(() => {
    new CheckFuelCommand(new FuelAdapter(tank, 30)).execute();
  }).toThrow(Error);
});

test("BurnFuelCommand test", () => {
  const tank = {};
  new FuelAdapter(tank).setValue(20);
  new BurnFuelCommand(new FuelAdapter(tank, 10)).execute();
  expect(new FuelAdapter(tank).getValue()).toEqual(10);
});

test("MacroCommand test", () => {
  const tank = {};
  const burnFuel = 15;
  const defaultFuel = 20;
  const fuelAdaper = new FuelAdapter(tank, burnFuel).setValue(defaultFuel);

  new MacroCommand([
    new CheckFuelCommand(fuelAdaper),
    new MoveCommand(
      new MovableAdapter(tank).setValue({ x: 12, y: 5 }),
      new VelocityAdapter(tank).setValue({ x: -7, y: 3 })
    ),
    new BurnFuelCommand(fuelAdaper),
  ]).execute();

  expect(new MovableAdapter(tank).getValue()).toEqual({ x: 5, y: 8 });
  expect(new FuelAdapter(tank).getValue()).toEqual(defaultFuel - burnFuel);

  expect(() => {
    new MacroCommand([
      new CheckFuelCommand(fuelAdaper),
      new MoveCommand(new MovableAdapter(tank), new VelocityAdapter(tank)),
      new BurnFuelCommand(fuelAdaper),
    ]).execute();
  }).toThrow(CommnadException);
});
