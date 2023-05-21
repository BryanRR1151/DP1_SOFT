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
import { FaAmazonPay, FaAngleDown } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { SimulatedTimer } from '../components/SimulatedTimer';

const INITIAL_TIMER = 0;
const TARGET_TIMER = 10080;

export const WeekSimulationPage = () => {

  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  const [timer, setTimer] = useState(-1);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [oFiles, setOFiles] = useState<any[]>([]);
  const [bFiles, setBFiles] = useState<any[]>([]);
  const [fFiles, setFFiles] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<TVehicle|undefined>(undefined);
  const interval = useRef<any>(null);

  const startAlgorithm = async() => {
    const data = new FormData();
    for (let i = 0 ; i < oFiles.length ; i++) {
      data.append("fPacks", oFiles[i]);
    }
    for (let i = 0 ; i < bFiles.length ; i++) {
      data.append("fBlocks", bFiles[i]);
    }
    if(bFiles.length == 0) data.append("fBlocks", '');
    for (let i = 0 ; i < fFiles.length ; i++) {
      data.append("fFaults", fFiles[i]);
    }
    if(fFiles.length == 0) data.append("fFaults", '');
    await AlgorithmService.start(data).then((response) => {
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
    setOpenPanel(true);
    setTypePanel(PanelType.vehicleInfo);
    setVehicle(vehicle);
  }

  const parseMoment = (moment: TMoment) => {
    let newVehicles = moment.activeVehicles.map((v, index) => {
      if (v.type == VehicleType.auto) {
        let move = v.movement;
        let newMove: TMovement;
        if (move.to.x - move.from.x > 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, to: { x: move.to.x-0.5, y: move.to.y }};
          else newMove = { from: { x: move.from.x+0.5, y: move.from.y }, to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        } 
        else if (move.to.y - move.from.y > 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, to: { x: move.to.x, y: move.to.y-0.5 }};
          else newMove = { from: { x: move.from.x, y: move.from.y+0.5 }, to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        }
        else if (move.to.x - move.from.x < 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, to: { x: move.to.x+0.5, y: move.to.y }};
          else newMove = { from: { x: move.from.x-0.5, y: move.from.y }, to: { x: move.to.x, y: move.to.y }};
          v.movement = newMove;
        } 
        else if (move.to.y - move.from.y < 0) {
          if (!v.moved) newMove = { from: { x: move.from.x, y: move.from.y }, to: { x: move.to.x, y: move.to.y+0.5 }};
          else newMove = { from: { x: move.from.x, y: move.from.y-0.5 }, to: { x: move.to.x, y: move.to.y }};
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
                  onClick={() => { if(oFiles.length == 7) { setTimer(INITIAL_TIMER); } else { toast.error('Debe subir 7 archivos de pedidos'); } }}
                >
                  Iniciar simulación
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
                {(timer >= 0) &&
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationDetails) }}
                    sx={{ marginLeft: 2 }}
                  >
                    Ver detalles
                  </Button>
                }
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
                {timer >= 0 && <SimulatedTimer min={timer} />}
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
        {typePanel == PanelType.vehicleInfo && vehicle !== undefined &&
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Detalles del vehiculo:</Typography>
            <Typography sx={{marginBottom: 2}}><b>Tipo: </b>{vehicle.type}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Carga actual: </b>{vehicle.carry}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Capacidad total: </b>{vehicle.capacity}</Typography>
          </Box>
        }
        {typePanel == PanelType.simulationDetails && apiMoment !== undefined &&
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Detalles de la simulación:</Typography>
            {timer >= 0 && <SimulatedTimer min={timer} />}
            <Typography sx={{marginTop: 2, marginBottom: 2}}><b>Pedidos entregados: </b>{apiMoment.ordersDelivered}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Pedidos restantes: </b>{apiMoment.ordersLeft}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Capacidad de la flota: </b>{apiMoment.fleetCapacity}%</Typography>
          </Box>
        }
      </Box>
      {openPanel && <Box sx={panelStyles.overlay} onClick={ () => { setOpenPanel(false); setTypePanel(null); setVehicle(undefined); }}/>}
      <ToastContainer />
    </>
  )
}