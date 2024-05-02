import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

export async function run(): Promise<void> {
  const { owner, repo } = context.repo
  const token = core.getInput('github-token', { required: true })
  const baseBranch = core.getInput('base-branch', { required: true })
  const headBranch = core.getInput('head-branch', { required: true })

  const github = getOctokit(token)

  const { data: diffCommits } = await github.rest.repos.compareCommits({
    owner,
    repo,
    base: baseBranch,
    head: headBranch
  })

  let prUrls = []
  for (const commit of diffCommits.commits) {
    const { data: commitPRs } =
      await github.rest.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: commit.sha
      })
    for (const associatedPR of commitPRs) {
      prUrls.push(associatedPR.html_url)
    }
  }
  prUrls = [...new Set(prUrls)]
  const now = new Date()
  const prTitle = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${context.sha.substring(0, 7)} - RELEASE`
  const prBody = `# What's Changed\n${prUrls.map(url => `- ${url}`).join('\n')}`

  const { data: releasePRs } = await github.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    base: baseBranch,
    head: `${owner}:${headBranch}`
  })

  if (releasePRs.length > 1) {
    throw new Error(
      'There are multiple release PRs open. Please close all but one.'
    )
  }

  if (releasePRs.length === 1) {
    await github.rest.pulls.update({
      owner,
      repo,
      pull_number: releasePRs[0].number,
      title: prTitle,
      body: prBody
    })
    console.info(`Updated release PR: ${releasePRs[0].html_url}`)
    return
  }

  await github.rest.pulls.create({
    owner,
    repo,
    title: prTitle,
    body: prBody,
    base: baseBranch,
    head: headBranch
  })
  console.info(`Created release PR: ${owner}/${repo}/${headBranch}`)
}
