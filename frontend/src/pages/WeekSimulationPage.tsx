import React from 'react'
import { Link } from 'react-router-dom'
import colorConfigs from '../configs/colorConfigs'
import { Breadcrumbs, Typography } from '@mui/material';
import { Simulation } from '../components/Simulation';

export const WeekSimulationPage = () => {
  return (
    <>
      <Breadcrumbs 
        maxItems={2} 
        aria-label='breadcrumb'
        sx={{
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingTop: '5px',
          paddingBottom: '5px',
          backgroundColor: colorConfigs.breadcrumb.bg
        }}
      >
          <Link to={'/simulacion'} style={{ textDecoration: 'none' }}>Seleccionar simulación</Link>
          <Typography>Simulación semanal</Typography>
      </Breadcrumbs>

      <Simulation isCollapse={ false } targetTimer={ 365 } />
    </>
  )
}