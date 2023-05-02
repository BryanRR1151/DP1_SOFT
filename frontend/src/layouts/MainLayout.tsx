import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, Typography } from '@mui/material';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import sizeConfigs from '../configs/sizeConfigs';
import colorConfigs from '../configs/colorConfigs';

export const MainLayout = () => {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Topbar />
        <Box
          component="nav"
          sx={{
            width: sizeConfigs.sidebar.width
          }}
        >
          <Sidebar />
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            paddingTop: '55px',
            width: `calc(100%-${sizeConfigs.sidebar.width})`,
            minHeight: '100vh', 
            backgroundColor: colorConfigs.mainBg,
            marginRight: '-8px',
            marginLeft: '-10px'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  )
}