import {
  COMMANDS_TO_SET_UP,
  CONTROLLERS_TO_SET_UP_METADATA_KEY,
  ROUTES_TO_SET_UP,
} from "./constants"

interface BotConfiguration {
  controllers?: Array<{ new (): any }>
  routes: Array<{ new (): any }>
  commands: Array<{ new (): any }>
}

export function Bot(configuration: BotConfiguration): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(
      CONTROLLERS_TO_SET_UP_METADATA_KEY,
      configuration.controllers,
      target
    )
    Reflect.defineMetadata(ROUTES_TO_SET_UP, configuration.routes, target)
    Reflect.defineMetadata(COMMANDS_TO_SET_UP, configuration.commands, target)
  }
}
