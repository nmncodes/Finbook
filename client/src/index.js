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
    type: 'dark',
    primary: {
      main: '#8b5cf6',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(30, 41, 59, 0.7)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
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
        border: '1px solid rgba(255,255,255,0.05)',
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
        color: '#f8fafc',
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