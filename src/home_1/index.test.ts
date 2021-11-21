import { DirectionAdapter } from "./direction";
import { MovableAdapter } from "./move";
import { MoveCommand } from "./move.command";
import { RotateCommand } from "./rotate.command";
import { VelocityAdapter } from "./velocity";

test("object (12, 5) add (-7, 3) is equal (5, 8) ", () => {
  const tank = {};
  new MoveCommand(
    new MovableAdapter(tank).setValue({ x: 12, y: 5 }),
    new VelocityAdapter(tank).setValue({ x: -7, y: 3 })
  ).execute();

  expect(new MovableAdapter(tank).getValue()).toEqual({ x: 5, y: 8 });
});

test("try move not position object ", () => {
  const tank = {};
  expect(() => {
    new MoveCommand(
      new MovableAdapter(tank),
      new VelocityAdapter(tank).setValue({ x: -7, y: 3 })
    ).execute();
  }).toThrow("position not found");
});

test("try move not velocity object ", () => {
  const tank = {};
  expect(() => {
    new MoveCommand(
      new MovableAdapter(tank).setValue({ x: 12, y: 5 }),
      new VelocityAdapter(tank)
    ).execute();
  }).toThrow("velocity not found");
});

test("cahnge direction", () => {
  const tank = {};
  new DirectionAdapter(tank).setValue({ x: 1, y: 0 });

  new RotateCommand(new DirectionAdapter(tank, { x: 0, y: 1 })).execute();
  expect(new DirectionAdapter(tank).getValue()).toEqual({ x: 1, y: 1 });

  new RotateCommand(new DirectionAdapter(tank, { x: -1, y: 1 })).execute();
  expect(new DirectionAdapter(tank).getValue()).toEqual({ x: 0, y: 2 });

  new RotateCommand(new DirectionAdapter(tank, { x: 0, y: -1 })).execute();
  expect(new DirectionAdapter(tank).getValue()).toEqual({ x: 0, y: 1 });

  new RotateCommand(new DirectionAdapter(tank, { x: 1, y: 0 })).execute();
  expect(new DirectionAdapter(tank).getValue()).toEqual({ x: 1, y: 1 });
});
