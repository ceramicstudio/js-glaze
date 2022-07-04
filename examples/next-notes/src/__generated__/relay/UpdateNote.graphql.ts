/**
 * @generated SignedSource<<91c642b1a8f95478852a5c95df356096>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateNote$data = {
  readonly id: string;
  readonly text: string;
  readonly title: string;
  readonly " $fragmentType": "UpdateNote";
};
export type UpdateNote$key = {
  readonly " $data"?: UpdateNote$data;
  readonly " $fragmentSpreads": FragmentRefs<"UpdateNote">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UpdateNote",
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
    }
  ],
  "type": "Note",
  "abstractKey": null
};

(node as any).hash = "0d92e6ef8054eecb4a750f55ec387dd3";

export default node;
