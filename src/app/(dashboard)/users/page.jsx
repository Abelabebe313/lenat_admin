'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

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
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_USERS, GET_USER_STATS } from '@lib/graphql/queries'
import { DELETE_USER } from '@lib/graphql/mutations'

// Component Imports
import UserModal from '@/components/users/UserModal'
import ViewUserDrawer from '@/components/users/ViewUserDrawer'
import { toast } from 'react-hot-toast'

const UsersPage = () => {
  // States
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openUserModal, setOpenUserModal] = useState(false)
  const [openViewDrawer, setOpenViewDrawer] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // GraphQL query variables
  const queryVariables = useMemo(() => {
    const variables = {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      where: {}
    }

    if (searchTerm) {
      variables.where = {
        _or: [
          { email: { _ilike: `%${searchTerm}%` } },
          { phone_number: { _ilike: `%${searchTerm}%` } },
          { profile: { full_name: { _ilike: `%${searchTerm}%` } } }
        ]
      }
    }

    return variables
  }, [page, rowsPerPage, searchTerm])

  // GraphQL query to fetch users
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: queryVariables,
    fetchPolicy: 'network-only'
  })

  // GraphQL query to fetch stats
  const { data: statsData, refetch: refetchStats, error: statsError } = useQuery(GET_USER_STATS, {
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (statsError) {
      toast.error(`Error loading stats: ${statsError.message}`)
    }
  }, [statsError])

  // Delete mutation
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      refetch()
      refetchStats()
    },
    onError: (error) => {
      toast.error(`Error deleting user: ${error.message}`)
    }
  })

  // Transform GraphQL data to match our UI structure
  const users = useMemo(() => {
    if (!data?.users) return []
    
    return data.users.map(user => ({
      id: user.id,
      fullName: user.profile?.full_name || 'Unknown User',
      email: user.email || 'No email',
      gender: user.profile?.gender || 'unknown',
      role: user.roles?.[0]?.role || 'subscriber',
      status: user.status || 'Active',
      avatar: user.profile?.media?.url || null,
      phoneNumber: user.phone_number,
      birthDate: user.profile?.birth_date,
      profile: user.profile,
      createdAt: user.created_at,
      roles: user.roles
    }))
  }, [data])

  const totalUsers = data?.users_aggregate?.aggregate?.count || 0

  const stats = useMemo(() => ({
    total: statsData?.total?.aggregate?.count || 0,
    active: statsData?.active?.aggregate?.count || 0,
    inactive: statsData?.inactive?.aggregate?.count || 0,
    admins: statsData?.admins?.aggregate?.count || 0
  }), [statsData])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'error'
      default:
        return 'default'
    }
  }

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'info'
      case 'female':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setOpenUserModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setOpenUserModal(true)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setOpenViewDrawer(true)
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser({ variables: { id: userToDelete.id } })
    }
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          Error loading users: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        <Button 
          variant='contained' 
          startIcon={<Icon icon='tabler-user-plus' />}
          onClick={handleAddUser}
        >
          Add New User
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
                  <Icon icon='tabler-users' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Users
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
                  <Icon icon='tabler-user-check' style={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Active Users
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
                    backgroundColor: 'error.15'
                  }}
                >
                  <Icon icon='tabler-shield' style={{ fontSize: 24, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {stats.admins}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Administrators
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
                  <Icon icon='tabler-user-x' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {stats.inactive}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Inactive Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              User List
            </Typography>
            <TextField
              size='small'
              placeholder='Search User'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='tabler-search' />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
               <CircularProgress />
             </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align='center'>
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                src={user.avatar} 
                                alt={user.fullName}
                                sx={{ width: 40, height: 40 }}
                              >
                                {user.fullName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                  {user.fullName}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon 
                                icon={user.role === 'admin' ? 'tabler-device-laptop' : 'tabler-user'} 
                                fontSize={20}
                                color={user.role === 'admin' ? 'error.main' : 'primary.main'}
                              />
                              <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                                {user.role}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status} 
                              color={getStatusColor(user.status)} 
                              size='small' 
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>
                              {user.phoneNumber || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size='small' color='primary' onClick={() => handleEditUser(user)}>
                              <Icon icon='tabler-edit' />
                            </IconButton>
                            <IconButton size='small' color='info' onClick={() => handleViewUser(user)}>
                              <Icon icon='tabler-eye' />
                            </IconButton>
                            <IconButton size='small' color='error' onClick={() => handleDeleteClick(user)}>
                              <Icon icon='tabler-trash' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={totalUsers}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <UserModal 
        open={openUserModal} 
        handleClose={() => setOpenUserModal(false)} 
        user={selectedUser} 
      />

      <ViewUserDrawer 
        open={openViewDrawer} 
        handleClose={() => setOpenViewDrawer(false)} 
        user={selectedUser} 
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{userToDelete?.fullName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' autoFocus disabled={deleteLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersPage
