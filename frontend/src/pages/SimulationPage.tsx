import React from 'react'
import colorConfigs from '../configs/colorConfigs'
import { Link } from 'react-router-dom'
import { Container, Grid, Card, CardMedia, CardContent, CardHeader, Box, Breadcrumbs, Typography } from '@mui/material';
import simulacion from '../assets/simulacion.jpg'

export const SimulationPage = () => {
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
        <Typography>Seleccionar simulación</Typography>
      </Breadcrumbs>

      <Container sx={{ padding: 2.5 }}>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          <Grid item xs={12} sm={6}>
            <Link to={'/simulacion/semanal'} style={{ textDecoration: 'none' }}>
              <Card sx={{ maxWidth: 500 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={simulacion}
                  alt="simulacion semanal"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    Simulación Semanal
                  </Typography>
                  <Typography variant="body2">
                    Permite la carga de pedidos e incidentes para visualizar el comportamiento de las entregas en un plazo de 7 días.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Link to={'/simulacion/colapso'} style={{ textDecoration: 'none' }}>
              <Card sx={{ maxWidth: 500 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={simulacion}
                  alt="simulacion colapso logistico"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    Colapso Logístico
                  </Typography>
                  <Typography variant="body2">
                  Permite la carga de pedidos y bloqueos de calles para visualizar el comportamiento de las entregas hasta alcanzar el colapso logístico.
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}