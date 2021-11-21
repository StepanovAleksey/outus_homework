import { MovableAdapter, MoveCommand } from "./move";
import { EDirection, RotateAdapter, RotateCommand, ERotate } from "./rotate";
import { ICommand } from "./shared";
import { VelocityAdapter } from "./velocity";

test("object (12, 5) add (-7, 3) is equal (5, 8) ", () => {
  const tank = {};
  new MoveCommand(
    new MovableAdapter(tank).setPosition({ x: 12, y: 5 }),
    new VelocityAdapter(tank).setVelocity({ x: -7, y: 3 })
  ).execute();

  expect(new MovableAdapter(tank).getPosition()).toEqual({ x: 5, y: 8 });
});

test("try move not position object ", () => {
  const tank = {};
  expect(() => {
    new MoveCommand(
      new MovableAdapter(tank),
      new VelocityAdapter(tank).setVelocity({ x: -7, y: 3 })
    ).execute();
  }).toThrow("position not found");
});

test("try move not velocity object ", () => {
  const tank = {};
  expect(() => {
    new MoveCommand(
      new MovableAdapter(tank).setPosition({ x: 12, y: 5 }),
      new VelocityAdapter(tank)
    ).execute();
  }).toThrow("velocity not found");
});

test("rotate 360 degree", () => {
  const tank = {};
  new RotateAdapter(tank).setDirection(EDirection.up);

  new RotateCommand(new RotateAdapter(tank, ERotate.right)).execute();
  expect(new RotateAdapter(tank).getDirection()).toEqual(EDirection.right);

  new RotateCommand(new RotateAdapter(tank, ERotate.right)).execute();
  expect(new RotateAdapter(tank).getDirection()).toEqual(EDirection.down);

  new RotateCommand(new RotateAdapter(tank, ERotate.right)).execute();
  expect(new RotateAdapter(tank).getDirection()).toEqual(EDirection.left);

  new RotateCommand(new RotateAdapter(tank, ERotate.right)).execute();
  expect(new RotateAdapter(tank).getDirection()).toEqual(EDirection.up);
});
