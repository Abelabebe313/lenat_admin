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

// Icon Imports
import { Icon } from '@iconify/react'

const BlogUploadModal = ({ open, onClose, onSubmit, error: externalError, success: externalSuccess }) => {
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    file: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // File input ref
  const fileInputRef = useRef(null)

  // Available blog post types
  const blogTypes = ['Baby', 'First', 'Parental_Care', 'Second', 'Third']

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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.type) {
      newErrors.type = 'Type is required'
    }

    if (!formData.file) {
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
      uploadData.append('file', formData.file)

      // Call the onSubmit prop with the form data
      await onSubmit(uploadData)
      
      // Reset form and close modal on success
      handleClose()
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to upload blog post. Please try again.'
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
            Create New Blog Post
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {externalSuccess && (
            <Alert severity='success' sx={{ mb: 3 }}>
              Blog post created successfully!
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

          {/* Type Selector */}
          <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.type}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label='Type'
              onChange={handleInputChange('type')}
              required
            >
              {blogTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {errors.type && (
              <Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
                {errors.type}
              </Typography>
            )}
          </FormControl>

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
              Upload Featured Image
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
            startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler-upload' />}
          >
            {loading ? 'Creating...' : 'Create Blog Post'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default BlogUploadModal

