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
import moment from 'moment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Space } from 'react-zoomable-ui';

interface ISimulation {
  isCollapse: boolean;
  targetTimer: number; // In days
}

const INITIAL_TIMER = 0;
const RATIO = 1;

const options = [
  { value: "1", label: 'TI1' },
  { value: "2", label: 'TI2' },
  { value: "3", label: 'TI3' }
]
const vehicleOptions = [
  { value: VehicleType.auto, label: 'Aut' },
  { value: VehicleType.moto, label: 'Mot' }
]

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const barOptionsPacks = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Pedidos entregados por hora' }}};
const barOptionsCapacity = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Capacidad de la flota por hora' }}};

export const Simulation = (props: ISimulation) => {
  
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [apiMoments, setApiMoments] = useState<TMoment[]>([]);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  const [timer, setTimer] = useState(-1);
  const [realTimer, setRealTimer] = useState(0);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [fFiles, setFFiles] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<TVehicle|undefined>(undefined);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1 min/seg
  const [auxCount, setAuxCount] = useState<number>(0);
  const [stopped, setStopped] = useState<boolean>(false);
  const [initialDate, setInitialDate] = useState<string>('2023-10-01');
  const [selected, setSelected] = useState<string>("1");
  const [stopType, setStopType] = useState<number>(-2);
  const [stopMessage, setStopMessage] = useState<string>("");
  const [stopMaxCapacity, setStopMaxCapacity] = useState<number>(0);
  const [stopTotalPacks, setStopTotalPacks] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [lastTimer, setLastTimer] = useState<number>(0);
  const [vehicleCodeError, setVehicleCodeError] = useState<boolean>(false);
  const [callFinalMoment, setCallFinalMoment] = useState<boolean>(false);
  const [faultVehicles, setFaultVehicles] = useState<TVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [labels, setLabels] = useState<string[]>([]);
  const [dataPacks, setDataPacks] = useState<number[]>([]);
  const [dataCapacity, setDataCapacity] = useState<number[]>([]);
  const [alter, setAlter] = useState<number>(0);
  const [initTime, setInitTime] = useState<any>();
  const [finishTime, setFinishTime] = useState<any>();
  const [extra, setExtra] = useState<number>(0);
  const [prevSpeed, setPrevSpeed] = useState<number>(1);

  const interval = useRef<any>(null);
  const realInterval = useRef<any>(null);

  useEffect(() => {
    window.addEventListener("beforeunload", function(e){
      stopAlgorithmOnDismount();
   }, false);
    return () => {
      stopAlgorithmOnDismount();
    }
  }, [])

  const stopAlgorithmOnDismount = async() => {
    if (interval.current)
      AlgorithmService.kill().then((response) => {
        console.log('Algorithm stopped successfully');
      }).catch((err) => {
        console.log(err);
      });
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

  const configureLabels = (finalMin: number) => {
    const hours = Math.floor(finalMin / 60);
    const days = Math.floor(hours / 24);

    const dd = initialDate.substr(8, 2);
    const md = initialDate.substr(5, 2);
    const ad = initialDate.substr(0, 4);
    const startTime = '00:00';

    let arr;
    arr = new Array(hours).fill("").map((_, i) => `${moment([ad, Number(md)-1, dd]).add(i/24, 'days').format('DD/MM/YYYY')} ${moment(startTime, 'HH:mm').add(i, 'hours').format('HH:mm')}`);
    setLabels(arr)
  }

  const getMomentFromAlgorithm = async() => {
    if (stopped) {
      stopCollapse();
      return;
    }
    if ((auxCount == 0 && (timer + speed <= props.targetTimer*24*60)) || callFinalMoment) {
      setExtra(timer);
      setPrevSpeed(speed);
      if (prevSpeed == speed && extra == timer-1 && speed != 1 && !callFinalMoment) return;
      await AlgorithmService.getMoment( !callFinalMoment ? timer : 2147483645, !callFinalMoment ? speed*RATIO : 1 ).then((response) => {
        let moments: TMoment[] = response.data;
        let newMoment = moments[0];
        let newFaultVehicles = [...faultVehicles.filter((vehicle) => vehicle.stopTime! >= timer)];
        newMoment.activeVehicles = [...newMoment.activeVehicles.filter((vehicle) => !newFaultVehicles.find((fv) => fv.code == vehicle.code)) ?? [], ...newFaultVehicles];
        setFaultVehicles(newFaultVehicles);

        setApiMoment(parseMoment(newMoment));
        setApiMoments(moments);
        // if (moments.length < speed*RATIO) {
        //   setAlter(moments.length);
        // }
        if (speed != 1 || (speed == 1 && RATIO > 1)) setAuxCount(1);

        if (moments[0].finish && !stopped)  {
          setStopped(true);
          setStopType(moments[0].finish.code);
          setStopMessage(moments[0].finish.message);
          setStopMaxCapacity(moments[0].finish.maxCapacity);
          setStopTotalPacks(moments[0].finish.totalPack);
          setLastTimer(moments[0].finish.minute);
          setDataPacks(moments[0].finish.packsHourly);
          setDataCapacity(moments[0].finish.capacityHourly);
          configureLabels(moments[0].finish.minute);
        }
      }).catch((err) => {
        console.log(err);
      });
    }
    else {
      if (auxCount < apiMoments.length) {
        let newMoment = apiMoments[auxCount];
        let newFaultVehicles = [...faultVehicles.filter((vehicle) => vehicle.stopTime! >= timer)];
        newMoment.activeVehicles = [...newMoment.activeVehicles.filter((vehicle) => !newFaultVehicles.find((fv) => fv.code == vehicle.code)) ?? [], ...newFaultVehicles];
        setFaultVehicles(newFaultVehicles);
        setApiMoment(parseMoment(newMoment));
      }

      if (auxCount < (!alter ? (speed*RATIO - 1) : (alter - 1))) {
        setAuxCount((count) => count + 1);
      }
      else {
        setAuxCount(0);
        // setAlter(0);
      }

      if (auxCount < apiMoments.length && apiMoments[auxCount].finish && !stopped) {
        setStopped(true);
        setStopType(apiMoments[auxCount].finish!.code);
        setStopMessage(apiMoments[auxCount].finish!.message);
        setStopMaxCapacity(apiMoments[auxCount].finish!.maxCapacity);
        setStopTotalPacks(apiMoments[auxCount].finish!.totalPack);
        setLastTimer(apiMoments[auxCount].finish!.minute);
        setDataPacks(apiMoments[auxCount].finish!.packsHourly);
        setDataCapacity(apiMoments[auxCount].finish!.capacityHourly);
        configureLabels(apiMoments[auxCount].finish!.minute);
      }
    }
  }

  const stopSimulation = async() => {
    setLoading(true);
    setCallFinalMoment(true);
    await AlgorithmService.kill().then((response) => {
      console.log('Algorithm stopped successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const stopCollapse = () => {
    const minutes = Math.floor(lastTimer);
    const hours = Math.floor(lastTimer / 60);
    const days = Math.floor(hours / 24);
    setStopped(false);
    clearInterval(interval.current);
    clearInterval(realInterval.current);
    setApiMoment(undefined);
    setApiMoments([]);
    setTimer(-2);
    setSpeed(1);
    setAuxCount(0);
    setShowResults(true);
    setFaultVehicles([]);
    setLoading(false);
    setCallFinalMoment(false);
    setFinishTime(moment());
    if (stopType != -2) {
      switch(stopType) {
        case(-1):
          toast.error(`Hubo un error: ${stopMessage}`);
          break;
        case(0):
          toast.error(`La simulación alcanzó el colapso logístico en: ${('0'+days).slice(-2)} días, ${('0'+hours%24).slice(-2)} horas, ${('0'+(minutes%60).toString()).slice(-2)} minutos`);
          break;
        case(1):
          toast.success(`Simulación culminada exitosamente`);
          break;
        case(2):
          toast.success(`Simulación detenida exitosamente`);
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
    if (timer === INITIAL_TIMER) {
      startAlgorithm();
      setLoading(true);
      setStopType(-2);
      setTimeout(() => {
        setLoading(false);
        setSpeed(8);
        setRealTimer(0);
        setInitTime(moment());
        realInterval.current = setInterval(() => {
          setRealTimer((count) => count + 1);
        }, 1000);
      }, 5000);
    }
    if (timer > INITIAL_TIMER && timer < props.targetTimer*24*60) {
      getMomentFromAlgorithm();
    }
  }, [timer]);

  useEffect(() => {
    if(speed == 1 && timer < 0) return;
    if (interval.current) 
      clearInterval(interval.current);
    setAuxCount(0);
    interval.current = setInterval(() => {
      setTimer((count) => count + 1);
    }, 1000/speed);
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

  const handleVehicleFailure = (e: any, code: String) => {
    e.preventDefault()
    let aux = apiMoment!.activeVehicles.find(v => v.code == code)!;
    let failure = +selected;
    let stop = failure == 1 || failure == 2 ? timer + 120 : timer + 240;
    if(!aux.code) {
      setVehicleCodeError(true);
    } else {
      let failVehicle: TVehicle = { ...aux, movement: { from: { ...aux.movement!.to! }, to: { ...aux.movement!.to! }}, stopTime: stop, failureType: failure, route: null };
      let newApiMoments = apiMoments.map((moment: TMoment) => {
        let newMoment = moment; 
        newMoment?.activeVehicles.filter(v => v.code == code);
        return newMoment;
      });
      setFaultVehicles([...faultVehicles, failVehicle]);
      setVehicleCodeError(false);
      setApiMoments(newApiMoments);
      setOpenPanel(false); 
      setTypePanel(null); 
      setVehicle(undefined);
      let x = failVehicle.movement!.from!.x.toString();
      let y = failVehicle.movement!.from!.y.toString();
      registerFault(code, selected, x, y);
    }
  }

  const registerFault = async(code: String, fault: string, x: string, y: string) => {
    await AlgorithmService.manualKill(code, fault, x, y).then(() => {
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

    const duration = moment.duration(finishTime.diff(initTime));

    const realHours = duration.hours();
    const realMinutes = duration.minutes();
    const realSeconds = duration.seconds();

    return (
      <>
       {
        <>
          {stopType == -1 &&
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Hubo un error en la simulación. Inténtelo de nuevo</Typography>
          }
          <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Resumen de la simulación:</Typography>
          <Typography sx={{marginBottom: 2}}><b>Tiempo real transcurrido: </b>{`${('0'+realHours).slice(-2)} horas, ${('0'+realMinutes).slice(-2)} minutos, ${('0'+realSeconds).slice(-2)} segundos`}</Typography>
          <Typography sx={{marginBottom: 2}}><b>Tiempo total transcurrido: </b>{`${('0'+days).slice(-2)} días, ${('0'+hours%24).slice(-2)} horas, ${('0'+(minutes%60).toString()).slice(-2)} minutos`}</Typography>
          <Typography sx={{marginBottom: 2}}><b>Máxima capacidad de flota alcanzada: </b>{stopMaxCapacity.toFixed(2)}%</Typography>
          <Typography sx={{marginBottom: 2}}><b>Total de pedidos entregados: </b>{stopTotalPacks}</Typography>
          <Box style={{ width: '100%', overflowX: 'auto' }}>
            <Bar options={barOptionsPacks} data={{
              labels,
              datasets: [
                {
                  label: '',
                  data: dataPacks,
                  minBarLength: 20,
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
              ]
            }} />
          </Box>
          <Box style={{ width: '1000px', overflowX: 'auto' }}>
            <Bar options={barOptionsCapacity} data={{
              labels,
              datasets: [
                {
                  label: '1000px',
                  data: dataCapacity,
                  minBarLength: 20,
                  backgroundColor: 'rgba(53, 162, 235, 0.5)',
                }
              ]
            }} />
          </Box>
        </>
       }
      </>
    )
  }

  return (
    <>
      <Box>
        <Box sx={{ width:'100%' }}>
          <Box
            sx={{
              padding: 5,
              paddingTop: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ width: '80%' }}>
                {!showResults && !loading &&
                  <AnimationGrid 
                    moment={ (timer >= 0 && apiMoment !== undefined) ? apiMoment : undefined}
                    openVehiclePopup={ openVehiclePopup }
                    speed={ speed }
                  />}
                {showResults && !loading &&
                  <Box sx={{ height: '100%' }}>
                    { renderSimulationResume() }
                  </Box>}
                {loading &&
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '20px' }}>
                    <CircularProgress />
                  </Box>}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '20%', marginLeft: '50px', gap: 1 }}>
                <Box>
                  <Button
                    variant='contained'
                    color='secondary'
                    disabled={timer >= 0}
                    onClick={() => { if(initialDate) { setTimer(INITIAL_TIMER); setShowResults(false); } else { toast.error(`Debe ingresar una fecha de inicio de simulación`); } }}
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
                    disabled={timer <= -1 || loading}
                    sx={{ width: '220px' }}
                  >
                    Detener simulación
                  </Button>
                </Box>
                {/* {(timer >= 0) &&
                  <>
                    <Box>
                      <Button
                        variant='outlined'
                        color='secondary'
                        onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationDetails) }}
                        sx={{ width: '220px' }}
                        disabled={loading}
                      >
                        Ver detalles
                      </Button>
                    </Box>
                  </>
                } */}
                <Box>
                  {(timer <= -1) &&
                    <Box sx={{ marginTop: 5 }}>
                        <TextField required label='Fecha de inicio' type='date' value={initialDate} onChange={(e) => setInitialDate(e.target?.value)} sx={{ width: '220px' }} />
                    </Box>
                  }
                  {timer >= 0 && !loading && apiMoment &&
                    <>
                      <Box sx={{ display: 'flex', gap: 5, marginTop: 2 }}>
                        <Box sx={{ gap: 1, borderRadius: 2, display: 'flex', justifyContent: 'space-between', width: '220px'}}>
                          <Button variant={ speed == 1 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(1); }}>x1</Button>
                          <Button variant={ speed == 2 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(2); }}>x2</Button>
                          <Button variant={ speed == 8 ? 'contained' : 'outlined' } color='secondary' onClick={() => { setSpeed(8); }}>x8</Button>
                        </Box>
                      </Box>
                      <Box sx={{ marginTop: 4 }}>
                        <SimulatedTimer min={timer} initialDate={initialDate} />
                        <Typography sx={{marginTop: 2, marginBottom: 2}}><b>Tiempo real transcurrido: </b>{moment.utc(realTimer*1000).format('HH:mm:ss')}</Typography>
                        <Typography sx={{marginBottom: 2}}><b>Pedidos entregados: </b>{apiMoment.ordersDelivered}</Typography>
                        <Typography sx={{marginBottom: 2}}><b>Pedidos restantes: </b>{apiMoment.ordersLeft}</Typography>
                        <Typography sx={{marginBottom: 2}}><b>Capacidad de la flota: </b>{apiMoment.fleetCapacity.toFixed(2)}%</Typography>
                      </Box>
                    </>
                  }
                  <Box sx={{ marginTop: 10, gap: 1, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
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
            {vehicle.stopTime ?
              <>
                <Typography sx={{marginBottom: 2}}>
                  <b>Tipo de incidente: </b>{vehicle.failureType}
                </Typography>
              </> : null
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