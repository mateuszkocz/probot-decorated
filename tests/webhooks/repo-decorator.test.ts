import nock from "nock"
import { Context as ProbotContext, Probot } from "probot"
import { Bot, createBot } from "../../src/bot"
import { Context, On, Repo, Webhook } from "../../src/webhooks"
import payload from "../fixtures/pull_request.opened.json"
import { createTestProbot } from "../utils/create-test-probot"

const repoContent = { owner: "probot-decorated", repo: "test-repo" }

describe("@Repo", () => {
  @Webhook()
  class RepoTest {
    @On("pull_request.opened")
    async checkRepo(
      @Context() context: ProbotContext,
      // TODO: How to type it properly?
      @Repo() repo: any
    ) {
      const issueComment = context.issue({
        body: repo(),
      })
      await context.github.issues.createComment(issueComment)
    }
  }
  @Bot({
    webhooks: [RepoTest],
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
          done(expect(body).toMatchObject({ body: repoContent }))
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
