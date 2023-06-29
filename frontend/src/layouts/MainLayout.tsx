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
            margin: '-8px',
            flexGrow: 1,
            width: `calc(100% - ${sizeConfigs.sidebar.width})`,
            minHeight: '100vh',
            height: '100%',
            backgroundColor: colorConfigs.mainBg
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  )
}