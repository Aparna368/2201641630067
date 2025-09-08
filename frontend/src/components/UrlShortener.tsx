import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { urlShortenerApi } from '../api';
import { validateUrlForm } from '../validation';
import { UrlFormData, ShortUrlResponse } from '../types';
import { logger } from '../logger';

interface UrlFormProps {
  onUrlCreated: (response: ShortUrlResponse, originalUrl: string) => void;
}

const UrlShortener: React.FC<UrlFormProps> = ({ onUrlCreated }) => {
  const [urls, setUrls] = useState<UrlFormData[]>([
    { url: '', validity: '', shortcode: '' }
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addUrlForm = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', validity: '', shortcode: '' }]);
      logger.info(`Added URL form. Total forms: ${urls.length + 1}`, 'component', { totalForms: urls.length + 1 });
    }
  };

  const removeUrlForm = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      logger.info(`Removed URL form at index ${index}. Total forms: ${newUrls.length}`, 'component', { 
        removedIndex: index, 
        totalForms: newUrls.length 
      });
    }
  };

  const updateUrlForm = (index: number, field: keyof UrlFormData, value: string) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };


  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      logger.info('Starting URL shortening process', 'component', { urlCount: urls.length });

      const validUrls = urls.filter(url => url.url.trim());
      if (validUrls.length === 0) {
        setErrors(['Please enter at least one URL']);
        setLoading(false);
        return;
      }

      // Validate all forms
      const validationPromises = validUrls.map(url => validateUrlForm(url));
      const validationResults = await Promise.all(validationPromises);
      
      const allErrors = validationResults.flatMap(result => result.errors);
      if (allErrors.length > 0) {
        setErrors(allErrors);
        setLoading(false);
        return;
      }

      // Create short URLs
      const createPromises = validUrls.map(async (urlData) => {
        const requestData = {
          url: urlData.url.trim(),
          validity: urlData.validity ? parseInt(urlData.validity, 10) : undefined,
          shortcode: urlData.shortcode.trim() || undefined
        };

        const response = await urlShortenerApi.createShortUrl(requestData);
        onUrlCreated(response, urlData.url);
        return response;
      });

      await Promise.all(createPromises);
      
      // Reset forms
      setUrls([{ url: '', validity: '', shortcode: '' }]);
      logger.info('All URLs shortened successfully', 'component', { successCount: validUrls.length });

    } catch (error: any) {
      logger.error(`Error shortening URLs: ${error.message}`, 'component', { 
        error: error.message,
        stack: error.stack
      });
      setErrors([error.response?.data?.message || 'Failed to create short URLs']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        <LinkIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        URL Shortener
      </Typography>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      <Grid container spacing={3}>
        {urls.map((urlData, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    URL {index + 1}
                  </Typography>
                  {urls.length > 1 && (
                    <IconButton
                      onClick={() => removeUrlForm(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      placeholder="https://example.com/very-long-url"
                      value={urlData.url}
                      onChange={(e) => updateUrlForm(index, 'url', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      placeholder="30"
                      type="number"
                      value={urlData.validity}
                      onChange={(e) => updateUrlForm(index, 'validity', e.target.value)}
                      helperText="Optional - defaults to 30 minutes"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode"
                      placeholder="mycode"
                      value={urlData.shortcode}
                      onChange={(e) => updateUrlForm(index, 'shortcode', e.target.value)}
                      helperText="Optional - 3-20 alphanumeric characters"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addUrlForm}
          disabled={urls.length >= 5}
        >
          Add URL ({urls.length}/5)
        </Button>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || urls.every(url => !url.url.trim())}
        >
          {loading ? 'Creating...' : 'Shorten URLs'}
        </Button>
      </Box>
    </Box>
  );
};

export default UrlShortener;
