import React from 'react'
import sizeConfigs from '../configs/sizeConfigs'
import { Link, useLocation } from 'react-router-dom'
import { Drawer, Typography, List, Toolbar, Stack, ListItemButton, ListItemIcon } from '@mui/material';
import colorConfigs from '../configs/colorConfigs';
import routes from '../routes/routes';

export const Sidebar = () => {

  const location = useLocation();

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: sizeConfigs.sidebar.width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sizeConfigs.sidebar.width,
          boxSizing: 'border-box',
          borderRight: '0px',
          backgroundColor: colorConfigs.sidebar.bg
        }
      }}
    >
      <Toolbar>
        <Typography 
          variant='h4' 
          sx={{ color: 'white' }}
        >SPR</Typography>
      </Toolbar>
      <Stack
        sx={{ 
          width: '100%',
          "& :hover": {
            backgroundColor: colorConfigs.sidebar.activeBg
          }
        }}
        direction='column'
        justifyContent='center'
      >
        <List disablePadding>
          {
            routes.map(({ name, path, inMenu }) => {
              return (
                inMenu ?
                <Link
                  to={ path }
                  style={{ 
                    textDecoration: 'none' 
                  }}
                >
                  <ListItemButton 
                    sx={{ 
                      paddingLeft: '25px',
                      paddingRight: '25px',
                      backgroundColor: (location.pathname.split('/')[1] == path.split('/')[1]) ? colorConfigs.sidebar.activeBg : colorConfigs.sidebar.bg,
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography 
                      variant='h6'
                      sx={{ color: 'white' }}
                    >
                      { name }
                    </Typography>
                  </ListItemButton>
                </Link> : null
              );
            })
          }
        </List>
      </Stack>
    </Drawer>
  )
}