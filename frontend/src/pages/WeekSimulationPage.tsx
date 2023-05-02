import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import colorConfigs from '../configs/colorConfigs'
import { Button, Breadcrumbs, Box, Typography, Container, Grid } from '@mui/material';
import sizeConfigs from '../configs/sizeConfigs';
import { AnimationGrid } from '../components/AnimationGrid';
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';

const INITIAL_TIMER = 0;
const TARGET_TIMER = 180;

export const WeekSimulationPage = () => {

  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [timer, setTimer] = useState(-1);
  const [finished, setFinished] = useState(true);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  const interval = useRef<any>(null);
  
  const startAlgorithm = async() => {
    setFinished(false);
    await AlgorithmService.start().then((response) => {
      console.log('Algorithm executed successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const getMomentFromAlgorithm = async() => {
    await AlgorithmService.getMoment( timer ).then((response) => {
      setApiMoment(parseMoment(response.data));
    }).catch((err) => {
      console.log(err);
    });
  }

  const stopSimulation = async() => {
    setFinished(true);
    setApiMoment(undefined);
    setTimer(-1);
    await AlgorithmService.kill().then((response) => {
      console.log('Algorithm stopped successfully');
    }).catch((err) => {
      console.log(err);
    });
  }
  
  const handleTimer = () => {
    interval.current = setInterval(() => {
      setTimer((count) => count + 1);
    }, 1000);
  }

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    if (timer == -1) return;
    if (timer >= TARGET_TIMER && interval.current) {
      clearInterval(interval.current);
      if (finished) setTimer(-1);
    }
    if (timer === INITIAL_TIMER) {
      startAlgorithm();
      handleTimer();
    }
    if (timer > INITIAL_TIMER && timer < TARGET_TIMER) {
      getMomentFromAlgorithm();
    }
  }, [timer]);

  const openVehiclePopup = (vehicle: TVehicle) => {
    console.log(vehicle);
  }

  const parseMoment = (moment: TMoment) => {
    let newVehicles = moment.activeVehicles.map((v, index) => {
      if (v.type == VehicleType.auto) {
        let move = v.movement;
        let newMove: TMovement;
        if (move.to.x - move.from.x > 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, 
                                     to: { x: move.to.x-0.5, y: move.to.y }};
          else newMove = { from: { x: move.from.x+0.5, y: move.from.y }, 
                          to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        } 
        else if (move.to.y - move.from.y > 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, 
                                     to: { x: move.to.x, y: move.to.y-0.5 }};
          else newMove = { from: { x: move.from.x, y: move.from.y+0.5 }, 
                          to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        }
      }
      return v;
    });
    moment.activeVehicles = newVehicles;
    return moment;
  }

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

      <Container>
        <Box
          sx={{
            display: 'flex',
            width: `calc(100vw - ${sizeConfigs.sidebar.width})`
          }}
        >
          <Box
            sx={{
              padding: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '50vw'
            }}
          >
            <Box
              sx={{
                marginBottom: 2
              }}
            >
              <Button
                variant='contained'
                color='secondary'
                disabled={timer >= 0}
                onClick={() => setTimer(INITIAL_TIMER)}
              >
                Iniciar simulación {timer}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={stopSimulation}
                disabled={timer == -1}
                sx={{
                  marginLeft: 2
                }}
              >
                Detener simulación
              </Button>
            </Box>
            <AnimationGrid 
              moment={ (timer >= 0 && apiMoment !== undefined) ? apiMoment : undefined}
              openVehiclePopup={openVehiclePopup}
            />
          </Box>
          <Box
            sx={{
              padding: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: 'calc(100% - 50vw)'
            }}
          >
            {/* TO BE MADE: <FileComponent /> */}
            {/* TO BE MADE: <FileComponent /> */}
          </Box>
        </Box>
      </Container>
    </>
  )
}