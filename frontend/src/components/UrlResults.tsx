import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { ShortUrlResponse } from '../types';
import { logger } from '../logger';

interface UrlResultsProps {
  results: Array<{ response: ShortUrlResponse; originalUrl: string }>;
}

const UrlResults: React.FC<UrlResultsProps> = ({ results }) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('Copied to clipboard', 'component', { text });
    } catch (error) {
      logger.error('Failed to copy to clipboard', 'component', { 
        error: (error as Error).message,
        stack: (error as Error).stack
      });
    }
  };

  const formatExpiry = (expiry: string) => {
    const date = new Date(expiry);
    return date.toLocaleString();
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        <CheckIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
        Short URLs Created
      </Typography>

      {results.map((result, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Short URL
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'monospace',
                    backgroundColor: 'grey.100',
                    padding: 1,
                    borderRadius: 1,
                    wordBreak: 'break-all'
                  }}
                >
                  {result.response.shortlink}
                </Typography>
              </Box>
              
              <Tooltip title="Copy to clipboard">
                <IconButton
                  onClick={() => copyToClipboard(result.response.shortlink)}
                  color="primary"
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Original URL:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: 'grey.50',
                  padding: 1,
                  borderRadius: 1,
                  wordBreak: 'break-all'
                }}
              >
                {result.originalUrl}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={<TimeIcon />}
                label={`Expires: ${formatExpiry(result.response.expiry)}`}
                color="info"
                variant="outlined"
                size="small"
              />
            </Box>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                href={result.response.shortlink}
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
              >
                Test Short URL
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Alert severity="success" sx={{ mt: 2 }}>
        Successfully created {results.length} short URL{results.length > 1 ? 's' : ''}!
      </Alert>
    </Box>
  );
};

export default UrlResults;
