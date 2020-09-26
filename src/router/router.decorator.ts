import { ROUTER_CONFIG } from "../common/constants"

interface RouterConfig {
  prefix: string
}

export const Router = (config: Readonly<RouterConfig>): ClassDecorator => {
  return (target): void => {
    Reflect.defineMetadata(ROUTER_CONFIG, config, target)
  }
}
