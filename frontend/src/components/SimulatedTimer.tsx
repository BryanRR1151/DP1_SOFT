import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

interface ISimulatedTimer {
  min: number;
}

export const SimulatedTimer = ({ min }: ISimulatedTimer) => {
  const minutes = Math.floor(min);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24)

  return (
    <Box sx={{display: 'flex'}}>
      <Typography variant={'h6'}>{`${('0'+days).slice(-2)}:${('0'+hours%24).slice(-2)}:${('0'+(minutes%60).toString()).slice(-2)}`}</Typography>
      <Typography sx={{marginLeft: '5px', marginTop: '3px'}}>{`(dd/hh/mm)`}</Typography>
    </Box>
  );
}