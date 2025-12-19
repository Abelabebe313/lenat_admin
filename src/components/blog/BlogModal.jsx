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
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

// Icon Imports
import { Icon } from '@iconify/react'

const BlogModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  error: externalError, 
  success: externalSuccess,
  editMode = false,
  initialData = null
}) => {
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    status: 'Active',
    state: 'Pending',
    is_premium: false,
    file: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // File input ref
  const fileInputRef = useRef(null)

  // Available options
  const blogTypes = ['Baby', 'First', 'Parental_Care', 'Second', 'Third']
  const statusOptions = ['Active', 'Inactive', 'Deleted']
  const stateOptions = [
    'Accepted', 'Available', 'Canceled', 'Done', 
    'InProgress', 'Out_Of_Stock', 'Paid', 'Pending', 'Rejected', 'UnPaid', 'Unavailable'
  ]

  // Initialize form with edit data
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        type: initialData.type || '',
        status: initialData.status || 'Active',
        state: initialData.state || 'Pending',
        is_premium: initialData.is_premium || false,
        file: null // Don't pre-fill file in edit mode
      })
    } else {
      setFormData({
        title: '',
        content: '',
        type: '',
        status: 'Active',
        state: 'Pending',
        is_premium: false,
        file: null
      })
    }
  }, [editMode, initialData, open])

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

  // Handle switch changes
  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.type) {
      newErrors.type = 'Type is required'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    // File is only required for create mode
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
      uploadData.append('title', formData.title)
      uploadData.append('content', formData.content)
      uploadData.append('type', formData.type)
      uploadData.append('status', formData.status)
      uploadData.append('state', formData.state)
      uploadData.append('is_premium', formData.is_premium)
      
      if (formData.file) {
        uploadData.append('file', formData.file)
      }

      if (editMode && initialData) {
        uploadData.append('id', initialData.id)
      }

      // Call the onSubmit prop with the form data
      await onSubmit(uploadData)
      
      // Reset form and close modal on success
      handleClose()
    } catch (error) {
      console.error('Submit error:', error)
      setErrors(prev => ({
        ...prev,
        submit: `Failed to ${editMode ? 'update' : 'create'} blog post. Please try again.`
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
        title: '',
        content: '',
        type: '',
        status: 'Active',
        state: 'Pending',
        is_premium: false,
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler-article' style={{ fontSize: 24 }} />
          <Box component="span" sx={{ fontWeight: 600 }}>
            {editMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {externalSuccess && (
            <Alert severity='success' sx={{ mb: 3 }}>
              Blog post {editMode ? 'updated' : 'created'} successfully!
            </Alert>
          )}
          
          {errors.submit && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}

          {/* Title Field */}
          <TextField
            fullWidth
            label='Blog Title'
            placeholder='Enter blog post title'
            value={formData.title}
            onChange={handleInputChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            sx={{ mb: 3 }}
            required
          />

          {/* Type and Status Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label='Type'
                onChange={handleInputChange('type')}
                required
              >
                {blogTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.status}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label='Status'
                onChange={handleInputChange('status')}
                required
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {errors.status && (
                <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                  {errors.status}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* State and Premium Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl fullWidth error={!!errors.state}>
              <InputLabel>State</InputLabel>
              <Select
                value={formData.state}
                label='State'
                onChange={handleInputChange('state')}
                required
              >
                {stateOptions.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
              {errors.state && (
                <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                  {errors.state}
                </Typography>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_premium}
                  onChange={handleSwitchChange('is_premium')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon='tabler-crown' />
                  <Typography>Premium Content</Typography>
                </Box>
              }
              sx={{ minWidth: 200 }}
            />
          </Box>

          {/* Content Field - Wide text area for large content */}
          <TextField
            fullWidth
            label='Content'
            placeholder='Write your blog post content here...'
            value={formData.content}
            onChange={handleInputChange('content')}
            multiline
            rows={8}
            sx={{ mb: 3 }}
          />

          {/* File Upload Area */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
              {editMode ? 'Update Featured Image (Optional)' : 'Upload Featured Image'}
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
                    PNG, JPG, GIF, WebP up to 10MB {editMode && '(Optional)'}
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
            {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Blog Post' : 'Create Blog Post')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default BlogModal
