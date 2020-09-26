import { Context } from "probot/lib/context"

export type InjectableCommandKey = keyof Context | "context" | "command"
