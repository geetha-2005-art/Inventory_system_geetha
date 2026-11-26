import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App.jsx';
import NotificationProvider from './components/NotificationProvider';
import { initializeData } from './services/initService';
import theme from './theme';
import './index.css';

// Load sample data on the very first run only
const initResult = initializeData();
if (initResult.error) console.error(initResult.error);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>
);