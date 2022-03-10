// This is an auto-gerated file, do not edit manually

import type { GraphModel } from '@glazed/types'

export const graph: GraphModel = {
  index: {
    notePad: {
      id: 'kjzl6cwe1jw145vx6rpgkvhldnuwus2f1knvzh0cajdc88ushiyeashi8j41183',
      schema: 'ceramic://k3y52l7qbv1frydss69u97ms1y6ual60krgzyeyjzlrj9v3t8du2qgt5imutj2vi8',
    },
  },
  lists: {
    NotesListNotes: {
      type: 'reference',
      schemas: ['ceramic://k3y52l7qbv1frylj2z6qnb64m2ee1y31gx0d2kqt89n3okzjit4a3ztac03d8zrb4'],
      owner: 'NotesList',
    },
  },
  objects: {
    NotesList: {
      fields: { notes: { required: false, type: 'list', name: 'NotesListNotes' } },
      parents: null,
    },
    Note: {
      fields: {
        date: {
          type: 'string',
          title: 'date',
          format: 'date-time',
          maxLength: 30,
          required: false,
        },
        text: { type: 'string', title: 'text', maxLength: 4000, required: false },
        title: { type: 'string', title: 'text', maxLength: 100, required: false },
      },
      parents: null,
    },
  },
  referenced: {
    'ceramic://k3y52l7qbv1frydss69u97ms1y6ual60krgzyeyjzlrj9v3t8du2qgt5imutj2vi8': {
      type: 'object',
      name: 'NotesList',
    },
    'ceramic://k3y52l7qbv1frylj2z6qnb64m2ee1y31gx0d2kqt89n3okzjit4a3ztac03d8zrb4': {
      type: 'object',
      name: 'Note',
    },
  },
  references: {
    NotesListNotes: {
      schemas: ['ceramic://k3y52l7qbv1frylj2z6qnb64m2ee1y31gx0d2kqt89n3okzjit4a3ztac03d8zrb4'],
      owner: 'NotesList',
    },
  },
  roots: {
    placeholderNote: {
      id: 'kjzl6cwe1jw14881mfpiggu1ip1wn1c3hi5fq84lmuxelnkge37vzikyd6quqlk',
      schema: 'ceramic://k3y52l7qbv1frylj2z6qnb64m2ee1y31gx0d2kqt89n3okzjit4a3ztac03d8zrb4',
    },
  },
}
