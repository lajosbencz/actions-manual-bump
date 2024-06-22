import { latest, bump } from '../src/tag'

describe('tag.js', () => {
  describe('latest()', () => {
    it('return nothing', () => {
      expect(latest([])).toBeNull()
    })

    it('return the latest tag', () => {
      expect(latest(['0.1.0', '0.2.0', '1.0.0', '0.1.2'])).toBe('1.0.0')
      expect(latest(['0.1.0', '0.2.0', 'v1.0.0', '0.1.2'])).toBe('v1.0.0')
      expect(latest(['v0.1.0', '0.2.0', '1.0.0', 'v0.1.2'])).toBe('1.0.0')
    })
  })

  describe('bump()', () => {
    it('bump a tag to a new version', () => {
      expect(bump('0.0.0', 'patch')).toBe('0.0.1')
      expect(bump('0.0.0', 'minor')).toBe('0.1.0')
      expect(bump('0.0.0', 'major')).toBe('1.0.0')
      expect(bump('0.1.0', 'patch')).toBe('0.1.1')
      expect(bump('0.1.0', 'minor')).toBe('0.2.0')
      expect(bump('0.1.0', 'major')).toBe('1.0.0')
      expect(bump('0.1.0', 'prepatch')).toBe('0.1.1-0')
      expect(bump('0.1.0-0', 'prepatch')).toBe('0.1.1-0')
      expect(bump('0.1.1-1', 'preminor')).toBe('0.2.0-0')
      expect(bump('0.2.0-3', 'prepatch')).toBe('0.2.1-0')
      expect(bump('0.1.0', 'premajor')).toBe('1.0.0-0')
      expect(bump('1.0.0-0', 'premajor')).toBe('2.0.0-0')
      expect(bump('0.0.0', 'prerelease', 'alpha')).toBe('0.0.1-alpha.0')
      expect(bump('0.1.0', 'prerelease', 'alpha')).toBe('0.1.1-alpha.0')
      expect(bump('0.1.1-alpha.0', 'prerelease', 'alpha')).toBe('0.1.1-alpha.1')
      expect(bump('0.1.0', 'prerelease', 'beta')).toBe('0.1.1-beta.0')
      expect(bump('0.1.1-beta.3', 'prerelease', 'beta')).toBe('0.1.1-beta.4')
    })
  })
})
