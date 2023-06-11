import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import moment from 'moment';

interface ISimulatedTimer {
  min: number;
  initialDate: string;
}

export const SimulatedTimer = ({ min, initialDate }: ISimulatedTimer) => {
  const minutes = Math.floor(min);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24);
  
  const dd = initialDate.substr(8, 2);
  const md = initialDate.substr(5, 2);
  const ad = initialDate.substr(0, 4);

  return (
    <>
      <Box sx={{display: 'flex'}}>
        <Typography variant={'h6'}>{`${('0'+days).slice(-2)}:${('0'+hours%24).slice(-2)}:${('0'+(minutes%60).toString()).slice(-2)}`}</Typography>
        <Typography sx={{marginLeft: '5px', marginTop: '3px'}}>{`(dd/hh/mm)`}</Typography>
      </Box>
      <Typography variant={'h6'} sx={{marginTop: '10px'}}>Día:</Typography>
      <Typography sx={{marginTop: '5px'}}>{moment([ad, md, dd]).add(days, 'days').format('DD/MM/YYYY')}</Typography>
    </>
  );
}