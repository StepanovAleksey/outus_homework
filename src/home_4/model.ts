import { ICommand } from "../home_1/models";
import { EBASE_IOC_COMMAND as EIOC_COMMAND } from "./const";

export interface IIoC {
  parent: IIoC;
  Resolve<T>(key: string, ...args: any[]): T;
}

export class IoCModel implements IIoC {
  Resolve = null;
  constructor(public parent: IIoC) {}
}

export class SetResolveContextCommand implements ICommand {
  constructor(private context: IIoC) {}
  execute(): void {
    let ownerIoC = this.context;
    while (!!ownerIoC.parent) {
      ownerIoC = ownerIoC.parent;
    }
    const self = this;
    ownerIoC.Resolve = (key: string, ...args: any[]) => {
      let findResolve = self.context[key];
      let parent = self.context.parent;
      while (!findResolve && parent) {
        findResolve = parent[key];
        parent = parent?.parent;
      }
      if (!findResolve) {
        throw new Error(
          `key resolve not found. key: ${key}; args: ${JSON.stringify(args)}`
        );
      }
      return findResolve.apply(self.context, args) as any;
    };
  }
}

class RegisterCommand implements ICommand {
  constructor(
    private ioc: object,
    private objKeyName: string,
    private objClass: (...args) => any
  ) {}
  execute(): void {
    this.ioc[this.objKeyName] = this.objClass;
  }
}

/** регистрация "IoC.Register" */
export class AddIoCRegisterCommand implements ICommand {
  constructor(private ioc: IIoC) {}
  execute(): void {
    this.ioc[EIOC_COMMAND["IoC.Register"]] = function (
      objKeyName: string,
      objClass: (...args) => any
    ) {
      return new RegisterCommand(this, objKeyName, objClass);
    };
  }
}

class ScopeNewCommand implements ICommand {
  constructor(private ioc: IIoC, private scopeId: string) {}
  execute(): void {
    this.ioc["scopes"] = this.ioc["scopes"] || {};
    this.ioc["scopes"][this.scopeId] = new IoCModel(this.ioc);
  }
}

class ScopeCurrentCommand implements ICommand {
  constructor(private ioc: IIoC, private scopeId: string) {}
  execute(): void {
    const context: IIoC =
      this.scopeId !== "parent"
        ? this.ioc["scopes"][this.scopeId]
        : this.ioc.parent || this.ioc;
    new SetResolveContextCommand(context).execute();
  }
}

/** добавление скопов "Scope.New", "Scope.Current" */
export class IoCScopeMacroCommand implements ICommand {
  constructor(private ioc: IIoC) {}
  execute(): void {
    const _self = this;
    this.ioc
      .Resolve<ICommand>(
        EIOC_COMMAND["IoC.Register"],
        EIOC_COMMAND["Scope.New"],
        function (scopeId) {
          //@ts-ignore
          return new ScopeNewCommand(this as IIoC, scopeId);
        }
      )
      .execute();

    this.ioc
      .Resolve<ICommand>(
        EIOC_COMMAND["IoC.Register"],
        EIOC_COMMAND["Scope.Current"],
        function (scopeId: string) {
          return new ScopeCurrentCommand(
            //@ts-ignore
            this as IIoC,
            scopeId
          );
        }
      )
      .execute();
  }
}
