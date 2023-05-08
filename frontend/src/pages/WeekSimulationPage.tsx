import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import colorConfigs from '../configs/colorConfigs'
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid } from '@mui/material';
import sizeConfigs from '../configs/sizeConfigs';
import { AnimationGrid } from '../components/AnimationGrid';
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { DropzoneComponent } from '../components/DropzoneComponent';
import { PanelType, panelStyles } from '../types/types';
import { FaAngleDown } from 'react-icons/fa';

const INITIAL_TIMER = 0;
const TARGET_TIMER = 180;

export const WeekSimulationPage = () => {

  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  const [timer, setTimer] = useState(-1);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [oFiles, setOFiles] = useState<any[]>([]);
  const [bFiles, setBFiles] = useState<any[]>([]);
  const [fFiles, setFFiles] = useState<any[]>([]);
  const interval = useRef<any>(null);

  const startAlgorithm = async() => {
    await AlgorithmService.start().then((response) => {
      console.log('Algorithm executed successfully');
      if (timer >= TARGET_TIMER) setTimer(-1);
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
    setApiMoment(undefined);
    clearInterval(interval.current);
    setTimer(-2);
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
    if (timer == -1 || timer == -2) return;
    if (timer >= TARGET_TIMER && interval.current) {
      clearInterval(interval.current);
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
        else if (move.to.x - move.from.x < 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, 
                                     to: { x: move.to.x+0.5, y: move.to.y }};
          else newMove = { from: { x: move.from.x-0.5, y: move.from.y }, 
                          to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        } 
        else if (move.to.y - move.from.y < 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, 
                                     to: { x: move.to.x, y: move.to.y+0.5 }};
          else newMove = { from: { x: move.from.x, y: move.from.y-0.5 }, 
                          to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        }
      }
      return v;
    });
    moment.activeVehicles = newVehicles;
    return moment;
  }

  const onFileChange = (updatedList: any[], type: string) => {
    if (type == 'Order') {
      setOFiles(updatedList);
    }
    else if (type == 'Blockage') {
      setBFiles(updatedList);
    }
    else if (type == 'Failure') {
      setFFiles(updatedList);
    }
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
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              padding: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
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
                  disabled={timer <= -1}
                  sx={{
                    marginLeft: 2
                  }}
                >
                  Detener simulación
                </Button>
              </Box>
              <Box>
                {(timer <= -1) &&
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationFiles) }}
                    sx={{ marginLeft: 2 }}
                  >
                    Subir archivos
                  </Button>
                }
              </Box>
            </Box>
            <AnimationGrid 
              moment={ (timer >= 0 && apiMoment !== undefined) ? apiMoment : undefined}
              openVehiclePopup={openVehiclePopup}
            />
          </Box>
        </Box>
      </Container>
      <Box
        sx={{ ...panelStyles.panel, ...(openPanel && panelStyles.panelOpen) }}
        display="flex"
        flexDirection="column"
      >
        {typePanel == PanelType.simulationFiles ?
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Subir archivos para la simulación:</Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<FaAngleDown />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Pedidos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <DropzoneComponent onFileChange={onFileChange} type={'Order'} files={oFiles} />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<FaAngleDown />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography>Bloqueos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <DropzoneComponent onFileChange={onFileChange} type={'Blockage'} files={bFiles} />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<FaAngleDown />}
                aria-controls="panel3a-content"
                id="panel3a-header"
              >
                <Typography>Fallas de vehículos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <DropzoneComponent onFileChange={onFileChange} type={'Failure'} files={fFiles} />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box> : null
      }
      </Box>
      {openPanel && <Box sx={panelStyles.overlay} onClick={ () => { setOpenPanel(false); setTypePanel(null) }}/>}
    </>
  )
}