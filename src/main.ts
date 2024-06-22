import * as core from '@actions/core'
import semver, { ReleaseType } from 'semver'
import * as tag from './tag'

/**
 * Runs the action
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // inputs from action.yml
    const releaseType: ReleaseType = (core.getInput('release_type', {
      required: true
    }) || 'prepatch') as ReleaseType
    const push = core.getBooleanInput('push')
    const filter = core.getInput('filter').replace(/^v/, '') || ''
    const prefixWithV = core.getBooleanInput('prefix_with_v')
    const prerelease = core.getInput('prerelease_identifier_base') || ''
    const commitHash = core.getInput('commit_hash') || 'HEAD'
    const committer = {
      name: core.getInput('committer_name') || 'GH Bot - Manual Bump',
      email: core.getInput('committer_email') || 'github-actions@github.com'
    }

    // process inputs
    const prefix = prefixWithV ? 'v' : ''

    // print inputs
    core.info(`Release type: ${releaseType}`)
    core.info(`Push to remote: ${push}`)
    core.info(`Prefix with "v": ${prefixWithV}`)
    if (prerelease) {
      core.info(`Prerelease Identifier Base: ${prerelease}`)
    }

    // list tags
    const tags: string[] = await tag.list(`${prefix}${filter}`)
    core.debug(`Tags: ${tags.join(' | ')}`)

    // get the last tag
    let oldTag = tag.latest(tags)
    if (!oldTag) {
      core.notice('No previous tags found.')
      oldTag = `0.0.0`
    }
    oldTag = prefix + oldTag
    core.debug(`Last Tag: ${oldTag}`)

    // bump the tag
    const newTag = prefix + tag.bump(oldTag, releaseType, prerelease)
    core.info(`New Tag: ${newTag}`)

    // tag locally
    await tag.tag(newTag, commitHash, committer)

    if (push) {
      // push to remote
      await tag.push(newTag)
    }

    // set output
    const v = semver.coerce(newTag)
    if (!v) {
      throw new Error(`Unexpected version was generated: ${newTag}`)
    }
    const isDraft = v.compare('0.1.0') < 0
    const isPrerelease =
      (!isDraft && v.compare('1.0.0') < 0) || v.prerelease.length > 0
    core.setOutput('old_tag', oldTag)
    core.setOutput('old_tag_semver', semver.coerce(oldTag)?.version)
    core.setOutput('new_tag', newTag)
    core.setOutput('new_tag_semver', v.version)
    core.setOutput('draft', isDraft)
    core.setOutput('prerelease', isPrerelease)
  } catch (e) {
    if (e instanceof Error) core.setFailed(e.message)
    else core.setFailed(`Unexpected error: ${e}`)
  }
}
