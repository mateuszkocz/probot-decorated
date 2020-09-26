import { createArgumentInjectionDecorator } from "../common/create-argument-injector-decorator"

export const Context = createArgumentInjectionDecorator("context")
export const Log = createArgumentInjectionDecorator("log")
export const GitHub = createArgumentInjectionDecorator("github")
export const Id = createArgumentInjectionDecorator("id")
export const Name = createArgumentInjectionDecorator("name")
export const Payload = createArgumentInjectionDecorator("payload")
export const Event = createArgumentInjectionDecorator("event")
export const IsBot = createArgumentInjectionDecorator("isBot")
export const Config = createArgumentInjectionDecorator("config")
export const Issue = createArgumentInjectionDecorator("issue")
export const PullRequest = createArgumentInjectionDecorator("pullRequest")
export const Repo = createArgumentInjectionDecorator("repo")
