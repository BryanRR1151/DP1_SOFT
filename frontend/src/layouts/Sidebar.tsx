import React, { useState } from 'react'
import sizeConfigs from '../configs/sizeConfigs'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Drawer, Typography, List, Toolbar, Stack, ListItemButton, ListItemIcon, Divider, Box, IconButton, Avatar, Button, Menu, MenuItem } from '@mui/material';
import colorConfigs from '../configs/colorConfigs';
import routes from '../routes/routes';
import { useAuthUser, useSignOut } from 'react-auth-kit';
import logo from '../assets/logo_white.png';
import UserService from '../services/UserService';
import { TUser } from '../types/types';

export const Sidebar = () => {
  const location = useLocation();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const auth = useAuthUser()

  const handleClick = (e: any) => {
    setAnchorEl(e.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleLogout = async() => {
    const user: TUser = { email: auth()?.email };
    await UserService.logout(user).then((response) => {
      console.log(response.data);
      signOut();
      navigate('/login');
    }).catch((err) => {
      console.log(err);
    })
  }


  return (
    <>
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
          <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>
            <img src={logo} width='200' height='100' />
          </Box>
        </Toolbar>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {
              routes.map(({ name, path, inMenu }) => {
                let color = (location.pathname.split('/')[1] == path.split('/')[1]) ? 'secondary' : 'primary';
                return (
                  inMenu ?
                  <Link
                    to={ path }
                    style={{ 
                      textDecoration: 'none' 
                    }}
                  >
                    <Button
                      variant='contained'
                      color={color as any}
                      sx={{
                        width: '95%',
                        marginLeft: '5px',
                        marginBottom: '5px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 500, textTransform: 'none' }}
                      >
                        { name }
                      </Typography>
                    </Button>
                  </Link> : null
                );
              })
            }
          </Box>
          <Box sx={{marginBottom: 2, padding: 1}}>
            <Button
                onClick={handleClick}
                size="small"
                sx={{ gap: 1 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
              <Avatar sx={{ width: 32, height: 32 }}>{auth()?.name.substring(0, 1)}</Avatar>
              <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                <Typography sx={{ variant: 'h6', color: 'white', textTransform: 'none' }}>{auth()?.name}</Typography>
              </Box>
            </Button>
          </Box>
        </Box>
      </Drawer>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              bottom: 0,
              left: 10,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 65 }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}