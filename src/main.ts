import * as core from '@actions/core'
import { ReleaseType } from 'semver'
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
    const prefixWithV = core.getBooleanInput('prefix_with_v', {
      required: true
    })
    const prerelease = core.getInput('prerelease_identifier_base') || ''
    const commitHash = core.getInput('commit_hash') || 'HEAD'

    // process inputs
    const prefix = prefixWithV ? 'v' : ''

    // print inputs
    core.debug(`Release type: ${releaseType}`)
    core.debug(`Push to remote: ${push}`)
    core.debug(`Prefix with "v": ${prefixWithV}`)
    if (prerelease) {
      core.debug(`Prerelease Identifier Base: ${prerelease}`)
    }

    // list tags
    const tags: string[] = await tag.list(`${prefix}${filter}`)
    core.debug(`Filtered tags: ${tags.join(' | ')}`)

    // get the last tag
    let oldTag = tag.latest(tags)
    if (!oldTag) {
      core.notice(
        'No previous tags found. Defaulting to 0.0.0 for the last tag.'
      )
      oldTag = `${prefix}0.0.0`
    }
    core.debug(`Last Tag: ${oldTag}`)

    // bump the tag
    const newTag = tag.bump(oldTag, releaseType, prerelease)
    core.info(`New Tag: ${newTag}`)

    if (push) {
      await tag.push(newTag, commitHash)
    }

    // set output
    core.setOutput('old_tag', oldTag)
    core.setOutput('new_tag', newTag)
  } catch (e) {
    if (e instanceof Error) core.setFailed(e.message)
    else core.setFailed(`Unexpected error: ${e}`)
  }
}
