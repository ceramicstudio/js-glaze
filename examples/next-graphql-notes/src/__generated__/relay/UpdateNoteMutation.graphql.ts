/**
 * @generated SignedSource<<5b8aeaeb275ca51bcc8b939c9fe060ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateNoteInput = {
  id: string;
  content: NoteInput;
  clientMutationId?: string | null;
};
export type NoteInput = {
  date?: string | null;
  text?: string | null;
  title?: string | null;
};
export type UpdateNoteMutation$variables = {
  input: UpdateNoteInput;
};
export type UpdateNoteMutation$data = {
  readonly updateNote: {
    readonly node: {
      readonly " $fragmentSpreads": FragmentRefs<"DisplayNote">;
    };
  } | null;
};
export type UpdateNoteMutation = {
  variables: UpdateNoteMutation$variables;
  response: UpdateNoteMutation$data;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UpdateNoteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateNotePayload",
        "kind": "LinkedField",
        "name": "updateNote",
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
    "name": "UpdateNoteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateNotePayload",
        "kind": "LinkedField",
        "name": "updateNote",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
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
    ]
  },
  "params": {
    "cacheID": "de9754e392ec28bdc4252bdaa3e8fd71",
    "id": null,
    "metadata": {},
    "name": "UpdateNoteMutation",
    "operationKind": "mutation",
    "text": "mutation UpdateNoteMutation(\n  $input: UpdateNoteInput!\n) {\n  updateNote(input: $input) {\n    node {\n      ...DisplayNote\n      id\n    }\n  }\n}\n\nfragment DisplayNote on Note {\n  ...UpdateNote\n  _ceramic {\n    viewerIsController\n  }\n  id\n  title\n  text\n}\n\nfragment UpdateNote on Note {\n  id\n  title\n  text\n}\n"
  }
};
})();

(node as any).hash = "a19c21848b6733df7bcbac5b3a6e81c2";

export default node;
