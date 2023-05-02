import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import routes from './routes/routes'
import { ThemeProvider } from '@mui/material'
import { theme } from './themes/mainTheme'

function App() {

  return (
    <ThemeProvider theme={ theme }>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />} >
            {
              routes.map(({ path, component: Component }) => {
                return (
                  <Route path={ path } element={ <Component /> } />
                )
              })
            }
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
