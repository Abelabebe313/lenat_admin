'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery } from '@apollo/client/react'
import { GET_USERS } from '@/lib/graphql/queries'

const AppointmentModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  error, 
  success, 
  editMode = false, 
  appointmentData = null 
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    doctor_id: '',
    type: '',
    scheduled_at: '',
    description: '',
    medical_condition: '',
    surgery_history: '',
    patient_notes: '',
    state: 'Pending',
    payment_state: 'Pending'
  })
  const [loading, setLoading] = useState(false)

  // Fetch users for patient and doctor selection
  const { data: usersData } = useQuery(GET_USERS)
  const users = usersData?.users || []

  // Appointment types (only CALL is available in backend)
  const appointmentTypes = [
    { value: 'CALL', label: 'Call' }
  ]

  // State options
  const stateOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ]

  // Payment state options (using generic state enum)
  const paymentStateOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Paid' },
    { value: 'Rejected', label: 'Failed' },
    { value: 'Completed', label: 'Completed' }
  ]

  // Reset form when modal opens/closes or when appointmentData changes
  useEffect(() => {
    if (open) {
      if (editMode && appointmentData) {
        setFormData({
          user_id: appointmentData.user_id || '',
          doctor_id: appointmentData.doctor_id || '',
          type: appointmentData.type || '',
          scheduled_at: appointmentData.scheduled_at ? new Date(appointmentData.scheduled_at).toISOString().slice(0, 16) : '',
          description: appointmentData.description || '',
          medical_condition: appointmentData.medical_condition || '',
          surgery_history: appointmentData.surgery_history || '',
          patient_notes: appointmentData.patient_notes || '',
          state: appointmentData.state || 'Pending',
          payment_state: appointmentData.payment_state || 'Pending'
        })
      } else {
        setFormData({
          user_id: '',
          doctor_id: '',
          type: '',
          scheduled_at: '',
          description: '',
          medical_condition: '',
          surgery_history: '',
          patient_notes: '',
          state: 'Pending',
          payment_state: 'Pending'
        })
      }
    }
  }, [open, editMode, appointmentData])

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler-calendar' style={{ fontSize: 24 }} />
          {editMode ? 'Edit Appointment' : 'Create New Appointment'}
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Appointment {editMode ? 'updated' : 'created'} successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={formData.user_id}
                  label="Patient"
                  onChange={handleChange('user_id')}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.profile?.full_name || user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={formData.doctor_id}
                  label="Doctor"
                  onChange={handleChange('doctor_id')}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.profile?.full_name || user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Appointment Type"
                  onChange={handleChange('type')}
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Scheduled Date & Time"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={handleChange('scheduled_at')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.state}
                  label="Status"
                  onChange={handleChange('state')}
                >
                  {stateOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.payment_state}
                  label="Payment Status"
                  onChange={handleChange('payment_state')}
                >
                  {paymentStateOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Enter appointment description..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Medical Condition"
                value={formData.medical_condition}
                onChange={handleChange('medical_condition')}
                placeholder="Enter medical condition..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Surgery History"
                value={formData.surgery_history}
                onChange={handleChange('surgery_history')}
                placeholder="Enter surgery history..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Patient Notes"
                value={formData.patient_notes}
                onChange={handleChange('patient_notes')}
                placeholder="Enter patient notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Icon icon='tabler-check' />}
          >
            {loading ? 'Saving...' : (editMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AppointmentModal
