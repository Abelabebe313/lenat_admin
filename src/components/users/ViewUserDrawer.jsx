import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import { Icon } from '@iconify/react'

const ViewUserDrawer = ({ open, handleClose, user }) => {
  if (!user) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: 300, sm: 400 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3
        }}
      >
        <Typography variant='h6'>User Details</Typography>
        <IconButton onClick={handleClose}>
          <Icon icon='tabler-x' />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={user.avatar}
            alt={user.fullName}
            sx={{ width: 100, height: 100, mb: 2 }}
          >
            {user.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {user.fullName}
          </Typography>
          <Chip
            label={user.role}
            color='primary'
            size='small'
            sx={{ mt: 1, textTransform: 'capitalize' }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='subtitle2' color='text.secondary'>
              Email
            </Typography>
            <Typography variant='body1'>{user.email}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle2' color='text.secondary'>
              Phone Number
            </Typography>
            <Typography variant='body1'>{user.phoneNumber || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              Gender
            </Typography>
            <Typography variant='body1' sx={{ textTransform: 'capitalize' }}>
              {user.gender || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='subtitle2' color='text.secondary'>
              Birth Date
            </Typography>
            <Typography variant='body1'>{user.birthDate || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle2' color='text.secondary'>
              Status
            </Typography>
            <Chip
              label={user.status}
              color={getStatusColor(user.status)}
              size='small'
              sx={{ mt: 0.5, textTransform: 'capitalize' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle2' color='text.secondary'>
              User ID
            </Typography>
            <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
              {user.id}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  )
}

export default ViewUserDrawer
