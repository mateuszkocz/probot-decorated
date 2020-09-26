import { Application, Context } from "probot"
import registerCommand from "probot-commands"
import {
  ARGUMENTS_METADATA_KEY,
  COMMANDS_TO_SET_UP,
  WEBHOOKS_TO_SET_UP,
  REGISTRABLE_COMMANDS_METADATA_KEY,
  REGISTRABLE_PROPERTIES_METADATA_KEY,
  REGISTRABLE_ROUTES_METADATA_KEY,
  ROUTER_CONFIG,
  ROUTES_TO_SET_UP,
} from "../common"
import { InjectableArgumentProperties } from "../common"
import { InjectableCommandKey } from "../commands"
import { InjectableContextKey } from "../webhooks"
import { RegistrableCommandProperties } from "../commands"
import { RegistrableOnProperties } from "../webhooks"
import { RegistrableRouteProperties } from "../router"
import { BotModule } from "./bot-module.interface"

type UserProvidedFeature = {
  new (): Record<string | symbol, (...args: unknown[]) => unknown>
}

const setupWebhooks = (app: Application, webhooks: UserProvidedFeature[]) => {
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
            isBot: () => context.isBot,
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

const setUpRoutes = (app: Application, routes: UserProvidedFeature[]) => {
  routes?.forEach((route) => {
    const instance = new route()
    const routerConfig = Reflect.getMetadata(ROUTER_CONFIG, route)
    const registrableRoutes: RegistrableRouteProperties[] = Reflect.getMetadata(
      REGISTRABLE_ROUTES_METADATA_KEY,
      route.prototype
    )
    const router = app.route(routerConfig.prefix)
    registrableRoutes.forEach(({ word, path, property }) => {
      router[word](path, (request, response) => {
        const values = {
          request,
          response,
        }
        const injectableRouterArgumentProperties: InjectableArgumentProperties<
          "request" | "response"
        >[] = Reflect.getMetadata(
          ARGUMENTS_METADATA_KEY,
          route.prototype,
          property
        )
        const providedArguments = injectableRouterArgumentProperties
          .sort((a, b) => a.index - b.index)
          .map(({ name }) => values[name])
        instance[(property as unknown) as string](providedArguments)
      })
    })
  })
}

const setUpCommands = (app: Application, commands: UserProvidedFeature[]) => {
  commands?.forEach((commandObject) => {
    const instance = new commandObject()
    const registrableCommands: RegistrableCommandProperties[] = Reflect.getMetadata(
      REGISTRABLE_COMMANDS_METADATA_KEY,
      commandObject.prototype
    )
    registrableCommands.forEach(({ command: commandName, property }) => {
      // TODO: Type context and command properly.
      registerCommand(app, commandName, (context: Context, command: string) => {
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
      })
    })
  })
}

export const createBot = (
  botModule: BotModule
): ((app: Application) => void) => {
  return (app: Application): void => {
    const webhooks = Reflect.getMetadata(WEBHOOKS_TO_SET_UP, botModule)
    const routes = Reflect.getMetadata(ROUTES_TO_SET_UP, botModule)
    const commands = Reflect.getMetadata(COMMANDS_TO_SET_UP, botModule)
    setupWebhooks(app, webhooks)
    setUpRoutes(app, routes)
    setUpCommands(app, commands)
  }
}
