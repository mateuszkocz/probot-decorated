import { ROUTER_CONFIG } from "./constants"

interface RouterConfig {
  prefix: string
}

export function Router(config: RouterConfig): ClassDecorator {
  return (target: unknown) => {
    Reflect.defineMetadata(ROUTER_CONFIG, config, target)
  }
}
