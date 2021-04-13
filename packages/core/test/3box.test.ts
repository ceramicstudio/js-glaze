/* eslint-disable @typescript-eslint/no-unsafe-call */

import fetch from 'cross-fetch'

import { loadLegacy3BoxProfile, getLegacy3BoxProfileAsBasicProfile } from '../src/3box'

jest.mock('cross-fetch')

const TEST_PROFILE = {
  description: 'linktr.ee/xray9876543210',
  proof_did:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE2MDI4NDI1MTQsImlzcyI6ImRpZDozOmJhZnlyZWlicHNuYjZzMnpvcTRibnk1c3hxcmJ4MzVxa2ZpeXNwbG52M3JsY2FqcnZyZWUzMmF6d2lpIn0.38WK012LLCMAe7D3MgYLDCHUTbPePSgy3AWYKmoptFq1nSyuk7L-iIs7V0plnqmfKFEqK6iF6Cs0uu8YPg28Cg',
  collectiblesFavorites: [
    { address: '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0', token_id: '12578' },
    { address: '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0', token_id: '9203' },
    { address: '0x2a46f2ffd99e19a89476e2f62270e0a35bbf0756', token_id: '19878' },
  ],
  image: [
    {
      '@type': 'ImageObject',
      contentUrl: { '/': 'QmXcMwWuhuAyivd2TZNYxpRX72YZ3WrAJKNL7w79tnbeAf' },
    },
  ],
  proof_twitter:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE2MDI1NzU0OTYsInN1YiI6ImRpZDozOmJhZnlyZWlicHNuYjZzMnpvcTRibnk1c3hxcmJ4MzVxa2ZpeXNwbG52M3JsY2FqcnZyZWUzMmF6d2lpIiwiY2xhaW0iOnsidHdpdHRlcl9oYW5kbGUiOiJ4cmF5OTg3NjU0MzIxMCIsInR3aXR0ZXJfcHJvb2YiOiJodHRwczovL3R3aXR0ZXIuY29tL3hyYXk5ODc2NTQzMjEwL3N0YXR1cy8xMzE1OTIzMDgwNzQxNDQ1NjMyIn0sImlzcyI6ImRpZDpodHRwczp2ZXJpZmljYXRpb25zLjNib3guaW8ifQ.8oD95fv-I5fiv12rXI4Y5Si-8EKBCQLjiWb_JYPZ7X0jv41RItIWuP9SYzLIEXr7qdCVdWebS8GygSBxwUac_w',
  name: 'xray',
  memberSince: 'Alpha',
}

describe('3box', () => {
  describe('loadLegacy3BoxProfile', () => {
    test('successful response', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => {
          return Promise.resolve(TEST_PROFILE)
        },
      })
      await expect(loadLegacy3BoxProfile('success')).resolves.toMatchSnapshot()
      expect(fetch).toBeCalledWith('https://ipfs.3box.io/profile?address=success')
    })

    test('error response', async () => {
      fetch.mockResolvedValue({ ok: false })
      await expect(loadLegacy3BoxProfile('error')).resolves.toMatchSnapshot()
      expect(fetch).toBeCalledWith('https://ipfs.3box.io/profile?address=error')
    })

    test('fetch error', async () => {
      fetch.mockRejectedValue(new Error('Failed'))
      await expect(loadLegacy3BoxProfile('failed')).resolves.toMatchSnapshot()
      expect(fetch).toBeCalledWith('https://ipfs.3box.io/profile?address=failed')
    })
  })

  describe('getLegacy3BoxProfileAsBasicProfile', () => {
    test('successful response', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => {
          return Promise.resolve(TEST_PROFILE)
        },
      })
      await expect(getLegacy3BoxProfileAsBasicProfile('')).resolves.toMatchSnapshot()
      expect(fetch).toBeCalledWith('https://ipfs.3box.io/profile?address=success')
    })

    test('error response', async () => {
      fetch.mockResolvedValue({ ok: false })
      await expect(getLegacy3BoxProfileAsBasicProfile('')).resolves.toMatchSnapshot()
      expect(fetch).toBeCalledWith('https://ipfs.3box.io/profile?address=error')
    })

    test('fetch error', async () => {
      fetch.mockRejectedValue(new Error('Failed'))
      await expect(getLegacy3BoxProfileAsBasicProfile('')).resolves.toMatchSnapshot()
      expect(fetch).toBeCalledWith('https://ipfs.3box.io/profile?address=failed')
    })
  })
})
