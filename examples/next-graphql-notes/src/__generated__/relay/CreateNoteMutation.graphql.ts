/**
 * @generated SignedSource<<da98da78e3320ecd455e5b631aaf8723>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AddNotePadNotesListNotesEdgeInput = {
  content: NoteInput;
  clientMutationId?: string | null;
};
export type NoteInput = {
  date?: string | null;
  text?: string | null;
  title?: string | null;
};
export type CreateNoteMutation$variables = {
  input: AddNotePadNotesListNotesEdgeInput;
};
export type CreateNoteMutation$data = {
  readonly addNotePadNotesListNotesEdge: {
    readonly edge: {
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"DisplayNote">;
      } | null;
    };
  } | null;
};
export type CreateNoteMutation = {
  variables: CreateNoteMutation$variables;
  response: CreateNoteMutation$data;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
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
    "name": "CreateNoteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddNotePadNotesListNotesEdgePayload",
        "kind": "LinkedField",
        "name": "addNotePadNotesListNotesEdge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "NoteEdge",
            "kind": "LinkedField",
            "name": "edge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Note",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DisplayNote"
                  },
                  (v2/*: any*/)
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
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CreateNoteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddNotePadNotesListNotesEdgePayload",
        "kind": "LinkedField",
        "name": "addNotePadNotesListNotesEdge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "NoteEdge",
            "kind": "LinkedField",
            "name": "edge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Note",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
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
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1743540a62403988713f10e30302ea8c",
    "id": null,
    "metadata": {},
    "name": "CreateNoteMutation",
    "operationKind": "mutation",
    "text": "mutation CreateNoteMutation(\n  $input: AddNotePadNotesListNotesEdgeInput!\n) {\n  addNotePadNotesListNotesEdge(input: $input) {\n    edge {\n      node {\n        ...DisplayNote\n        id\n      }\n    }\n  }\n}\n\nfragment DisplayNote on Note {\n  ...UpdateNote\n  _ceramic {\n    viewerIsController\n  }\n  id\n  title\n  text\n}\n\nfragment UpdateNote on Note {\n  id\n  title\n  text\n}\n"
  }
};
})();

(node as any).hash = "13d57f316683ec083b8e2f50826b2023";

export default node;
