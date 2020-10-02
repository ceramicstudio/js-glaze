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
      searchParameters: { facetFilters: ['type:lvl2', 'version:current'] }
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false
    },
    image: 'img/idx_opengraph.png',
    navbar: {
      hideOnScroll: true,
      logo: {
        alt: 'IDX',
        src: '/img/logo_idx.png'
      },
      items: [
        {
          to: 'docs/libs-getting-started',
          activeBasePath: 'docs/libs',
          label: 'Libraries',
          position: 'left'
        },
        {
          to: 'docs/guide-authentication',
          activeBasePath: 'docs/guide',
          label: 'Guides',
          position: 'left'
        },
        {
          href: 'https://discord.gg/ZXR5eT8',
          label: 'Discord',
          position: 'right'
        },
        {
          href: 'https://github.com/ceramicstudio/js-idx',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs'
            },
            {
              label: 'Libraries',
              to: 'docs/libs-getting-started'
            },
            {
              label: 'Guides',
              to: 'docs/guide-authentication'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/ZXR5eT8'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/identityindex'
            }
          ]
        },
        {
          title: 'More',
          items: [
            // {
            //   label: 'Blog',
            //   to: 'blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/ceramicstudio/js-idx'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ceramic Studio.`
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
