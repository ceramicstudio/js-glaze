/**
 * @generated SignedSource<<7deb63f743bb4e4cd63e74c4145ca4c8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateNoteInput = {
  clientMutationId?: string | null;
  content: RequiredNoteInput;
};
export type RequiredNoteInput = {
  text: string;
  title: string;
};
export type CreateNoteMutation$variables = {
  input: CreateNoteInput;
};
export type CreateNoteMutation$data = {
  readonly createNote: {
    readonly document: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"DisplayNote">;
    };
  } | null;
};
export type CreateNoteMutation = {
  response: CreateNoteMutation$data;
  variables: CreateNoteMutation$variables;
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
        "concreteType": "CreateNotePayload",
        "kind": "LinkedField",
        "name": "createNote",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Note",
            "kind": "LinkedField",
            "name": "document",
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
        "concreteType": "CreateNotePayload",
        "kind": "LinkedField",
        "name": "createNote",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Note",
            "kind": "LinkedField",
            "name": "document",
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
                "concreteType": "CeramicAccount",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isViewer",
                    "storageKey": null
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
    ]
  },
  "params": {
    "cacheID": "7a5549ac86d3dc7ffc8b8aba35f2c614",
    "id": null,
    "metadata": {},
    "name": "CreateNoteMutation",
    "operationKind": "mutation",
    "text": "mutation CreateNoteMutation(\n  $input: CreateNoteInput!\n) {\n  createNote(input: $input) {\n    document {\n      ...DisplayNote\n      id\n    }\n  }\n}\n\nfragment DisplayNote on Note {\n  ...UpdateNote\n  author {\n    isViewer\n    id\n  }\n  id\n  title\n  text\n}\n\nfragment UpdateNote on Note {\n  id\n  title\n  text\n}\n"
  }
};
})();

(node as any).hash = "43fd31075402ef934ca85e3766a7f5c1";

export default node;
