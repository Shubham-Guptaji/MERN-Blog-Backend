import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client' 
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import store from './Redux/store.js'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Create root element and render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Provider store={store} >
      <GoogleOAuthProvider clientId="962263182715-venvjtrlb1qgk95bhv79ilbrv5esp4s3.apps.googleusercontent.com">
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  // </React.StrictMode>,
)