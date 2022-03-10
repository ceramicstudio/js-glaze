/**
 * @generated SignedSource<<3e0de1ba1e8b332aedceb31401f2c959>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AccountNotesPageQuery$variables = {
  did: string;
};
export type AccountNotesPageQuery$data = {
  readonly account: {
    readonly store: {
      readonly notePad: {
        readonly " $fragmentSpreads": FragmentRefs<"NotesList_notesList">;
      } | null;
    } | null;
  };
};
export type AccountNotesPageQuery = {
  variables: AccountNotesPageQuery$variables;
  response: AccountNotesPageQuery$data;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "did"
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
    "kind": "Literal",
    "name": "last",
    "value": 20
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AccountNotesPageQuery",
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AccountNotesPageQuery",
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
                    "args": (v2/*: any*/),
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
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "title",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "__typename",
                                "storageKey": null
                              }
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
                    "args": (v2/*: any*/),
                    "filters": null,
                    "handle": "connection",
                    "key": "NotesList__notesConnection",
                    "kind": "LinkedHandle",
                    "name": "notesConnection"
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "72e2ee4ea19d961cd50bdab7ce03ec8d",
    "id": null,
    "metadata": {},
    "name": "AccountNotesPageQuery",
    "operationKind": "query",
    "text": "query AccountNotesPageQuery(\n  $did: ID!\n) {\n  account(id: $did) {\n    store {\n      notePad {\n        ...NotesList_notesList\n        id\n      }\n    }\n    id\n  }\n}\n\nfragment NotesList_notesList on NotesList {\n  notesConnection(last: 20) {\n    edges {\n      cursor\n      node {\n        id\n        title\n        __typename\n      }\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n  id\n}\n"
  }
};
})();

(node as any).hash = "916965161768c0c98b39600903bca2a6";

export default node;
