import "reflect-metadata"
import {
  COMMANDS_TO_SET_UP,
  ROUTES_TO_SET_UP,
  WEBHOOKS_TO_SET_UP,
} from "../common"

interface BotConfiguration {
  webhooks?: Array<{ new (): unknown }>
  routes?: Array<{ new (): unknown }>
  commands?: Array<{ new (): unknown }>
}

export const Bot = ({
  commands,
  webhooks,
  routes,
}: Readonly<BotConfiguration> = {}): ClassDecorator => {
  return (target): void => {
    Reflect.defineMetadata(WEBHOOKS_TO_SET_UP, webhooks, target)
    Reflect.defineMetadata(ROUTES_TO_SET_UP, routes, target)
    Reflect.defineMetadata(COMMANDS_TO_SET_UP, commands, target)
  }
}
