import { Command } from '../command'
import Commits from '../commands/stream/commits'

describe('stream:commits', () => {
  // let result: Array<any>
  // beforeEach(() => {
  //   result = []
  //   jest.spyOn(Command.prototype, 'warn').mockImplementation((val) => {
  //     result.push(val)
  //   })
  // })

  // afterEach(() => jest.restoreAllMocks())
  it('should fail.', async () => {
    // const consoleSpy = jest.spyOn(Command.prototype, 'log')
    const consoleSpy = jest.spyOn(process.stdout, 'write')

    await Commits.run(['notAStreamID'])

    expect(consoleSpy).toHaveBeenCalled()
    // await Commits.run(['--help'])
    // expect(result).toContain('Can not')
  })
})
