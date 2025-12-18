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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

// Icon Imports
import { Icon } from '@iconify/react'

const FeedUploadModal = ({ open, onClose, onSubmit, error: externalError, success: externalSuccess, editMode = false, editingFeed = null }) => {
  // Form states
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    state: 'Accepted',
    file: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // File input ref
  const fileInputRef = useRef(null)

  // Available categories (same as in feeds page)
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

  // Populate form when editing
  // Populate form when editing
  useEffect(() => {
    if (editMode && editingFeed) {
      setFormData({
        description: editingFeed.description || '',
        category: editingFeed.category || '',
        state: editingFeed.status || 'Accepted',
        file: null
      })
    } else {
      setFormData({
        description: '',
        category: '',
        state: 'Accepted',
        file: null
      })
    }
  }, [editMode, editingFeed])

  // Format category names for display
  const formatCategoryName = (category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
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

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    // File is required only when creating new feed
    if (!editMode && !formData.file) {
      newErrors.file = 'Please select a file to upload'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Clear external error when modal closes or form changes
  useEffect(() => {
    if (externalError) {
      setErrors(prev => ({ ...prev, submit: externalError }))
    }
  }, [externalError])

  // Handle success state
  useEffect(() => {
    if (externalSuccess) {
      // Success is handled in parent, just clear local errors
      setErrors({})
    }
  }, [externalSuccess])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('description', formData.description)
      uploadData.append('category', formData.category)
      uploadData.append('state', formData.state)
      if (formData.file) {
        uploadData.append('file', formData.file)
      }

      // Call the onSubmit prop with the form data
      await onSubmit(uploadData)
      
      // Reset form and close modal on success
      handleClose()
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to upload feed. Please try again.'
      }))
    } finally {
      setLoading(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    // Only reset if not closing due to success
    if (!externalSuccess) {
    setFormData({
      description: '',
      category: '',
      state: 'Accepted',
      file: null
    })
    setErrors({})
    }
    setLoading(false)
    setDragActive(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler-upload' style={{ fontSize: 24 }} />
          <Box component="span" sx={{ fontWeight: 600 }}>
            {editMode ? 'Edit Feed' : 'Upload New Feed'}
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {externalSuccess && (
            <Alert severity='success' sx={{ mb: 3 }}>
              Feed uploaded successfully!
            </Alert>
          )}
          
          {errors.submit && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}


          {/* Description Field */}
          <TextField
            fullWidth
            label='Description'
            placeholder='Enter feed description'
            value={formData.description}
            onChange={handleInputChange('description')}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          {/* Category Selector */}
          <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.category}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label='Category'
              onChange={handleInputChange('category')}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {formatCategoryName(category)}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                {errors.category}
              </Typography>
            )}
          </FormControl>

          {/* State Selector */}
          <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.state}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.state}
              label='Status'
              onChange={handleInputChange('state')}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* File Upload Area */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
              {editMode ? 'Upload New Image (Optional)' : 'Upload Image'}
            </Typography>
            
            {/* Show current image in edit mode */}
            {editMode && editingFeed?.media?.url && !formData.file && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                  Current Image:
                </Typography>
                <Box
                  component="img"
                  src={editingFeed.media.url}
                  alt={editingFeed.name}
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2
                  }}
                />
              </Box>
            )}
            
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
                    {dragActive ? 'Drop your image here' : (editMode ? 'Click to upload a new image' : 'Click to upload or drag and drop')}
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
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            variant='outlined'
          >
            Cancel
          </Button>
          <Button 
            type='submit' 
            variant='contained'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Icon icon={editMode ? 'tabler-check' : 'tabler-upload'} />}
          >
            {loading ? (editMode ? 'Updating...' : 'Uploading...') : (editMode ? 'Update Feed' : 'Upload Feed')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default FeedUploadModal
