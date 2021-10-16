import { ICommand } from "../home_1/models";

export class CommnadException implements Error {
  constructor(public message: string) {
    this.name = "CommnadException";
  }
  name = "CommnadException";
  stack?: string;
}
export class MacroCommand implements ICommand {
  constructor(private commands: ICommand[]) {}
  execute(): void {
    try {
      this.commands.forEach((command) => {
        command.execute();
      });
    } catch (ex) {
      throw new CommnadException((ex as Error).message);
    }
  }
}
