# GitHub Action to manually create tags

[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Driven by [SemVer](https://www.npmjs.com/package/semver)

## Example usage

```yaml
- name: Calculate new tag
  id: tag
  uses: ./
  with:
    release_type: '${{ github.event.inputs.release_type }}'
    push: 'false'
    prefix_with_v: '${{ github.event.inputs.prefix_with_v }}'
    filter: '${{ github.event.inputs.filter }}'
    prerelease_identifier_base: '${{ github.event.inputs.prerelease_base }}'
```

See full example at [bump.yml](./.github/workflows/bump.yml)

## Inputs

| Name                       | Description                                                                  | Required | Default                     |
| -------------------------- | ---------------------------------------------------------------------------- | -------- | --------------------------- |
| release_type               | Which SemVer level to bump                                                   | `true`   | `patch`                     |
| push                       | Whether to tag and push to the remote repository                             | `false`  | `false`                     |
| filter                     | Filter for the tag to bump                                                   | `false`  | `false`                     |
| prefix_with_v              | Whether to prefix the version with a "v"                                     | `false`  | `true`                      |
| prerelease_identifier_base | Prerelease Identifier Base (only takes effect with release_type: prerelease) | `false`  |                             |
| commit_hash                | The commit hash to tag                                                       | `false`  |                             |
| commiter_name              | The name of the commiter                                                     | `false`  | `github-actions`            |
| committer_email            | The email of the commiter                                                    | `false`  | `github-actions@github.com` |

## Outputs

| Name           | Description                         | Type    | Example value |
| -------------- | ----------------------------------- | ------- | ------------- |
| old_tag        | Latest tag before bump              | string  | `v0.1.0`      |
| new_tag        | New tag after bump                  | string  | `v0.1.1`      |
| old_tag_semver | Latest semver before bump           | string  | `0.1.0`       |
| new_tag_semver | New semver after bump               | string  | `0.1.1`       |
| draft          | Whether the new tag is a draft      | boolean | `false`       |
| prerelease     | Whether the new tag is a prerelease | boolean | `true`        |
