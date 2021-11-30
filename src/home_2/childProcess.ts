import { parentPort } from "worker_threads";
import {
  ICommand,
  ESystemCommandType,
  ECommandType,
  AbstractCommandHandler,
  CompleteCommand,
  ChildStoppedCommand,
} from "./models";
import { BaseWorkerModel } from "./shared";

class HandleInfoCommand extends AbstractCommandHandler<ChildWorkerModel> {
  commandTypes = [ECommandType.info];
  handle(command: ICommand<string>) {
    console.info("child process info:", command.payload);
    parentPort.postMessage(new CompleteCommand(command.uid));
  }
}

class HandleErrorCommand extends AbstractCommandHandler<ChildWorkerModel> {
  commandTypes = [ECommandType.error];
  handle(command: ICommand<string>) {
    console.error("child process error:", command);
    parentPort.postMessage(command);
  }
}

class HandleCodeCommand extends AbstractCommandHandler<ChildWorkerModel> {
  commandTypes = [ECommandType.code];
  handle(command: ICommand<string>) {
    eval(command.payload);
    parentPort.postMessage(new CompleteCommand(command.uid));
  }
}

class HandleSystemCommand extends AbstractCommandHandler<ChildWorkerModel> {
  commandTypes = [ECommandType.system];
  handle(command: ICommand<ESystemCommandType>) {
    switch (command.payload) {
      case ESystemCommandType.softStop:
        const oldEvalCommand = this.targetObject.evolveCommand;
        this.targetObject.evolveCommand = () => {
          if (!this.targetObject.allCommands.length) {
            parentPort.postMessage(new ChildStoppedCommand());
            process.exit(0);
          }
          oldEvalCommand();
        };
        break;
      case ESystemCommandType.hardStop:
        parentPort.postMessage(new ChildStoppedCommand());
        process.exit(0);
    }
    parentPort.postMessage(new CompleteCommand(command.uid));
  }
}

class ChildWorkerModel extends BaseWorkerModel {
  constructor() {
    super();
    this.handlers.push(
      new HandleInfoCommand(this),
      new HandleErrorCommand(this),
      new HandleCodeCommand(this),
      new HandleSystemCommand(this)
    );
  }
}

const childWorker = new ChildWorkerModel();
parentPort.on("message", (command: ICommand) => {
  childWorker.registerCommand(command);
});
