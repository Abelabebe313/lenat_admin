import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { Icon } from '@iconify/react'
import { useMutation } from '@apollo/client/react'
import { INSERT_USER, UPDATE_USER } from '@lib/graphql/mutations'
import { GET_USERS } from '@lib/graphql/queries'
import { toast } from 'react-hot-toast'

const UserModal = ({ open, handleClose, user }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    gender: '',
    birthDate: '',
    role: 'subscriber',
    status: 'Active'
  })
  const [showPassword, setShowPassword] = useState(false)

  const [insertUser, { loading: insertLoading }] = useMutation(INSERT_USER, {
    refetchQueries: [GET_USERS],
    onCompleted: () => {
      toast.success('User created successfully')
      handleClose()
      resetForm()
    },
    onError: (error) => {
      toast.error(`Error creating user: ${error.message}`)
    }
  })

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    refetchQueries: [GET_USERS],
    onCompleted: () => {
      toast.success('User updated successfully')
      handleClose()
      resetForm()
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error.message}`)
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '', // Don't populate password on edit
        gender: user.profile?.gender || '',
        birthDate: user.birthDate || '',
        role: user.roles?.[0]?.role || 'subscriber',
        status: user.status || 'Active'
      })
    } else {
      resetForm()
    }
  }, [user])

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      gender: '',
      birthDate: '',
      role: 'subscriber',
      status: 'Active'
    })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (user) {
      updateUser({
        variables: {
          id: user.id,
          email: formData.email,
          phone_number: formData.phoneNumber,
          full_name: formData.fullName,
          gender: formData.gender,
          birth_date: formData.birthDate || null,
          status: formData.status,
          role: formData.role
        }
      })
    } else {
      const newUserId = crypto.randomUUID()
      insertUser({
        variables: {
          id: newUserId,
          email: formData.email,
          phone_number: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
          full_name: formData.fullName,
          gender: formData.gender,
          birth_date: formData.birthDate || null,
          status: formData.status
        }
      })
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Full Name'
                name='fullName'
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone Number'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Grid>
            {!user && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Icon icon={showPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value='male'>Male</MenuItem>
                <MenuItem value='female'>Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Birth Date'
                name='birthDate'
                type='date'
                value={formData.birthDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Role'
                name='role'
                value={formData.role}
                onChange={handleChange}
              >
                <MenuItem value='subscriber'>Subscriber</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='doctor'>Doctor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Status'
                name='status'
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
          <Button 
            type='submit' 
            variant='contained' 
            disabled={insertLoading || updateLoading}
          >
            {user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UserModal
