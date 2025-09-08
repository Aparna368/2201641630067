import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { urlShortenerApi } from '../api';
import { ShortUrlStats } from '../types';
import { logger } from '../logger';

const Statistics: React.FC = () => {
  const [urls, setUrls] = useState<ShortUrlStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Fetching URL statistics', 'component');
      
      const data = await urlShortenerApi.getAllShortUrls();
      setUrls(data);
      logger.info(`Retrieved ${data.length} URL statistics`, 'component', { count: data.length });
    } catch (error: any) {
      logger.error(`Failed to fetch statistics: ${error.message}`, 'component', { 
        error: error.message,
        stack: error.stack
      });
      setError(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const toggleRowExpansion = (shortcode: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(shortcode)) {
      newExpanded.delete(shortcode);
    } else {
      newExpanded.add(shortcode);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading statistics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <ViewIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchStatistics}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Alert severity="info">
          No short URLs found. Create some URLs first to see statistics.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <React.Fragment key={url.shortcode}>
                  <TableRow>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {url.shortlink}
                        </Typography>
                        <Tooltip title="Copy URL">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(url.shortlink)}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={url.originalUrl}
                      >
                        {url.originalUrl}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<TimeIcon />}
                        label={formatDate(url.createdAt)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<TimeIcon />}
                        label={formatDate(url.expiry)}
                        size="small"
                        variant="outlined"
                        color={new Date(url.expiry) < new Date() ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${url.clickCount} clicks`}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => toggleRowExpansion(url.shortcode)}
                        size="small"
                      >
                        {expandedRows.has(url.shortcode) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ padding: 0 }}>
                      <Collapse in={expandedRows.has(url.shortcode)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            Click Details
                          </Typography>
                          {url.clicks.length === 0 ? (
                            <Alert severity="info">
                              No clicks recorded yet.
                            </Alert>
                          ) : (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Timestamp</TableCell>
                                  <TableCell>Location</TableCell>
                                  <TableCell>Referrer</TableCell>
                                  <TableCell>User Agent</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {url.clicks.map((click, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Chip
                                        icon={<TimeIcon />}
                                        label={formatDate(click.timestamp)}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <LocationIcon fontSize="small" />
                                        {click.location || 'Unknown'}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      {click.referrer ? (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            maxWidth: '200px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                          title={click.referrer}
                                        >
                                          {click.referrer}
                                        </Typography>
                                      ) : (
                                        'Direct'
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          maxWidth: '200px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                        title={click.userAgent}
                                      >
                                        {click.userAgent || 'Unknown'}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Statistics;
