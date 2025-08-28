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

const BlogPage = () => {
  const [posts] = useState([
    {
      id: 1,
      title: 'Getting Started with Lenat Platform',
      author: 'John Doe',
      category: 'Tutorial',
      status: 'Published',
      publishDate: '2024-01-15',
      views: 1247,
      likes: 89
    },
    {
      id: 2,
      title: 'Advanced Features Guide',
      author: 'Jane Smith',
      category: 'Guide',
      status: 'Draft',
      publishDate: '2024-01-14',
      views: 0,
      likes: 0
    },
    {
      id: 3,
      title: 'Platform Updates - January 2024',
      author: 'Admin Team',
      category: 'News',
      status: 'Published',
      publishDate: '2024-01-10',
      views: 2156,
      likes: 156
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'success'
      case 'Draft':
        return 'warning'
      case 'Archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Tutorial':
        return 'primary'
      case 'Guide':
        return 'info'
      case 'News':
        return 'success'
      default:
        return 'default'
    }
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
                  <TableCell>Author</TableCell>
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
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {post.title.charAt(0)}
                        </Avatar>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {post.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{post.author}</TableCell>
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
