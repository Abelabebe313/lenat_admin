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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import { GET_BLOG_POSTS, GET_STORAGE_BLOG_POST_URL } from '@lib/graphql/queries'
import { CREATE_ONE_BLOG_POST, UPDATE_BLOG_POST, DELETE_BLOG_POST } from '@lib/graphql/mutations'

// Component Imports
import BlogModal from '@components/blog/BlogModal'

// Context Imports
import { useAuth } from '@contexts/AuthContext'

const BlogPage = () => {
  // Auth context
  const { user } = useAuth()
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [premiumFilter, setPremiumFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
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

  // Mutation to update blog post
  const [updateBlogPost] = useMutation(UPDATE_BLOG_POST)

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

  // Available options
  const blogTypes = ['Baby', 'First', 'Parental_Care', 'Second', 'Third']
  const statusOptions = ['Active', 'Inactive', 'Deleted']
  const stateOptions = [
    'Accepted', 'Available', 'Canceled', 'Done', 
    'InProgress', 'Out_Of_Stock', 'Paid', 'Pending', 'Rejected', 'UnPaid', 'Unavailable'
  ]

  // Transform GraphQL data to match our UI structure
  const posts = useMemo(() => {
    if (!data?.blog_posts) return []
    
    return data.blog_posts.map(post => ({
      id: post.id,
      title: post.title || `Blog Post ${post.id.slice(0, 8)}`,
      content: post.content || '',
      author: post.user_id ? `User ${post.user_id.slice(0, 8)}` : 'Unknown',
      type: post.type || 'general',
      status: post.status || 'Active',
      state: post.state || 'Pending',
      is_premium: post.is_premium || false,
      media: post.media,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      likes: post.likes_aggregate?.aggregate?.count || 0,
      comments: post.comments_aggregate?.aggregate?.count || 0,
      bookmarks: post.bookmarks_aggregate?.aggregate?.count || 0,
      user_id: post.user_id
    }))
  }, [data])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'warning'
      case 'Deleted':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'Accepted':
      case 'Done':
      case 'Paid':
        return 'success'
      case 'Pending':
      case 'InProgress':
        return 'warning'
      case 'Rejected':
      case 'Canceled':
      case 'UnPaid':
        return 'error'
      case 'Available':
        return 'info'
      case 'Out_Of_Stock':
      case 'Unavailable':
        return 'default'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
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

  // Format names for display
  const formatName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesType = !typeFilter || post.type === typeFilter
      const matchesStatus = !statusFilter || post.status === statusFilter
      const matchesState = !stateFilter || post.state === stateFilter
      const matchesPremium = premiumFilter === '' || 
        (premiumFilter === 'premium' && post.is_premium) ||
        (premiumFilter === 'free' && !post.is_premium)
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Date filtering
      let matchesDateFrom = true
      let matchesDateTo = true
      
      if (dateFrom) {
        const postDate = new Date(post.createdAt)
        const fromDate = new Date(dateFrom)
        matchesDateFrom = postDate >= fromDate
      }
      
      if (dateTo) {
        const postDate = new Date(post.createdAt)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        matchesDateTo = postDate <= toDate
      }
      
      return matchesType && matchesStatus && matchesState && matchesPremium && 
             matchesSearch && matchesDateFrom && matchesDateTo
    })
  }, [posts, typeFilter, statusFilter, stateFilter, premiumFilter, searchQuery, dateFrom, dateTo])

  // Paginated posts
  const paginatedPosts = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredPosts.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredPosts, page, rowsPerPage])

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter('')
    setStatusFilter('')
    setStateFilter('')
    setPremiumFilter('')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setPage(0)
  }

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle create new post
  const handleCreateNew = () => {
    setEditMode(false)
    setSelectedPost(null)
    setModalOpen(true)
  }

  // Handle edit post
  const handleEditPost = (post) => {
    setEditMode(true)
    setSelectedPost(post)
    setModalOpen(true)
  }

  // Handle delete blog post
  const handleDeletePost = (postId, postTitle) => {
    setDeleteDialog({ open: true, postId, postTitle })
  }

  // Confirm delete blog post
  const confirmDeletePost = () => {
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

  // Handle blog post submission (create or update)
  const handleBlogSubmit = async (formData) => {
    setUploadError(null)
    setUploadSuccess(false)
    
    try {
      // Get form values
      const title = formData.get('title') || ''
      const content = formData.get('content') || ''
      const type = formData.get('type')
      const status = formData.get('status')
      const state = formData.get('state')
      const is_premium = formData.get('is_premium') === 'true'
      const file = formData.get('file')
      const postId = formData.get('id')
      
      // Validate required fields
      if (!title.trim()) {
        throw new Error('Title is required')
      }
      
      if (!type) {
        throw new Error('Type is required')
      }

      // Get user_id from auth context
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      if (editMode && postId) {
        // Update existing post
        console.log('Updating blog post...')
        await updateBlogPost({
          variables: {
            id: postId,
            title: title,
            content: content,
            type: type,
            status: status,
            state: state,
            is_premium: is_premium
          }
        })

        // If there's a new file, upload it
        if (file && file.size > 0) {
          console.log('Uploading new image...')
          const fileName = file.name
          const storageResult = await getStorageUrl({
            variables: {
              file_name: fileName,
              object_id: postId
            }
          })

          const uploadUrl = storageResult.data?.storage_blog_upload?.url
          if (uploadUrl) {
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
          }
        }

        setSnackbar({ open: true, message: 'Blog post updated successfully!', severity: 'success' })
      } else {
        // Create new post
        console.log('Creating blog post...')
        const createResult = await createBlogPost({
          variables: {
            title: title,
            content: content,
            type: type,
            status: status,
            state: state,
            is_premium: is_premium,
            user_id: user.id
          }
        })

        const blogPostId = createResult.data?.insert_blog_posts_one?.id
        if (!blogPostId) {
          throw new Error('Failed to create blog post')
        }

        console.log('Blog post created with ID:', blogPostId)

        // Upload file if provided
        if (file && file.size > 0) {
          console.log('Getting presigned URL...')
          const fileName = file.name
          const storageResult = await getStorageUrl({
            variables: {
              file_name: fileName,
              object_id: blogPostId
            }
          })

          const uploadUrl = storageResult.data?.storage_blog_upload?.url
          if (!uploadUrl) {
            throw new Error('Failed to get upload URL')
          }

          console.log('Uploading file to MinIO...')
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
        }

        setSnackbar({ open: true, message: 'Blog post created successfully!', severity: 'success' })
      }

      // Refresh blog list
      await refetch()
      
      // Show success message
      setUploadSuccess(true)
      
      // Close modal after a short delay
      setTimeout(() => {
        setModalOpen(false)
        setUploadSuccess(false)
      }, 1500)

    } catch (error) {
      console.error('Submit error:', error)
      setUploadError(error.message || 'Failed to save blog post. Please try again.')
      throw error
    }
  }

  // Analytics calculations
  const totalPosts = posts.length
  const activePosts = posts.filter(post => post.status === 'Active').length
  const premiumPosts = posts.filter(post => post.is_premium).length
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)
  const totalBookmarks = posts.reduce((sum, post) => sum + post.bookmarks, 0)

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
            onClick={handleCreateNew}
          >
            Create New Post
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
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
            onClick={handleCreateNew}
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
          onClick={handleCreateNew}
        >
          Create New Post
        </Button>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    {totalPosts}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Posts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    {activePosts}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Active Posts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
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
                  <Icon icon='tabler-crown' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {premiumPosts}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Premium Posts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    backgroundColor: 'error.15'
                  }}
                >
                  <Icon icon='tabler-heart' style={{ fontSize: 24, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalLikes}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Likes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
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
                  <Icon icon='tabler-message' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalComments}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Comments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    backgroundColor: 'secondary.15'
                  }}
                >
                  <Icon icon='tabler-bookmark' style={{ fontSize: 24, color: 'secondary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalBookmarks}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Bookmarks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            Filter Blog Posts
          </Typography>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder='Search by title, content, or author...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler-search' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label='Type'
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value=''>All Types</MenuItem>
                  {blogTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {formatName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label='Status'
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value=''>All Statuses</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {formatName(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={stateFilter}
                  label='State'
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <MenuItem value=''>All States</MenuItem>
                  {stateOptions.map((state) => (
                    <MenuItem key={state} value={state}>
                      {formatName(state)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Premium</InputLabel>
                <Select
                  value={premiumFilter}
                  label='Premium'
                  onChange={(e) => setPremiumFilter(e.target.value)}
                >
                  <MenuItem value=''>All Posts</MenuItem>
                  <MenuItem value='premium'>Premium Only</MenuItem>
                  <MenuItem value='free'>Free Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type='date'
                label='Date From'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type='date'
                label='Date To'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant='outlined'
                onClick={clearFilters}
                startIcon={<Icon icon='tabler-x' />}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
          {(typeFilter || statusFilter || stateFilter || premiumFilter || searchQuery || dateFrom || dateTo) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant='body2' color='text.secondary'>
                Active filters:
              </Typography>
              {typeFilter && (
                <Chip
                  label={`Type: ${formatName(typeFilter)}`}
                  size='small'
                  onDelete={() => setTypeFilter('')}
                  color='primary'
                />
              )}
              {statusFilter && (
                <Chip
                  label={`Status: ${formatName(statusFilter)}`}
                  size='small'
                  onDelete={() => setStatusFilter('')}
                  color='secondary'
                />
              )}
              {stateFilter && (
                <Chip
                  label={`State: ${formatName(stateFilter)}`}
                  size='small'
                  onDelete={() => setStateFilter('')}
                  color='info'
                />
              )}
              {premiumFilter && (
                <Chip
                  label={`Premium: ${formatName(premiumFilter)}`}
                  size='small'
                  onDelete={() => setPremiumFilter('')}
                  color='warning'
                />
              )}
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size='small'
                  onDelete={() => setSearchQuery('')}
                  color='success'
                />
              )}
              {dateFrom && (
                <Chip
                  label={`From: ${dateFrom}`}
                  size='small'
                  onDelete={() => setDateFrom('')}
                  color='default'
                />
              )}
              {dateTo && (
                <Chip
                  label={`To: ${dateTo}`}
                  size='small'
                  onDelete={() => setDateTo('')}
                  color='default'
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Blog Posts ({filteredPosts.length} of {posts.length})
            </Typography>
          </Box>
          
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell align='center'>Premium</TableCell>
                  <TableCell align='center'>Engagement</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedPosts.length > 0 ? (
                  paginatedPosts.map((post) => (
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
                          <Avatar sx={{ width: 40, height: 40, fontSize: '1rem' }} variant="rounded">
                            {post.title.charAt(0)}
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {post.title}
                          </Typography>
                          {post.content && (
                            <Typography variant='caption' color='text.secondary' sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {post.content}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {post.author}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatName(post.type)} 
                          color={getTypeColor(post.type)} 
                          size='small' 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatName(post.status)} 
                          color={getStatusColor(post.status)} 
                          size='small' 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatName(post.state)} 
                          color={getStateColor(post.state)} 
                          size='small' 
                        />
                      </TableCell>
                      <TableCell align='center'>
                        {post.is_premium ? (
                          <Tooltip title="Premium Content">
                            <Icon icon='tabler-crown' style={{ fontSize: 20, color: '#FFD700' }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Free Content">
                            <Icon icon='tabler-lock-open' style={{ fontSize: 20, color: 'text.secondary' }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Likes">
                            <Chip 
                              icon={<Icon icon='tabler-heart' />}
                              label={post.likes}
                              size='small'
                              variant='outlined'
                            />
                          </Tooltip>
                          <Tooltip title="Comments">
                            <Chip 
                              icon={<Icon icon='tabler-message' />}
                              label={post.comments}
                              size='small'
                              variant='outlined'
                            />
                          </Tooltip>
                          <Tooltip title="Bookmarks">
                            <Chip 
                              icon={<Icon icon='tabler-bookmark' />}
                              label={post.bookmarks}
                              size='small'
                              variant='outlined'
                            />
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton 
                              size='small' 
                              color='primary'
                              onClick={() => handleEditPost(post)}
                            >
                              <Icon icon='tabler-edit' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size='small' 
                              color='error'
                              onClick={() => handleDeletePost(post.id, post.title)}
                            >
                              <Icon icon='tabler-trash' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align='center' sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Icon icon='tabler-search-off' style={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant='body1' color='text.secondary'>
                          No blog posts found matching your filters
                        </Typography>
                        <Button variant='outlined' onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredPosts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Blog Modal */}
      <BlogModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setUploadError(null)
          setUploadSuccess(false)
          setEditMode(false)
          setSelectedPost(null)
        }}
        onSubmit={handleBlogSubmit}
        error={uploadError}
        success={uploadSuccess}
        editMode={editMode}
        initialData={selectedPost}
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
            onClick={confirmDeletePost}
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
