//Copyright (c) 2022

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reducers from './reducers/'

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#8b5cf6',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.7)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiPaper: {
      root: {
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0,0,0,0.05)',
      },
      elevation1: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    },
    MuiButton: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
      }
    },
    MuiInputBase: {
      input: {
        color: '#0f172a',
      }
    }
  }
});

const store = createStore(reducers, compose(applyMiddleware(thunk)))

ReactDOM.render(
  <Provider store={store} >
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
);