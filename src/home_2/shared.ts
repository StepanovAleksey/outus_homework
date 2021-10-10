import {
  ECommandType,
  ESystemCommandType,
  ICommand,
  typeCommand,
} from "./models";

type handleFuncType = (command: ICommand) => any;

export abstract class BaseWorkerModel {
  protected allCommands: ICommand[] = [];

  private handleDictionary: Record<ECommandType, handleFuncType> = {
    [ECommandType.code]: this.handleCodeCommand.bind(this),
    [ECommandType.error]: this.handleErrorCommand.bind(this),
    [ECommandType.system]: this._handleSysytemCommand.bind(this),
    [ECommandType.info]: this.handleInfoCommand.bind(this),
  };

  constructor() {}

  registerCommand(command: ICommand) {
    this.allCommands.push(command);
    this.handleDictionary[command.type](command);
  }

  protected abstract handleInfoCommand(command: ICommand<string>): any;
  protected abstract handleErrorCommand(command: ICommand<string>): any;
  protected abstract handleSystemCommand(
    command: ICommand<ESystemCommandType>
  ): any;
  protected abstract handleCodeCommand(command: ICommand<string>): any;
  private _handleSysytemCommand(command: ICommand<typeCommand>) {
    this.handleSystemCommand(command as ICommand<ESystemCommandType>);
  }
}
