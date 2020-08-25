import { DoctypeProxy } from '../src/doctypes'

describe('DoctypeProxy', () => {
  test('calls the getRemote function to get the value when the queue is empty', async () => {
    const getRemote = jest.fn(() => Promise.resolve('test'))
    const proxy = new DoctypeProxy(getRemote)
    await expect(proxy.get()).resolves.toBe('test')
    expect(getRemote).toBeCalledTimes(1)
  })

  test('calls the getRemote function to get the first value of the chain', async () => {
    const getRemote = jest.fn(() => Promise.resolve('remote'))
    const mutateFirst = jest.fn(() => Promise.resolve('first'))
    const mutateSecond = jest.fn(() => Promise.resolve('second'))

    const proxy = new DoctypeProxy(getRemote)
    const results = await Promise.all([
      proxy.change(mutateFirst),
      proxy.change(mutateSecond),
      proxy.get()
    ])

    expect(results).toEqual([undefined, undefined, 'second'])
    expect(getRemote).toBeCalledTimes(1)
    expect(mutateFirst).toBeCalledTimes(1)
    expect(mutateFirst).toBeCalledWith('remote')
    expect(mutateSecond).toBeCalledTimes(1)
    expect(mutateSecond).toBeCalledWith('first')
  })

  test('calls the getRemote function before every chain execution', async () => {
    const getRemote = jest.fn(() => Promise.resolve('remote'))
    const mutateFirst = jest.fn(() => Promise.resolve('first'))
    const mutateSecond = jest.fn(() => Promise.resolve('second'))
    const mutateThird = jest.fn(() => Promise.resolve('third'))

    const proxy = new DoctypeProxy(getRemote)

    await Promise.all([proxy.change(mutateFirst), proxy.change(mutateSecond)])
    expect(getRemote).toBeCalledTimes(1)
    expect(mutateFirst).toBeCalledTimes(1)
    expect(mutateFirst).toBeCalledWith('remote')
    expect(mutateSecond).toBeCalledTimes(1)
    expect(mutateSecond).toBeCalledWith('first')

    const results = await Promise.all([proxy.change(mutateThird), proxy.get()])
    expect(results).toEqual([undefined, 'third'])
    expect(getRemote).toBeCalledTimes(2)
    expect(mutateThird).toBeCalledTimes(1)
    expect(mutateThird).toBeCalledWith('remote')

    await expect(proxy.get()).resolves.toBe('remote')
  })

  test('rejects all calls if the getRemote call fails', async () => {
    const error = new Error('failed')
    const getRemote = jest.fn(() => Promise.reject(error))
    const mutateFirst = jest.fn()
    const mutateSecond = jest.fn()

    const proxy = new DoctypeProxy(getRemote)
    // @ts-ignore Promise.allSettled
    const results = await Promise.allSettled([
      proxy.change(mutateFirst),
      proxy.change(mutateSecond),
      proxy.get()
    ])
    for (const res of results) {
      expect(res.status).toBe('rejected')
      expect(res.reason).toBe(error)
    }
  })

  test('skips failed mutations', async () => {
    const error = new Error('failed')
    const getRemote = jest.fn(() => Promise.resolve('remote'))
    const mutateFirst = jest.fn(() => Promise.reject(error))
    const mutateSecond = jest.fn(() => Promise.resolve('second'))

    const proxy = new DoctypeProxy(getRemote)
    // @ts-ignore Promise.allSettled
    const [resFirst, resSecond, resGet] = await Promise.allSettled([
      proxy.change(mutateFirst),
      proxy.change(mutateSecond),
      proxy.get()
    ])

    expect(resFirst.status).toBe('rejected')
    expect(resFirst.reason).toBe(error)

    expect(mutateSecond).toBeCalledTimes(1)
    expect(mutateSecond).toBeCalledWith('remote')
    expect(resSecond.status).toBe('fulfilled')

    expect(resGet.status).toBe('fulfilled')
    expect(resGet.value).toBe('second')
  })

  test('delays get calls until mutations are done', async () => {
    const getRemote = jest.fn(() => Promise.resolve('remote'))
    const mutateFirst = jest.fn(() => Promise.resolve('first'))
    const mutateSecond = jest.fn(() => Promise.resolve('second'))

    const proxy = new DoctypeProxy(getRemote)
    const [value1, _change1, value2, _change2, value3] = await Promise.all([
      proxy.get(),
      proxy.change(mutateFirst),
      proxy.get(),
      proxy.change(mutateSecond),
      proxy.get()
    ])

    expect(getRemote).toBeCalledTimes(2)
    expect(value1).toBe('remote')
    expect(value2).toBe('second')
    expect(value3).toBe('second')
  })
})
