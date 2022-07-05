/**
 * @generated SignedSource<<0e1a073cd2652d0afdfa45f0c3d99761>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DisplayNote$data = {
  readonly author: {
    readonly isViewer: boolean;
  };
  readonly id: string;
  readonly text: string;
  readonly title: string;
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

(node as any).hash = "6072b79d7d774034051f17451068c60c";

export default node;
