'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Icon Imports
import { Icon } from '@iconify/react'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Lenat Admin',
    siteDescription: 'Admin panel for Lenat platform',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en'
  })

  const [notifications, setNotifications] = useState({
    newUser: true,
    newOrder: true,
    newPost: false,
    systemAlerts: true,
    marketing: false
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', { settings, notifications })
    // Show success message or handle response
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
        <Button variant='contained' onClick={handleSave}>
          Save Changes
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                General Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label='Site Name'
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                />
                
                <TextField
                  fullWidth
                  label='Site Description'
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  multiline
                  rows={2}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.timezone}
                    label='Timezone'
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <MenuItem value='UTC'>UTC</MenuItem>
                    <MenuItem value='EST'>Eastern Time</MenuItem>
                    <MenuItem value='PST'>Pacific Time</MenuItem>
                    <MenuItem value='GMT'>GMT</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    label='Date Format'
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <MenuItem value='MM/DD/YYYY'>MM/DD/YYYY</MenuItem>
                    <MenuItem value='DD/MM/YYYY'>DD/MM/YYYY</MenuItem>
                    <MenuItem value='YYYY-MM-DD'>YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    label='Language'
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <MenuItem value='en'>English</MenuItem>
                    <MenuItem value='es'>Spanish</MenuItem>
                    <MenuItem value='fr'>French</MenuItem>
                    <MenuItem value='de'>German</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                System Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    />
                  }
                  label='Maintenance Mode'
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowRegistration}
                      onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                    />
                  }
                  label='Allow User Registration'
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label='Email Notifications'
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                  }
                  label='SMS Notifications'
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Notification Preferences
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.newUser}
                        onChange={(e) => handleNotificationChange('newUser', e.target.checked)}
                      />
                    }
                    label='New User Registration'
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.newOrder}
                        onChange={(e) => handleNotificationChange('newOrder', e.target.checked)}
                      />
                    }
                    label='New Marketplace Orders'
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.newPost}
                        onChange={(e) => handleNotificationChange('newPost', e.target.checked)}
                      />
                    }
                    label='New Blog Posts'
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.systemAlerts}
                        onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                      />
                    }
                    label='System Alerts'
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.marketing}
                        onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                      />
                    }
                    label='Marketing Updates'
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Security Settings
              </Typography>
              
              <Alert severity='info' sx={{ mb: 3 }}>
                Security settings are managed by the system administrator. Contact your admin for changes.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Enabled for all admin users
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      Session Timeout
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      30 minutes of inactivity
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      Password Policy
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Minimum 8 characters, mixed case
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SettingsPage
