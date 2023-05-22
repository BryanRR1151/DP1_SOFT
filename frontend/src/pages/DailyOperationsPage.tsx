import React, { useState, useEffect } from "react";
import data from './momentDefault.json';
import returnData from './returnTest.json';
import routesData from './routesTest.json';
import movementData from './movementDefault.json';
import { Link } from 'react-router-dom'
import { AnimationGrid } from '../components/AnimationGrid';
import colorConfigs from '../configs/colorConfigs'
import Select from 'react-select'
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid, TextField } from '@mui/material';
import { TMoment, TMovement, TSolution, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { PanelType, panelStyles } from "../types/types";

export const DailyOperationsPage = () => {

  const [vehicles, setVehicles] = useState<TVehicle[]|undefined>(undefined);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [route, setRoute] = useState<TSolution|undefined>({chroms:[]});
  const [movement, setMovement] = useState<TMovement|null>({from:null,to:null});
  const [vehicle, setVehicle] = useState<TVehicle|undefined>({id: 0,type: VehicleType.auto,speed: 0,cost: 0,
    turn: 0,overtime: 0,state: 0,capacity: 0,carry: 0,moved: false,
    pack: null,location: null,route: null,step: 0,movement: null});
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>({min: 0,ordersDelivered: 0,ordersLeft: 0,
    fleetCapacity: 0,activeVehicles: [],activePacks: [],activeBlockages: []});
  var time = new Date();
  const seconds = time.getHours()*60*60+time.getMinutes()*60+time.getSeconds();
  
  const parseRoutes = (vehicles: TVehicle[]) => {
    let newVehicles = vehicles.map((v, index) => {
      if (v.type == VehicleType.auto) {
        v.id
      }
      return v;
    });
    return newVehicles;
  }

  const parseApiMoment = (vehicles: TVehicle[]) => {
    let moment: TMoment;

    //moment = TMoment();
    //moment.activeVehicles = vehicles.map(vehicle => {
      //return vehicle;
    //});
    //return moment;
  }

  const openVehiclePopup = (vehicle: TVehicle) => {
    setOpenPanel(true);
    setTypePanel(PanelType.vehicleInfo);
    setVehicle(vehicle);
    console.log(vehicle);
  }

  const planTheRoutes = async() => {
    await AlgorithmService.planRoutes(seconds).then((response) => {
      //setVehicles(parseRoutes(response.data));
      //setApiMoment(parseApiMoment(response.data));
    }).catch((err) => {
      console.log(err);
    });
  }

  const parseMoment = (moment: TMoment) => {
    return moment;
  }

  const parseVehicle = (vehicle: TVehicle) => {
    return vehicle;
  }

  const initiateAlgorithm = async() => {
    await AlgorithmService.initDaily().then((response) => {
      console.log('Algorithm initiated successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const completePackage = async(vehicle: TVehicle) => {
    /*await AlgorithmService.completePack(idVehicle).then((response) => {
      console.log('Package completed successfully');
      return response;
    }).catch((err) => {
      console.log(err);
      return null;
    });*/
    //vehicle = returnData.vehicle;
    //setV(parseVehicle(returnData.vehicle));
    return returnData;
  }
  var once = false;
  //should activate every time there's a new pack
  useEffect(() => {
    setInterval(() => {
      setCount(prevCount => prevCount + 1);
      time = new Date();
      if(!once){
        routesData.forEach( (v)=>{
          v.movement.from.x=45;
          v.movement.from.y=30;
          v.movement.to.x=45;
          v.movement.to.y=30;
        })
        setApiMoment({min: apiMoment!.min,ordersDelivered: apiMoment!.ordersDelivered,
          ordersLeft: apiMoment!.ordersLeft,fleetCapacity: apiMoment!.fleetCapacity,
          activeVehicles: apiMoment!.activeVehicles.concat(routesData),
          activePacks: apiMoment!.activePacks,activeBlockages: apiMoment!.activeBlockages});
          
        once=true;
      }
      //planTheRoutes;
    }, 1000);
  }, []);
  
  //updates the vehicles position displayed and reduces routes
  useEffect(() => {
    setInterval(() => {
      let newVehicles = routesData.map((v,index) => {
        if(v.route!.chroms.length!=0){
          v.movement.from=v.route!.chroms[0].from;
          v.movement.to=v.route!.chroms[0].to;
          v.route!.chroms.shift();
        }else{
          if(v.location!.destination==true){
            return null;
          }else{
            //notify package has been delivered
            v.route!.chroms = returnData.vehicle.route?.chroms;
            v.location!.destination=true;
          }
        }
        return v;
      });
      newVehicles = newVehicles.filter((value)=>value!=null);
      setApiMoment({min: apiMoment!.min,ordersDelivered: apiMoment!.ordersDelivered,
        ordersLeft: apiMoment!.ordersLeft,fleetCapacity: apiMoment!.fleetCapacity,
        activeVehicles: newVehicles,
        activePacks: apiMoment!.activePacks,activeBlockages: apiMoment!.activeBlockages});
      //every minute
    }, 1000);
  }, []);
  var started = false;
  useEffect(() => {
    if(count==0 && !started){
      started = true;
      setApiMoment(parseMoment(data.moment));/*
      data.moment.activeVehicles.forEach( (v)=>{
        v.movement.from=v.route.chroms[0].from;
        v.movement.to=v.route.chroms[0].to;
        v.route.chroms.shift();
      })*/
      //initiateAlgorithm;
    }
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault()/*
    let newError: TOrderError = { quantity: false, term: false, x: false, y: false };
    
    if (!data.quantity || data.quantity <= 0) {
      newError.quantity = true;
    }
    if (!data.term || data.quantity <= 0) {
      newError.term = true;
    }
    if (!data.orderNode.x || (data.orderNode.x < 0 || data.orderNode.x > 70)) {
      newError.x = true;
    }
    if (!data.orderNode.y || (data.orderNode.y < 0 || data.orderNode.y > 50)) {
      newError.y = true;
    }

    if (Object.values(newError).find((e) => e == true)) {
      setError(newError);
      return;
    }

    handlePanel(false);
    handleDeselect();*/
}

  const options = [
    { value: 'TI1', label: 'TI1' },
    { value: 'TI2', label: 'TI2' },
    { value: 'TI3', label: 'TI3' }
  ]
  const handleChange = (selectedOption) => {
    setSelected(selectedOption);
    console.log(`Option selected:`, selectedOption);
  };

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
          <Typography>Visualización</Typography>
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
                  variant='outlined'
                  color='secondary'
                  onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationFiles) }}
                  sx={{ marginLeft: 2 }}
                >
                  Registrar incidencias
                </Button>
              </Box>
            </Box>
            <AnimationGrid 
              moment = {apiMoment}
              openVehiclePopup={openVehiclePopup}
            />
          </Box>
        </Box>
      </Container>
      <form autoComplete="off" onSubmit={handleSubmit}>  
        <Box
          sx={{ ...panelStyles.panel, ...(openPanel && panelStyles.panelOpen) }}
          display="flex"
          flexDirection="column"
        >
          {typePanel == PanelType.simulationFiles ?
            <Box sx={{height:500,paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
              <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Registrar falla vehicular:</Typography>
                
              <TextField 
                label="Código del vehículo"
                //onChange={(e: any) => setData({ ...data, term: e.target?.value })}
                required
                variant="outlined"
                color="secondary"
                type="string"
                //value={data.term}
                //error={error.term}
                fullWidth
                sx={{mb: 3}}
              />
              <Box sx={{width:343, height:65}}>
                <Select 
                  defaultValue={options[0]}
                  isSearchable = {true}
                  name = "incident type"
                  options={options} 
                  onChange={handleChange}
                />
              </Box>
              <Button variant="contained" color="secondary" type="submit">Guardar</Button>
            </Box> : null
          }
        </Box>
      </form>
      {openPanel && <Box sx={panelStyles.overlay} onClick={ () => { setOpenPanel(false); setTypePanel(null); setVehicle(undefined); }}/>}
      <h1>{JSON.stringify(apiMoment)}</h1>
      <h1>The component has been rendered for {count} minutes. {seconds} seconds since beggining of day</h1>
    </>
  )
}