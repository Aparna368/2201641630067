import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import {
  Link as LinkIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import UrlShortener from './components/UrlShortener';
import UrlResults from './components/UrlResults';
import Statistics from './components/Statistics';
import { ShortUrlResponse } from './types';
import { logger } from './logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState<Array<{ response: ShortUrlResponse; originalUrl: string }>>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    logger.info(`Switched to tab ${newValue}`, 'component', { tabIndex: newValue });
  };

  const handleUrlCreated = (response: ShortUrlResponse, originalUrl: string) => {
    setResults(prev => [...prev, { response, originalUrl }]);
    logger.info('URL created and added to results', 'component', { 
      shortlink: response.shortlink, 
      originalUrl 
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="URL Shortener tabs">
            <Tab 
              icon={<LinkIcon />} 
              label="Shorten URLs" 
              iconPosition="start"
              id="simple-tab-0"
              aria-controls="simple-tabpanel-0"
            />
            <Tab 
              icon={<ChartIcon />} 
              label="Statistics" 
              iconPosition="start"
              id="simple-tab-1"
              aria-controls="simple-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UrlShortener onUrlCreated={handleUrlCreated} />
          <UrlResults results={results} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Statistics />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;
