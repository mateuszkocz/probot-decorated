import { Application, Context } from "probot"
import registerCommand from "probot-commands"
import {
  ARGUMENTS_METADATA_KEY,
  COMMANDS_TO_SET_UP,
  CONTROLLERS_TO_SET_UP_METADATA_KEY,
  REGISTRABLE_COMMANDS_METADATA_KEY,
  REGISTRABLE_PROPERTIES_METADATA_KEY,
  REGISTRABLE_ROUTES_METADATA_KEY,
  ROUTER_CONFIG,
  ROUTES_TO_SET_UP,
} from "./constants"
import { InjectableArgumentProperties } from "./injectable-argument-properties.interface"
import {
  InjectableCommandKey,
  InjectableContextKey,
} from "./injectable-keys.type"
import { RegistrableCommandProperties } from "./registrable-command-properties.interface"
import { RegistrableOnProperties } from "./registrable-on-properties.interface"
import { RegistrableRouteProperties } from "./registrable-route-properties.interface"

type UserProvidedClass = {
  new (): Record<string | symbol, (...args: unknown[]) => unknown>
}

const setUpControllers = (
  app: Application,
  controllers: UserProvidedClass[]
) => {
  controllers.forEach((controller) => {
    const instance = new controller()
    const registrableProperties: RegistrableOnProperties[] = Reflect.getMetadata(
      REGISTRABLE_PROPERTIES_METADATA_KEY,
      controller.prototype
    )
    registrableProperties.forEach(({ event, property }) => {
      app.on(event, (context: Context) => {
        const values = {
          context,
          ...context,
          log: context.log,
          event: context.event,
          isBot: () => context.isBot,
          config: context.config.bind(context),
          issue: context.issue.bind(context),
          pullRequest: context.pullRequest.bind(context),
          repo: context.repo.bind(context),
        }
        const injectableArgumentProperties: InjectableArgumentProperties<
          InjectableContextKey
        >[] = Reflect.getMetadata(
          ARGUMENTS_METADATA_KEY,
          controller.prototype,
          property
        )
        const providedArguments = injectableArgumentProperties
          .sort((a, b) => a.index - b.index)
          .map(({ name }) => values[name])
        instance[(property as unknown) as string](...providedArguments)
      })
    })
  })
}

const setUpRoutes = (app: Application, routes: UserProvidedClass[]) => {
  routes.forEach((route) => {
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

const setUpCommands = (app: Application, commands: UserProvidedClass[]) => {
  commands.forEach((commandObject) => {
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
  botModule: UserProvidedClass
): ((app: Application) => void) => {
  return (app: Application): void => {
    const controllers = Reflect.getMetadata(
      CONTROLLERS_TO_SET_UP_METADATA_KEY,
      botModule
    )
    const routes = Reflect.getMetadata(ROUTES_TO_SET_UP, botModule)
    const commands = Reflect.getMetadata(COMMANDS_TO_SET_UP, botModule)
    setUpControllers(app, controllers)
    setUpRoutes(app, routes)
    setUpCommands(app, commands)
  }
}
