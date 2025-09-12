'use client'

// React Imports
import { useState, useMemo } from 'react'

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

// Icon Imports
import { Icon } from '@iconify/react'

// GraphQL Imports
import { useQuery } from '@apollo/client/react'
import { GET_USERS } from '@lib/graphql/queries'

const UsersPage = () => {
  // GraphQL query to fetch users
  const { data, loading, error } = useQuery(GET_USERS)

  // Transform GraphQL data to match our UI structure
  const users = useMemo(() => {
    if (!data?.users) return []
    
    return data.users.map(user => ({
      id: user.id,
      fullName: user.profile?.full_name || 'Unknown User',
      email: user.email || 'No email',
      gender: user.profile?.gender ? 
        user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1) : 
        'Unknown',
      role: 'User', // Default role since it's not in the API response
      status: user.status,
      lastLogin: 'N/A', // Not available in the API response
      avatar: user.profile?.media?.url || null,
      phoneNumber: user.phone_number,
      birthDate: user.profile?.birth_date,
      profile: user.profile
    }))
  }, [data])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'error'
      default:
        return 'default'
    }
  }


  const getGenderColor = (gender) => {
    switch (gender) {
      case 'Male':
        return 'info'
      case 'Female':
        return 'secondary'
      default:
        return 'default'
    }
  }

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
        <Alert severity='error' sx={{ mb: 3 }}>
          Error loading users: {error.message}
        </Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
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
        <Button variant='contained' startIcon={<Icon icon='tabler-user-plus' />}>
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
                    {users.length}
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
                    {users.filter(u => u.status === 'Active').length}
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
                    {users.filter(u => u.role === 'Admin').length}
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
                    {users.filter(u => u.status === 'Inactive').length}
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

      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            User List
          </Typography>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Image</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar 
                        src={user.avatar} 
                        alt={user.fullName}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.fullName.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {user.id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {user.fullName}
                        </Typography>
                        {user.phoneNumber && (
                          <Typography variant='caption' color='text.secondary'>
                            {user.phoneNumber}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.gender} 
                        color={getGenderColor(user.gender)} 
                        size='small' 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={getStatusColor(user.status)} 
                        size='small' 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
                        {user.lastLogin}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size='small' color='primary'>
                        <Icon icon='tabler-edit' />
                      </IconButton>
                      <IconButton size='small' color='info'>
                        <Icon icon='tabler-eye' />
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

export default UsersPage
