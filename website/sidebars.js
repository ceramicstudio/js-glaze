module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'idx-welcome' // Home
    },
    {
      type: 'doc',
      id: 'idx-components' // IDX Components
    },
    {
      type: 'category',
      label: 'Basic Concepts',
      items: [
        'core-concepts-dids',
        'core-concepts-index',
        'core-concepts-definitions',
        'core-concepts-references',
        'core-concepts-schemas',
        'core-concepts-ceramic'
      ]
    },
    {
      type: 'category',
      label: 'API Reference',
      items: ['libs-getting-started', 'libs-types', 'libs-tools', 'libs-idx', 'libs-web']
    },
    {
      type: 'category',
      label: 'Guides',
      items: ['guide-cli', 'guide-public-data', 'guide-authentication', 'guide-definitions']
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: ['tutorial-build-a-simple-notes-app']
    },
    {
      type: 'category',
      label: 'Community',
      items: [
        {
          type: 'link',
          label: 'Discord', // string - the label that should be displayed.
          href: 'https://chat.idx.xyz' // string - the target URL.
        },
        {
          type: 'link',
          label: 'Github', // string - the label that should be displayed.
          href: 'https://github.com/ceramicstudio/js-idx' // string - the target URL.
        },
        {
          type: 'link',
          label: 'Twitter', // string - the label that should be displayed.
          href: 'https://twitter.com/identityindex' // string - the target URL.
        }
      ]
    }
  ]
}
