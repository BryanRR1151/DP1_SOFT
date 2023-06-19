import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import colorConfigs from '../configs/colorConfigs'
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid, Input, TextField, CircularProgress } from '@mui/material';
import sizeConfigs from '../configs/sizeConfigs';
import { AnimationGrid } from '../components/AnimationGrid';
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { DropzoneComponent } from '../components/DropzoneComponent';
import { PanelType, panelStyles } from '../types/types';
import { FaAmazonPay, FaAngleDown } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { SimulatedTimer } from '../components/SimulatedTimer';
import Select, { GroupBase } from 'react-select'

interface ISimulation {
  isCollapse: boolean;
  targetTimer: number; // In days
}

const INITIAL_TIMER = 0;

const options = [
  { value: "1", label: 'TI1' },
  { value: "2", label: 'TI2' },
  { value: "3", label: 'TI3' }
]
const vehicleOptions = [
  { value: VehicleType.auto, label: 'Aut' },
  { value: VehicleType.moto, label: 'Mot' }
]

export const Simulation = (props: ISimulation) => {
  
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [apiMoments, setApiMoments] = useState<TMoment[]>([]);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  const [timer, setTimer] = useState(-1);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [fFiles, setFFiles] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<TVehicle|undefined>(undefined);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1 min/seg
  const [auxCount, setAuxCount] = useState<number>(0);
  const [stopped, setStopped] = useState<boolean>(false);
  const [initialDate, setInitialDate] = useState<string>('2023-09-01');

  const [selected, setSelected] = useState<string>("1");
  const [stopType, setStopType] = useState<number>(-2);
  const [stopMessage, setStopMessage] = useState<string>("");
  const [stopMaxCapacity, setStopMaxCapacity] = useState<number>(0);
  const [stopTotalPacks, setStopTotalPacks] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [lastTimer, setLastTimer] = useState<number>(0);

  const [vehicleCodeError, setVehicleCodeError] = useState<boolean>(false);
  const [vehicleCodeErrorMessage, setVehicleCodeErrorMessage] = useState<string>("");
  const [saveNeedsToBeDisabled, setSaveNeedsToBeDisabled] = useState<boolean>(true);
  const [vehicleCodeValue, setVehicleCodeValue] = useState<number>(0);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("Aut");

  const [faultVehicles, setFaultVehicles] = useState<TVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const interval = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopAlgorithmOnDismount();
    }
  }, [])

  const stopAlgorithmOnDismount = async() => {
    if (timer > 0) {
      AlgorithmService.kill().then((response) => {
        console.log('Algorithm stopped successfully');
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  const startAlgorithm = async() => {
    let sendDate = initialDate.substr(8, 2) + '/' + initialDate.substr(5, 2) + '/' + initialDate.substr(0, 4);
    if (!props.isCollapse) {
      await AlgorithmService.startWeekly(sendDate).then((response) => {
        console.log('Algorithm executed successfully');
        if (timer >= props.targetTimer*24*60) setTimer(-1);
      }).catch((err) => {
        console.log(err);
      });
    }
    else {
      await AlgorithmService.startCollapse(sendDate).then((response) => {
        console.log('Algorithm executed successfully');
        if (timer >= props.targetTimer*24*60) setTimer(-1);
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  const getMomentFromAlgorithm = async() => {
    if (stopped) {
      stopCollapse();
      return;
    }
    if (auxCount == 0 && (timer + speed <= props.targetTimer*24*60)) {
      await AlgorithmService.getMoment( timer, speed ).then((response) => {
        let moments: TMoment[] = response.data;

        let newMoment = moments[0];
        let newFaultVehicles = [...newMoment.faultVehicles ?? [], ...faultVehicles.filter((vehicle) => vehicle.stopTime! != timer)];
        newMoment.activeVehicles = [...newMoment.activeVehicles.filter((vehicle) => !newFaultVehicles.find((fv) => fv.code == vehicle.code)) ?? [], ...newFaultVehicles];
        setFaultVehicles(newFaultVehicles);

        console.log(newMoment.activeVehicles);
        console.log(newFaultVehicles);

        setApiMoment(parseMoment(newMoment));
        setApiMoments(moments);

        if (moments[0].finish && !stopped)  {
          setStopped(true);
          setStopType(moments[0].finish.code);
          setStopMessage(moments[0].finish.message);
          setStopMaxCapacity(moments[0].finish.maxCapacity);
          setStopTotalPacks(moments[0].finish.totalPack);
        }
      }).catch((err) => {
        console.log(err);
      });
    }
    else {
      let newMoment = apiMoments[auxCount];
      let newFaultVehicles = [...newMoment.faultVehicles ?? [], ...faultVehicles.filter((vehicle) => vehicle.stopTime! != timer)];
      newMoment.activeVehicles = [...newMoment.activeVehicles.filter((vehicle) => !newFaultVehicles.find((fv) => fv.code == vehicle.code)) ?? [], ...newFaultVehicles];
      setFaultVehicles(newFaultVehicles);
      
      console.log(newMoment.activeVehicles);
      console.log(newFaultVehicles);

      setApiMoment(parseMoment(newMoment));

      if (apiMoments[auxCount].finish && !stopped)  {
        setStopped(true);
        setStopType(apiMoments[auxCount].finish!.code);
        setStopMessage(apiMoments[auxCount].finish!.message);
        setStopMaxCapacity(apiMoments[auxCount].finish!.maxCapacity);
        setStopTotalPacks(apiMoments[auxCount].finish!.totalPack);
      }
    }
  }

  const stopSimulation = async() => {
    clearInterval(interval.current);
    setApiMoment(undefined);
    setApiMoments([]);
    setTimer(-2);
    setSpeed(1);
    setAuxCount(0);
    setFaultVehicles([]);
    await AlgorithmService.kill().then((response) => {
      console.log('Algorithm stopped successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const stopCollapse = () => {
    const minutes = Math.floor(timer);
    const hours = Math.floor(timer / 60);
    const days = Math.floor(hours / 24);
    clearInterval(interval.current);
    setApiMoment(undefined);
    setApiMoments([]);
    setTimer(-2);
    setSpeed(1);
    setAuxCount(0);
    setShowResults(true);
    setLastTimer(timer);
    setFaultVehicles([]);
    if (stopType != -2) {
      switch(stopType) {
        case(-1):
          toast.error(`Hubo un error: ${stopMessage}`);
          break;
        case(0):
          toast.error(`La simulación alcanzó el colapso logístico en: ${('0'+days).slice(-2)} días, ${('0'+hours).slice(-2)} horas, ${('0'+(minutes%60).toString()).slice(-2)} minutos`);
          break;
        case(1):
          toast.success(`Simulación culminada exitosamente`);
          break;
      }
    }
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
      clearInterval(interval.current);
      setApiMoment(undefined);
      setApiMoments([]);
      setTimer(-2);
      setSpeed(1);
      setAuxCount(0);
    }
    if (timer === INITIAL_TIMER) {
      startAlgorithm();
      setLoading(true);
      setStopType(-2);
      setTimeout(() => {
        handleTimer();
        setLoading(false);
        setSpeed(8);
        setAuxCount(-1);
      }, 3000);
    }
    if (timer > INITIAL_TIMER && timer < props.targetTimer*24*60) {
      getMomentFromAlgorithm();
    }
  }, [timer]);

  useEffect(() => {
    if(speed == 1 && timer < 0) return;
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
        let move = v.movement as TMovement;
        let newMove: TMovement;
        if (move.to!.x - move.from!.x > 0) {
          if (!v.moved) newMove = { from: { x: move.from!.x, y: move.from!.y }, to: { x: move.to!.x-0.5, y: move.to!.y }};
          else newMove = { from: { x: move.from!.x+0.5, y: move.from!.y }, to: { x: move.to!.x, y: move.to!.y }};
          v.movement = newMove;
        } 
        else if (move.to!.y - move.from!.y > 0) {
          if (!v.moved) newMove = { from: { x: move.from!.x, y: move.from!.y }, to: { x: move.to!.x, y: move.to!.y-0.5 }};
          else newMove = { from: { x: move.from!.x, y: move.from!.y+0.5 }, to: { x: move.to!.x, y: move.to!.y }};
          v.movement = newMove;
        }
        else if (move.to!.x - move.from!.x < 0) {
          if (!v.moved) newMove = { from: { x: move.from!.x, y: move.from!.y }, to: { x: move.to!.x+0.5, y: move.to!.y }};
          else newMove = { from: { x: move.from!.x-0.5, y: move.from!.y }, to: { x: move.to!.x, y: move.to!.y }};
          v.movement = newMove;
        } 
        else if (move.to!.y - move.from!.y < 0) {
          if (!v.moved) newMove = { from: { x: move.from!.x, y: move.from!.y }, to: { x: move.to!.x, y: move.to!.y+0.5 }};
          else newMove = { from: { x: move.from!.x, y: move.from!.y-0.5 }, to: { x: move.to!.x, y: move.to!.y }};
          v.movement = newMove;
        }
      }
      return v;
    });
    moment.activeVehicles = newVehicles;
    return moment;
  }

  // ---------------- VEHICLE FAILURES ------------------

  const handleVehicleCodeChange = (formVehicleCode: number) => {
    let code = formVehicleCode;
    setVehicleCodeValue(code);
    if(code <= 0) {
      setVehicleCodeError(true);
      setSaveNeedsToBeDisabled(true);
      setVehicleCodeErrorMessage("El código debe ser mayor que 0");
    } else {
      if(apiMoment?.activeVehicles.find(v => v.code == selectedVehicleType + formVehicleCode.toString().padStart(3,"0")) == undefined) {
        setVehicleCodeError(true);
        setSaveNeedsToBeDisabled(true);
        setVehicleCodeErrorMessage("El vehículo no se encuentra en ruta");
      } else {
        setVehicleCodeError(false);
        setSaveNeedsToBeDisabled(false);
        setVehicleCodeErrorMessage("");
      }
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    let damagedVehicleIndex = -1;
    damagedVehicleIndex = apiMoment!.activeVehicles.findIndex(v => v.code == selectedVehicleType + vehicleCodeValue.toString().padStart(3,"0"));
    if(damagedVehicleIndex == -1) {
      setVehicleCodeError(true);
      setSaveNeedsToBeDisabled(true);
      setVehicleCodeErrorMessage("El vehículo no se encuentra en ruta");
    } else {
      apiMoment?.activeVehicles.splice(damagedVehicleIndex,1);
      setApiMoment(apiMoment);
      // registerFault(selectedVehicleType + vehicleCodeValue.toString().padStart(3,"0"), selected);
    }
  }

  const handleVehicleFailure = (e: any, code: String) => {
    e.preventDefault()
    let damagedVehicleIndex = -1;
    damagedVehicleIndex = apiMoment!.activeVehicles.findIndex(v => v.code == code);
    if(damagedVehicleIndex == -1) {
      setVehicleCodeError(true);
    } else {
      let newApiMoments = apiMoments.map((moment: TMoment) => {
        let newMoment = moment; 
        newMoment?.activeVehicles.splice(damagedVehicleIndex, 1);
        return newMoment;
      });
      setVehicleCodeError(false);
      setApiMoments(newApiMoments);
      setOpenPanel(false); 
      setTypePanel(null); 
      setVehicle(undefined);
      registerFault(code, selected);
    }
  }

  const registerFault = async(code: String, fault: string) => {
    await AlgorithmService.manualKill(code, fault).then(() => {
      toast.success(`Falla ingresada correctamente`);
    }).catch((err) => {
      console.log(err);
    });
  }

  // ----------------------------------------------------

  const renderSimulationResume = () => {
    const minutes = Math.floor(lastTimer);
    const hours = Math.floor(lastTimer / 60);
    const days = Math.floor(hours / 24);

    return (
      <>
       {stopType == 1 || stopType == 0 ?
        <>
          <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Resumen de la simulación:</Typography>
          <Typography sx={{marginBottom: 2}}><b>Tiempo total transcurrido: </b>{`${('0'+days).slice(-2)} días, ${('0'+hours).slice(-2)} horas, ${('0'+(minutes%60).toString()).slice(-2)} minutos`}</Typography>
          <Typography sx={{marginBottom: 2}}><b>Máxima capacidad de flota alcanzada: </b>{stopMaxCapacity.toFixed(2)}%</Typography>
          <Typography sx={{marginBottom: 2}}><b>Total de pedidos entregados: </b>{stopTotalPacks}</Typography>
        </> : stopType == -1 ?
        <>
          <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Hubo un error en la simulación. Inténtelo de nuevo</Typography>
        </> : null
       }
      </>
    )
  }

  return (
    <>
      <Box>
        <Box sx={{ width:1000 }}>
          <Box
            sx={{
              padding: 5,
              paddingTop: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ /*display: 'flex'*/display: 'flex' }}>
              <Box sx={{ width: '1600px' }}>
                {!showResults && !loading ?
                  <AnimationGrid 
                    moment={ (timer >= 0 && apiMoment !== undefined) ? apiMoment : undefined}
                    openVehiclePopup={ openVehiclePopup }
                    speed={ speed }
                  /> : showResults && !loading ?
                  <Box sx={{ height: '100%' }}>
                    { renderSimulationResume() }
                  </Box> : loading ?
                  <Box sx={{ display: 'flex', /*width: '100%'*/width: '840px', justifyContent: 'center', marginTop: '20px' }}>
                    <CircularProgress />
                  </Box> : null
                }
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '50px', gap: 1 }}>
                <Box>
                  <Button
                    variant='contained'
                    color='secondary'
                    disabled={timer >= 0}
                    onClick={() => { if(!props.isCollapse ? initialDate : true) { setTimer(INITIAL_TIMER); setShowResults(false); } else { toast.error(`Debe ingresar una fecha de inicio de simulación`); } }}
                    sx={{ width: '220px' }}
                  >
                    Iniciar simulación
                  </Button>
                </Box>
                <Box>
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={stopSimulation}
                    disabled={timer <= -1}
                    sx={{ width: '220px' }}
                  >
                    Detener simulación
                  </Button>
                </Box>
                {(timer >= 0) &&
                  <>
                    <Box>
                      <Button
                        variant='outlined'
                        color='secondary'
                        onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationDetails) }}
                        sx={{ width: '220px' }}
                      >
                        Ver detalles
                      </Button>
                    </Box>
                    {/* <Box>
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationFiles) }}
                        sx={{}}
                      >
                        Registrar incidencias
                      </Button>
                    </Box> */}
                  </>
                }
                <Box>
                  {(timer <= -1) &&
                    <Box sx={{ marginTop: 5 }}>
                      {/* <Button
                        variant='outlined'
                        color='secondary'
                        onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationFiles) }}
                        sx={{ width: '220px' }}
                      >
                        Subir archivos
                      </Button> */}
                      {!props.isCollapse &&
                        <TextField required label='Fecha de inicio' type='date' value={initialDate} onChange={(e) => setInitialDate(e.target?.value)} sx={{ width: '220px' }} />
                      }
                    </Box>
                  }
                  {timer >= 0 && 
                    <>
                      <Box sx={{ display: 'flex', gap: 5, marginTop: 5 }}>
                        <Box sx={{ gap: 1, borderRadius: 2, display: 'flex', justifyContent: 'space-between', width: '220px'}}>
                          <Button variant={ speed == 1 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(1); setAuxCount(-1); }}>x1</Button>
                          <Button variant={ speed == 2 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(2); setAuxCount(-1); }}>x2</Button>
                          <Button variant={ speed == 8 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(8); setAuxCount(-1); }}>x8</Button>
                        </Box>
                      </Box>
                      <Box sx={{ marginTop: 5 }}>
                        <SimulatedTimer min={timer} initialDate={initialDate} />
                      </Box>
                    </>
                  }
                  <Box sx={{ marginTop: 20, gap: 1, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
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
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{ ...panelStyles.panel, ...(openPanel && panelStyles.panelOpen) }}
        display="flex"
        flexDirection="column"
      >
        {typePanel == PanelType.simulationFiles ?
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
          <Box>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Registrar falla vehicular:</Typography>
            <form autoComplete="off" onSubmit={handleSubmit}> 
              <Box
                display="flex"
                flexDirection="row"
                sx={{}}
              >
                <Box
                  sx={{width:130}}
                >
                  <Select 
                    defaultValue={vehicleOptions[0]}
                    isSearchable = {false}
                    name = "vehicle options"
                    options={vehicleOptions} 
                    onChange={(e: any) => {setSelectedVehicleType(e.label)}}
                  />
                </Box>
                <TextField 
                  label="Código del vehículo"
                  onChange={(e: any) => {handleVehicleCodeChange(e.target?.value)}}
                  required
                  variant="outlined"
                  color="secondary"
                  type="number"
                  error={vehicleCodeError}
                  helperText={vehicleCodeErrorMessage}
                  fullWidth
                  size="small"
                  sx={{marginLeft: 2,mb: 3}}
                />
              </Box>
              <Box sx={{width:294, height:65}}>
                <Select 
                  defaultValue={options[0]}
                  isSearchable = {true}
                  name = "incident type"
                  options={options} 
                  onChange={(e: any) => {setSelected(e.value)}}
                />
              </Box>
              <Button disabled={saveNeedsToBeDisabled} variant="contained" color="secondary" type="submit">Guardar</Button>
            </form>
          </Box>
        </Box> : null
        }
        {typePanel == PanelType.vehicleInfo && vehicle !== undefined &&
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, height: '100%'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Detalles del vehiculo:</Typography>
            <Typography sx={{marginBottom: 2}}><b>Código: </b>{vehicle.code}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Tipo: </b>{vehicle.type}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Carga actual: </b>{vehicle.carry}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Capacidad total: </b>{vehicle.capacity}</Typography>
            {!vehicle.stopTime &&
              <>
                <Typography variant='h6' sx={{marginBottom: 2, fontSize: '16px'}}>Registrar incidente:</Typography>
                <Select 
                  defaultValue={options[0]}
                  isSearchable = {true}
                  options={options} 
                  onChange={(e: any) => {setSelected(e.value)}}
                />
              </>
            }
            {vehicleCodeError && <Typography sx={{marginBottom: 1, color: 'red'}}>* El vehículo no se encuentra en ruta</Typography>}
            <Button sx={{marginTop: 2}} variant="contained" color="secondary" type="submit" onClick={(e) => handleVehicleFailure(e, vehicle.code!)}>Guardar</Button>
          </Box>
        }
        {typePanel == PanelType.simulationDetails && apiMoment !== undefined &&
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Detalles de la simulación:</Typography>
            {timer >= 0 && <SimulatedTimer min={timer} initialDate={initialDate} />}
            <Typography sx={{marginTop: 2, marginBottom: 2}}><b>Pedidos entregados: </b>{apiMoment.ordersDelivered}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Pedidos restantes: </b>{apiMoment.ordersLeft}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Capacidad de la flota: </b>{apiMoment.fleetCapacity.toFixed(2)}%</Typography>
          </Box>
        }
      </Box>
      {openPanel && <Box sx={panelStyles.overlay} onClick={ () => { setOpenPanel(false); setTypePanel(null); setVehicle(undefined); }}/>}
      <ToastContainer />
    </>
  )
}