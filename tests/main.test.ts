import fs from "fs"
import nock from "nock"
import path from "path"
import { Probot, ProbotOctokit, Context as ProbotContext } from "probot"
import { Bot, Controller, createBot, On, Context } from "../src"
import payload from "./fixtures/issues.opened.json"

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
)
const issueCreatedBody = { body: "Thanks for opening this issue!" }

describe("Controllers", () => {
  let bot: Probot

  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  beforeEach(() => {
    bot = new Probot({
      id: 123,
      privateKey,
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    })

    @Controller()
    class TestController {
      @On("issues.opened")
      async sayHi(@Context() context: ProbotContext) {
        const issueComment = context.issue({
          body: "Thanks for opening this issue!",
        })
        await context.github.issues.createComment(issueComment)
      }
    }

    @Bot({
      controllers: [TestController],
      routes: [],
      commands: [],
    })
    class TestApp {}

    // @ts-ignore
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
    // @ts-ignore
    await bot.receive({ name: "issues.opened", payload })

    expect(mock.pendingMocks()).toStrictEqual([])
  })
})
