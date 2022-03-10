/**
 * @generated SignedSource<<efe04fb01e04153ca1e0552c243c8426>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotePageQuery$variables = {
  did: string;
  id: string;
};
export type NotePageQuery$data = {
  readonly account: {
    readonly store: {
      readonly notePad: {
        readonly " $fragmentSpreads": FragmentRefs<"NotesList_notesList">;
      } | null;
    } | null;
  };
  readonly note: {
    readonly " $fragmentSpreads": FragmentRefs<"DisplayNote">;
  } | null;
};
export type NotePageQuery = {
  variables: NotePageQuery$variables;
  response: NotePageQuery$data;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "did"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "did"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = [
  {
    "kind": "Literal",
    "name": "last",
    "value": 20
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotePageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DID",
        "kind": "LinkedField",
        "name": "account",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DataStore",
            "kind": "LinkedField",
            "name": "store",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotesList",
                "kind": "LinkedField",
                "name": "notePad",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "NotesList_notesList"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": "note",
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "DisplayNote"
              }
            ],
            "type": "Note",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotePageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DID",
        "kind": "LinkedField",
        "name": "account",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DataStore",
            "kind": "LinkedField",
            "name": "store",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotesList",
                "kind": "LinkedField",
                "name": "notePad",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": "NoteConnection",
                    "kind": "LinkedField",
                    "name": "notesConnection",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "NoteEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "cursor",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Note",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v4/*: any*/),
                              (v5/*: any*/),
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PageInfo",
                        "kind": "LinkedField",
                        "name": "pageInfo",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "hasPreviousPage",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "startCursor",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "notesConnection(last:20)"
                  },
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "filters": null,
                    "handle": "connection",
                    "key": "NotesList__notesConnection",
                    "kind": "LinkedHandle",
                    "name": "notesConnection"
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "note",
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "text",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CeramicMetadata",
                "kind": "LinkedField",
                "name": "_ceramic",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerIsController",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Note",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9323ab9c402e4d4d588873a9c6727b9a",
    "id": null,
    "metadata": {},
    "name": "NotePageQuery",
    "operationKind": "query",
    "text": "query NotePageQuery(\n  $did: ID!\n  $id: ID!\n) {\n  account(id: $did) {\n    store {\n      notePad {\n        ...NotesList_notesList\n        id\n      }\n    }\n    id\n  }\n  note: node(id: $id) {\n    __typename\n    ... on Note {\n      ...DisplayNote\n    }\n    id\n  }\n}\n\nfragment DisplayNote on Note {\n  ...UpdateNote\n  _ceramic {\n    viewerIsController\n  }\n  id\n  title\n  text\n}\n\nfragment NotesList_notesList on NotesList {\n  notesConnection(last: 20) {\n    edges {\n      cursor\n      node {\n        id\n        title\n        __typename\n      }\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n  id\n}\n\nfragment UpdateNote on Note {\n  id\n  title\n  text\n}\n"
  }
};
})();

(node as any).hash = "7256173481aac2a18b11bec074c969f3";

export default node;
