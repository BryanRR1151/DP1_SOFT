import React from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Typography, Box } from '@mui/material';
import colorConfigs from '../configs/colorConfigs';

export const OrdersPage = () => {
  return (
    <>
      <Breadcrumbs 
        maxItems={2} 
        aria-label='breadcrumb'
        sx={{
          backgroundColor: colorConfigs.breadcrumb.bg
        }}
      >
        <Box
          sx={{
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingTop: '5px',
            paddingBottom: '5px'
          }}
        >
          <Typography>Pedidos</Typography>
        </Box>
      </Breadcrumbs>
    </>
  )
}