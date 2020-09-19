import "reflect-metadata"
import {
  COMMANDS_TO_SET_UP,
  CONTROLLERS_TO_SET_UP_METADATA_KEY,
  ROUTES_TO_SET_UP,
} from "./constants"

interface BotConfiguration {
  controllers?: Array<{ new (): unknown }>
  routes: Array<{ new (): unknown }>
  commands: Array<{ new (): unknown }>
}

export const Bot = ({
  commands,
  controllers,
  routes,
}: Readonly<BotConfiguration>): ClassDecorator => {
  return (target): void => {
    Reflect.defineMetadata(
      CONTROLLERS_TO_SET_UP_METADATA_KEY,
      controllers,
      target
    )
    Reflect.defineMetadata(ROUTES_TO_SET_UP, routes, target)
    Reflect.defineMetadata(COMMANDS_TO_SET_UP, commands, target)
  }
}
