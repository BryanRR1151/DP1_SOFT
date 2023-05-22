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

interface ISimulation {
  isCollapse: boolean;
  targetTimer: number; // In days
}

const INITIAL_TIMER = 0;

export const Simulation = (props: ISimulation) => {
  
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [apiMoments, setApiMoments] = useState<TMoment[]>([]);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  const [timer, setTimer] = useState(-1);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [oFiles, setOFiles] = useState<any[]>([]);
  const [bFiles, setBFiles] = useState<any[]>([]);
  const [fFiles, setFFiles] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<TVehicle|undefined>(undefined);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1 min/seg
  const [auxCount, setAuxCount] = useState<number>(0);
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
      if (timer >= props.targetTimer*24*60) setTimer(-1);
    }).catch((err) => {
      console.log(err);
    });
  }

  const getMomentFromAlgorithm = async() => {
    if (auxCount == 0 && (timer + speed <= props.targetTimer*24*60)) {
      await AlgorithmService.getMoment( timer, speed ).then((response) => {
        /*
          if (props.isCollapse) {
            let moments: TMoment[] = response.data.moments;
            let end = response.data.end;
            if (!end) {
              setApiMoment(parseMoment(moments[0]));
              setApiMoments(moments);
            }
            else {
              const minutes = Math.floor(timer);
              const hours = Math.floor(timer / 60);
              const days = Math.floor(hours / 24);
              setApiMoment(undefined);
              clearInterval(interval.current);
              setTimer(-2);
              toast.error(`La simulación alcanzó el colapso logístico en el siguiente tiempo: ${('0'+days).slice(-2)}:${('0'+hours).slice(-2)}:${('0'+(minutes%60).toString()).slice(-2)} (dd/hh/mm)`);
            }
          }
        */
        let moments: TMoment[] = response.data;
        setApiMoment(parseMoment(moments[0]));
        setApiMoments(moments);
      }).catch((err) => {
        console.log(err);
      });
    }
    else {
      setApiMoment(parseMoment(apiMoments[auxCount]));
    }
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
    if (timer >= props.targetTimer*24*60 && interval.current) {
      setApiMoment(undefined);
      clearInterval(interval.current);
      setTimer(-2);
    }
    if (timer === INITIAL_TIMER) {
      startAlgorithm();
      handleTimer();
    }
    if (timer > INITIAL_TIMER && timer < props.targetTimer*24*60) {
      getMomentFromAlgorithm();
    }
  }, [timer]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = setInterval(() => {
        setAuxCount((count) => count == speed - 1 ? 0 : count + 1);
        setTimer((count) => count + 1);
      }, 1000/speed);
    }
  }, [speed]);

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
                  onClick={() => { if(!props.isCollapse ? oFiles.length == props.targetTimer : oFiles.length == 1) { setTimer(INITIAL_TIMER); } else { toast.error(`Debe subir ${ props.isCollapse ? '1 archivo' : `${ props.targetTimer } archivos`} de pedidos`); } }}
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
                {timer >= 0 && 
                  <Box sx={{ display: 'flex', gap: 5 }}>
                    <Box sx={{ gap: 1, marginLeft: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button variant={ speed == 1 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(1); setAuxCount(-1); }}>x1</Button>
                      <Button variant={ speed == 2 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(2); setAuxCount(-1); }}>x2</Button>
                      <Button variant={ speed == 3 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(3); setAuxCount(-1); }}>x3</Button>
                    </Box>
                    <Box>
                      <SimulatedTimer min={timer} />
                    </Box>
                  </Box>
                }
              </Box>
            </Box>
            <AnimationGrid 
              moment={ (timer >= 0 && apiMoment !== undefined) ? apiMoment : undefined}
              openVehiclePopup={ openVehiclePopup }
              speed={ speed }
            />
            <Box sx={{ marginTop: 4, gap: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
              <Box><Typography variant={'h6'}>Leyenda:</Typography></Box>
              <Box sx={{ display: 'flex' }}>
                <Typography>Depósito:</Typography>
                <div style={{ width: 10, height: 10, backgroundColor: colorConfigs.dots.depot, borderRadius: 20, marginTop: 5, marginLeft: 5}}></div>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography>Punto de entrega:</Typography>
                <div style={{ width: 10, height: 10, backgroundColor: colorConfigs.dots.pack, borderRadius: 20, marginTop: 5, marginLeft: 5}}></div>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography>Bloqueo:</Typography>
                <div style={{ width: 10, height: 10, backgroundColor: colorConfigs.dots.block, borderRadius: 20, marginTop: 5, marginLeft: 5}}></div>
              </Box>
            </Box>
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