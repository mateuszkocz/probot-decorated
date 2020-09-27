import nock from "nock"
import { Context as ProbotContext, Probot } from "probot"
import { Bot, Context, createBot, On, Webhook } from "../src"
import payload from "./fixtures/issues.opened.json"
import { createTestProbot } from "./utils/create-test-probot"

const issueCreatedBody = { body: "Thanks for opening this issue!" }

describe("Webhooks", () => {
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

    @Webhook()
    class TestWebhook {
      @On("issues.opened")
      async sayHi(@Context() context: ProbotContext) {
        const issueComment = context.issue({
          body: "Thanks for opening this issue!",
        })
        await context.github.issues.createComment(issueComment)
      }
    }

    @Bot({
      webhooks: [TestWebhook],
    })
    class TestApp {}

    bot.load(createBot(TestApp))
  })

  test("creates a comment when an issue is opened", async (done) => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })

      // Test that a comment is posted
      .post(
        "/repos/probot-decorated/test-repo/issues/1/comments",
        (body: any) => {
          done(expect(body).toMatchObject(issueCreatedBody))
          return true
        }
      )
      .reply(200)

    // Receive a webhook event
    await bot.receive({ name: "issues", payload, id: "1" })

    expect(mock.pendingMocks()).toStrictEqual([])
  })
})
