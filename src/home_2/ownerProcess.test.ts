import {
  CodeCommand,
  EStatusProcess,
  ESystemCommandType,
  InfoCommand,
  SystemCommand,
} from "./models";
import { OwnerProcessModel } from "./ownerProcess";

test("child process is started ", () => {
  const ownerProcess = new OwnerProcessModel();
  const startMessage = new SystemCommand(ESystemCommandType.start);
  const hardStopMessage = new SystemCommand(ESystemCommandType.hardStop);

  ownerProcess.addSystemMsgCollback(ESystemCommandType.isStarted, (command) => {
    expect(ownerProcess.childWorker.status).toEqual(EStatusProcess.worked);
  });

  ownerProcess.registerCommand(startMessage);
  ownerProcess.registerCommand(new InfoCommand("команда info. test 1"));
  ownerProcess.registerCommand(
    new CodeCommand(`console.info("это динамический код. test 1");`)
  );
  ownerProcess.registerCommand(hardStopMessage);
});

test("hard stop", () => {
  const ownerProcess = new OwnerProcessModel();
  const startMessage = new SystemCommand(ESystemCommandType.start);
  const hardStopMessage = new SystemCommand(ESystemCommandType.hardStop);

  ownerProcess.addSystemMsgCollback(
    ESystemCommandType.completeCommand,
    (command) => {
      if (hardStopMessage.uid === command.uid) {
        expect(ownerProcess.childWorker.status).toEqual(EStatusProcess.stopped);
      }
    }
  );

  ownerProcess.registerCommand(startMessage);
  ownerProcess.registerCommand(new InfoCommand("команда info. test 2"));
  ownerProcess.registerCommand(hardStopMessage);
  ownerProcess.registerCommand(
    new CodeCommand(`console.info("это динамический код. test 2");`)
  );
});

test("soft stop and command queue equal 0", () => {
  const ownerProcess = new OwnerProcessModel();
  const startMessage = new SystemCommand(ESystemCommandType.start);
  const softStopMessage = new SystemCommand(ESystemCommandType.softStop);

  ownerProcess.addSystemMsgCollback(
    ESystemCommandType.completeCommand,
    (command) => {
      if (softStopMessage.uid === command.uid) {
        expect(ownerProcess.childWorker.status).toEqual(EStatusProcess.worked);
        expect(ownerProcess.allCommands.length).toEqual(0);
      }
    }
  );

  ownerProcess.registerCommand(startMessage);
  ownerProcess.registerCommand(new InfoCommand("команда info. test 3"));

  ownerProcess.registerCommand(
    new CodeCommand(`console.info("это динамический код 1. test 3")`)
  );
  ownerProcess.registerCommand(
    new CodeCommand(`console.info("это динамический код 2. test 3")`)
  );
  ownerProcess.registerCommand(
    new CodeCommand(`console.info("это динамический код 3. test 3")`)
  );
  ownerProcess.registerCommand(softStopMessage);
});
