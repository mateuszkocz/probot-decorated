import fs from "fs"
import path from "path"
import { Probot, ProbotOctokit } from "probot"

const privateKey = fs.readFileSync(
  path.join(__dirname, "../fixtures/mock-cert.pem"),
  "utf-8"
)

export const createProbot = () =>
  new Probot({
    id: 123,
    privateKey,
    Octokit: ProbotOctokit.defaults({
      retry: { enabled: false },
      throttle: { enabled: false },
    }),
  })
