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

// Icon Imports
import { Icon } from '@iconify/react'

const TriviaPage = () => {
  const [games] = useState([
    {
      id: 1,
      title: 'Tech Quiz 2024',
      category: 'Technology',
      difficulty: 'Medium',
      status: 'Active',
      questions: 20,
      players: 156,
      avgScore: 75.5
    },
    {
      id: 2,
      title: 'History Masters',
      category: 'History',
      difficulty: 'Hard',
      status: 'Active',
      questions: 25,
      players: 89,
      avgScore: 62.3
    },
    {
      id: 3,
      title: 'Science Fun',
      category: 'Science',
      difficulty: 'Easy',
      status: 'Draft',
      questions: 15,
      players: 0,
      avgScore: 0
    }
  ])

  const [leaderboard] = useState([
    {
      rank: 1,
      player: 'Alice Johnson',
      score: 95,
      game: 'Tech Quiz 2024',
      date: '2024-01-15'
    },
    {
      rank: 2,
      player: 'Bob Smith',
      score: 92,
      game: 'Tech Quiz 2024',
      date: '2024-01-15'
    },
    {
      rank: 3,
      player: 'Carol Davis',
      score: 88,
      game: 'History Masters',
      date: '2024-01-14'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Draft':
        return 'warning'
      case 'Archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'success'
      case 'Medium':
        return 'warning'
      case 'Hard':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Technology':
        return 'primary'
      case 'History':
        return 'secondary'
      case 'Science':
        return 'info'
      default:
        return 'default'
    }
  }

  const totalGames = games.length
  const activeGames = games.filter(game => game.status === 'Active').length
  const totalPlayers = games.reduce((sum, game) => sum + game.players, 0)
  const avgScore = games.reduce((sum, game) => sum + game.avgScore, 0) / games.length

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Trivia Game Management
        </Typography>
        <Button variant='contained' startIcon={<Icon icon='tabler-plus' />}>
          Create New Game
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
                  <Icon icon='tabler-gamepad' style={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalGames}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Games
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
                  <Icon icon='tabler-users' style={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {totalPlayers}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Players
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
                  <Icon icon='tabler-trophy' style={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {avgScore.toFixed(1)}%
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Average Score
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
                  <Icon icon='tabler-check-circle' style={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {activeGames}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Active Games
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Trivia Games
              </Typography>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Game</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Questions</TableCell>
                      <TableCell>Players</TableCell>
                      <TableCell>Avg Score</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {games.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {game.title.charAt(0)}
                            </Avatar>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {game.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={game.category} 
                            color={getCategoryColor(game.category)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={game.difficulty} 
                            color={getDifficultyColor(game.difficulty)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={game.status} 
                            color={getStatusColor(game.status)} 
                            size='small' 
                          />
                        </TableCell>
                        <TableCell>{game.questions}</TableCell>
                        <TableCell>{game.players}</TableCell>
                        <TableCell>{game.avgScore > 0 ? `${game.avgScore}%` : '-'}</TableCell>
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
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Top Players
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaderboard.map((player) => (
                  <Box
                    key={player.rank}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: player.rank === 1 ? 'warning.15' : 'transparent'
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: player.rank === 1 ? 'warning.main' : 'primary.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {player.player}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {player.game}
                      </Typography>
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {player.score}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TriviaPage
