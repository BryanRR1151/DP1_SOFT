import { Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import colorConfigs from '../configs/colorConfigs';
import { TUser } from '../types/types';
import UserService from '../services/UserService';
import { useSignIn } from 'react-auth-kit'
import logo from '../assets/logo_black.png';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [ email, setEmail ] = useState<string>('');
  const [ error, setError ] = useState<string>('');

  const signIn = useSignIn();
  const navigate = useNavigate();

  const submitLogin = async(e: any) => {
    e.preventDefault();
    setError('');
    const user: TUser = { email };
    await UserService.loginUser(user).then((response) => {
      signIn({
        token: response.data.token,
        expiresIn: 86400,
        tokenType: 'bearer',
        authState: { email: response.data.email, token: response.data.token, name: response.data.nombre ?? '' + " " + response.data.apellido ?? '' }
      });
      navigate('/');
    }).catch((err) => {
      console.log(err);
      setError('El usuario no está registrado en el sistema');
    });
  }

  return (
    <>
      <Box sx={{margin: '-8px'}}>
        <Box sx={{ margin: '-8px', backgroundColor: colorConfigs.topbar.bg, display: 'flex', alignItems: 'center', width: '100%', height: '100vh', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: colorConfigs.breadcrumb.bg, borderRadius: '10px', alignSelf: 'center', padding: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <img src={logo} width='200' height='125' />
            </Box>
            <Box>
              <form autoComplete="off" onSubmit={(e) => submitLogin(e)}>
                <TextField 
                  label="Ingrese su correo"
                  onChange={(e: any) => setEmail(e.target?.value)}
                  variant="outlined"
                  color="secondary"
                  type="text"
                  sx={{mb: 3}}
                  fullWidth
                  value={email}
                  error={error.length > 0}
                  helperText={error}
                />
                <Button variant="contained" color="secondary" type="submit">Login</Button>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}