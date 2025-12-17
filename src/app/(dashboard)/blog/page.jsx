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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import { GET_BLOG_POSTS, GET_STORAGE_BLOG_POST_URL } from '@lib/graphql/queries'
import { CREATE_ONE_BLOG_POST, DELETE_BLOG_POST } from '@lib/graphql/mutations'

// Component Imports
import BlogUploadModal from '@components/blog/BlogUploadModal'

// Context Imports
import { useAuth } from '@contexts/AuthContext'

const BlogPage = () => {
  // Auth context
  const { user } = useAuth()
  
  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, postId: null, postTitle: '' })

  // Image preview state
  const [imagePreview, setImagePreview] = useState({ open: false, imageUrl: null, imageName: '' })

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // GraphQL query to fetch blog posts
  const { data, loading, error, refetch } = useQuery(GET_BLOG_POSTS)

  // Mutation to create blog post
  const [createBlogPost] = useMutation(CREATE_ONE_BLOG_POST)

  // Mutation to delete blog post
  const [deleteBlogPost, { loading: deleting }] = useMutation(DELETE_BLOG_POST, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Blog post deleted successfully!', severity: 'success' })
      setDeleteDialog({ open: false, postId: null, postTitle: '' })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting blog post: ${error.message}`, severity: 'error' })
      setDeleteDialog({ open: false, postId: null, postTitle: '' })
    }
  })

  // Lazy query to get presigned URL
  const [getStorageUrl] = useLazyQuery(GET_STORAGE_BLOG_POST_URL)

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
      case 'First':
        return 'info'
      case 'Parental_Care':
        return 'secondary'
      case 'Second':
        return 'success'
      case 'Third':
        return 'warning'
      default:
        return 'default'
    }
  }

  // Handle blog post upload
  const handleBlogUpload = async (formData) => {
    setUploadError(null)
    setUploadSuccess(false)
    
    try {
      // Get form values
      const title = formData.get('title') || ''
      const content = formData.get('content') || ''
      const type = formData.get('type')
      const file = formData.get('file')
      
      // Validate required fields
      if (!title.trim()) {
        throw new Error('Title is required')
      }
      
      if (!type) {
        throw new Error('Type is required')
      }
      
      if (!file) {
        throw new Error('File is required')
      }

      // Get user_id from auth context
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Step 1: Create blog post and get ID
      console.log('Step 1: Creating blog post...')
      const createResult = await createBlogPost({
        variables: {
          title: title,
          content: content,
          type: type,
          user_id: user.id
        }
      })

      const blogPostId = createResult.data?.insert_blog_posts_one?.id
      if (!blogPostId) {
        throw new Error('Failed to create blog post')
      }

      console.log('Blog post created with ID:', blogPostId)

      // Step 2: Get presigned URL for file upload
      console.log('Step 2: Getting presigned URL...')
      const fileName = file.name
      const storageResult = await getStorageUrl({
        variables: {
          file_name: fileName,
          object_id: blogPostId
        }
      })

      // Log the full response for debugging
      console.log('Storage URL response:', JSON.stringify(storageResult, null, 2))
      
      // Check for GraphQL errors (can exist even with 200 status)
      if (storageResult.errors && storageResult.errors.length > 0) {
        const errorMessages = storageResult.errors.map(e => e.message).join(', ')
        console.error('GraphQL errors:', storageResult.errors)
        throw new Error(`GraphQL error: ${errorMessages}`)
      }
      
      // Check for Apollo Client errors
      if (storageResult.error) {
        console.error('Apollo error:', storageResult.error)
        throw new Error(`GraphQL error: ${storageResult.error.message}`)
      }

      // Check if data exists
      if (!storageResult.data) {
        console.error('No data in response:', storageResult)
        throw new Error('No data returned from storage URL query')
      }

      // Try different possible response structures
      const uploadUrl = storageResult.data?.storage_blog_upload?.url || 
                       storageResult.data?.storage_blog_upload_url?.url ||
                       storageResult.data?.url

      if (!uploadUrl) {
        console.error('Response structure:', storageResult.data)
        throw new Error(`Failed to get upload URL. Response structure: ${JSON.stringify(storageResult.data)}`)
      }

      console.log('Got presigned URL:', uploadUrl)

      // Step 3: Upload file to presigned URL
      console.log('Step 3: Uploading file to MinIO...')
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed: ${uploadResponse.statusText}`)
      }

      console.log('File uploaded successfully')

      // Step 4: Refresh blog list
      await refetch()
      
      // Show success message
      setUploadSuccess(true)
      
      // Close modal after a short delay
      setTimeout(() => {
        setUploadModalOpen(false)
        setUploadSuccess(false)
      }, 1500)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload blog post. Please try again.')
      throw error
    }
  }

  // Handle delete blog post
  const handleDeleteBlog = (postId, postTitle) => {
    setDeleteDialog({ open: true, postId, postTitle })
  }

  // Confirm delete blog post
  const confirmDeleteBlog = () => {
    if (deleteDialog.postId) {
      deleteBlogPost({
        variables: { id: deleteDialog.postId }
      })
    }
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Handle image preview
  const handleImagePreview = (imageUrl, imageName) => {
    if (imageUrl) {
      setImagePreview({ open: true, imageUrl, imageName })
    }
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Blog Post Management
          </Typography>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => setUploadModalOpen(true)}
          >
            Create New Post
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
        
        {/* Blog Upload Modal */}
        <BlogUploadModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false)
            setUploadError(null)
            setUploadSuccess(false)
          }}
          onSubmit={handleBlogUpload}
          error={uploadError}
          success={uploadSuccess}
        />
      </Box>
    )
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Blog Post Management
          </Typography>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => setUploadModalOpen(true)}
          >
            Create New Post
          </Button>
        </Box>
        <Alert severity='error' sx={{ mb: 3 }}>
          Error loading blog posts: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
          Retry
        </Button>
        
        {/* Blog Upload Modal */}
        <BlogUploadModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false)
            setUploadError(null)
            setUploadSuccess(false)
          }}
          onSubmit={handleBlogUpload}
          error={uploadError}
          success={uploadSuccess}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Blog Post Management
        </Typography>
        <Button 
          variant='contained' 
          startIcon={<Icon icon='tabler-plus' />}
          onClick={() => setUploadModalOpen(true)}
        >
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
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Publish Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      {post.media?.url ? (
                        <Avatar 
                          src={post.media.url} 
                          alt={post.title}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                          variant="rounded"
                          onClick={() => handleImagePreview(post.media.url, post.title)}
                        />
                      ) : (
                        <Avatar sx={{ width: 40, height: 40, fontSize: '1rem' }}>
                          {post.title.charAt(0)}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {post.title}
                      </Typography>
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
                    <TableCell>
                      <IconButton 
                        size='small' 
                        color='error'
                        onClick={() => handleDeleteBlog(post.id, post.title)}
                      >
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

      {/* Blog Upload Modal */}
      <BlogUploadModal
        open={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setUploadError(null)
          setUploadSuccess(false)
        }}
        onSubmit={handleBlogUpload}
        error={uploadError}
        success={uploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, postId: null, postTitle: '' })}
        aria-labelledby="delete-blog-dialog-title"
      >
        <DialogTitle id="delete-blog-dialog-title">
          Delete Blog Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.postTitle}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, postId: null, postTitle: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteBlog}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Icon icon="tabler-trash" />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={() => setImagePreview({ open: false, imageUrl: null, imageName: '' })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            pb: 1,
            fontWeight: 600
          }}
        >
          {imagePreview.imageName}
          <IconButton
            onClick={() => setImagePreview({ open: false, imageUrl: null, imageName: '' })}
            sx={{ color: 'white' }}
          >
            <Icon icon="tabler-x" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box
            component="img"
            src={imagePreview.imageUrl || ''}
            alt={imagePreview.imageName}
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 1
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BlogPage
