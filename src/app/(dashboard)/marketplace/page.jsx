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

const MarketplacePage = () => {
  const [products] = useState([
    {
      id: 1,
      name: 'Premium Course Bundle',
      category: 'Education',
      price: 99.99,
      status: 'Active',
      stock: 50,
      sales: 23,
      revenue: 2307.77
    },
    {
      id: 2,
      name: 'Digital Art Collection',
      category: 'Art',
      price: 29.99,
      status: 'Active',
      stock: 100,
      sales: 45,
      revenue: 1349.55
    },
    {
      id: 3,
      name: 'Software License',
      category: 'Software',
      price: 199.99,
      status: 'Out of Stock',
      stock: 0,
      sales: 12,
      revenue: 2399.88
    }
  ])

  const [orders] = useState([
    {
      id: 'ORD-001',
      customer: 'Alice Johnson',
      product: 'Premium Course Bundle',
      amount: 99.99,
      status: 'Completed',
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customer: 'Bob Smith',
      product: 'Digital Art Collection',
      amount: 29.99,
      status: 'Pending',
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      customer: 'Carol Davis',
      product: 'Software License',
      amount: 199.99,
      status: 'Processing',
      date: '2024-01-13'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Processing':
        return 'info'
      case 'Out of Stock':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Education':
        return 'primary'
      case 'Art':
        return 'secondary'
      case 'Software':
        return 'info'
      default:
        return 'default'
    }
  }

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0)
  const totalSales = products.reduce((sum, product) => sum + product.sales, 0)
  const totalProducts = products.length
  const activeProducts = products.filter(product => product.status === 'Active').length

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Marketplace Management
        </Typography>
        <Button variant='contained' startIcon={<Icon icon='tabler-plus' />}>
          Add New Product
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
                  <Icon icon='tabler-package' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalProducts}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Products
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
                  <Icon icon='tabler-currency-dollar' style={{ fontSize: 24, color: 'success.main' }} />
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
                  <Icon icon='tabler-shopping-cart' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalSales}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Sales
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
                  <Icon icon='tabler-check-circle' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {activeProducts}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Active Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Products
              </Typography>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {product.name.charAt(0)}
                            </Avatar>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.category} 
                            color={getCategoryColor(product.category)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <Chip 
                            label={product.status} 
                            color={getStatusColor(product.status)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
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
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Recent Orders
              </Typography>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>${order.amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size='small' color='info'>
                            <Icon icon='tabler-eye' />
                          </IconButton>
                          <IconButton size='small' color='primary'>
                            <Icon icon='tabler-edit' />
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
      </Grid>
    </Box>
  )
}

export default MarketplacePage
