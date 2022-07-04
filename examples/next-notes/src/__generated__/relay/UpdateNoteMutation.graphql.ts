/**
 * @generated SignedSource<<2c9576b920e4e7c7d26dec59231e8bc6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateNoteInput = {
  clientMutationId?: string | null;
  content: NoteInput;
  id: string;
  options?: UpdateOptionsInput | null;
};
export type NoteInput = {
  text?: string | null;
  title?: string | null;
};
export type UpdateOptionsInput = {
  replace?: boolean | null;
  version?: any | null;
};
export type UpdateNoteMutation$variables = {
  input: UpdateNoteInput;
};
export type UpdateNoteMutation$data = {
  readonly updateNote: {
    readonly document: {
      readonly " $fragmentSpreads": FragmentRefs<"DisplayNote">;
    };
  } | null;
};
export type UpdateNoteMutation = {
  response: UpdateNoteMutation$data;
  variables: UpdateNoteMutation$variables;
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
            "name": "document",
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
    "cacheID": "27f8a559e664c36571f92c8654bad0e7",
    "id": null,
    "metadata": {},
    "name": "UpdateNoteMutation",
    "operationKind": "mutation",
    "text": "mutation UpdateNoteMutation(\n  $input: UpdateNoteInput!\n) {\n  updateNote(input: $input) {\n    document {\n      ...DisplayNote\n      id\n    }\n  }\n}\n\nfragment DisplayNote on Note {\n  ...UpdateNote\n  author {\n    isViewer\n    id\n  }\n  id\n  title\n  text\n}\n\nfragment UpdateNote on Note {\n  id\n  title\n  text\n}\n"
  }
};
})();

(node as any).hash = "3f6899a06f3a1740cb3aa4a43e277316";

export default node;
