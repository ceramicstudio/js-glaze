/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { applyMap, promiseMap, compositeDefinitionFromSchema } from '../src'

describe('utils', () => {
  it('applyMap applies the given function to all values in a record', () => {
    const res = applyMap({ one: 1, two: 2 }, (v) => v * 2)
    expect(res).toEqual({ one: 2, two: 4 })
  })

  it('promiseMap applies the given async function to all values in a record', async () => {
    const res = await promiseMap({ one: 1, two: 2 }, (v) => Promise.resolve(v * 2))
    expect(res).toEqual({ one: 2, two: 4 })
  })

  it('compositeDefinitionFromSchema supports @model and @length', () => {
    const compositeDefinition = compositeDefinitionFromSchema(`
    type Profile @model(index: LINK) {
      name: String @length(max: 150)
    }
    `)
    expect(compositeDefinition).toMatchObject(
      {
        "version":"1.0",
        "models": 
          {"Profile":
            {
              "name":"Profile",
              "accountRelation":"link",
              "schema":{
                "name":{
                  "type":"string",
                  "title":"name",
                  "maxLength":150,
                  "minLength":0
                }
              }
            }
          }
        }
    )
  })
})
