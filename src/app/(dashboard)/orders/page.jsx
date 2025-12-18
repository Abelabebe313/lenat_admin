'use client'

// React Imports
import { useState } from 'react'

// Apollo Client Imports
import { useQuery, useMutation } from '@apollo/client/react'

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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import TablePagination from '@mui/material/TablePagination'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { GET_MARKETPLACE_ORDERS, GET_USERS, GET_MARKETPLACE_PRODUCTS } from '@/lib/graphql/queries'
import { UPDATE_MARKETPLACE_ORDER, DELETE_MARKETPLACE_ORDER, CREATE_MARKETPLACE_ORDER } from '@/lib/graphql/mutations'

const OrdersPage = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null })
  const [detailsDialog, setDetailsDialog] = useState({ open: false, order: null })
  const [createDialog, setCreateDialog] = useState({ open: false })
  const [statusMenu, setStatusMenu] = useState({ anchorEl: null, orderId: null })
  
  // New Order State
  const [newOrder, setNewOrder] = useState({
    userId: '',
    items: [] // { productId: '', quantity: 1 }
  })
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Fetch orders
  const { data, loading, error, refetch } = useQuery(GET_MARKETPLACE_ORDERS)
  
  // Fetch users and products for create dialog
  const { data: usersData } = useQuery(GET_USERS)
  const { data: productsData } = useQuery(GET_MARKETPLACE_PRODUCTS)

  // Mutations
  const [updateOrder] = useMutation(UPDATE_MARKETPLACE_ORDER, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Order status updated successfully!', severity: 'success' })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error updating order: ${error.message}`, severity: 'error' })
    }
  })

  const [deleteOrder] = useMutation(DELETE_MARKETPLACE_ORDER, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Order deleted successfully!', severity: 'success' })
      setDeleteDialog({ open: false, orderId: null })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting order: ${error.message}`, severity: 'error' })
      setDeleteDialog({ open: false, orderId: null })
    }
  })

  const [createOrder] = useMutation(CREATE_MARKETPLACE_ORDER, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Order created successfully!', severity: 'success' })
      setCreateDialog({ open: false })
      setNewOrder({ userId: '', items: [] })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error creating order: ${error.message}`, severity: 'error' })
    }
  })

  // Process data
  const orders = data?.marketplace_orders?.map(order => {
    const totalAmount = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    
    return {
      ...order,
      totalAmount,
      totalItems
    }
  }) || []

  // Filter and Search
  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.user?.profile?.full_name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower)
      
    const matchesStatus = statusFilter === 'all' || order.state === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination
  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
      case 'Accepted':
      case 'Paid':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'InProgress':
        return 'info'
      case 'Canceled':
      case 'Rejected':
      case 'Out_Of_Stock':
        return 'error'
      default:
        return 'default'
    }
  }

  const handleStatusUpdate = (newStatus) => {
    if (statusMenu.orderId) {
      updateOrder({
        variables: {
          id: statusMenu.orderId,
          state: newStatus
        }
      })
    }
    setStatusMenu({ anchorEl: null, orderId: null })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.orderId) {
      deleteOrder({
        variables: { id: deleteDialog.orderId }
      })
    }
  }

  const handleCreateOrder = () => {
    if (!newOrder.userId || newOrder.items.length === 0) {
      setSnackbar({ open: true, message: 'Please select a user and at least one product', severity: 'error' })
      return
    }

    const itemsInput = newOrder.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
      variant: {} // Empty variant for now
    }))

    createOrder({
      variables: {
        user_id: newOrder.userId,
        items: itemsInput
      }
    })
  }

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: '', quantity: 1 }]
    })
  }

  const handleRemoveItem = (index) => {
    const updatedItems = [...newOrder.items]
    updatedItems.splice(index, 1)
    setNewOrder({ ...newOrder, items: updatedItems })
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewOrder({ ...newOrder, items: updatedItems })
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading orders: {error.message}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 1 }}>
            Orders Management
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage and track all marketplace orders
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant='outlined' 
            startIcon={<Icon icon='tabler-arrow-left' />}
            onClick={() => window.location.href = '/marketplace'}
          >
            Back to Marketplace
          </Button>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => setCreateDialog({ open: true })}
          >
            Create Order
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              size='small'
              placeholder='Search Order ID, Name, Email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='tabler-search' />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['all', 'Pending', 'InProgress', 'Done', 'Canceled'].map((status) => (
                <Chip
                  key={status}
                  label={status === 'all' ? 'All' : (status === 'InProgress' ? 'Processing' : (status === 'Done' ? 'Completed' : (status === 'Canceled' ? 'Cancelled' : status)))}
                  color={statusFilter === status ? 'primary' : 'default'}
                  onClick={() => setStatusFilter(status)}
                  variant={statusFilter === status ? 'filled' : 'outlined'}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </Box>
          </Box>

          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                          #{order.id.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {order.user?.profile?.full_name || 'Unknown'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {order.user?.email || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.totalItems} items</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.state} 
                          color={getStatusColor(order.state)} 
                          size='small' 
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton 
                          size='small' 
                          color='info'
                          onClick={() => setDetailsDialog({ open: true, order })}
                          title="View Details"
                        >
                          <Icon icon='tabler-eye' />
                        </IconButton>
                        <IconButton 
                          size='small' 
                          color='primary'
                          onClick={(e) => setStatusMenu({ anchorEl: e.currentTarget, orderId: order.id })}
                          title="Update Status"
                        >
                          <Icon icon='tabler-edit' />
                        </IconButton>
                        <IconButton 
                          size='small' 
                          color='error'
                          onClick={() => setDeleteDialog({ open: true, orderId: order.id })}
                          title="Delete Order"
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
                        <Icon icon='tabler-shopping-cart-off' style={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant='body1' color='text.secondary'>
                          No orders found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10))
              setPage(0)
            }}
          />
        </CardContent>
      </Card>

      {/* Status Update Menu */}
      <Menu
        anchorEl={statusMenu.anchorEl}
        open={Boolean(statusMenu.anchorEl)}
        onClose={() => setStatusMenu({ anchorEl: null, orderId: null })}
      >
        <MenuItem onClick={() => handleStatusUpdate('Pending')}>Pending</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('InProgress')}>Processing</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('Done')}>Completed</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('Canceled')}>Cancelled</MenuItem>
      </Menu>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, order: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details #{detailsDialog.order?.id.slice(0, 8)}
        </DialogTitle>
        <DialogContent dividers>
          {detailsDialog.order && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Date Placed</Typography>
                  <Typography variant="body1">{new Date(detailsDialog.order.created_at).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1">{detailsDialog.order.user?.profile?.full_name || 'Unknown'}</Typography>
                  <Typography variant="caption" color="text.secondary">{detailsDialog.order.user?.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={detailsDialog.order.state} 
                    color={getStatusColor(detailsDialog.order.state)} 
                    size='small' 
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="h6" color="primary.main">${detailsDialog.order.totalAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>Items</Typography>
              <List>
                {detailsDialog.order.items.map((item, index) => (
                  <Box key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" sx={{ width: 60, height: 60, mr: 2 }}>
                          <Icon icon="tabler-package" fontSize={30} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {item.product.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Price per unit: ${item.product.price}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                              Total: ${(item.product.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < detailsDialog.order.items.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, order: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog
        open={createDialog.open}
        onClose={() => setCreateDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={newOrder.userId}
                label="Select User"
                onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
              >
                {usersData?.users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.profile?.full_name || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Order Items</Typography>
              {newOrder.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={item.productId}
                      label="Product"
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    >
                      {productsData?.marketplace_products?.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} (${product.price})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    type="number"
                    label="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    sx={{ width: 100 }}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <IconButton color="error" onClick={() => handleRemoveItem(index)} sx={{ mt: 1 }}>
                    <Icon icon="tabler-trash" />
                  </IconButton>
                </Box>
              ))}
              <Button 
                startIcon={<Icon icon="tabler-plus" />} 
                onClick={handleAddItem}
                variant="outlined"
                size="small"
              >
                Add Item
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained">Create Order</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, orderId: null })}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, orderId: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default OrdersPage
