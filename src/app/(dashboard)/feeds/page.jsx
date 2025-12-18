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

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import { GET_FEED_POSTS, GET_STORAGE_FEED_POST_URL } from '@lib/graphql/queries'
import { CREATE_ONE_POST_FEED, DELETE_FEED_POST, UPDATE_FEED_POST } from '@lib/graphql/mutations'

// Component Imports
import FeedUploadModal from '@components/feeds/FeedUploadModal'

// Context Imports
import { useAuth } from '@contexts/AuthContext'

const FeedsPage = () => {
  // Auth context
  const { user } = useAuth()
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingFeed, setEditingFeed] = useState(null)

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, feedId: null, feedName: '' })

  // Image preview state
  const [imagePreview, setImagePreview] = useState({ open: false, imageUrl: null, imageName: '' })

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // GraphQL query to fetch feed posts
  const { data, loading, error, refetch } = useQuery(GET_FEED_POSTS)

  // Mutation to create feed post
  const [createFeedPost] = useMutation(CREATE_ONE_POST_FEED)

  // Mutation to delete feed post
  const [deleteFeedPost, { loading: deleting }] = useMutation(DELETE_FEED_POST, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Feed post deleted successfully!', severity: 'success' })
      setDeleteDialog({ open: false, feedId: null, feedName: '' })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting feed post: ${error.message}`, severity: 'error' })
      setDeleteDialog({ open: false, feedId: null, feedName: '' })
    }
  })

  // Mutation to update feed post
  const [updateFeedPost, { loading: updating }] = useMutation(UPDATE_FEED_POST, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Feed post updated successfully!', severity: 'success' })
      setUploadModalOpen(false)
      setEditMode(false)
      setEditingFeed(null)
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error updating feed post: ${error.message}`, severity: 'error' })
    }
  })

  // Lazy query to get presigned URL
  const [getStorageUrl] = useLazyQuery(GET_STORAGE_FEED_POST_URL)

  // Available categories and statuses based on backend
  const categories = [
    'Prenatal_Stage',
    'First_Trimester', 
    'Second_Trimester',
    'Third_Trimester',
    'Labor_and_Delivery',
    'Postpartum',
    'Child_Growth',
    'Fatherhood'
  ]

  const statuses = ['Accepted', 'Pending', 'Rejected']

  // Transform GraphQL data to match our UI structure
  const feeds = useMemo(() => {
    if (!data?.feed_posts) return []
    
    return data.feed_posts.map(post => ({
      id: post.id,
      name: post.description || post.media?.file_name || `Feed ${post.id.slice(0, 8)}`,
      description: post.description,
      category: post.category,
      status: post.state,
      lastUpdate: new Date(post.updated_at).toLocaleString(),
      media: post.media,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }))
  }, [data])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Prenatal_Stage':
        return 'primary'
      case 'First_Trimester':
        return 'info'
      case 'Second_Trimester':
        return 'secondary'
      case 'Third_Trimester':
        return 'info'
      case 'Labor_and_Delivery':
        return 'secondary'
      case 'Postpartum':
        return 'info'
      case 'Child_Growth':
        return 'secondary'
      case 'Fatherhood':
        return 'info'
      default:
        return 'default'
    }
  }

  // Format category names for display
  const formatCategoryName = (category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Filter feeds based on selected filters
  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed => {
      const matchesCategory = !categoryFilter || feed.category === categoryFilter
      const matchesStatus = !statusFilter || feed.status === statusFilter
      const matchesSearch = !searchQuery || 
        feed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [feeds, categoryFilter, statusFilter, searchQuery])

  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter('')
    setStatusFilter('')
    setSearchQuery('')
  }

  // Handle delete feed post
  const handleDeleteFeed = (feedId, feedName) => {
    setDeleteDialog({ open: true, feedId, feedName })
  }

  // Confirm delete feed post
  const confirmDeleteFeed = () => {
    if (deleteDialog.feedId) {
      deleteFeedPost({
        variables: { id: deleteDialog.feedId }
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

  // Handle edit feed
  const handleEditFeed = (feed) => {
    setEditingFeed(feed)
    setEditMode(true)
    setUploadModalOpen(true)
  }

  // Handle feed upload
  const handleFeedUpload = async (formData) => {
    setUploadError(null)
    setUploadSuccess(false)
    
    try {
      console.log("i'm now running")
      // Get form values
      const description = formData.get('description') || ''
      const category = formData.get('category')
      const file = formData.get('file')
      const state = formData.get('state') || 'Accepted'
      
      // Validate required fields
      if (!category) {
        throw new Error('Category is required')
      }

      // If in edit mode, update the existing feed
      if (editMode && editingFeed) {
        console.log('Updating feed post:', editingFeed.id)
        
        // Update feed post metadata
        await updateFeedPost({
          variables: {
            id: editingFeed.id,
            description: description,
            category: category,
            state: state
          }
        })

        // If a new file is provided, upload it
        if (file) {
          console.log('Uploading new file for existing feed...')
          
          const fileName = file.name
          const storageResult = await getStorageUrl({
            variables: {
              file_name: fileName,
              object_id: editingFeed.id
            }
          })

          // Check for errors
          if (storageResult.errors && storageResult.errors.length > 0) {
            const errorMessages = storageResult.errors.map(e => e.message).join(', ')
            throw new Error(`GraphQL error: ${errorMessages}`)
          }
          
          if (storageResult.error) {
            throw new Error(`GraphQL error: ${storageResult.error.message}`)
          }

          if (!storageResult.data) {
            throw new Error('No data returned from storage URL query')
          }

          const uploadUrl = storageResult.data?.storage_feed_upload?.url || 
                           storageResult.data?.storage_feed_upload_url?.url ||
                           storageResult.data?.url

          if (!uploadUrl) {
            throw new Error(`Failed to get upload URL. Response structure: ${JSON.stringify(storageResult.data)}`)
          }

          // Upload file to presigned URL
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

        // Refresh feed list
        await refetch()
        
        // Show success message
        setUploadSuccess(true)
        
        // Close modal after a short delay
        setTimeout(() => {
          setUploadModalOpen(false)
          setUploadSuccess(false)
          setEditMode(false)
          setEditingFeed(null)
        }, 1500)

        return
      }

      // Create new feed post flow
      if (!file) {
        throw new Error('File is required')
      }

      // Get user_id from auth context
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Step 1: Create feed post and get ID
      console.log('Step 1: Creating feed post...')
      const createResult = await createFeedPost({
        variables: {
          description: description,
          user_id: user.id,
          category: category,
          state: state
        }
      })

      const feedPostId = createResult.data?.insert_feed_posts_one?.id
      if (!feedPostId) {
        throw new Error('Failed to create feed post')
      }

      console.log('Feed post created with ID:', feedPostId)

      // Step 2: Get presigned URL for file upload
      console.log('Step 2: Getting presigned URL...')
      console.log('File name:', file.name)
      console.log('Feed post ID:', feedPostId)
      
      const fileName = file.name
      const storageResult = await getStorageUrl({
        variables: {
          file_name: fileName,
          object_id: feedPostId
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
      const uploadUrl = storageResult.data?.storage_feed_upload?.url || 
                       storageResult.data?.storage_feed_upload_url?.url ||
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

      // Step 4: Refresh feed list
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
      setUploadError(error.message || 'Failed to upload feed. Please try again.')
      throw error
    }
  }

  const totalFeeds = feeds.length
  const acceptedFeeds = feeds.filter(feed => feed.status === 'Accepted').length
  const pendingFeeds = feeds.filter(feed => feed.status === 'Pending').length
  const rejectedFeeds = feeds.filter(feed => feed.status === 'Rejected').length
  const totalItems = feeds.length // Each feed post is an item
  const totalSubscribers = 0 // This would need to come from a different query

  // Show loading state (but still show the button)
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Content Feed Management
          </Typography>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => {
              console.log('Button clicked, opening modal')
              setUploadModalOpen(true)
            }}
          >
            Create New Feed
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
        
        {/* Feed Upload Modal */}
        <FeedUploadModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false)
            setUploadError(null)
            setUploadSuccess(false)
            setEditMode(false)
            setEditingFeed(null)
          }}
          onSubmit={handleFeedUpload}
          error={uploadError}
          success={uploadSuccess}
          editMode={editMode}
          editingFeed={editingFeed}
        />
      </Box>
    )
  }

  // Show error state (but still show the button)
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Content Feed Management
          </Typography>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => {
              console.log('Button clicked, opening modal')
              setUploadModalOpen(true)
            }}
          >
            Create New Feed
          </Button>
        </Box>
        <Alert severity='error' sx={{ mb: 3 }}>
          Error loading feed posts: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
          Retry
        </Button>
        
        {/* Feed Upload Modal */}
        <FeedUploadModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false)
            setUploadError(null)
            setUploadSuccess(false)
            setEditMode(false)
            setEditingFeed(null)
          }}
          onSubmit={handleFeedUpload}
          error={uploadError}
          success={uploadSuccess}
          editMode={editMode}
          editingFeed={editingFeed}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Content Feed Management
        </Typography>
        <Button 
          variant='contained' 
          startIcon={<Icon icon='tabler-plus' />}
          onClick={() => {
            console.log('Button clicked, opening modal')
            setUploadModalOpen(true)
          }}
        >
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
                    {acceptedFeeds}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Accepted Feeds
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
      </Grid>

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            Filter Feeds
          </Typography>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder='Search feeds...'
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label='Category'
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value=''>All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {formatCategoryName(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label='Status'
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value=''>All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant='outlined'
                onClick={clearFilters}
                startIcon={<Icon icon='tabler-x' />}
              >
              </Button>
            </Grid>
          </Grid>
          {(categoryFilter || statusFilter || searchQuery) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant='body2' color='text.secondary'>
                Active filters:
              </Typography>
              {categoryFilter && (
                <Chip
                  label={`Category: ${formatCategoryName(categoryFilter)}`}
                  size='small'
                  onDelete={() => setCategoryFilter('')}
                  color='primary'
                />
              )}
              {statusFilter && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  size='small'
                  onDelete={() => setStatusFilter('')}
                  color='secondary'
                />
              )}
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size='small'
                  onDelete={() => setSearchQuery('')}
                  color='info'
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Content Feeds ({filteredFeeds.length} of {feeds.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Accepted: ${acceptedFeeds}`}
                    size='small'
                    color='success'
                    variant='outlined'
                  />
                  <Chip
                    label={`Pending: ${pendingFeeds}`}
                    size='small'
                    color='warning'
                    variant='outlined'
                  />
                  <Chip
                    label={`Rejected: ${rejectedFeeds}`}
                    size='small'
                    color='error'
                    variant='outlined'
                  />
                </Box>
              </Box>
              {/* ========================= */}
              {/* ===  table ====  */}
              {/* ========================= */}
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  {/* table head */}
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Feed Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Update</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  {/* table body */}
                  <TableBody>
                    {filteredFeeds.length > 0 ? (
                      filteredFeeds.map((feed) => (
                        <TableRow key={feed.id}>
                          <TableCell>
                            {feed.media?.url ? (
                              <Avatar 
                                src={feed.media.url} 
                                alt={feed.name}
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
                                onClick={() => handleImagePreview(feed.media.url, feed.name)}
                              />
                            ) : (
                              <Avatar sx={{ width: 40, height: 40, fontSize: '1rem' }}>
                                {feed.name.charAt(0)}
                              </Avatar>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {feed.description || feed.media?.file_name || `Feed ${feed.id.slice(0, 8)}`}
                              </Typography>
                              {feed.description && feed.media?.file_name && (
                                <Typography variant='caption' color='text.secondary'>
                                  {feed.media.file_name}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatCategoryName(feed.category)} 
                              color={getCategoryColor(feed.category)} 
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
                              {feed.lastUpdate}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size='small' 
                              color='primary'
                              onClick={() => handleEditFeed(feed)}
                              sx={{ mr: 1 }}
                            >
                              <Icon icon='tabler-edit' />
                            </IconButton>
                            <IconButton 
                              size='small' 
                              color='error'
                              onClick={() => handleDeleteFeed(feed.id, feed.name)}
                            >
                              <Icon icon='tabler-trash' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Icon icon='tabler-search-off' style={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant='body1' color='text.secondary'>
                              No feeds found matching your filters
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
            </CardContent>
          </Card>
        </Grid>

      {/* Feed Upload Modal */}
      <FeedUploadModal
        open={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setUploadError(null)
          setUploadSuccess(false)
          setEditMode(false)
          setEditingFeed(null)
        }}
        onSubmit={handleFeedUpload}
        error={uploadError}
        success={uploadSuccess}
        editMode={editMode}
        editingFeed={editingFeed}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, feedId: null, feedName: '' })}
        aria-labelledby="delete-feed-dialog-title"
      >
        <DialogTitle id="delete-feed-dialog-title">
          Delete Feed Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.feedName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, feedId: null, feedName: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteFeed}
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
      
      {/* Debug info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <Box sx={{ position: 'fixed', top: 10, right: 10, bg: 'black', color: 'white', p: 1, zIndex: 9999 }}>
          Modal: {uploadModalOpen ? 'OPEN' : 'CLOSED'} | Loading: {loading ? 'YES' : 'NO'} | Error: {error ? 'YES' : 'NO'}
        </Box>
      )} */}
    </Box>
  )
}

export default FeedsPage
