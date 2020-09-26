import { Application, Context } from "probot"
import registerCommand from "probot-commands"
import { BotModule } from "../bot"
import {
  ARGUMENTS_METADATA_KEY,
  COMMANDS_TO_SET_UP,
  InjectableArgumentProperties,
  REGISTRABLE_COMMANDS_METADATA_KEY,
  SetupStrategyContract,
  UserProvidedFeature,
} from "../common"
import { InjectableCommandKey } from "./injectable-command-key.type"
import { RegistrableCommandProperties } from "./registrable-command-properties.interface"

export class CommandsSetupStrategy implements SetupStrategyContract {
  setup(app: Application, bot: BotModule): void {
    const commands = this.getCommandsFromBotModule(bot)
    return this.start(commands, app)
  }

  private getCommandsFromBotModule(bot: BotModule): UserProvidedFeature[] {
    return Reflect.getMetadata(COMMANDS_TO_SET_UP, bot)
  }

  private start(commands: UserProvidedFeature[], app: Application) {
    commands?.forEach((commandObject) => {
      const instance = new commandObject()
      const registrableCommands: RegistrableCommandProperties[] = Reflect.getMetadata(
        REGISTRABLE_COMMANDS_METADATA_KEY,
        commandObject.prototype
      )
      registrableCommands.forEach(({ command: commandName, property }) => {
        // TODO: Type context and command properly.
        registerCommand(
          app,
          commandName,
          (context: Context, command: string) => {
            const values = {
              context,
              ...context,
              command,
              // TODO: which of those values are really provided?
              log: context.log,
              event: context.event,
              isBot: () => context.isBot,
              config: context.config.bind(context),
              issue: context.issue.bind(context),
              pullRequest: context.pullRequest.bind(context),
              repo: context.repo.bind(context),
            }
            const injectableArgumentProperties: InjectableArgumentProperties<
              InjectableCommandKey
            >[] = Reflect.getMetadata(
              ARGUMENTS_METADATA_KEY,
              commandObject.prototype,
              property
            )
            const providedArguments = injectableArgumentProperties
              .sort((a, b) => a.index - b.index)
              .map(({ name }) => values[name])
            instance[(property as unknown) as string](providedArguments)
          }
        )
      })
    })
  }
}
