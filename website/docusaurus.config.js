module.exports = {
  title: 'Identity Index',
  tagline: 'A standard and library for constructing an identity-centric index of resources',
  url: 'https://ceramicstudio.github.io',
  baseUrl: '/js-idx/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'ceramicstudio',
  projectName: 'js-idx',
  themeConfig: {
    navbar: {
      title: 'IDX',
      logo: {
        alt: 'Identity Index Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/idx-introduction',
          activeBasePath: 'docs/idx',
          label: 'Specification',
          position: 'left',
        },
        {
          to: 'docs/lib-getting-started',
          activeBasePath: 'docs/lib',
          label: 'Library',
          position: 'left',
        },
        {
          href: 'https://github.com/ceramicstudio/js-idx',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Specification',
              to: 'docs/idx-introduction',
            },
            {
              label: 'Library',
              to: 'docs/lib-getting-started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            // {
            //   label: 'Discord',
            //   href: 'https://discordapp.com/invite/docusaurus',
            // },
            {
              label: 'Twitter',
              href: 'https://twitter.com/identityindex',
            },
          ],
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
              href: 'https://github.com/ceramicstudio/js-idx',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ceramic Studio.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/ceramicstudio/js-idx/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
