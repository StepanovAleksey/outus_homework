import { DirectionAdapter } from "../home_1/direction";
import { MovableAdapter } from "../home_1/move";
import { MoveCommand } from "../home_1/move.command";
import { RotateCommand } from "../home_1/rotate.command";
import { VelocityAdapter } from "../home_1/velocity";
import { BurnFuelCommand, CheckFuelCommand, FuelAdapter } from "./fuel";
import { CommnadException, MacroCommand } from "./models";
import { ChangeVelocityComamnd } from "./сhangeVelocity.command";

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

test("ChangeVelocityComamnd test", () => {
  const tank = {};
  const burnFuel = 15;
  const defaultFuel = 20;
  const fuelAdaper = new FuelAdapter(tank, burnFuel).setValue(defaultFuel);
  new MacroCommand([
    new CheckFuelCommand(fuelAdaper),
    new MoveCommand(
      new MovableAdapter(tank).setValue({ x: 0, y: 0 }),
      new VelocityAdapter(tank).setValue({ x: -2, y: -2 })
    ),
    new BurnFuelCommand(fuelAdaper),
    new RotateCommand(
      new DirectionAdapter(tank, { x: 1, y: 1 }).setValue({ x: 1, y: 1 })
    ),
    new ChangeVelocityComamnd(
      new DirectionAdapter(tank),
      new VelocityAdapter(tank)
    ),
  ]).execute();
  expect(new VelocityAdapter(tank).getValue()).toEqual({ x: 0, y: 0 });
});
