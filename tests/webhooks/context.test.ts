import nock from "nock"
import { Context as ProbotContext, Probot } from "probot"
import { Bot, Context, createBot, On, Webhook } from "../../src"
import payload from "../fixtures/issues.opened.json"
import { createTestProbot } from "../utils/create-test-probot"

const issueCreatedBody = { body: "Thanks for opening this issue!" }

describe("@Context", () => {
  @Webhook()
  class ContextTest {
    @On("issues.opened")
    async checkContext(@Context() context: ProbotContext) {
      const issueComment = context.issue({
        body: "Thanks for opening this issue!",
      })
      await context.github.issues.createComment(issueComment)
    }
  }

  @Bot({
    webhooks: [ContextTest],
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
  test("is passed to the responder", async (done) => {
    const mock = nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })
      .post(
        "/repos/probot-decorated/test-repo/issues/1/comments",
        (body: any) => {
          done(expect(body).toMatchObject(issueCreatedBody))
          return true
        }
      )
      .reply(200)
    await bot.receive({ name: "issues", payload, id: "1" })
    expect(mock.pendingMocks()).toStrictEqual([])
  })
})
