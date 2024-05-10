import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

export async function run(): Promise<void> {
  const { owner, repo } = context.repo
  const token = core.getInput('github-token', { required: true })
  const baseBranch = core.getInput('base-branch', { required: true })
  const headBranch = core.getInput('head-branch', { required: true })

  const github = getOctokit(token)
  let prUrls = []
  let lastCommitSha = context.sha

  try {
    const { data: diffCommits, status: status } =
      await github.rest.repos.compareCommits({
        owner,
        repo,
        base: baseBranch,
        head: headBranch
      })
    if (status !== 200) {
      core.warning(`Failed to compare commits: ${status}`)
      return
    }

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
      lastCommitSha = commit.sha
    }
  } catch (error) {
    core.warning(`Failed to compare commits: ${error}, error: ${error}`)
    return
  }

  prUrls = [...new Set(prUrls)]
  const now = new Date()
  const prTitle = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${lastCommitSha.substring(0, 7)} - RELEASE`
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
    core.setOutput('release-pr-url', releasePRs[0].html_url)
    core.info(`Updated release PR: ${releasePRs[0].html_url}`)
    return
  }

  try {
    const { data: createdPr } = await github.rest.pulls.create({
      owner,
      repo,
      title: prTitle,
      body: prBody,
      base: baseBranch,
      head: headBranch
    })
    core.setOutput('release-pr-url', createdPr.html_url)
    core.info(`Created release PR: ${owner}/${repo}/${headBranch}`)
  } catch (error) {
    core.warning(`Failed to create release PR: ${error}`)
    throw error
  }
}
