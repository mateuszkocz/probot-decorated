import { EventNames } from "@octokit/webhooks/dist-types/generated/event-names"

export interface OnProperties {
  readonly event: EventNames.All
  readonly property: string | symbol
}
