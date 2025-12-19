'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery } from '@apollo/client/react'
import { GET_DASHBOARD_STATS } from '@lib/graphql/queries'

const Dashboard = () => {
  // Fetch dashboard stats
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
    pollInterval: 30000 // Poll every 30 seconds for real-time updates
  })

  // Process data for stats cards
  const stats = useMemo(() => {
    if (!data) return []

    return [
      {
        title: 'Total Users',
        value: data.users_aggregate?.aggregate?.count || 0,
        icon: 'tabler-users',
        color: '#7367F0', // Primary Purple
        bgColor: 'rgba(115, 103, 240, 0.15)',
        desc: 'Registered users'
      },
      {
        title: 'Blog Posts',
        value: data.blog_posts_aggregate?.aggregate?.count || 0,
        icon: 'tabler-article',
        color: '#28C76F', // Success Green
        bgColor: 'rgba(40, 199, 111, 0.15)',
        desc: 'Published articles'
      },
      {
        title: 'Marketplace Orders',
        value: data.marketplace_orders_aggregate?.aggregate?.count || 0,
        icon: 'tabler-shopping-cart',
        color: '#FF9F43', // Warning Orange
        bgColor: 'rgba(255, 159, 67, 0.15)',
        desc: 'Total orders placed'
      },
      {
        title: 'Trivia Games',
        value: data.game_trivia_aggregate?.aggregate?.count || 0,
        icon: 'tabler-gamepad',
        color: '#EA5455', // Error Red
        bgColor: 'rgba(234, 84, 85, 0.15)',
        desc: 'Active games'
      },
      {
        title: 'Appointments',
        value: data.consultant_appointments_aggregate?.aggregate?.count || 0,
        icon: 'tabler-calendar',
        color: '#00CFE8', // Info Cyan
        bgColor: 'rgba(0, 207, 232, 0.15)',
        desc: 'Consultations booked'
      },
      {
        title: 'Products',
        value: data.marketplace_products_aggregate?.aggregate?.count || 0,
        icon: 'tabler-package',
        color: '#A8AAAE', // Secondary Grey
        bgColor: 'rgba(168, 170, 174, 0.15)',
        desc: 'Available items'
      }
    ]
  }, [data])

  // Additional stats
  const extraStats = useMemo(() => {
    if (!data) return []
    return [
      { label: 'Doctors', value: data.profile_doctors_aggregate?.aggregate?.count || 0, icon: 'tabler-stethoscope' },
      { label: 'Patients', value: data.profile_patients_aggregate?.aggregate?.count || 0, icon: 'tabler-user-heart' },
      { label: 'Feed Posts', value: data.feed_posts_aggregate?.aggregate?.count || 0, icon: 'tabler-rss' },
      { label: 'Feed Likes', value: data.feed_likes_aggregate?.aggregate?.count || 0, icon: 'tabler-thumb-up' }
    ]
  }, [data])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>Error loading dashboard data: {error.message}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Welcome back! Here's what's happening in your platform today.
        </Typography>
      </Box>

      {/* Main Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant='h3' sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value.toLocaleString()}
                    </Typography>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: stat.bgColor,
                      color: stat.color
                    }}
                  >
                    <Icon icon={stat.icon} width={28} />
                  </Box>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  {stat.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity / Audit Logs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Recent System Activity
              </Typography>
              <Icon icon='tabler-activity' width={24} color='#A8AAAE' />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data?.audit_logs && data.audit_logs.length > 0 ? (
                data.audit_logs.slice(0, 5).map((log, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 34, height: 34 }}>
                      <Icon icon='tabler-user' width={20} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {log.session_user_name || 'System User'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Performed an action in the system
                      </Typography>
                    </Box>
                    <Typography variant='caption' color='text.disabled'>
                      Just now
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
                  No recent activity logs found.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats & Actions */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Secondary Stats */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Platform Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {extraStats.map((stat, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon icon={stat.icon} width={20} color='#7367F0' />
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                    </Box>
                    {index < extraStats.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 600, color: 'white' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { label: 'Add User', icon: 'tabler-user-plus', href: '/users' },
                  { label: 'New Post', icon: 'tabler-pencil', href: '/blog' },
                  { label: 'Add Product', icon: 'tabler-plus', href: '/marketplace/products' }
                ].map((action, index) => (
                  <Box
                    key={index}
                    component="a"
                    href={action.href}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    <Icon icon={action.icon} width={18} />
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>
                      {action.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
