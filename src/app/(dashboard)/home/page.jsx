'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

// Icon Imports
import { Icon } from '@iconify/react'

// export const metadata = {
//   title: 'Dashboard - Lenat Admin',
//   description: 'Main dashboard for Lenat Admin panel'
// }

const Dashboard = () => {
  const [stats] = useState([
    {
      title: 'Total Users',
      value: '2,847',
      icon: 'tabler-users',
      color: 'primary.main',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Blog Posts',
      value: '156',
      icon: 'tabler-article',
      color: 'success.main',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Content Feeds',
      value: '89',
      icon: 'tabler-rss',
      color: 'info.main',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Marketplace Orders',
      value: '1,234',
      icon: 'tabler-shopping-cart',
      color: 'warning.main',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Trivia Games',
      value: '45',
      icon: 'tabler-gamepad',
      color: 'secondary.main',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Revenue',
      value: '$12,847',
      icon: 'tabler-currency-dollar',
      color: 'success.main',
      change: '+18%',
      changeType: 'positive'
    }
  ])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 600 }}>
        Welcome to Lenat Admin Dashboard
      </Typography>
      
      <Typography variant='body1' sx={{ mb: 4, color: 'text.secondary' }}>
        Manage your platform operations, monitor performance, and oversee all aspects of the Lenat ecosystem.
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${stat.color}15`
                    }}
                  >
                    <Icon icon={stat.icon} style={{ fontSize: 24, color: stat.color }} />
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      color: stat.changeType === 'positive' ? 'success.main' : 'error.main',
                      fontWeight: 600
                    }}
                  >
                    {stat.change}
                  </Typography>
                </Box>
                <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                'New user registration: John Doe',
                'Blog post published: "Getting Started with Lenat"',
                'Marketplace order completed: Order #1234',
                'Trivia game created: "Tech Quiz 2024"',
                'Content feed updated: Daily News'
              ].map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main'
                    }}
                  />
                  <Typography variant='body2'>{activity}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Add New User', icon: 'tabler-user-plus', href: '/users/add' },
                { label: 'Create Blog Post', icon: 'tabler-article', href: '/blog/create' },
                { label: 'Manage Products', icon: 'tabler-package', href: '/marketplace/products' },
                { label: 'Create Trivia Game', icon: 'tabler-gamepad', href: '/trivia/create' },
                { label: 'View Analytics', icon: 'tabler-chart-line', href: '/dashboard/analytics' }
              ].map((action, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Icon icon={action.icon} style={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant='body2'>{action.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
