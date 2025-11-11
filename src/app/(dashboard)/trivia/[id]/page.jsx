"use client";

// React Imports
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
import Divider from "@mui/material/Divider";
import CardActions from "@mui/material/CardActions";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

// Apollo Client Imports
import { useQuery, useMutation } from '@apollo/client/react';

// GraphQL Imports
import { GET_TRIVIA_QUESTIONS } from "@/lib/graphql/queries";
import { UPDATE_TRIVIA_QUESTION, DELETE_TRIVIA_QUESTION, DELETE_TRIVIA_WITH_QUESTIONS } from "@/lib/graphql/mutations";

// Icon Imports
import { Icon } from "@iconify/react";

const TriviaQuestionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const triviaId = params.id;

  // State for toggling visibility
  const [showOptions, setShowOptions] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  
  // State for editing mode
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for delete confirmations
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState({ open: false, questionId: null, questionIndex: null });
  const [deleteTriviaDialog, setDeleteTriviaDialog] = useState({ open: false });

  // Fetch trivia questions from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_TRIVIA_QUESTIONS, {
    variables: { id: triviaId },
    skip: !triviaId
  });
  
  const trivia = data?.game_trivia_by_pk;
  const questions = trivia?.questions || [];

  // Update mutation
  const [updateQuestion, { loading: updating }] = useMutation(UPDATE_TRIVIA_QUESTION, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Question updated successfully!', severity: 'success' });
      setEditingQuestion(null);
      refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error updating question: ${error.message}`, severity: 'error' });
    }
  });

  // Delete question mutation
  const [deleteQuestion, { loading: deletingQuestion }] = useMutation(DELETE_TRIVIA_QUESTION, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Question deleted successfully!', severity: 'success' });
      setDeleteQuestionDialog({ open: false, questionId: null, questionIndex: null });
      refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting question: ${error.message}`, severity: 'error' });
    }
  });

  // Delete trivia mutation (with cascade delete for questions)
  const [deleteTrivia, { loading: deletingTrivia }] = useMutation(DELETE_TRIVIA_WITH_QUESTIONS, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Trivia and all questions deleted successfully!', severity: 'success' });
      setDeleteTriviaDialog({ open: false });
      router.push('/trivia');
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting trivia: ${error.message}`, severity: 'error' });
    }
  });

  // Toggle functions
  const toggleOptions = (questionIndex) => {
    setShowOptions(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const toggleAnswers = (questionIndex) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  // Edit functions
  const startEditing = (question, questionIndex) => {
    setEditingQuestion(questionIndex);
    setEditContent(question.content);
    setEditAnswer(question.answer);
    setEditOptions(question.options || []);
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditContent('');
    setEditAnswer('');
    setEditOptions([]);
  };

  const saveQuestion = async (questionId) => {
    try {
      await updateQuestion({
        variables: {
          id: questionId,
          content: editContent,
          answer: editAnswer,
          options: editOptions
        }
      });
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Delete handlers
  const handleDeleteQuestion = (questionId, questionIndex) => {
    setDeleteQuestionDialog({ open: true, questionId, questionIndex });
  };

  const confirmDeleteQuestion = () => {
    if (deleteQuestionDialog.questionId) {
      deleteQuestion({
        variables: { id: deleteQuestionDialog.questionId }
      });
    }
  };

  const handleDeleteTrivia = () => {
    setDeleteTriviaDialog({ open: true });
  };

  const confirmDeleteTrivia = () => {
    if (triviaId) {
      deleteTrivia({
        variables: { triviaId: triviaId }
      });
    }
  };

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
          Error loading trivia questions: {error.message}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<Icon icon="tabler-arrow-left" />}
          onClick={() => router.push('/trivia')}
        >
          Back to Trivia
        </Button>
      </Box>
    );
  }

  // Show not found state
  if (!trivia) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Trivia not found
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<Icon icon="tabler-arrow-left" />}
          onClick={() => router.push('/trivia')}
        >
          Back to Trivia
        </Button>
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Icon icon="tabler-arrow-left" />}
            onClick={() => router.push('/trivia')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Trivia Questions
          </Typography>
        </Box>
        
      </Box>

      {/* Trivia Info Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              sx={{ width: 48, height: 48, fontSize: "1.25rem" }}
            >
              {trivia.description?.charAt(0)?.toUpperCase() || 'T'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Trivia ID: {trivia.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {questions.length} questions
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {trivia.description}
          </Typography>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
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
                    icon="tabler-help-circle"
                    style={{ fontSize: 24, color: "primary.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {questions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Questions
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
                    icon="tabler-check"
                    style={{ fontSize: 24, color: "success.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {questions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Questions
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
                    backgroundColor: "info.15",
                  }}
                >
                  <Icon
                    icon="tabler-clock"
                    style={{ fontSize: 24, color: "info.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
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
                    icon="tabler-edit"
                    style={{ fontSize: 24, color: "warning.main" }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Draft Questions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Questions List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Questions ({questions.length})
          </Typography>
          
          {questions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Icon 
                icon="tabler-help-circle" 
                style={{ fontSize: 64, color: 'text.secondary', marginBottom: 16 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No questions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This trivia doesn't have any questions yet.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {questions.map((question, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: "0.875rem",
                            backgroundColor: 'primary.main'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Typography variant="subtitle2" color="text.secondary">
                          Question {index + 1}
                        </Typography>
                      </Box>
                      
                      {editingQuestion === index ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 3 }}
                          placeholder="Enter question content..."
                        />
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 3,
                            lineHeight: 1.6,
                            minHeight: '3.2em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {question.content}
                        </Typography>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* Options */}
                      {question.options && question.options.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Options:
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleOptions(index)}
                              sx={{ color: 'primary.main' }}
                              title={showOptions[index] ? "Hide Options" : "Show Options"}
                            >
                              <Icon icon={showOptions[index] ? "tabler-eye-off" : "tabler-eye"} />
                            </IconButton>
                          </Box>
                          {showOptions[index] && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {question.options.map((option, optionIndex) => (
                                <Box
                                  key={optionIndex}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    backgroundColor: option === question.answer ? 'success.15' : null,
                                    border: option === question.answer ? '1px solid' : '1px solid transparent',
                                    borderColor: option === question.answer ? 'transparent' : 'transparent'
                                  }}
                                >
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.primary',
                                      fontWeight: option === question.answer ? 500 : 400
                                    }}
                                  >
                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Answer */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Correct Answer:
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleAnswers(index)}
                            sx={{ color: 'success.main' }}
                            title={showAnswers[index] ? "Hide Answer" : "Show Answer"}
                          >
                            <Icon icon={showAnswers[index] ? "tabler-eye-off" : "tabler-eye"} />
                          </IconButton>
                        </Box>
                        {showAnswers[index] && (
                          editingQuestion === index ? (
                            <TextField
                              fullWidth
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              variant="outlined"
                              size="small"
                              placeholder="Enter correct answer..."
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'success.15',
                                  '& fieldset': {
                                    borderColor: 'success.main',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'success.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'success.main',
                                  },
                                },
                                '& .MuiInputBase-input': {
                                  color: 'success.main',
                                  fontWeight: 500,
                                }
                              }}
                            />
                          ) : (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                backgroundColor: 'success.15',
                                color: 'success.main',
                                p: 2,
                                borderRadius: 1,
                                fontWeight: 500
                              }}
                            >
                              {question.answer}
                            </Typography>
                          )
                        )}
                      </Box>

                      {/* Explanation */}
                      {question.explanation && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Explanation:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              backgroundColor: 'info.15',
                              color: 'info.main',
                              p: 2,
                              borderRadius: 1,
                              fontStyle: 'italic'
                            }}
                          >
                            {question.explanation}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                      {editingQuestion === index ? (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => saveQuestion(question.id)}
                            disabled={updating}
                            title="Save Changes"
                          >
                            <Icon icon="tabler-check" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={cancelEditing}
                            disabled={updating}
                            title="Cancel"
                          >
                            <Icon icon="tabler-x" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => startEditing(question, index)}
                            title="Edit Question"
                          >
                            <Icon icon="tabler-edit" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            title="Delete Question"
                            onClick={() => handleDeleteQuestion(question.id, index)}
                          >
                            <Icon icon="tabler-trash" />
                          </IconButton>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
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

      {/* Delete Question Confirmation Dialog */}
      <Dialog
        open={deleteQuestionDialog.open}
        onClose={() => setDeleteQuestionDialog({ open: false, questionId: null, questionIndex: null })}
        aria-labelledby="delete-question-dialog-title"
      >
        <DialogTitle id="delete-question-dialog-title">
          Delete Question
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteQuestionDialog({ open: false, questionId: null, questionIndex: null })}
            disabled={deletingQuestion}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteQuestion}
            color="error"
            variant="contained"
            disabled={deletingQuestion}
            startIcon={deletingQuestion ? <CircularProgress size={16} /> : <Icon icon="tabler-trash" />}
          >
            {deletingQuestion ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Trivia Confirmation Dialog */}
      <Dialog
        open={deleteTriviaDialog.open}
        onClose={() => setDeleteTriviaDialog({ open: false })}
        aria-labelledby="delete-trivia-dialog-title"
      >
        <DialogTitle id="delete-trivia-dialog-title">
          Delete Trivia
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this entire trivia? This will delete all questions and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteTriviaDialog({ open: false })}
            disabled={deletingTrivia}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteTrivia}
            color="error"
            variant="contained"
            disabled={deletingTrivia}
            startIcon={deletingTrivia ? <CircularProgress size={16} /> : <Icon icon="tabler-trash" />}
          >
            {deletingTrivia ? 'Deleting...' : 'Delete Trivia'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TriviaQuestionsPage;
