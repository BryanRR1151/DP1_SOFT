import React from 'react'
import { AppBar, Toolbar, Typography } from '@mui/material';
import colorConfigs from '../configs/colorConfigs'
import sizeConfigs from '../configs/sizeConfigs';

export const Topbar = () => {
  return (
    <AppBar
      position='fixed'
      sx={{
        width: `calc(100%-${sizeConfigs.sidebar.width})`,
        pl: sizeConfigs.sidebar.width,
        boxShadow: 'unset',
        backgroundColor: colorConfigs.topbar.bg,
        color: colorConfigs.topbar.color
      }}
    >
      <Toolbar>
      </Toolbar>
    </AppBar>
  )
}