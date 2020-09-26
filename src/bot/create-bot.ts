import { Application } from "probot"
import { BotModule } from ".."
import { CommandsSetupStrategy } from "../commands"
import { WebhooksSetupStrategy } from "../webhooks"
import { RouterSetupStrategy } from "../router"

export const createBot = (
  botModule: BotModule
): ((app: Application) => void) => {
  return (app: Application): void => {
    return [
      new WebhooksSetupStrategy(),
      new RouterSetupStrategy(),
      new CommandsSetupStrategy(),
    ].forEach((strategy) => strategy.setup(app, botModule))
  }
}
