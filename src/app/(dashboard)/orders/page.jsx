'use client'

// React Imports
import { useState } from 'react'

// Apollo Client Imports
import { useQuery } from '@apollo/client/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { GET_MARKETPLACE_ORDERS } from '@/lib/graphql/queries'

const OrdersPage = () => {
  // Fetch marketplace orders from GraphQL
  const { data, loading, error } = useQuery(GET_MARKETPLACE_ORDERS)
  
  // Transform the GraphQL data to match our UI needs
  const orders = data?.marketplace_orders?.map(order => {
    // Calculate total amount for the order
    const totalAmount = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    // Get the first product name for display (or show count if multiple items)
    const productNames = order.items.map(item => item.product.name)
    const productDisplay = order.items.length === 1 
      ? productNames[0] 
      : `${order.items.length} items (${productNames.slice(0, 2).join(', ')}${order.items.length > 2 ? '...' : ''})`
    
    // Format date
    const orderDate = new Date(order.created_at).toLocaleDateString()
    
    return {
      id: order.id,
      customer: `User ${order.items[0]?.product.user_id?.slice(-8) || 'Unknown'}`, // Use user_id as customer identifier
      product: productDisplay,
      amount: totalAmount,
      status: order.state,
      date: orderDate,
      items: order.items, // Keep full items for detailed view
      rawOrder: order // Keep original order data
    }
  }) || []

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Accepted':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Processing':
        return 'info'
      case 'Cancelled':
      case 'Rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const totalOrders = orders.length
  const completedOrders = orders.filter(order => order.status === 'Completed' || order.status === 'Accepted').length
  const pendingOrders = orders.filter(order => order.status === 'Pending').length
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)

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
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading orders: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Orders Management
        </Typography>
        <Button variant='contained' startIcon={<Icon icon='tabler-plus' />}>
          Add New Order
        </Button>
      </Box>

      {/* Statistics Cards */}
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
                  <Icon icon='tabler-shopping-cart' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalOrders}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Orders
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
                    {completedOrders}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Completed
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
                  <Icon icon='tabler-clock' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {pendingOrders}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Pending
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
                  <Icon icon='tabler-currency-dollar' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    ${totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            All Orders
          </Typography>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {order.id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Box>
                        {order.items.map((item, index) => (
                          <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem' }}>
                            {item.product.name}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {order.items.map((item, index) => (
                          <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem' }}>
                            {item.quantity}x
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        ${order.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)} 
                        size='small' 
                      />
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <IconButton size='small' color='info'>
                        <Icon icon='tabler-eye' />
                      </IconButton>
                      <IconButton size='small' color='primary'>
                        <Icon icon='tabler-edit' />
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

export default OrdersPage