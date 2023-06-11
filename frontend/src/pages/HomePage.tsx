import React, {useEffect} from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  const redirectSimulation = async() => {
    navigate('/simulacion');
  }

  useEffect(() => {
    redirectSimulation();
  }, []);

  return (
    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '20px' }}>
      <CircularProgress />
    </Box>
  )
}