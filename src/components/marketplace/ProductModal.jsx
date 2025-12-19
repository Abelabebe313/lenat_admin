'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Icon Imports
import { Icon } from '@iconify/react'

// Apollo Client Imports
import { useQuery } from '@apollo/client/react'

// MUI Autocomplete Import
import Autocomplete from '@mui/material/Autocomplete'

const CATEGORIES = [
  { id: 'pregnancy_clothes', name: 'Pregnancy Clothes' },
  { id: 'kids_clothes', name: 'Kids Clothes' },
  { id: 'kids_toys', name: 'Kids Toys' },
  { id: 'gifts', name: 'Gifts' }
]

const ProductModal = ({ open, onClose, onSubmit, error, success, editMode = false, productData = null }) => {
  // Use static categories
  const categories = CATEGORIES

  const [formData, setFormData] = useState({
    name: productData?.name || '',
    price: productData?.price || '',
    description: productData?.description || '',
    is_active: productData?.is_active ?? true,
    is_featured: productData?.is_featured ?? false,
    categories: productData?.categories || [],
    file: null
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // File input ref
  const fileInputRef = useRef(null)

  // Update form when productData changes
  useEffect(() => {
    if (productData && editMode) {
      setFormData({
        name: productData.name || '',
        price: productData.price || '',
        description: productData.description || '',
        is_active: productData.is_active ?? true,
        is_featured: productData.is_featured ?? false,
        categories: productData.categories || [],
        file: null
      })
    }
  }, [productData, editMode])

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
        }))
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 10MB'
        }))
        return
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }))
      
      // Clear file error
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: ''
        }))
      }
    }
  }

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0]
    handleFileSelect(file)
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click()
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      // Reset form on success
      if (!editMode) {
        setFormData({
          name: '',
          price: '',
          description: '',
          is_active: true,
          is_featured: false,
          categories: [],
          file: null
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err) {
      console.error('Error submitting product:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        price: '',
        description: '',
        is_active: true,
        is_featured: false,
        categories: [],
        file: null
      })
      setErrors({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler-package' style={{ fontSize: 24 }} />
          {editMode ? 'Edit Product' : 'Add New Product'}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Product {editMode ? 'updated' : 'created'} successfully!
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Product Name */}
          <TextField
            fullWidth
            required
            label="Product Name"
            value={formData.name}
            onChange={handleChange('name')}
            disabled={loading || success}
            placeholder="Enter product name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon='tabler-tag' />
                </InputAdornment>
              ),
            }}
          />

          {/* Price */}
          <TextField
            fullWidth
            required
            type="number"
            label="Price"
            value={formData.price}
            onChange={handleChange('price')}
            disabled={loading || success}
            placeholder="0.00"
            inputProps={{
              min: 0,
              step: 0.01
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon='tabler-currency-dollar' />
                </InputAdornment>
              ),
            }}
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            disabled={loading || success}
            placeholder="Enter product description (optional)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                  <Icon icon='tabler-file-text' />
                </InputAdornment>
              ),
            }}
          />

          {/* Category Selection */}
          <Autocomplete
            multiple
            options={categories}
            getOptionLabel={(option) => option.name}
            value={categories.filter(cat => formData.categories.includes(cat.id))}
            onChange={(event, newValue) => {
              setFormData(prev => ({
                ...prev,
                categories: newValue.map(cat => cat.id)
              }))
            }}
            disabled={loading || success}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categories"
                placeholder="Select categories"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Icon icon='tabler-category' />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />

          {/* File Upload Area */}
          {!editMode && (
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                Product Image {editMode ? '(Optional)' : ''}
              </Typography>
              
              <Paper
                variant='outlined'
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: dragActive ? '2px dashed' : '1px dashed',
                  borderColor: dragActive ? 'primary.main' : 'divider',
                  backgroundColor: dragActive ? 'primary.5' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.5'
                  }
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleFileInputClick}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                
                {formData.file ? (
                  <Box>
                    <Icon icon='tabler-file-image' style={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      {formData.file.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ mb: 2, display: 'block' }}>
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Chip
                      label='Remove'
                      size='small'
                      color='error'
                      variant='outlined'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile()
                      }}
                    />
                  </Box>
                ) : (
                  <Box>
                    <Icon icon='tabler-cloud-upload' style={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      PNG, JPG, GIF, WebP up to 10MB
                    </Typography>
                  </Box>
                )}
              </Paper>
              
              {errors.file && (
                <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                  {errors.file}
                </Typography>
              )}
            </Box>
          )}

          {/* Active Status */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleChange('is_active')}
                disabled={loading || success}
              />
            }
            label="Active (Product is available for purchase)"
          />

          {/* Featured Status */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_featured}
                onChange={handleChange('is_featured')}
                disabled={loading || success}
              />
            }
            label="Featured (Show on homepage)"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="contained"
          disabled={loading || success || !formData.name || !formData.price}
          startIcon={loading ? <CircularProgress size={20} /> : <Icon icon='tabler-check' />}
        >
          {loading ? 'Saving...' : editMode ? 'Update Product' : 'Create Product'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductModal
