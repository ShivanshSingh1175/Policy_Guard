import { Box, Card, Typography, Button } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  error,
  onRetry 
}: ErrorStateProps) {
  const errorMessage = message || (error instanceof Error ? error.message : 'An unexpected error occurred');

  return (
    <Card sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
      <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {errorMessage}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Card>
  );
}
