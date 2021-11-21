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

class HandleInfoCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.info];
  handle(command: ICommand<string>) {
    console.info("child process info:", command.payload);
    parentPort.postMessage(new CompleteCommand(command.uid));
  }
}

class HandleErrorCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.error];
  handle(command: ICommand<string>) {
    console.error("child process error:", command);
    parentPort.postMessage(command);
  }
}

class HandleCodeCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.code];
  handle(command: ICommand<string>) {
    eval(command.payload);
    parentPort.postMessage(new CompleteCommand(command.uid));
  }
}

class HandleSystemCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.system];
  handle(command: ICommand<ESystemCommandType>) {
    // @ts-ignore
    const self = this as BaseWorkerModel;
    switch (command.payload) {
      case ESystemCommandType.softStop:
        const oldEvalCommand = self.evolveCommand;
        self.evolveCommand = () => {
          if (!self.allCommands.length) {
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
      new HandleInfoCommand(),
      new HandleErrorCommand(),
      new HandleCodeCommand(),
      new HandleSystemCommand()
    );
    // this.sendParentCommand(new SystemCommand(ESystemCommandType.isStarted));
  }

  // protected handleInfoCommand(command: ICommand<string>) {
  //   console.info("child process info:", command.payload);
  // }

  // protected handleErrorCommand(command: ICommand<string>) {
  //   console.error("child process error:", command);
  // }

  // protected handleSystemCommand(command: ICommand<ESystemCommandType>) {
  //   switch (command.payload) {
  //     case ESystemCommandType.softStop:
  //       this.isSoftStop = true;
  //       this.parentCmpleteCommandMessage(command.uid);
  //       process.exit(0);
  //   }
  // }

  // protected handleCodeCommand(command: ICommand<string>) {
  //   eval(command.payload);
  // }
  // protected sendParentCommand(command: ICommand) {
  //   parentPort.postMessage(command);
  // }

  // protected evolveCommand() {
  //   try {
  //     super.evolveCommand();
  //   } catch (error) {
  //     this.sendParentCommand(new ErrorCommand(error as string));
  //   }
  // }
}

const childWorker = new ChildWorkerModel();
parentPort.on("message", (command: ICommand) => {
  childWorker.registerCommand(command);
});
