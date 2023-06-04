import React, { useState, useEffect } from "react";
import data from './momentDefault.json';
import returnData from './returnTest.json';
import routesData from './routesTest.json';
import movementData from './movementDefault.json';
import { Link } from 'react-router-dom'
import { AnimationGrid } from '../components/AnimationGrid';
import colorConfigs from '../configs/colorConfigs'
import Select, { GroupBase } from 'react-select'
import { ToastContainer, toast } from 'react-toastify';
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid, TextField } from '@mui/material';
import { TMoment, TMovement, TPack, TSolution, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { PanelType, panelStyles } from "../types/types";
import { DropzoneComponent } from "../components/DropzoneComponent";
import { TBlockage } from "../test/movements";

export const DailyOperationsPage = () => {

  var [vehicles, setVehicles] = useState<TVehicle[]>([]);
  var [todaysBlockages, setTodaysBlockages] = useState<TBlockage[]>([]);
  var [count, setCount] = useState(0);
  var [vehicleCodeError, setVehicleCodeError] = useState<boolean>(false);
  var [vehicleCodeErrorMessage, setVehicleCodeErrorMessage] = useState<String>(" ");
  var [saveNeedsToBeDisabled, setSaveNeedsToBeDisabled] = useState<boolean>(true);
  var [isVehicleEnRoute, setIsVehicleEnRoute] = useState<boolean>(false);
  var [vehicleCodeValue, setVehicleCodeValue] = useState<number>(0);
  const [bFiles, setBFiles] = useState<any[]>([]);
  var [selected, setSelected] = useState<String>("1");
  var [selectedVehicleType, setSelectedVehicleType] = useState<String>("Aut");
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [vehicle, setVehicle] = useState<TVehicle|undefined>({id: 0, code: "",type: VehicleType.auto,speed: 0,cost: 0,
    turn: 0,overtime: 0,state: 0,capacity: 0,carry: 0,moved: false,
    pack: null,location: null,route: null,step: 0,movement: null});
  var [apiMoment, setApiMoment] = useState<TMoment|undefined>({min: 0,ordersDelivered: 0,ordersLeft: 0,
    fleetCapacity: 0,activeVehicles: [],activePacks: [],activeBlockages: [],collapsed: false});
  var time = new Date();
  //new Date().getHours()*60+new Date().getMinutes();
  const seconds = Math.trunc(time.getTime()/1000);

  const initiateAlgorithm = async() => {
    await AlgorithmService.initDaily().then(() => {
      console.log('Algorithm initiated successfully');
    }).catch((err) => {
      console.log(err);
    });

    await AlgorithmService.getBlockages().then((response) => {
      todaysBlockages=response.data
      setTodaysBlockages(todaysBlockages);
      console.log('Blockages retrieved successfully');
    }).catch((err) => {
      console.log(err);
    });
    /*
    await AlgorithmService.planRoutes(seconds.toString()).then((response) => {
      vehicles=parseVehicles(response.data);
      console.log(vehicles);
      console.log('Routes planned successfully');
    }).catch((err) => {
      console.log(err);
    });*/
  }

  const parseVehicles = (vehicles: TVehicle[]) => {
    return vehicles;
  }

  const planTheRoutes = async() => {
    let blockagesToAdd : TBlockage[]=[];
    let fullTime = new Date();
    let currentTime = Math.trunc(fullTime.getTime()/1000)-fullTime.getSeconds();
    todaysBlockages.forEach(b => {
      if(b.start==currentTime){
        blockagesToAdd.push(b);
        AlgorithmService.setBlockages(currentTime.toString()).then((response) => {
          let vehiclesToBeFixed : TVehicle[]=response.data;
          vehiclesToBeFixed.forEach(v => {
            apiMoment!.activeVehicles.find(av=>av.id==v.id)!.route!.chroms=v.route!.chroms;
          });
          console.log('Blockages set successfully');
        }).catch((err) => {
          console.log(err);
        });
      }
      if(b.end==currentTime){
        let index = apiMoment!.activeBlockages.indexOf(b);
        if(index!=-1){
          apiMoment!.activeBlockages.splice(index,1);
          AlgorithmService.setBlockages(currentTime.toString()).then(() => {
            console.log('Blockages removed successfully');
          }).catch((err) => {
            console.log(err);
          });
        }
      }
    });
    apiMoment!.activeBlockages=apiMoment!.activeBlockages.concat(blockagesToAdd);

    await AlgorithmService.planRoutes(currentTime.toString()).then((response) => {
      console.log(currentTime);
      vehicles=parseVehicles(response.data);
      console.log(vehicles);
      vehicles!.forEach( (v)=>{
        //v.movement!.from=v.route!.chroms[0].from;
        //v.movement!.to=v.route!.chroms[0].from;
        v!.movement!.from!.x=45;
        v!.movement!.from!.y=30;
        v!.movement!.to!.x=45;
        v!.movement!.to!.y=30;
      })
      apiMoment!.activeVehicles=apiMoment!.activeVehicles.concat(vehicles);
      let packs : TPack[]=[];
      vehicles.forEach(v => {
        packs.push(v.pack!);
      });
      apiMoment!.activePacks=apiMoment!.activePacks.concat(packs);
      setApiMoment(apiMoment);
      vehicles=[];
      console.log('Routes planned successfully');
    }).catch((err) => {
      console.log(err);
    });
    let newVehicles = apiMoment!.activeVehicles!.map((v,index) => {
        if(v.route!.chroms.length!=0){
          v.movement!.from!.x=v.movement!.to!.x;
          v.movement!.from!.y=v.movement!.to!.y;
          if(v.movement!.from!.x < v.route!.chroms[0].to.x){
            v.movement!.to!.x=v.movement!.from!.x+v.speed/60;
          }else if(v.movement!.from!.x > v.route!.chroms[0].to.x){
            v.movement!.to!.x=v.movement!.from!.x-v.speed/60;
          }else if(v.movement!.from!.y < v.route!.chroms[0].to.y){
            v.movement!.to!.y=v.movement!.from!.y+v.speed/60;
          }else if(v.movement!.from!.y > v.route!.chroms[0].to.y){
            v.movement!.to!.y=v.movement!.from!.y-v.speed/60;
          }
          if(v.movement!.to!.x == v.route!.chroms[0].to.x && v.movement!.to!.y == v.route!.chroms[0].to.y){
            v.route!.chroms.shift();
          }
        }else{
          if(v.location!.destination==true){
            return null;
          }else{
            //notify package has been delivered
            apiMoment?.activePacks.splice(apiMoment!.activePacks.indexOf(v.pack!),1);
            AlgorithmService.completePack(v.id,seconds.toString()).then((response) => {
              v.route!.chroms = parseVehicle(response.data)!.route!.chroms;
              v.location!.destination=true;
              v.movement!.from=v.route!.chroms[0].from;
              v.movement!.to=v.route!.chroms[0].to;
              v.route!.chroms.shift();
              console.log('Package completed successfully');
            }).catch((err) => {
              console.log(err);
            });
          }
        }
        return v;
      });
      newVehicles = newVehicles!.filter((value)=>value!=null);
      apiMoment!.activeVehicles=newVehicles;
      setApiMoment(apiMoment);
  }

  var started = false;
  useEffect(() => {
    if(count==0 && !started){
      started = true;
      apiMoment=data.moment;
      initiateAlgorithm();
    }
  }, []);

  const openVehiclePopup = (vehicle: TVehicle) => {
    setOpenPanel(true);
    setTypePanel(PanelType.vehicleInfo);
    setVehicle(vehicle);
  }

  const parseVehicle = (vehicle: TVehicle) => {
    return vehicle;
  }
  
  //should activate every time there's a new pack
  useEffect(() => {
    setInterval(() => {
      count=count+60;
      setCount(count);
      time = new Date();
      planTheRoutes();
    }, 3000);
  }, []);  

  const registerFault = async(vehicle: String, fault: String, time: String) => {
    console.log(vehicle,fault,time);
    await AlgorithmService.setFault(vehicle,fault,time).then(() => {
      console.log('Fault registered successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    let damagedVehicleIndex:number=-1;
    damagedVehicleIndex = apiMoment!.activeVehicles.findIndex(v => v.code==selectedVehicleType+vehicleCodeValue.toString().padStart(3,"0"));
    if(damagedVehicleIndex==-1){
      vehicleCodeError = true;
      saveNeedsToBeDisabled = true;
      vehicleCodeErrorMessage = "El vehículo no se encuentra en ruta";
      setVehicleCodeError(vehicleCodeError);
      setSaveNeedsToBeDisabled(saveNeedsToBeDisabled);
      setVehicleCodeErrorMessage(vehicleCodeErrorMessage);
    }else{
      apiMoment?.activeVehicles.splice(damagedVehicleIndex,1);
      setApiMoment(apiMoment);
      //call falla vehicular service
      registerFault(selectedVehicleType+vehicleCodeValue.toString().padStart(3,"0"),selected,seconds.toString());
    }
  }
  const handleSubmitFromVehicle = (e: any) => {
    e.preventDefault()
    let damagedVehicleIndex:number=-1;
    damagedVehicleIndex = apiMoment!.activeVehicles.findIndex(v => v==vehicle);
    if(damagedVehicleIndex==-1){
      vehicleCodeError = true;
      saveNeedsToBeDisabled = true;
      vehicleCodeErrorMessage = "El vehículo no se encuentra en ruta";
      setVehicleCodeError(vehicleCodeError);
      setSaveNeedsToBeDisabled(saveNeedsToBeDisabled);
      setVehicleCodeErrorMessage(vehicleCodeErrorMessage);
    }else{
      apiMoment?.activeVehicles.splice(damagedVehicleIndex,1);
      setApiMoment(apiMoment);
      //call falla vehicular service
      registerFault(vehicle?.code,selected,seconds.toString());
    }
  }
  const onFileChange = (updatedList: any[], type: string) => {
    setBFiles(updatedList);
  }

  const handleVehicleCodeChange = (formVehicleCode: number) => {
    vehicleCodeValue=formVehicleCode;
    setVehicleCodeValue(vehicleCodeValue);
    if(vehicleCodeValue<=0){
      vehicleCodeError = true;
      saveNeedsToBeDisabled = true;
      vehicleCodeErrorMessage = "El código debe ser mayor que 0";
    }else{
      if(apiMoment?.activeVehicles.find(v => v.code==selectedVehicleType+formVehicleCode.toString().padStart(3,"0"))==undefined){
        vehicleCodeError = true;
        saveNeedsToBeDisabled = true;
        vehicleCodeErrorMessage = "El vehículo no se encuentra en ruta";
      }else{
        vehicleCodeError = false;
        saveNeedsToBeDisabled = false;
        vehicleCodeErrorMessage = " ";
      }
    }
    setVehicleCodeError(vehicleCodeError);
    setSaveNeedsToBeDisabled(saveNeedsToBeDisabled);
    setVehicleCodeErrorMessage(vehicleCodeErrorMessage);
  }

  const options = [
    { value: "1", label: 'TI1' },
    { value: "2", label: 'TI2' },
    { value: "3", label: 'TI3' }
  ]
  const vehicleOptions = [
    { value: VehicleType.auto, label: 'Aut' },
    { value: VehicleType.moto, label: 'Mot' }
  ]

  const handleIncidentTypeChange = (selectedOption: String) => {
    selected=selectedOption;
    setSelected(selected);
    console.log(`Option selected:`, selected);
  };

  const handleVehicleTypeChange = (selectedOption: String) => {
    selectedVehicleType=selectedOption;
    setSelectedVehicleType(selectedVehicleType);
    console.log(`Type Option selected:`, selectedVehicleType);
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

      <Box>
        <Box sx={{ display: 'flex' }}>
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
              <Box>
                <AnimationGrid 
                  moment = {apiMoment}
                  openVehiclePopup={openVehiclePopup}
                  speed = {1/3}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '50px', gap: 1 }}>
                <Box>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationFiles) }}
                    sx={{}}
                  >
                    Registrar incidencias
                  </Button>
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
                      onChange={(e: any) => {handleVehicleTypeChange(e.label)}}
                      //onChange={handleChange}
                    />
                  </Box>
                  <TextField 
                    label="Código del vehículo"
                    onChange={(e: any) => {handleVehicleCodeChange(e.target?.value)}}
                    required
                    variant="outlined"
                    color="secondary"
                    type="number"
                    //value={vehicleCodeValue}
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
                    onChange={(e: any) => {handleIncidentTypeChange(e.value)}}
                  />
                </Box>
                <Button disabled={saveNeedsToBeDisabled} variant="contained" color="secondary" type="submit">Guardar</Button>
              </form>
            </Box>
            <Box sx={{height:100}}/>
            <Box > 
              <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Registrar bloqueos:</Typography>
              <Box>
                <DropzoneComponent onFileChange={onFileChange} type={'Blockage'} files={bFiles} />
              </Box>
            </Box>
          </Box> : null
        }
        {typePanel == PanelType.vehicleInfo && vehicle !== undefined &&
          <Box sx={{height: 600, paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Detalles del vehiculo:</Typography>
            <Typography sx={{marginBottom: 2}}><b>Código: </b>{vehicle.code}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Carga actual: </b>{vehicle.carry}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Capacidad total: </b>{vehicle.capacity}</Typography>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Registrar falla vehicular:</Typography>
              <form autoComplete="off" onSubmit={handleSubmitFromVehicle}> 
                <Box
                  display="flex"
                  flexDirection="row"
                  sx={{}}
                >
                  <Box
                    sx={{width:130}}
                  >
                    <Select 
                      isDisabled={true}
                      defaultValue={vehicle.type==VehicleType.auto?vehicleOptions[0]:vehicleOptions[1]}
                      isSearchable = {false}
                      name = "vehicle options"
                      options={vehicleOptions} 
                      //onChange={handleChange}
                    />
                  </Box>
                  <TextField 
                    disabled={true}
                    //label="Código del vehículo"
                    //onChange={(e: any) => setData({ ...data, term: e.target?.value })}
                    required
                    variant="outlined"
                    color="secondary"
                    type="number"
                    value={parseInt(vehicle.code!.slice(3))}
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
                    onChange={(e: any) => {handleIncidentTypeChange(e.value)}}
                  />
                </Box>
                <Button variant="contained" color="secondary" type="submit">Guardar</Button>
              </form>
          </Box>
        }
      </Box>
      {openPanel && <Box sx={panelStyles.overlay} onClick={ () => { setOpenPanel(false); setTypePanel(null); 
        setVehicle(undefined); vehicleCodeError=false; setVehicleCodeError(vehicleCodeError); 
        vehicleCodeErrorMessage=""; setVehicleCodeErrorMessage(vehicleCodeErrorMessage); 
        saveNeedsToBeDisabled=true; setSaveNeedsToBeDisabled(saveNeedsToBeDisabled)}}/>}
      <ToastContainer />
    </>
  )
}/*
<h1>{JSON.stringify(apiMoment)}</h1>
<h1>The component has been rendered for {count} minutes. {seconds} seconds since beggining of day</h1>*/