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
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import TablePagination from '@mui/material/TablePagination'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { GET_APPOINTMENTS } from '@/lib/graphql/queries'
import { CREATE_APPOINTMENT, UPDATE_APPOINTMENT, DELETE_APPOINTMENT } from '@/lib/graphql/mutations'

// Component Imports
import AppointmentModal from '@/components/appointments/AppointmentModal'

// Context Imports
import { useAuth } from '@contexts/AuthContext'

const AppointmentsPage = () => {
  const { user } = useAuth()

  // Modal states
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointmentError, setAppointmentError] = useState(null)
  const [appointmentSuccess, setAppointmentSuccess] = useState(false)

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, appointmentId: null, patientName: '' })

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Search, filter, and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Fetch appointments from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_APPOINTMENTS)

  // Mutation to create appointment
  const [createAppointment] = useMutation(CREATE_APPOINTMENT)

  // Mutation to update appointment
  const [updateAppointment] = useMutation(UPDATE_APPOINTMENT)

  // Mutation to delete appointment
  const [deleteAppointment, { loading: deleting }] = useMutation(DELETE_APPOINTMENT, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Appointment deleted successfully!', severity: 'success' })
      setDeleteDialog({ open: false, appointmentId: null, patientName: '' })
      refetch()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting appointment: ${error.message}`, severity: 'error' })
      setDeleteDialog({ open: false, appointmentId: null, patientName: '' })
    }
  })

  // Transform the GraphQL data to match our UI needs
  const rawAppointments = data?.consultant_appointments?.map(appointment => ({
    id: appointment.id,
    user_id: appointment.user_id,
    doctor_id: appointment.doctor_id,
    type: appointment.type,
    scheduled_at: appointment.scheduled_at,
    description: appointment.description,
    medical_condition: appointment.medical_condition,
    surgery_history: appointment.surgery_history,
    patient_notes: appointment.patient_notes,
    state: appointment.state,
    payment_state: appointment.payment_state,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    patientName: appointment.user?.profile?.full_name || 'Unknown Patient',
    patientEmail: appointment.user?.email || '',
    patientPhone: appointment.user?.phone_number || '',
    patientAvatar: appointment.user?.profile?.media?.url || null,
    doctorEmail: appointment.doctor?.email || 'Not Assigned',
    doctorPhone: appointment.doctor?.phone_number || '',
    roomId: appointment.room?.id || null
  })) || []

  // Filter and Search Logic
  const filteredAppointments = rawAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.state === statusFilter
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination Logic
  const appointments = filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
      case 'Completed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getPaymentColor = (paymentState) => {
    switch (paymentState) {
      case 'Accepted': // Paid
      case 'Completed':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Rejected': // Failed
        return 'error'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'CALL':
        return 'primary'
      case 'CHAT':
        return 'secondary'
      default:
        return 'default'
    }
  }

  // Handle appointment creation/update
  const handleAppointmentSubmit = async (formData) => {
    setAppointmentError(null)
    setAppointmentSuccess(false)

    try {
      if (editMode && selectedAppointment) {
        // Update existing appointment
        const updateVariables = {
          id: selectedAppointment.id,
          type: formData.type,
          scheduled_at: formData.scheduled_at,
          description: formData.description || null,
          medical_condition: formData.medical_condition || null,
          surgery_history: formData.surgery_history || null,
          patient_notes: formData.patient_notes || null,
          state: formData.state,
          payment_state: formData.payment_state
        }
        
        // Only include doctor_id if it has a value
        if (formData.doctor_id) {
          updateVariables.doctor_id = formData.doctor_id
        }
        
        await updateAppointment({ variables: updateVariables })
        setSnackbar({ open: true, message: 'Appointment updated successfully!', severity: 'success' })
      } else {
        // Validate required fields
        if (!formData.user_id) {
          throw new Error('Please select a patient')
        }

        // Create new appointment
        console.log('Creating appointment with data:', formData)
        
        const variables = {
          user_id: formData.user_id,
          doctor_id: formData.doctor_id || null,
          type: formData.type,
          scheduled_at: formData.scheduled_at,
          description: formData.description || null,
          medical_condition: formData.medical_condition || null,
          surgery_history: formData.surgery_history || null,
          patient_notes: formData.patient_notes || null,
          state: formData.state,
          payment_state: formData.payment_state
        }
        
        console.log('Mutation variables:', variables)
        
        await createAppointment({ variables })
        setSnackbar({ open: true, message: 'Appointment created successfully!', severity: 'success' })
      }

      setAppointmentSuccess(true)
      await refetch()

      // Close modal after a short delay
      setTimeout(() => {
        setAppointmentModalOpen(false)
        setAppointmentSuccess(false)
        setEditMode(false)
        setSelectedAppointment(null)
      }, 1500)
    } catch (error) {
      console.error('Appointment submission error:', error)
      setAppointmentError(error.message || 'Failed to save appointment. Please try again.')
      throw error
    }
  }

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setEditMode(true)
    setAppointmentModalOpen(true)
  }

  // Handle delete appointment
  const handleDeleteAppointment = (appointmentId, patientName) => {
    setDeleteDialog({ open: true, appointmentId, patientName })
  }

  // Confirm delete appointment
  const confirmDeleteAppointment = () => {
    if (deleteDialog.appointmentId) {
      deleteAppointment({
        variables: { id: deleteDialog.appointmentId }
      })
    }
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Calculate statistics
  const totalAppointments = filteredAppointments.length
  const pendingAppointments = filteredAppointments.filter(a => a.state === 'Pending').length
  const completedAppointments = filteredAppointments.filter(a => a.state === 'Completed').length
  const todayAppointments = filteredAppointments.filter(a => {
    const today = new Date().toDateString()
    const appointmentDate = new Date(a.scheduled_at).toDateString()
    return today === appointmentDate
  }).length

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Appointments Management
          </Typography>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => {
              setEditMode(false)
              setSelectedAppointment(null)
              setAppointmentModalOpen(true)
            }}
          >
            Schedule Appointment
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>

        {/* Appointment Modal */}
        <AppointmentModal
          open={appointmentModalOpen}
          onClose={() => {
            setAppointmentModalOpen(false)
            setAppointmentError(null)
            setAppointmentSuccess(false)
            setEditMode(false)
            setSelectedAppointment(null)
          }}
          onSubmit={handleAppointmentSubmit}
          error={appointmentError}
          success={appointmentSuccess}
          editMode={editMode}
          appointmentData={selectedAppointment}
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
            Appointments Management
          </Typography>
          <Button 
            variant='contained' 
            startIcon={<Icon icon='tabler-plus' />}
            onClick={() => {
              setEditMode(false)
              setSelectedAppointment(null)
              setAppointmentModalOpen(true)
            }}
          >
            Schedule Appointment
          </Button>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading appointments: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => refetch()}>
          Retry
        </Button>

        {/* Appointment Modal */}
        <AppointmentModal
          open={appointmentModalOpen}
          onClose={() => {
            setAppointmentModalOpen(false)
            setAppointmentError(null)
            setAppointmentSuccess(false)
            setEditMode(false)
            setSelectedAppointment(null)
          }}
          onSubmit={handleAppointmentSubmit}
          error={appointmentError}
          success={appointmentSuccess}
          editMode={editMode}
          appointmentData={selectedAppointment}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Appointments Management
        </Typography>
        <Button 
          variant='contained' 
          startIcon={<Icon icon='tabler-plus' />}
          onClick={() => {
            setEditMode(false)
            setSelectedAppointment(null)
            setAppointmentModalOpen(true)
          }}
        >
          Schedule Appointment
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
                  <Icon icon='tabler-calendar' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalAppointments}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Appointments
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
                    {pendingAppointments}
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
                    backgroundColor: 'success.15'
                  }}
                >
                  <Icon icon='tabler-check-circle' style={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {completedAppointments}
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
                    backgroundColor: 'info.15'
                  }}
                >
                  <Icon icon='tabler-calendar-event' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {todayAppointments}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Appointments Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Appointments
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size='small'
                placeholder='Search appointments...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler-search' />
                    </InputAdornment>
                  )
                }}
                sx={{ width: 250 }}
              />
              <FormControl size='small' sx={{ width: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label='Status'
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Status</MenuItem>
                  <MenuItem value='Pending'>Pending</MenuItem>
                  <MenuItem value='Accepted'>Accepted</MenuItem>
                  <MenuItem value='Completed'>Completed</MenuItem>
                  <MenuItem value='Rejected'>Rejected</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ width: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label='Type'
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Types</MenuItem>
                  <MenuItem value='CALL'>Call</MenuItem>
                  <MenuItem value='CHAT'>Chat</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {appointment.patientAvatar ? (
                            <Avatar 
                              src={appointment.patientAvatar} 
                              sx={{ width: 32, height: 32 }}
                              alt={appointment.patientName}
                            />
                          ) : (
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {appointment.patientName.charAt(0)}
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {appointment.patientName}
                            </Typography>
                            {appointment.patientEmail && (
                              <Typography variant='caption' color='text.secondary'>
                                {appointment.patientEmail}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.type} 
                          color={getTypeColor(appointment.type)} 
                          size='small' 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {new Date(appointment.scheduled_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.state} 
                          color={getStatusColor(appointment.state)} 
                          size='small' 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.payment_state} 
                          color={getPaymentColor(appointment.payment_state)} 
                          size='small' 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size='small' 
                          color='primary'
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Icon icon='tabler-edit' />
                        </IconButton>
                        <IconButton 
                          size='small' 
                          color='error'
                          onClick={() => handleDeleteAppointment(appointment.id, appointment.patientName)}
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
                        <Icon icon='tabler-calendar-off' style={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant='body1' color='text.secondary'>
                          No appointments found
                        </Typography>
                        <Button 
                          variant='contained' 
                          startIcon={<Icon icon='tabler-plus' />}
                          onClick={() => {
                            setEditMode(false)
                            setSelectedAppointment(null)
                            setAppointmentModalOpen(true)
                          }}
                        >
                          Schedule Your First Appointment
                        </Button>
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
            count={filteredAppointments.length}
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

      {/* Appointment Modal */}
      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => {
          setAppointmentModalOpen(false)
          setAppointmentError(null)
          setAppointmentSuccess(false)
          setEditMode(false)
          setSelectedAppointment(null)
        }}
        onSubmit={handleAppointmentSubmit}
        error={appointmentError}
        success={appointmentSuccess}
        editMode={editMode}
        appointmentData={selectedAppointment}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, appointmentId: null, patientName: '' })}
        aria-labelledby="delete-appointment-dialog-title"
      >
        <DialogTitle id="delete-appointment-dialog-title">
          Delete Appointment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the appointment for <strong>{deleteDialog.patientName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, appointmentId: null, patientName: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteAppointment} 
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AppointmentsPage
