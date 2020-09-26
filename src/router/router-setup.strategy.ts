import { Application } from "probot"
import { BotModule } from "../bot"
import {
  ARGUMENTS_METADATA_KEY,
  InjectableArgumentProperties,
  REGISTRABLE_ROUTES_METADATA_KEY,
  ROUTER_CONFIG,
  ROUTES_TO_SET_UP,
  SetupStrategyContract,
  UserProvidedFeature,
} from "../common"
import { RegistrableRouteProperties } from "./registrable-route-properties.interface"

export class RouterSetupStrategy implements SetupStrategyContract {
  setup(app: Application, bot: BotModule): void {
    const routes = this.getRoutesFromBotModule(bot)
    return this.start(routes, app)
  }

  private getRoutesFromBotModule(bot: BotModule): UserProvidedFeature[] {
    return Reflect.getMetadata(ROUTES_TO_SET_UP, bot)
  }

  private start(routes: UserProvidedFeature[], app: Application) {
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
}
