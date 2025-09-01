'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'

// Icon Imports
import { Icon } from '@iconify/react'

const FeedsPage = () => {
  const [feeds] = useState([
    {
      id: 1,
      name: 'Daily News Feed',
      type: 'RSS',
      status: 'Active',
      source: 'news.example.com',
      lastUpdate: '2024-01-15 10:30',
      items: 45,
      subscribers: 1234
    },
    {
      id: 2,
      name: 'Tech Updates',
      type: 'API',
      status: 'Active',
      source: 'api.tech.com',
      lastUpdate: '2024-01-15 09:15',
      items: 23,
      subscribers: 856
    },
    {
      id: 3,
      name: 'Sports Highlights',
      type: 'RSS',
      status: 'Paused',
      source: 'sports.example.com',
      lastUpdate: '2024-01-14 18:45',
      items: 67,
      subscribers: 2100
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Published':
        return 'success'
      case 'Paused':
      case 'Draft':
        return 'warning'
      case 'Error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'RSS':
        return 'primary'
      case 'API':
        return 'info'
      case 'Manual':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const totalFeeds = feeds.length
  const activeFeeds = feeds.filter(feed => feed.status === 'Active').length
  const totalItems = feeds.reduce((sum, feed) => sum + feed.items, 0)
  const totalSubscribers = feeds.reduce((sum, feed) => sum + feed.subscribers, 0)

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Content Feed Management
        </Typography>
        <Button variant='contained' startIcon={<Icon icon='tabler-plus' />}>
          Create New Feed
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.15'
                  }}
                >
                  <Icon icon='tabler-rss' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalFeeds}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Feeds
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'success.15'
                  }}
                >
                  <Icon icon='tabler-check-circle' style={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {activeFeeds}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Active Feeds
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'warning.15'
                  }}
                >
                  <Icon icon='tabler-file-text' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalItems}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'info.15'
                  }}
                >
                  <Icon icon='tabler-users' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalSubscribers.toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Subscribers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Content Feeds
              </Typography>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Feed Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Last Update</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeds.map((feed) => (
                      <TableRow key={feed.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {feed.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {feed.name}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {feed.items} items • {feed.subscribers} subscribers
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={feed.type} 
                            color={getTypeColor(feed.type)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={feed.status} 
                            color={getStatusColor(feed.status)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
                            {feed.source}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
                            {feed.lastUpdate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size='small' color='primary'>
                            <Icon icon='tabler-edit' />
                          </IconButton>
                          <IconButton size='small' color='info'>
                            <Icon icon='tabler-eye' />
                          </IconButton>
                          <IconButton size='small' color='error'>
                            <Icon icon='tabler-trash' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
    </Box>
  )
}

export default FeedsPage
