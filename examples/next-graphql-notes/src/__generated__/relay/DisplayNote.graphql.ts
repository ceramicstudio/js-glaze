/**
 * @generated SignedSource<<a24f41224300597e121ae100c9c0efbc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DisplayNote$data = {
  readonly _ceramic: {
    readonly viewerIsController: boolean;
  };
  readonly id: string;
  readonly title: string | null;
  readonly text: string | null;
  readonly " $fragmentSpreads": FragmentRefs<"UpdateNote">;
  readonly " $fragmentType": "DisplayNote";
};
export type DisplayNote$key = {
  readonly " $data"?: DisplayNote$data;
  readonly " $fragmentSpreads": FragmentRefs<"DisplayNote">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DisplayNote",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UpdateNote"
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
    },
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
    }
  ],
  "type": "Note",
  "abstractKey": null
};

(node as any).hash = "9bcd24e0fb74ed4e8c3e55408fdaac59";

export default node;
