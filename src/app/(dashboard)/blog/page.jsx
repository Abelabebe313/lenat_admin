'use client'

// React Imports
import { useState, useMemo } from 'react'

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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery } from '@apollo/client/react'
import { GET_BLOG_POSTS } from '@lib/graphql/queries'

const BlogPage = () => {
  // GraphQL query to fetch blog posts
  const { data, loading, error } = useQuery(GET_BLOG_POSTS)

  // Transform GraphQL data to match our UI structure
  const posts = useMemo(() => {
    if (!data?.blog_posts) return []
    
    return data.blog_posts.map(post => ({
      id: post.id,
      title: post.title || `Blog Post ${post.id.slice(0, 8)}`,
      author: 'Unknown Author', // Not available in API response
      category: post.type || 'General',
      status: post.state === 'Accepted' ? 'Published' : post.state,
      publishDate: new Date(post.updated_at).toLocaleDateString(),
      views: Math.floor(Math.random() * 1000), // Mock data since not in API
      likes: Math.floor(Math.random() * 100), // Mock data since not in API
      media: post.media,
      updatedAt: post.updated_at,
      type: post.type,
      state: post.state,
      status: post.status
    }))
  }, [data])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
      case 'Accepted':
        return 'success'
      case 'Draft':
      case 'Pending':
        return 'warning'
      case 'Archived':
      case 'Rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Baby':
        return 'primary'
      case 'Tutorial':
        return 'info'
      case 'Guide':
        return 'secondary'
      case 'News':
        return 'success'
      case 'General':
        return 'default'
      default:
        return 'default'
    }
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          Error loading blog posts: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Blog Post Management
        </Typography>
        <Button variant='contained' startIcon={<Icon icon='tabler-plus' />}>
          Create New Post
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
                  <Icon icon='tabler-article' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {posts.length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Posts
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
                  <Icon icon='tabler-eye' style={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Views
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
                  <Icon icon='tabler-heart' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {posts.reduce((sum, post) => sum + post.likes, 0)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Likes
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
                  <Icon icon='tabler-category' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {new Set(posts.map(post => post.category)).size}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Categories
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            Blog Posts
          </Typography>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Publish Date</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Likes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {post.media?.url ? (
                          <Avatar 
                            src={post.media.url} 
                            alt={post.title}
                            sx={{ width: 32, height: 32 }}
                            variant="rounded"
                          />
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {post.title.charAt(0)}
                          </Avatar>
                        )}
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {post.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={post.category} 
                        color={getCategoryColor(post.category)} 
                        size='small' 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={post.status} 
                        color={getStatusColor(post.status)} 
                        size='small' 
                      />
                    </TableCell>
                    <TableCell>{post.publishDate}</TableCell>
                    <TableCell>{post.views.toLocaleString()}</TableCell>
                    <TableCell>{post.likes}</TableCell>
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
    </Box>
  )
}

export default BlogPage
