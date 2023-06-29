import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import routes from './routes/routes'
import { ThemeProvider } from '@mui/material'
import { theme } from './themes/mainTheme'
import 'react-toastify/dist/ReactToastify.min.css';
import { AuthProvider, RequireAuth } from 'react-auth-kit'
import { Login } from './auth/Login'

function App() {

  return (
    <ThemeProvider theme={ theme }>
      <AuthProvider
        authType='cookie'
        authName='_auth'
        cookieDomain={window.location.hostname}
        cookieSecure={false}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />} >
              {
                routes.map(({ path, component: Component }, index) => {
                  return (
                    <Route path={ path } element={
                      <RequireAuth loginPath='/login'>
                        <Component /> 
                      </RequireAuth>
                    } key={index} />
                  )
                })
              }
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
