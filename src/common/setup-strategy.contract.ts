import { Application } from "probot"
import { BotModule } from "../bot"

export interface SetupStrategyContract {
  setup(app: Application, bot: BotModule): void
}
