import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
          <Paper sx={{ p: { xs: 3, md: 5 }, maxWidth: 600, width: '100%', textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h4" sx={{ color: 'error.main', mb: 2, fontWeight: 700 }}>
              Oops, something went wrong.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              An unexpected error occurred in the application. We have been notified and are looking into it.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
