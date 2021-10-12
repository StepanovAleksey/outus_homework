import { parentPort } from "worker_threads";
import {
  ICommand,
  ESystemCommandType,
  ErrorCommand,
  SystemCommand,
} from "./models";
import { BaseWorkerModel } from "./shared";

class ChildWorkerModel extends BaseWorkerModel {
  isSoftStop = false;

  constructor() {
    super();
    this.sendParentCommand(new SystemCommand(ESystemCommandType.isStarted));
  }

  protected handleInfoCommand(command: ICommand<string>) {
    console.info("child process info:", command.payload);
  }

  protected handleErrorCommand(command: ICommand<string>) {
    console.error("child process error:", command);
  }

  protected handleSystemCommand(command: ICommand<ESystemCommandType>) {
    switch (command.payload) {
      case ESystemCommandType.softStop:
        this.isSoftStop = true;
        this.parentCmpleteCommandMessage(command.uid);
        process.exit(0);
    }
  }
  protected handleCodeCommand(command: ICommand<string>) {
    eval(command.payload);
  }
  protected sendParentCommand(command: ICommand) {
    parentPort.postMessage(command);
  }

  protected evolveCommand() {
    try {
      super.evolveCommand();
    } catch (error) {
      this.sendParentCommand(new ErrorCommand(error as string));
    }
  }

  registerCommand(command: ICommand) {
    if (this.isSoftStop) {
      return;
    }
    super.registerCommand(command);
  }
}

const childWorker = new ChildWorkerModel();
parentPort.on("message", (command: ICommand) => {
  childWorker.registerCommand(command);
});
