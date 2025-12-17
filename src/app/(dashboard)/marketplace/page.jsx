'use client'

// React Imports
import { useState } from 'react'

// Apollo Client Imports
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'

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
import { GET_MARKETPLACE_PRODUCTS, GET_STORAGE_MARKETPLACE_PRODUCT_URL } from '@/lib/graphql/queries'
import { CREATE_MARKETPLACE_PRODUCT, UPDATE_MARKETPLACE_PRODUCT, DELETE_MARKETPLACE_PRODUCT } from '@/lib/graphql/mutations'

// Component Imports
import ProductModal from '@/components/marketplace/ProductModal'

// Context Imports
import { useAuth } from '@contexts/AuthContext'

const MarketplacePage = () => {
  const { user } = useAuth()

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productError, setProductError] = useState(null)
  const [productSuccess, setProductSuccess] = useState(false)

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: '' })

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Fetch marketplace products from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_MARKETPLACE_PRODUCTS)

  // Mutation to create product
  const [createProduct] = useMutation(CREATE_MARKETPLACE_PRODUCT)

  // Mutation to update product
  const [updateProduct] = useMutation(UPDATE_MARKETPLACE_PRODUCT)

  // Mutation to delete product
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_MARKETPLACE_PRODUCT, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' })
      setDeleteDialog({ open: false, productId: null, productName: '' })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting product: ${error.message}`, severity: 'error' })
      setDeleteDialog({ open: false, productId: null, productName: '' })
    }
  })

  // Lazy query to get presigned URL for image upload
  const [getStorageUrl] = useLazyQuery(GET_STORAGE_MARKETPLACE_PRODUCT_URL)
  
  // Transform the GraphQL data to match our UI needs
  const products = data?.marketplace_products?.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    is_active: product.is_active,
    is_featured: product.is_featured,
    category: product.product_categories?.[0]?.category?.name || 'Uncategorized',
    categories: product.product_categories?.map(pc => pc.category.name) || [],
    image: product.product_images?.[0]?.medium?.url,
    blurHash: product.product_images?.[0]?.medium?.blur_hash,
    status: product.is_active ? 'Active' : 'Inactive',
    stock: Math.floor(Math.random() * 100), // Mock stock since API doesn't provide this
    sales: Math.floor(Math.random() * 50), // Mock sales since API doesn't provide this
    revenue: product.price * Math.floor(Math.random() * 50) // Mock revenue
  })) || []

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Processing':
        return 'info'
      case 'Inactive':
      case 'Out of Stock':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Pregnancy Cloths':
        return 'primary'      // Blue
      case 'Kids Cloths':
        return 'info'         // Light Blue
      case 'Kids Toys':
        return 'warning'      // Orange
      case 'Gifts':
        return 'secondary'    // Purple
      default:
        return 'default'      // Gray
    }
  }

  // Handle product creation/update
  const handleProductSubmit = async (formData) => {
    setProductError(null)
    setProductSuccess(false)

    try {
      if (editMode && selectedProduct) {
        // Update existing product (no image upload for edit mode)
        await updateProduct({
          variables: {
            id: selectedProduct.id,
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description || null,
            is_active: formData.is_active,
            is_featured: formData.is_featured
          }
        })
        setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' })
      } else {
        // Create new product
        console.log('Step 1: Creating product...')
        const createResult = await createProduct({
          variables: {
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description || null,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
            user_id: user?.id
          }
        })

        const productId = createResult.data?.insert_marketplace_products_one?.id
        if (!productId) {
          throw new Error('Failed to create product')
        }

        console.log('Product created with ID:', productId)

        // TODO: Image upload disabled until backend adds storage_product_upload query
        // The backend needs to add a custom Hasura action/function for marketplace product uploads
        // Similar to: storage_feed_upload and storage_blog_upload
        // Once added, uncomment the code below and update the query name
        
        /*
        // If there's a file, upload it
        if (formData.file) {
          console.log('Step 2: Getting presigned URL for image upload...')
          const fileName = formData.file.name
          const storageResult = await getStorageUrl({
            variables: {
              file_name: fileName,
              object_id: productId
            }
          })

          // Check for errors
          if (storageResult.errors && storageResult.errors.length > 0) {
            const errorMessages = storageResult.errors.map(e => e.message).join(', ')
            console.error('GraphQL errors:', storageResult.errors)
            throw new Error(`GraphQL error: ${errorMessages}`)
          }

          if (storageResult.error) {
            console.error('Apollo error:', storageResult.error)
            throw new Error(`GraphQL error: ${storageResult.error.message}`)
          }

          if (!storageResult.data) {
            console.error('No data in response:', storageResult)
            throw new Error('No data returned from storage URL query')
          }

          const uploadUrl = storageResult.data?.storage_product_upload?.url

          if (!uploadUrl) {
            console.error('Response structure:', storageResult.data)
            throw new Error(`Failed to get upload URL. Response structure: ${JSON.stringify(storageResult.data)}`)
          }

          console.log('Got presigned URL:', uploadUrl)

          // Step 3: Upload file to presigned URL
          console.log('Step 3: Uploading file to MinIO...')
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: formData.file,
            headers: {
              'Content-Type': formData.file.type
            }
          })

          if (!uploadResponse.ok) {
            throw new Error(`File upload failed: ${uploadResponse.statusText}`)
          }

          console.log('File uploaded successfully')
        }
        */

        setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' })
      }

      setProductSuccess(true)
      await refetch()

      // Close modal after a short delay
      setTimeout(() => {
        setProductModalOpen(false)
        setProductSuccess(false)
        setEditMode(false)
        setSelectedProduct(null)
      }, 1500)
    } catch (error) {
      console.error('Product submission error:', error)
      setProductError(error.message || 'Failed to save product. Please try again.')
      throw error
    }
  }

  // Handle edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setEditMode(true)
    setProductModalOpen(true)
  }

  // Handle delete product
  const handleDeleteProduct = (productId, productName) => {
    setDeleteDialog({ open: true, productId, productName })
  }

  // Confirm delete product
  const confirmDeleteProduct = () => {
    if (deleteDialog.productId) {
      deleteProduct({
        variables: { id: deleteDialog.productId }
      })
    }
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0)
  const totalSales = products.reduce((sum, product) => sum + product.sales, 0)
  const totalProducts = products.length
  const activeProducts = products.filter(product => product.status === 'Active').length

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Marketplace Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant='outlined' 
              startIcon={<Icon icon='tabler-shopping-cart' />}
              onClick={() => window.location.href = '/orders'}
            >
              View Orders
            </Button>
            <Button 
              variant='contained' 
              startIcon={<Icon icon='tabler-plus' />}
              onClick={() => {
                setEditMode(false)
                setSelectedProduct(null)
                setProductModalOpen(true)
              }}
            >
              Add New Product
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>

        {/* Product Modal */}
        <ProductModal
          open={productModalOpen}
          onClose={() => {
            setProductModalOpen(false)
            setProductError(null)
            setProductSuccess(false)
            setEditMode(false)
            setSelectedProduct(null)
          }}
          onSubmit={handleProductSubmit}
          error={productError}
          success={productSuccess}
          editMode={editMode}
          productData={selectedProduct}
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
            Marketplace Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant='outlined' 
              startIcon={<Icon icon='tabler-shopping-cart' />}
              onClick={() => window.location.href = '/orders'}
            >
              View Orders
            </Button>
            <Button 
              variant='contained' 
              startIcon={<Icon icon='tabler-plus' />}
              onClick={() => {
                setEditMode(false)
                setSelectedProduct(null)
                setProductModalOpen(true)
              }}
            >
              Add New Product
            </Button>
          </Box>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading marketplace products: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => refetch()}>
          Retry
        </Button>

        {/* Product Modal */}
        <ProductModal
          open={productModalOpen}
          onClose={() => {
            setProductModalOpen(false)
            setProductError(null)
            setProductSuccess(false)
            setEditMode(false)
            setSelectedProduct(null)
          }}
          onSubmit={handleProductSubmit}
          error={productError}
          success={productSuccess}
          editMode={editMode}
          productData={selectedProduct}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Marketplace Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant='outlined' 
            startIcon={<Icon icon='tabler-shopping-cart' />}
            onClick={() => window.location.href = '/orders'}
          >
            View Orders
          </Button>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => {
              setEditMode(false)
              setSelectedProduct(null)
              setProductModalOpen(true)
            }}
          >
            Add New Product
          </Button>
        </Box>
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

      {/* Products Table - Full Width */}
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
                  <TableCell>Featured</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {product.image ? (
                            <Avatar 
                              src={product.image} 
                              sx={{ width: 32, height: 32 }}
                              alt={product.name}
                            />
                          ) : (
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {product.name.charAt(0)}
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {product.description}
                              </Typography>
                            )}
                          </Box>
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
                      <TableCell>
                        {product.is_featured ? (
                          <Chip 
                            icon={<Icon icon='tabler-star' />}
                            label="Featured" 
                            color='warning' 
                            size='small' 
                          />
                        ) : (
                          <Typography variant='body2' color='text.secondary'>-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size='small' 
                          color='primary'
                          onClick={() => handleEditProduct(product)}
                        >
                          <Icon icon='tabler-edit' />
                        </IconButton>
                        <IconButton 
                          size='small' 
                          color='error'
                          onClick={() => handleDeleteProduct(product.id, product.name)}
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
                        <Icon icon='tabler-package-off' style={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant='body1' color='text.secondary'>
                          No products found
                        </Typography>
                        <Button 
                          variant='contained' 
                          startIcon={<Icon icon='tabler-plus' />}
                          onClick={() => {
                            setEditMode(false)
                            setSelectedProduct(null)
                            setProductModalOpen(true)
                          }}
                        >
                          Add Your First Product
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

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setProductError(null)
          setProductSuccess(false)
          setEditMode(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleProductSubmit}
        error={productError}
        success={productSuccess}
        editMode={editMode}
        productData={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, productId: null, productName: '' })}
        aria-labelledby="delete-product-dialog-title"
      >
        <DialogTitle id="delete-product-dialog-title">
          Delete Product
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.productName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, productId: null, productName: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteProduct}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <Icon icon='tabler-trash' />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MarketplacePage
