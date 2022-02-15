/**
 * @jest-environment glaze
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */

import type { CeramicApi } from '@ceramicnetwork/common'
import { jest } from '@jest/globals'

import { ModelManager, deployEncodedModel } from '../src'

declare global {
  const ceramic: CeramicApi
}

describe('datamodel', () => {
  jest.setTimeout(20000)

  test('deploy encoded model', async () => {
    const encodedModel = {
      schemas: {
        kjzl6cwe1jw146mi4smwraxjypxq5d1qwq9iei4yydyxf6jwna1d8wouohto87e: {
          alias: 'Note',
          commits: [
            {
              jws: {
                payload: 'AXESIKiye0AVOuPrc8DMbos2QCqi4AZovd6PfkRRry7xqynW',
                signatures: [
                  {
                    signature:
                      'fjs2dgtTkJ59rHxIigfdnGPEVsDn_tFjT0uM_05vgUcs6_UsZVH7GZff3ylLT21Crd6qG_FqLPCfuhCzblyHDA',
                    protected:
                      'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2lUQnoxeW11ZXBBUTRIRUhZU0YxSDhxdUc1R0xWVlFSM2RqZFgzbURvb1dwI3o2TWtpVEJ6MXltdWVwQVE0SEVIWVNGMUg4cXVHNUdMVlZRUjNkamRYM21Eb29XcCJ9',
                  },
                ],
                link: 'bafyreifiwj5uafj24pvxhqgmn2ftmqbkulqam2f532hx4rcrv4xpdkzj2y',
              },
              linkedBlock:
                'omRkYXRhpWR0eXBlZm9iamVjdGV0aXRsZWROb3RlZyRzY2hlbWF4J2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI2hyZXF1aXJlZIBqcHJvcGVydGllc6JkZGF0ZaRkdHlwZWZzdHJpbmdldGl0bGVkZGF0ZWZmb3JtYXRpZGF0ZS10aW1laW1heExlbmd0aBgeZHRleHSjZHR5cGVmc3RyaW5nZXRpdGxlZHRleHRpbWF4TGVuZ3RoGQ+gZmhlYWRlcqJmdW5pcXVlcGNWazlHSkIxejZzU3JYOHJrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtpVEJ6MXltdWVwQVE0SEVIWVNGMUg4cXVHNUdMVlZRUjNkamRYM21Eb29XcA==',
            },
          ],
          dependencies: {},
          version: 'k3y52l7qbv1frxr40y3mwy5qlywfty4sfcqrmv4zckjcdnylk5jdq7cgq66r0acjk',
        },
        kjzl6cwe1jw149knipvwi8blih9n07be1f82wlps0qe4pjgq8qlpjgm4ppgi87v: {
          alias: 'NotesList',
          commits: [
            {
              jws: {
                payload: 'AXESIFk6k_JCPGisehqBXwSKS-15EqsrM_q6fv_BgzBUQqFg',
                signatures: [
                  {
                    signature:
                      'GtCSPTsh-Q2aF-cdDegEseH59fIgOT10DnZyzoG6usbxq41cHGTQGK4_pfwS1W97xntjbQ-IU8pC7J6nd4loDQ',
                    protected:
                      'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2lUQnoxeW11ZXBBUTRIRUhZU0YxSDhxdUc1R0xWVlFSM2RqZFgzbURvb1dwI3o2TWtpVEJ6MXltdWVwQVE0SEVIWVNGMUg4cXVHNUdMVlZRUjNkamRYM21Eb29XcCJ9',
                  },
                ],
                link: 'bafyreiczhkj7eqr4ncwhugubl4cius7npejkwkzt7k5h576bqmyfiqvbma',
              },
              linkedBlock:
                'omRkYXRhpWR0eXBlZm9iamVjdGV0aXRsZWlOb3Rlc0xpc3RnJHNjaGVtYXgnaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjaHJlcXVpcmVkgGpwcm9wZXJ0aWVzoWVub3Rlc6NkdHlwZWVhcnJheWVpdGVtc6RkdHlwZWZvYmplY3RldGl0bGVoTm90ZUl0ZW1ocmVxdWlyZWSAanByb3BlcnRpZXOiYmlkomR0eXBlZnN0cmluZ2gkY29tbWVudHhVY2lwODg6cmVmOmNlcmFtaWM6Ly9rM3k1Mmw3cWJ2MWZyeHI0MHkzbXd5NXFseXdmdHk0c2ZjcXJtdjR6Y2tqY2RueWxrNWpkcTdjZ3E2NnIwYWNqa2V0aXRsZaNkdHlwZWZzdHJpbmdldGl0bGVldGl0bGVpbWF4TGVuZ3RoGGRldGl0bGVlbm90ZXNmaGVhZGVyomZ1bmlxdWVwWGNPR3U1N2R6b08wZVd4Smtjb250cm9sbGVyc4F4OGRpZDprZXk6ejZNa2lUQnoxeW11ZXBBUTRIRUhZU0YxSDhxdUc1R0xWVlFSM2RqZFgzbURvb1dw',
            },
          ],
          dependencies: {
            'notes.id': ['kjzl6cwe1jw146mi4smwraxjypxq5d1qwq9iei4yydyxf6jwna1d8wouohto87e'],
          },
          version: 'k3y52l7qbv1fryc2v942v5n6gzesjlg0zu49gnufb97ohhmeym56dme5dit1dmfwg',
        },
      },
      definitions: {
        kjzl6cwe1jw145d00g4tuhpps6ozv30hb30cnlaevxmhy8hqbo2x8w58bupuhua: {
          alias: 'myNotes',
          commits: [
            {
              jws: {
                payload: 'AXESICreMVjrLh2HUVYljVDC1EXuQCwkx8sh47ndOmpaLY5K',
                signatures: [
                  {
                    signature:
                      '6gHBHJrAsmbQipRtXR0yQXhssKIuiHG2TisR443NkIsXqtbMrFu7IodxGhJAz_SdZYimgfomqgOr_Hrq2IKJBg',
                    protected:
                      'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2lUQnoxeW11ZXBBUTRIRUhZU0YxSDhxdUc1R0xWVlFSM2RqZFgzbURvb1dwI3o2TWtpVEJ6MXltdWVwQVE0SEVIWVNGMUg4cXVHNUdMVlZRUjNkamRYM21Eb29XcCJ9',
                  },
                ],
                link: 'bafyreibk3yyvr2zodwdvcvrfrvimfvcf5zacyjghzmq6hoo5hjvfulmoji',
              },
              linkedBlock:
                'omRkYXRho2RuYW1lZW5vdGVzZnNjaGVtYXhLY2VyYW1pYzovL2szeTUybDdxYnYxZnJ5YzJ2OTQydjVuNmd6ZXNqbGcwenU0OWdudWZiOTdvaGhtZXltNTZkbWU1ZGl0MWRtZndna2Rlc2NyaXB0aW9uaE15IG5vdGVzZmhlYWRlcqNmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnkxZnA0czBud2RhcmgwdmFodXNhcnBwb3NnZXZ5MHBlbWl5a3ltZDJvcmQ2c3d0aGFyY3dmdW5pcXVlcFZmSUd1SkIrYkNFbjJEL25rY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtpVEJ6MXltdWVwQVE0SEVIWVNGMUg4cXVHNUdMVlZRUjNkamRYM21Eb29XcA==',
            },
          ],
          schema: 'kjzl6cwe1jw149knipvwi8blih9n07be1f82wlps0qe4pjgq8qlpjgm4ppgi87v',
          version: 'k3y52l7qbv1frxi4g36qc8tyvcflr11ff2tehzre1v33znge36z8sf8l78afsuvb4',
        },
      },
      tiles: {},
    }
    await expect(deployEncodedModel(ceramic, encodedModel)).resolves.toMatchSnapshot()
  })

  test('creation flow', async () => {
    const manager = new ModelManager({ ceramic })

    const noteSchemaID = await manager.createSchema('Note', {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Note',
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date-time',
          title: 'date',
          maxLength: 30,
        },
        text: {
          type: 'string',
          title: 'text',
          maxLength: 4000,
        },
      },
      required: [],
    } as any)
    const notesListSchemaID = await manager.createSchema('NotesList', {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'NotesList',
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          title: 'notes',
          items: {
            type: 'object',
            title: 'NoteItem',
            properties: {
              id: {
                $comment: `cip88:ref:${manager.getSchemaURL(noteSchemaID) as string}`,
                type: 'string',
              },
              title: {
                type: 'string',
                title: 'title',
                maxLength: 100,
              },
            },
            required: [],
          },
        },
      },
      required: [],
    } as any)
    expect(manager.schemas).toEqual(['Note', 'NotesList'])

    await manager.createDefinition('myNotes', {
      name: 'notes',
      description: 'My notes',
      schema: manager.getSchemaURL(notesListSchemaID) as string,
    })
    expect(manager.definitions).toEqual(['myNotes'])

    expect(manager.toJSON()).toBeDefined()
  })
})
