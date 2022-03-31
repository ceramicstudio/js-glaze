export type DefinitionNodeType =
  | 'self' // default
  | 'did'
  | 'streamid'
  | 'any'

export type DefinitionNodeConfig = {
  type: DefinitionNodeType
  optional?: boolean // defaults to `false`
}

export type DefinitionConfig = {
  multiple?: boolean // defaults to `false` = deterministic stream (IDX default)
  to?: DefinitionNodeConfig
  from?: DefinitionNodeConfig
}

function isSelfNodeConfig(config?: DefinitionNodeConfig): boolean {
  return config == null || config.type === 'self'
}

// definition queries/mutations based on config type:
// - if multiple == false or not set, and to and from are "self" or unset -> IDX deterministic get/set
// - if multiple == false or not set

export function getDefinitionAccessPattern(config: DefinitionConfig = {}) {
  const isFromSelf = isSelfNodeConfig(config.from)
  const isToSelf = isSelfNodeConfig(config.to)

  if (config.multiple) {
    if (isFromSelf) {
      if (isToSelf) {
        // Collection list/add/remove with content on stream, ex: posts
      } else {
        // Collection list/add/remove linkTo, edge content based on schema, ex: comments on post
        // Could be optional link - in that case similar to previous logic
      }
    } else if (isToSelf) {
      // Collection of links with specified subject but object is stream content - what use case?
    } else {
      // Collection of links with specified subject and object = "any edge" use-case
    }
  } else if (isFromSelf) {
    if (isToSelf) {
      // Deterministic get/set/remove content == IDX
    } else {
      // Deterministic get/set/remove linkTo, edge content based on schema, ex: account link
    }
  } else if (isToSelf) {
    // Deterministic link with specified subject but object is stream content - what use case?
  } else {
    // Deterministic link with specified subject and object - what use case?
  }
}

type PosterModel = {
  v: 1
  protocols: {
    schemas: {
      BasicProfile: {}
      Post: {}
      EmptySchema: {}
    }
    definitions: {
      basicProfile: {
        // read/write: deterministic/IDX
        schema: '<BasicProfile>'
      }
      post: {
        // read: connection with optional streamID filter (false | string)
        // write: add to connection, optional linkTo param
        schema: '<Post>'
        config: {
          multiple: true
          to: { type: 'streamid'; optional: true } // Can be a reply or original post
        }
      }
      follow: {
        // read: based on DID type, connection from + connection to
        // write: add/remove follow link
        schema: '<EmptySchema>'
        config: {
          multiple: false
          to: { type: 'did' }
        }
      }
    }
  }
}
