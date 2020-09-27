import nock from "nock"
import { Context as ProbotContext, Probot } from "probot"
import { Bot, createBot } from "../../src/bot"
import { Context, On, PullRequest, Webhook } from "../../src/webhooks"
import payload from "../fixtures/pull_request.opened.json"
import { createTestProbot } from "../utils/create-test-probot"

const pullRequestContent = {
  pull_number: 1,
  owner: "probot-decorated",
  repo: "test-repo",
}

describe("@PullRequest", () => {
  @Webhook()
  class PullRequestTest {
    @On("pull_request.opened")
    async checkPullRequest(
      @Context() context: ProbotContext,
      // TODO: How to type it properly?
      @PullRequest() pullRequest: any
    ) {
      const issueComment = context.issue({
        body: pullRequest(),
      })
      await context.github.issues.createComment(issueComment)
    }
  }
  @Bot({
    webhooks: [PullRequestTest],
  })
  class WebhooksTestBot {}
  let bot: Probot
  beforeEach(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  beforeEach(() => {
    bot = createTestProbot()
    bot.load(createBot(WebhooksTestBot))
  })
  it("is passed to the responder", async (done) => {
    const mock = nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          pull_requests: "write",
        },
      })
      .post(
        "/repos/probot-decorated/test-repo/issues/1/comments",
        (body: unknown) => {
          done(expect(body).toMatchObject({ body: pullRequestContent }))
          return true
        }
      )
      .reply(200)
    await bot.receive({
      name: "pull_request",
      id: "1",
      payload: payload,
    })
    expect(mock.pendingMocks()).toStrictEqual([])
  })
})
