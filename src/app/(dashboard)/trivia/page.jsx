"use client";

// React Imports
import { useState, useMemo } from "react";
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
import TablePagination from "@mui/material/TablePagination";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";

// Apollo Client Imports
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';

// GraphQL Imports
import { GET_TRIVIA_GAMES, GET_TRIVIA_QUESTIONS } from "@/lib/graphql/queries";
import { 
  DELETE_TRIVIA_WITH_QUESTIONS, 
  INSERT_TRIVIA, 
  UPDATE_TRIVIA,
  INSERT_TRIVIA_QUESTION,
  UPDATE_TRIVIA_QUESTION,
  DELETE_TRIVIA_QUESTION
} from "@/lib/graphql/mutations";

// Icon Imports
import { Icon } from "@iconify/react";

// Context Imports
import { useAuth } from "@contexts/AuthContext";

const TriviaPage = () => {
  const router = useRouter();
  
  // Auth context
  const { user } = useAuth();
  
  // Filter states
  const [stateFilter, setStateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, triviaId: null, triviaName: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for trivia form (create/edit)
  const [triviaDialog, setTriviaDialog] = useState({ open: false, editMode: false });
  const [viewDialog, setViewDialog] = useState({ open: false });
  const [currentTrivia, setCurrentTrivia] = useState({
    id: null,
    name: '',
    description: '',
    index: 1,
    state: 'Pending',
    questions: []
  });
  
  // Track which questions to delete, update, or insert
  const [questionsToDelete, setQuestionsToDelete] = useState([]);
  
  // Fetch trivia games from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_TRIVIA_GAMES);
  
  // Lazy query to fetch trivia with questions for editing
  const [getTriviaQuestions, { loading: loadingQuestions }] = useLazyQuery(GET_TRIVIA_QUESTIONS);
  
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
      setTriviaDialog({ open: false, editMode: false });
      resetTriviaForm();
      refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error creating trivia: ${error.message}`, severity: 'error' });
    }
  });

  // Update trivia mutation
  const [updateTrivia] = useMutation(UPDATE_TRIVIA);
  const [insertQuestion] = useMutation(INSERT_TRIVIA_QUESTION);
  const [updateQuestion] = useMutation(UPDATE_TRIVIA_QUESTION);
  const [deleteQuestion] = useMutation(DELETE_TRIVIA_QUESTION);

  // Available state options
  const stateOptions = ['Accepted', 'Pending', 'Rejected', 'Draft'];

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

  // Filter games based on selected filters
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesState = !stateFilter || game.state === stateFilter;
      const matchesSearch = !searchQuery || 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Date filtering
      let matchesDateFrom = true;
      let matchesDateTo = true;
      
      if (dateFrom) {
        const gameDate = new Date(game.created_at);
        const fromDate = new Date(dateFrom);
        matchesDateFrom = gameDate >= fromDate;
      }
      
      if (dateTo) {
        const gameDate = new Date(game.created_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        matchesDateTo = gameDate <= toDate;
      }
      
      return matchesState && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [games, stateFilter, searchQuery, dateFrom, dateTo]);

  // Paginated games
  const paginatedGames = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredGames.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredGames, page, rowsPerPage]);

  // Clear all filters
  const clearFilters = () => {
    setStateFilter('');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  // Trivia form handlers
  const resetTriviaForm = () => {
    setCurrentTrivia({
      id: null,
      name: '',
      description: '',
      index: 1,
      state: 'Pending',
      questions: []
    });
    setQuestionsToDelete([]);
  };

  const handleCreateNew = () => {
    resetTriviaForm();
    setTriviaDialog({ open: true, editMode: false });
  };

  const handleEditTrivia = async (game) => {
    // Fetch trivia with questions
    const result = await getTriviaQuestions({
      variables: { id: game.id }
    });

    const triviaData = result.data?.game_trivia_by_pk;
    
    setCurrentTrivia({
      id: game.id,
      name: game.name,
      description: game.description || '',
      index: 1,
      state: game.state,
      questions: triviaData?.questions?.map(q => ({
        id: q.id,
        content: q.content || '',
        options: q.options || ['', '', '', ''],
        answer: q.answer || '',
        explanation: q.explanation || '',
        hint: '',
        isExisting: true // Mark as existing question
      })) || []
    });
    setQuestionsToDelete([]);
    setTriviaDialog({ open: true, editMode: true });
  };

  const handleViewTrivia = async (game) => {
    // Fetch trivia with questions for viewing
    const result = await getTriviaQuestions({
      variables: { id: game.id }
    });

    const triviaData = result.data?.game_trivia_by_pk;
    
    setCurrentTrivia({
      id: game.id,
      name: game.name,
      description: game.description || '',
      index: 1,
      state: game.state,
      questions: triviaData?.questions?.map(q => ({
        id: q.id,
        content: q.content || '',
        options: q.options || ['', '', '', ''],
        answer: q.answer || '',
        explanation: q.explanation || '',
        hint: ''
      })) || []
    });
    setViewDialog({ open: true });
  };

  const handleTriviaChange = (field, value) => {
    setCurrentTrivia(prev => ({
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
      hint: '',
      isExisting: false // Mark as new question
    };
    setCurrentTrivia(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestionField = (questionIndex, field, value) => {
    setCurrentTrivia(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setCurrentTrivia(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex 
          ? { ...q, options: q.options.map((opt, optIndex) => optIndex === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (questionIndex) => {
    const question = currentTrivia.questions[questionIndex];
    
    // If it's an existing question, add to delete list
    if (question.isExisting && question.id) {
      setQuestionsToDelete(prev => [...prev, question.id]);
    }
    
    // Remove from current questions
    setCurrentTrivia(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const handleSubmitTrivia = async () => {
    try {
      if (triviaDialog.editMode) {
        // Update trivia basic info
        await updateTrivia({
          variables: {
            id: currentTrivia.id,
            name: currentTrivia.name,
            description: currentTrivia.description,
            index: currentTrivia.index,
            state: currentTrivia.state
          }
        });

        // Delete questions marked for deletion
        for (const questionId of questionsToDelete) {
          await deleteQuestion({
            variables: { id: questionId }
          });
        }

        // Process questions
        for (const question of currentTrivia.questions) {
          if (question.isExisting && question.id) {
            // Update existing question
            await updateQuestion({
              variables: {
                id: question.id,
                content: question.content,
                answer: question.answer,
                options: question.options,
                explanation: question.explanation
              }
            });
          } else if (!question.isExisting) {
            // Insert new question
            await insertQuestion({
              variables: {
                trivia_id: currentTrivia.id,
                content: question.content,
                answer: question.answer,
                options: question.options,
                explanation: question.explanation
              }
            });
          }
        }

        setSnackbar({ open: true, message: 'Trivia updated successfully!', severity: 'success' });
        setTriviaDialog({ open: false, editMode: false });
        resetTriviaForm();
        refetch();
      } else {
        // Validate user is authenticated
        if (!user?.id) {
          setSnackbar({ open: true, message: 'User not authenticated. Please log in again.', severity: 'error' });
          return;
        }

        // Create new trivia
        const triviaData = {
          name: currentTrivia.name,
          description: currentTrivia.description,
          index: currentTrivia.index,
          state: currentTrivia.state,
          user_id: user.id,
          questions: {
            data: currentTrivia.questions.map(q => ({
              content: q.content,
              answer: q.answer,
              options: q.options,
              explanation: q.explanation
            }))
          }
        };
        
        await insertTrivia({
          variables: { trivia: triviaData }
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  };

  // Analytics calculations
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
          startIcon={<Icon icon="solar:add-circle-bold" />}
          onClick={handleCreateNew}
        >
          Create New Game
        </Button>
      </Box>

      {/* Analytics Cards */}
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
                    icon="solar:gameboy-bold-duotone"
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
                    icon="solar:check-circle-bold-duotone"
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
                    icon="solar:clock-circle-bold-duotone"
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
                    icon="solar:close-circle-bold-duotone"
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

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Filter Trivia Games
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="solar:magnifer-linear" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={stateFilter}
                  label="State"
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <MenuItem value="">All States</MenuItem>
                  {stateOptions.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Icon icon="solar:filter-bold" />}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trivia Games Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Trivia Games ({filteredGames.length})
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
                {paginatedGames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No trivia games found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedGames.map((game) => (
                    <TableRow 
                      key={game.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
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
                          {game.description || 'No description'}
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
                          <Tooltip title="View Game">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleViewTrivia(game)}
                            >
                              <Icon icon="solar:eye-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Trivia">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleEditTrivia(game)}
                            >
                              <Icon icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Trivia">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteTrivia(game.id, game.name)}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredGames.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

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
            startIcon={deleting ? <CircularProgress size={16} /> : <Icon icon="solar:trash-bin-trash-bold" />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Trivia Dialog */}
      <Dialog
        open={triviaDialog.open}
        onClose={() => setTriviaDialog({ open: false, editMode: false })}
        maxWidth="md"
        fullWidth
        aria-labelledby="trivia-dialog-title"
      >
        <DialogTitle id="trivia-dialog-title">
          {triviaDialog.editMode ? 'Edit Trivia' : 'Create New Trivia'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Basic Trivia Info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Trivia Name"
                value={currentTrivia.name}
                onChange={(e) => handleTriviaChange('name', e.target.value)}
                placeholder="e.g., General Knowledge #3"
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={currentTrivia.description}
                onChange={(e) => handleTriviaChange('description', e.target.value)}
                placeholder="ትክክለኛ መልስ የያዘውን አማራጭ ምረጥ"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Index"
                  type="number"
                  value={currentTrivia.index}
                  onChange={(e) => handleTriviaChange('index', parseInt(e.target.value) || 1)}
                  sx={{ width: 120 }}
                />
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={currentTrivia.state}
                    label="State"
                    onChange={(e) => handleTriviaChange('state', e.target.value)}
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
                <Typography variant="h6">Questions ({currentTrivia.questions.length})</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="solar:add-circle-bold" />}
                  onClick={addQuestion}
                >
                  Add Question
                </Button>
              </Box>

              {currentTrivia.questions.map((question, questionIndex) => (
                <Accordion key={questionIndex} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<Icon icon="solar:alt-arrow-down-bold" />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip 
                        label={questionIndex + 1} 
                        size="small" 
                        color={question.isExisting ? "default" : "primary"}
                      />
                      <Typography sx={{ fontWeight: 500 }}>
                        {question.content ? question.content.substring(0, 50) + (question.content.length > 50 ? '...' : '') : 'Empty Question'}
                      </Typography>
                      {!question.isExisting && (
                        <Chip label="New" size="small" color="success" />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Question Content"
                        value={question.content}
                        onChange={(e) => updateQuestionField(questionIndex, 'content', e.target.value)}
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
                        onChange={(e) => updateQuestionField(questionIndex, 'answer', e.target.value)}
                        placeholder="አዲስ አበባ"
                      />

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Explanation"
                        value={question.explanation}
                        onChange={(e) => updateQuestionField(questionIndex, 'explanation', e.target.value)}
                        placeholder="አዲስ አበባ የኢትዮጵያ ካፒታል ነው።"
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          color="error"
                          startIcon={<Icon icon="solar:trash-bin-trash-bold" />}
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          Remove Question
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}

              {currentTrivia.questions.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Icon icon="solar:question-circle-bold-duotone" style={{ fontSize: 48, marginBottom: 16 }} />
                  <Typography>No questions added yet. Click "Add Question" to get started.</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setTriviaDialog({ open: false, editMode: false })}
            disabled={loadingQuestions}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitTrivia}
            variant="contained"
            disabled={
              loadingQuestions ||
              !currentTrivia.name || 
              currentTrivia.questions.length === 0
            }
            startIcon={loadingQuestions ? <CircularProgress size={16} /> : <Icon icon="solar:check-circle-bold" />}
          >
            {loadingQuestions ? 'Saving...' : triviaDialog.editMode ? 'Update Trivia' : 'Create Trivia'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Trivia Dialog (Read-Only) */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false })}
        maxWidth="md"
        fullWidth
        aria-labelledby="view-trivia-dialog-title"
      >
        <DialogTitle id="view-trivia-dialog-title">
          View Trivia Game
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Basic Trivia Info */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  GAME INFORMATION
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {currentTrivia.name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {currentTrivia.description || 'No description'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Index
                      </Typography>
                      <Typography variant="body2">
                        {currentTrivia.index}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        State
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={currentTrivia.state}
                          color={getStatusColor(currentTrivia.state)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Questions ({currentTrivia.questions.length})
              </Typography>

              {currentTrivia.questions.length === 0 ? (
                <Alert severity="info">
                  No questions available for this trivia game.
                </Alert>
              ) : (
                currentTrivia.questions.map((question, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip 
                          label={`Q${index + 1}`} 
                          color="primary" 
                          size="small"
                        />
                        <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                          {question.content}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          OPTIONS
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          {question.options.map((option, optIndex) => (
                            <Grid item xs={12} sm={6} key={optIndex}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: option === question.answer ? 'success.main' : 'divider',
                                  backgroundColor: option === question.answer ? 'success.lighter' : 'background.paper',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <Chip 
                                  label={String.fromCharCode(65 + optIndex)} 
                                  size="small"
                                  color={option === question.answer ? 'success' : 'default'}
                                  sx={{ minWidth: 32 }}
                                />
                                <Typography variant="body2">
                                  {option || '(Empty)'}
                                </Typography>
                                {option === question.answer && (
                                  <Icon 
                                    icon="solar:check-circle-bold" 
                                    style={{ marginLeft: 'auto', color: 'success.main' }}
                                  />
                                )}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          CORRECT ANSWER
                        </Typography>
                        <Box sx={{ 
                          mt: 0.5, 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: 'success.lighter',
                          border: '1px solid',
                          borderColor: 'success.main'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                            {question.answer}
                          </Typography>
                        </Box>
                      </Box>

                      {question.explanation && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            EXPLANATION
                          </Typography>
                          <Box sx={{ 
                            mt: 0.5, 
                            p: 1.5, 
                            borderRadius: 1, 
                            backgroundColor: 'action.hover'
                          }}>
                            <Typography variant="body2">
                              {question.explanation}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDialog({ open: false })}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TriviaPage;
