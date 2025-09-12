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
import DialogActions from '@mui/material/DialogActions'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery } from '@apollo/client/react'
import { GET_FEED_POSTS } from '@lib/graphql/queries'

// Component Imports
import FeedUploadModal from '@components/feeds/FeedUploadModal'

const FeedsPage = () => {
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // GraphQL query to fetch feed posts
  const { data, loading, error } = useQuery(GET_FEED_POSTS)

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
      name: post.media?.file_name || `Feed ${post.id.slice(0, 8)}`,
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

  // Handle feed upload
  const handleFeedUpload = async (formData) => {
    try {
      // Here you would typically make an API call to upload the feed
      // For now, we'll just log the data and show a success message
      console.log('Uploading feed:', {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        file: formData.get('file')
      })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would:
      // 1. Upload the file to your storage service
      // 2. Create a feed post record in your database
      // 3. Refresh the feeds list
      
      alert('Feed uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
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
        
        {/* Simple Test Modal */}
        <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
          <DialogTitle>Test Modal</DialogTitle>
          <DialogContent>
            <Typography>This is a test modal to see if Dialog works</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ position: 'fixed', top: 10, right: 10, bg: 'black', color: 'white', p: 1, zIndex: 9999 }}>
            Modal State: {uploadModalOpen ? 'OPEN' : 'CLOSED'} | Loading: {loading ? 'YES' : 'NO'}
          </Box>
        )}
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
        
        {/* Simple Test Modal */}
        <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
          <DialogTitle>Test Modal</DialogTitle>
          <DialogContent>
            <Typography>This is a test modal to see if Dialog works</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ position: 'fixed', top: 10, right: 10, bg: 'black', color: 'white', p: 1, zIndex: 9999 }}>
            Modal State: {uploadModalOpen ? 'OPEN' : 'CLOSED'} | Error: {error ? 'YES' : 'NO'}
          </Box>
        )}
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
                                sx={{ width: 40, height: 40 }}
                                variant="rounded"
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
                                {feed.name}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {feed.media?.file_name || 'No file name'}
                              </Typography>
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

      {/* Simple Test Modal */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
        <DialogTitle>Test Modal</DialogTitle>
        <DialogContent>
          <Typography>This is a test modal to see if Dialog works</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Feed Upload Modal */}
      <FeedUploadModal
        open={uploadModalOpen}
        onClose={() => {
          console.log('Modal closing')
          setUploadModalOpen(false)
        }}
        onSubmit={handleFeedUpload}
      />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ position: 'fixed', top: 10, right: 10, bg: 'black', color: 'white', p: 1, zIndex: 9999 }}>
          Modal: {uploadModalOpen ? 'OPEN' : 'CLOSED'} | Loading: {loading ? 'YES' : 'NO'} | Error: {error ? 'YES' : 'NO'}
        </Box>
      )}
    </Box>
  )
}

export default FeedsPage
