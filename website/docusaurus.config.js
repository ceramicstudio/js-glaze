module.exports = {
  title: 'IDX - Build with Open Identity',
  url: 'https://idx.xyz',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.png',
  organizationName: 'ceramicstudio',
  projectName: 'js-idx',
  themeConfig: {
    algolia: {
      apiKey: '3c3073cbb52b20e3ede88100fbace482',
      indexName: 'idx',
      searchParameters: { facetFilters: ['version:current'] }
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false
    },
    image: 'img/idx_opengraph.png',
    sidebarCollapsible: true,
    navbar: {
      hideOnScroll: false,
      logo: {
        alt: 'IDX',
        src:
          'https://uploads-ssl.webflow.com/5e4b58d7f08158ece0209bbd/5fb488ba847afb916a7d0874_idxdevs.png'
      },
      items: [
        {
          className: 'navbar-icon navbar-discord',
          href: 'https://chat.idx.xyz',
          position: 'right'
        },
        {
          className: 'navbar-icon navbar-github',
          href: 'https://github.com/ceramicstudio/js-idx',
          position: 'right'
        }
      ]
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/ceramicstudio/js-idx/edit/master/website/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}
