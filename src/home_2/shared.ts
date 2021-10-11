import { ECommandType, ESystemCommandType, ICommand } from "./models";

type handleFuncType = (command: ICommand) => any;

export abstract class BaseWorkerModel {
  protected allCommands: ICommand[] = [];
  private isEvolveCommand = false;

  private handleDictionary: Record<ECommandType, handleFuncType> = {
    [ECommandType.code]: this.handleCodeCommand.bind(this),
    [ECommandType.error]: this.handleErrorCommand.bind(this),
    [ECommandType.system]: this.handleSystemCommand.bind(this),
    [ECommandType.info]: this.handleInfoCommand.bind(this),
  };

  constructor() {}

  registerCommand(command: ICommand) {
    this.allCommands.push(command);
    this.evolveCommand();
  }

  private evolveCommand() {
    if (this.isEvolveCommand) {
      return;
    }
    const command = this.allCommands.shift();
    this.isEvolveCommand = !!command;
    this.handleDictionary[command.type](command);
    this.isEvolveCommand = false;
    this.evolveCommand();
  } 

  protected abstract handleInfoCommand(command: ICommand<string>): any;
  protected abstract handleErrorCommand(command: ICommand<string>): any;
  protected abstract handleSystemCommand(
    command: ICommand<ESystemCommandType>
  ): any;
  protected abstract handleCodeCommand(command: ICommand<string>): any;
}
