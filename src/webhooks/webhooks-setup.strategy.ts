import { Application, Context } from "probot"
import { BotModule } from "../bot"
import {
  ARGUMENTS_METADATA_KEY,
  InjectableArgumentProperties,
  REGISTRABLE_PROPERTIES_METADATA_KEY,
  UserProvidedFeature,
  WEBHOOKS_TO_SET_UP,
} from "../common"
import { SetupStrategyContract } from "../common"
import { InjectableContextKey } from "./injectable-context-keys.type"
import { RegistrableOnProperties } from "./registrable-on-properties.interface"

export class WebhooksSetupStrategy implements SetupStrategyContract {
  setup(app: Application, bot: BotModule): void {
    const webhooks = this.getWebhooksFromBotModule(bot)
    return this.start(webhooks, app)
  }

  private getWebhooksFromBotModule(bot: BotModule): UserProvidedFeature[] {
    return Reflect.getMetadata(WEBHOOKS_TO_SET_UP, bot)
  }

  private start(webhooks: UserProvidedFeature[], app: Application) {
    webhooks?.forEach((webhook) => {
      const instance = new webhook()
      const registrableProperties: RegistrableOnProperties[] = Reflect.getMetadata(
        REGISTRABLE_PROPERTIES_METADATA_KEY,
        webhook.prototype
      )
      registrableProperties.forEach(({ event, property }) => {
        app.on(
          event,
          (context: Context): Promise<void> => {
            const values = {
              context,
              ...context,
              log: context.log,
              event: context.event,
              get isBot() {
                return context.isBot
              },
              config: () => context.config,
              issue: (...args: unknown[]) => context.issue(...args),
              pullRequest: (...args: unknown[]) => context.pullRequest(...args),
              repo: (...args: unknown[]) => context.repo(...args),
            }
            const injectableArgumentProperties: InjectableArgumentProperties<
              InjectableContextKey
            >[] = Reflect.getMetadata(
              ARGUMENTS_METADATA_KEY,
              webhook.prototype,
              property
            )
            const providedArguments = injectableArgumentProperties
              .sort((a, b) => a.index - b.index)
              .map(({ name }) => values[name])
            return instance[(property as unknown) as string](
              ...providedArguments
            ) as Promise<void>
          }
        )
      })
    })
  }
}
