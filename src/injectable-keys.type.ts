import { Context } from "probot/lib/context"

export type InjectableContextKey = keyof Context
export type InjectableCommandKey = InjectableContextKey | "context" | "command"
