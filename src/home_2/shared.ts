import { ErrorCommand, ICommand, ICommandHandler } from "./models";

export abstract class BaseWorkerModel {
  allCommands: ICommand[] = [];
  protected isEvolveCommand = false;
  handlers: ICommandHandler[] = [];

  constructor() {}

  public registerCommand(command: ICommand) {
    this.allCommands.push(command);
    this.evolveCommand();
  }
  public evolveCommand() {
    const сommand = this.allCommands.shift();
    if (!сommand) {
      return;
    }
    this.handlers
      .filter((handler) => handler.isCommandType(сommand.type))
      .forEach((c) => {
        try {
          c.handle.bind(this)(сommand);
        } catch (ex) {
          this.allCommands.unshift(new ErrorCommand(ex as string));
        }
      });

    this.evolveCommand();
  }
}
