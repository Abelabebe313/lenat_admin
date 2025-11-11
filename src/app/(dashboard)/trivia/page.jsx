"use client";

// React Imports
import { useState } from "react";
import { useRouter } from "next/navigation";

// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

// Apollo Client Imports
import { useQuery, useMutation } from '@apollo/client/react';

// GraphQL Imports
import { GET_TRIVIA_GAMES } from "@/lib/graphql/queries";
import { DELETE_TRIVIA_WITH_QUESTIONS, INSERT_TRIVIA } from "@/lib/graphql/mutations";

// Icon Imports
import { Icon } from "@iconify/react";

const TriviaPage = () => {
  const router = useRouter();
  
  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, triviaId: null, triviaName: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for new trivia form
  const [newTriviaDialog, setNewTriviaDialog] = useState({ open: false });
  const [newTrivia, setNewTrivia] = useState({
    name: '',
    description: '',
    index: 1,
    state: 'Pending',
    user_id: '963a82bd-d1f1-4850-82a7-46d050f2877a', // Default user ID
    questions: []
  });
  
  // Fetch trivia games from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_TRIVIA_GAMES);
  
  const games = data?.game_trivia || [];

  // Delete trivia mutation (with cascade delete for questions)
  const [deleteTrivia, { loading: deleting }] = useMutation(DELETE_TRIVIA_WITH_QUESTIONS, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Trivia and all questions deleted successfully!', severity: 'success' });
      setDeleteDialog({ open: false, triviaId: null, triviaName: '' });
      refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting trivia: ${error.message}`, severity: 'error' });
    }
  });

  // Insert trivia mutation
  const [insertTrivia, { loading: inserting }] = useMutation(INSERT_TRIVIA, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Trivia created successfully!', severity: 'success' });
      setNewTriviaDialog({ open: false });
      resetNewTriviaForm();
      refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error creating trivia: ${error.message}`, severity: 'error' });
    }
  });

  // Navigate to questions page
  const handleViewQuestions = (triviaId) => {
    router.push(`/trivia/${triviaId}`);
  };

  // Delete handlers
  const handleDeleteTrivia = (triviaId, triviaName) => {
    setDeleteDialog({ open: true, triviaId, triviaName });
  };

  const confirmDeleteTrivia = () => {
    if (deleteDialog.triviaId) {
      deleteTrivia({
        variables: { triviaId: deleteDialog.triviaId }
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // New trivia form handlers
  const resetNewTriviaForm = () => {
    setNewTrivia({
      name: '',
      description: '',
      index: 1,
      state: 'Pending',
      user_id: '963a82bd-d1f1-4850-82a7-46d050f2877a',
      questions: []
    });
  };

  const handleNewTriviaChange = (field, value) => {
    setNewTrivia(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      content: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: '',
      hint: ''
    };
    setNewTrivia(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setNewTrivia(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setNewTrivia(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex 
          ? { ...q, options: q.options.map((opt, optIndex) => optIndex === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (questionIndex) => {
    setNewTrivia(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const handleCreateTrivia = () => {
    const triviaData = {
      ...newTrivia,
      questions: {
        data: newTrivia.questions
      }
    };
    
    insertTrivia({
      variables: { trivia: triviaData }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "error";
      case "Draft":
        return "info";
      default:
        return "default";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalGames = games.length;
  const acceptedGames = games.filter((game) => game.state === "Accepted").length;
  const pendingGames = games.filter((game) => game.state === "Pending").length;
  const rejectedGames = games.filter((game) => game.state === "Rejected").length;

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading trivia games: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Trivia Game Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Icon icon="tabler-plus" />}
          onClick={() => setNewTriviaDialog({ open: true })}
        >
          Create New Game
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "primary.15",
                  }}
                >
                  <Icon
                    icon="tabler-gamepad"
                    style={{ fontSize: 24, color: "primary.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalGames}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "success.15",
                  }}
                >
                  <Icon
                    icon="tabler-check-circle"
                    style={{ fontSize: 24, color: "success.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {acceptedGames}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted Games
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "warning.15",
                  }}
                >
                  <Icon
                    icon="tabler-clock"
                    style={{ fontSize: 24, color: "warning.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {pendingGames}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Games
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "error.15",
                  }}
                >
                  <Icon
                    icon="tabler-x-circle"
                    style={{ fontSize: 24, color: "error.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {rejectedGames}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected Games
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Trivia Games
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Game Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No trivia games found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    games.map((game) => (
                      <TableRow 
                        key={game.id}
                        onClick={() => handleViewQuestions(game.id)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          '&:active': {
                            backgroundColor: 'action.selected',
                          }
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 2 }}
                          >
                            <Avatar
                              sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
                            >
                              {game.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {game.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {game.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={game.state}
                            color={getStatusColor(game.state)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(game.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(game.updated_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit action
                              }}
                              title="Edit Trivia"
                            >
                              <Icon icon="tabler-edit" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle view action
                              }}
                              title="View Details"
                            >
                              <Icon icon="tabler-eye" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrivia(game.id, game.name);
                              }}
                              title="Delete Trivia"
                            >
                              <Icon icon="tabler-trash" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

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

      {/* Delete Trivia Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, triviaId: null, triviaName: '' })}
        aria-labelledby="delete-trivia-dialog-title"
      >
        <DialogTitle id="delete-trivia-dialog-title">
          Delete Trivia
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.triviaName}"? This will delete all questions and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, triviaId: null, triviaName: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteTrivia}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Icon icon="tabler-trash" />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Trivia Creation Dialog */}
      <Dialog
        open={newTriviaDialog.open}
        onClose={() => setNewTriviaDialog({ open: false })}
        maxWidth="md"
        fullWidth
        aria-labelledby="new-trivia-dialog-title"
      >
        <DialogTitle id="new-trivia-dialog-title">
          Create New Trivia
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Basic Trivia Info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Trivia Name"
                value={newTrivia.name}
                onChange={(e) => handleNewTriviaChange('name', e.target.value)}
                placeholder="e.g., General Knowledge #3"
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newTrivia.description}
                onChange={(e) => handleNewTriviaChange('description', e.target.value)}
                placeholder="ትክክለኛ መልስ የያዘውን አማራጭ ምረጥ"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Index"
                  type="number"
                  value={newTrivia.index}
                  onChange={(e) => handleNewTriviaChange('index', parseInt(e.target.value) || 1)}
                  sx={{ width: 120 }}
                />
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={newTrivia.state}
                    label="State"
                    onChange={(e) => handleNewTriviaChange('state', e.target.value)}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Accepted">Accepted</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Questions Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Questions ({newTrivia.questions.length})</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="tabler-plus" />}
                  onClick={addQuestion}
                >
                  Add Question
                </Button>
              </Box>

              {newTrivia.questions.map((question, questionIndex) => (
                <Accordion key={questionIndex} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<Icon icon="tabler-chevron-down" />}>
                    <Typography>
                      Question {questionIndex + 1} {question.content ? `- ${question.content.substring(0, 50)}...` : '(Empty)'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Question Content"
                        value={question.content}
                        onChange={(e) => updateQuestion(questionIndex, 'content', e.target.value)}
                        placeholder="የኢትዮጵያ ካፒታል ከተማ የት ነው?"
                      />

                      <Typography variant="subtitle2">Options:</Typography>
                      {question.options.map((option, optionIndex) => (
                        <TextField
                          key={optionIndex}
                          fullWidth
                          label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          value={option}
                          onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                      ))}

                      <TextField
                        fullWidth
                        label="Correct Answer"
                        value={question.answer}
                        onChange={(e) => updateQuestion(questionIndex, 'answer', e.target.value)}
                        placeholder="አዲስ አበባ"
                      />

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Explanation"
                        value={question.explanation}
                        onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                        placeholder="አዲስ አበባ የኢትዮጵያ ካፒታል ነው።"
                      />

                      <TextField
                        fullWidth
                        label="Hint"
                        value={question.hint}
                        onChange={(e) => updateQuestion(questionIndex, 'hint', e.target.value)}
                        placeholder="AU ማዕከል ያለበት ከተማ"
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          color="error"
                          startIcon={<Icon icon="tabler-trash" />}
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          Remove Question
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}

              {newTrivia.questions.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Icon icon="tabler-help-circle" style={{ fontSize: 48, marginBottom: 16 }} />
                  <Typography>No questions added yet. Click "Add Question" to get started.</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setNewTriviaDialog({ open: false })}
            disabled={inserting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTrivia}
            variant="contained"
            disabled={inserting || !newTrivia.name || newTrivia.questions.length === 0}
            startIcon={inserting ? <CircularProgress size={16} /> : <Icon icon="tabler-check" />}
          >
            {inserting ? 'Creating...' : 'Create Trivia'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TriviaPage;
