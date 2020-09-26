import { EventNames } from "@octokit/webhooks/dist-types/generated/event-names"

export interface RegistrableOnProperties<
  EventName extends EventNames.All = EventNames.All
> {
  readonly event: EventName
  readonly property: string | symbol
}
