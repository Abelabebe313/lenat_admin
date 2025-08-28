const verticalMenuData = () => [
  {
    label: 'Dashboard',
    href: '/home',
    icon: 'tabler-dashboard'
  },
  {
    label: 'User Management',
    href: '/users',
    icon: 'tabler-users',
    children: [
      {
        label: 'All Users',
        href: '/users/list',
        icon: 'tabler-user-list'
      },
      {
        label: 'Add User',
        href: '/users/add',
        icon: 'tabler-user-plus'
      },
      {
        label: 'User Roles',
        href: '/users/roles',
        icon: 'tabler-shield'
      }
    ]
  },
  {
    label: 'Blog Posts',
    href: '/blog',
    icon: 'tabler-article',
    children: [
      {
        label: 'All Posts',
        href: '/blog/list',
        icon: 'tabler-list'
      },
      {
        label: 'Create Post',
        href: '/blog/create',
        icon: 'tabler-plus'
      },
      {
        label: 'Categories',
        href: '/blog/categories',
        icon: 'tabler-category'
      }
    ]
  },
  {
    label: 'Content Feeds',
    href: '/feeds',
    icon: 'tabler-rss',
    children: [
      {
        label: 'All Feeds',
        href: '/feeds/list',
        icon: 'tabler-list'
      },
      {
        label: 'Create Feed',
        href: '/feeds/create',
        icon: 'tabler-plus'
      },
      {
        label: 'Feed Analytics',
        href: '/feeds/analytics',
        icon: 'tabler-chart-line'
      }
    ]
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: 'tabler-shopping-cart',
    children: [
      {
        label: 'Products',
        href: '/marketplace/products',
        icon: 'tabler-package'
      },
      {
        label: 'Orders',
        href: '/marketplace/orders',
        icon: 'tabler-receipt'
      },
      {
        label: 'Transactions',
        href: '/marketplace/transactions',
        icon: 'tabler-credit-card'
      }
    ]
  },
  {
    label: 'Trivia Games',
    href: '/trivia',
    icon: 'tabler-gamepad',
    children: [
      {
        label: 'All Games',
        href: '/trivia/games',
        icon: 'tabler-list'
      },
      {
        label: 'Create Game',
        href: '/trivia/create',
        icon: 'tabler-plus'
      },
      {
        label: 'Game Analytics',
        href: '/trivia/analytics',
        icon: 'tabler-chart-pie'
      }
    ]
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'tabler-settings'
  }
]

export default verticalMenuData
