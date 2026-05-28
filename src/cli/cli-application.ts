import { CommandParser } from './command-parser.js';
import { Command } from './command/command.interface.js';

type CommandCollection = Record<string, Command>;


export class CLIApplication {
  private commands: CommandCollection = {};

  constructor(
    private readonly defaultCommand: string = '--help'
  ){ }

  public registerCommand(commandList: Command[]):void {
    commandList.forEach((command) => {
      const commandName: string = command.getName();

      if(Object.hasOwn(this.commands, commandName)){
        throw new Error(`Command ${commandName} is already registered`);
      }
      this.commands[commandName] = command;
    });
  }

  public getCommand(commandName: string): Command {
    return this.commands[commandName] ?? this.getDefaulCommand();
  }

  public getDefaulCommand(): Command | never {
    if (!this.commands[this.defaultCommand]) {
      throw new Error(`The default command (${this.defaultCommand}) is not resistered`);
    }

    return this.commands[this.defaultCommand];
  }

  public async processCommand(argv: string[]): Promise<void> {
    const parsedCommand = CommandParser.parse(argv);
    const [commandName] = Object.keys(parsedCommand);
    const command = this.getCommand(commandName);
    const commandArguments = parsedCommand[commandName] ?? [];
    await command.execute(...commandArguments);
  }
}
