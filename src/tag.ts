import { exec, getExecOutput } from '@actions/exec'
import semver, { SemVer } from 'semver'

/**
 * Coerce a tag into a SemVer object, preserve prereleases.
 * @param tag The tag to coerce.
 * @returns The coerced SemVer object.
 */
export function coerce(tag: string): SemVer | null {
  return semver.coerce(tag, { includePrerelease: true })
}

/**
 * Filter valid tags from a list of tags.
 * @param tags The list of tags to filter.
 * @param prefix The prefix to filter tags by.
 * @returns The list of valid tags.
 * @example
 * const tags = filterValid(['v0.1.0', 'v0.1.1', 'edge', 'v0.2.0'])
 * console.log(tags) // ['0.1.0', '0.1.1', '0.2.0']
 */
export function filterValid(tags: string[], prefix = ''): string[] {
  return tags
    .filter(t => prefix.length < 1 || t.startsWith(prefix))
    .map(t => coerce(t)?.raw || '')
    .filter(t => t.length > 0 && semver.valid(t))
}

/**
 * List tags from the remote repository.
 * @param prefix The prefix to filter tags by.
 * @returns Resolves with the list of tags.
 * @throws {Error} Throws an error if the tags cannot be listed.
 * @example
 * const tags = await list()
 * console.log(tags) // ['v0.1.0', 'v0.1.1', 'v0.2.0']
 * @example
 * const tags = await list('v0.1')
 * console.log(tags) // ['v0.1.0', 'v0.1.1']
 */
export async function list(prefix = ''): Promise<string[]> {
  await exec('git', ['fetch', '--tags'])
  const tagsOutput = await getExecOutput('git', ['tag', '--list'])
  if (tagsOutput.exitCode !== 0) {
    throw new Error(`Failed to list tags: ${tagsOutput.stderr}`)
  }
  const tags = tagsOutput.stdout.split('\n')
  return filterValid(tags, prefix)
}

/**
 * Get the latest tag from an list of tags.
 * @param tags The list of unordered tags.
 * @returns The latest tag.
 * @example
 * const latestTag = latest(['v0.1.0', 'v0.2.0', 'v0.1.1'])
 * console.log(latestTag) // 'v0.2.0'
 */
export function latest(tags: string[]): string | null {
  if (tags.length < 1) {
    return null
  }
  const sortedTags = semver.rsort(tags)
  return sortedTags.length > 0 ? sortedTags[0] : null
}

/**
 * Bump a tag to a new version.
 * @param oldTag The old tag to bump.
 * @param releaseType The type of release to bump.
 * @param prerelease The prerelease identifier.
 * @returns The new tag.
 * @throws {Error} Throws an error if the tag cannot be bumped.
 * @example
 * const newTag = bump('v0.1.0', 'patch', 'alpha')
 * console.log(newTag) // 'v0.1.1-alpha.0'
 * @example
 * const newTag = bump('v0.1.0', 'minor')
 * console.log(newTag) // 'v0.2.0'
 * @example
 * const newTag = bump('v0.1.0', 'major')
 * console.log(newTag) // 'v1.0.0'
 * @example
 * const newTag = bump('v0.1.0', 'prerelease', 'alpha')
 * console.log(newTag) // 'v0.1.1-alpha.0'
 */
export function bump(
  oldTag: string,
  releaseType: semver.ReleaseType,
  prerelease = ''
): string {
  const newTag = semver.inc(oldTag, releaseType, prerelease)
  if (!newTag) {
    throw new Error(`Failed to ${releaseType} on ${oldTag}`)
  }
  return newTag
}

/**
 * Creates tag locally
 * @param tag The tag to push.
 * @param target_commit The commit to tag.
 * @param committer The committer to use.
 * @returns {Promise<void>} Resolves when the tag is pushed.
 * @throws {Error} Throws an error if the tag cannot be pushed.
 * @example
 * await push('v0.1.0')
 * @example
 * await push('v0.1.0', 'HEAD')
 */
export async function create(
  tag: string,
  target_commit = 'HEAD',
  committer: { name: string; email: string } = {
    name: 'Github Actions',
    email: 'github-actions@github.com'
  }
): Promise<void> {
  await exec('git', ['config', '--global', 'user.name', committer.name])
  await exec('git', ['config', '--global', 'user.email', committer.email])
  await exec('git', ['tag', '-a', tag, '-m', tag, target_commit])
}

/**
 * Push a tag to the remote repository.
 * @param tag The tag to push.
 * @returns {Promise<void>} Resolves when the tag is pushed.
 * @throws {Error} Throws an error if the tag cannot be pushed.
 * @example
 * await push('v0.1.0')
 */
export async function push(tag: string): Promise<void> {
  await exec('git', ['push', 'origin', tag])
}
