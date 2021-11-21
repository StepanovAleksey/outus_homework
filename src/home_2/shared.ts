import {
  ECommandType,
  ESystemCommandType,
  ICommand,
  SystemCommand,
} from "./models";

type handleFuncType = (command: ICommand) => any;

export abstract class BaseWorkerModel {
  allCommands: ICommand[] = [];
  protected isEvolveCommand = false;

  private handleDictionary: Record<ECommandType, handleFuncType> = {
    [ECommandType.code]: this.handleCodeCommand.bind(this),
    [ECommandType.error]: this.handleErrorCommand.bind(this),
    [ECommandType.system]: this.handleSystemCommand.bind(this),
    [ECommandType.info]: this.handleInfoCommand.bind(this),
  };

  constructor() {}

  public registerCommand(command: ICommand) {
    this.allCommands.push(command);
    this.evolveCommand();
  }
  protected evolveCommand() {
    if (this.isEvolveCommand) {
      return;
    }
    try {
      const command = this.allCommands.shift();
      this.isEvolveCommand = !!command;
      if (!this.isEvolveCommand) {
        return;
      }
      this.handleDictionary[command.type](command);
      this.isEvolveCommand = false;
      this.parentCmpleteCommandMessage(command.uid);

      this.evolveCommand();
    } catch (error) {
      throw error;
    } finally {
      this.isEvolveCommand = false;
    }
  }

  protected parentCmpleteCommandMessage(commandUId: string) {
    this.sendParentCommand(
      new SystemCommand(ESystemCommandType.commandComplete, commandUId)
    );
  }

  protected abstract sendParentCommand(command: ICommand);

  protected abstract handleInfoCommand(command: ICommand<string>): any;
  protected abstract handleErrorCommand(command: ICommand<string>): any;
  protected abstract handleSystemCommand(
    command: ICommand<ESystemCommandType>
  ): any;
  protected abstract handleCodeCommand(command: ICommand<string>): any;
}
