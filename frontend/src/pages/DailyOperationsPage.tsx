import React, { useState, useEffect } from "react";
import data from './momentDefault.json';
import returnData from './returnTest.json';
import routesData from './routesTest.json';
import movementData from './movementDefault.json';
import { Link } from 'react-router-dom'
import { AnimationGrid } from '../components/AnimationGrid';
import colorConfigs from '../configs/colorConfigs'
import BlockageService from '../services/BlockageService';
import Select, { GroupBase } from 'react-select'
import { ToastContainer, toast } from 'react-toastify';
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid, TextField } from '@mui/material';
import { TMoment, TMovement, TPack, TSolution, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { PanelType, panelStyles } from "../types/types";
import { DropzoneComponent } from "../components/DropzoneComponent";
import Dropzone from 'react-dropzone'
import { TBlockage } from "../test/movements";
import { TBlockage as registerBlockageType }  from '../types/types';

export const DailyOperationsPage = () => {

  var [fileBlockages, setFileBlockages] = useState<registerBlockageType[][]>([]);
  var [filePackages, setFilePackages] = useState<TPack[]>([]);
  var [temporaryFilePackages, setTemporaryFilePackages] = useState<TPack[]>([]);
  var [mouseOver, setMouseOver] = useState<boolean>(false);
  var [vehicles, setVehicles] = useState<TVehicle[]>([]);
  var [todaysBlockages, setTodaysBlockages] = useState<TBlockage[]>([]);
  var [count, setCount] = useState(0);
  var [vehicleCodeError, setVehicleCodeError] = useState<boolean>(false);
  var [vehicleCodeErrorMessage, setVehicleCodeErrorMessage] = useState<String>(" ");
  var [saveNeedsToBeDisabled, setSaveNeedsToBeDisabled] = useState<boolean>(true);
  var [isVehicleEnRoute, setIsVehicleEnRoute] = useState<boolean>(false);
  var [vehicleCodeValue, setVehicleCodeValue] = useState<number>(0);
  var [bFiles, setBFiles] = useState<any[]>([]);
  var [selected, setSelected] = useState<String>("1");
  var [selectedVehicleType, setSelectedVehicleType] = useState<String>("Aut");
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const [typePanel, setTypePanel] = useState<PanelType|null>(null);
  const [vehicle, setVehicle] = useState<TVehicle|undefined>({id: 0, code: "",type: VehicleType.auto,speed: 0,cost: 0,
    turn: 0,overtime: 0,state: 0,capacity: 0,carry: 0,moved: false,
    pack: null,location: null,route: null,step: 0,movement: null});
  var [apiMoment, setApiMoment] = useState<TMoment|undefined>({min: 0,ordersDelivered: 0,ordersLeft: 0,
    fleetCapacity: 0,activeVehicles: [],activePacks: [],activeBlockages: [],collapse: false});
  var time = new Date();
  //new Date().getHours()*60+new Date().getMinutes();
  const seconds = Math.trunc(time.getTime()/1000);

  const initiateAlgorithm = async() => {
    await AlgorithmService.initDaily().then(() => {
      console.log('Algorithm initiated successfully');
    }).catch((err) => {
      console.log(err);
    });

    await BlockageService.getBlockages().then((response) => {
      console.log(response);
      todaysBlockages=response.data
      setTodaysBlockages(todaysBlockages);
      console.log('Blockages retrieved successfully');
      console.log(todaysBlockages);
    }).catch((err) => {
      console.log(err);
    });
    let blockagesToAdd : TBlockage[]=[];
    let fullTime = new Date();
    let currentTime = Math.trunc(fullTime.getTime()/1000)-fullTime.getSeconds();
    todaysBlockages.forEach(b => {
      if(b.start<=currentTime && b.end>=currentTime){
        blockagesToAdd.push(b);
        AlgorithmService.setBlockages(currentTime.toString()).then((response) => {
          console.log('Blockages set successfully');
        }).catch((err) => {
          console.log(err);
        });
      }
    });
    apiMoment!.activeBlockages=apiMoment!.activeBlockages.concat(blockagesToAdd);
    setApiMoment(apiMoment);
    /*
    await AlgorithmService.planRoutes(currentTime.toString()).then((response) => {
      vehicles=parseVehicles(response.data);
      vehicles!.forEach( (v)=>{
        v!.movement!.from!.x=45;
        v!.movement!.from!.y=30;
        v!.movement!.to!.x=45;
        v!.movement!.to!.y=30;
        v.broken=false;
      })
      apiMoment!.activeVehicles=apiMoment!.activeVehicles.concat(vehicles);
      let packs : TPack[]=[];
      vehicles.forEach(v => {
        packs.push(v.pack!);
      });
      apiMoment!.activePacks=apiMoment!.activePacks.concat(packs);
      vehicles=[];
      apiMoment?.activeVehicles.forEach(v => {
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
      })
      setApiMoment(apiMoment);
      console.log('Routes planned successfully');
    }).catch((err) => {
      console.log(err);
    });*/
  }

  const parseVehicles = (vehicles: TVehicle[]) => {
    return vehicles;
  }

  const planTheRoutes = async() => {
    await BlockageService.getBlockages().then((response) => {
      todaysBlockages=response.data
      setTodaysBlockages(todaysBlockages);
      console.log('Blockages retrieved successfully');
    }).catch((err) => {
      console.log(err);
    });
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
      vehicles=parseVehicles(response.data);
      vehicles!.forEach( (v)=>{
        //v.movement!.from=v.route!.chroms[0].from;
        //v.movement!.to=v.route!.chroms[0].from;
        v!.movement!.from!.x=45;
        v!.movement!.from!.y=30;
        v!.movement!.to!.x=45;
        v!.movement!.to!.y=30;
        v.broken=false;
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
    let temporaryVehicles:TVehicle[]=[];
    let newVehicles = apiMoment!.activeVehicles!.map((v,index) => {
      console.log(v);
      let shouldBeAddedToVehicles:boolean=true;
      if(v.route!.chroms.length!=0){
        if(v.broken==false || v.movement!.to!.x != v.route!.chroms[0].from.x || v.movement!.to!.y != v.route!.chroms[0].from.y){
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
          v.movement!.from!.x=v.movement!.to!.x;
          v.movement!.from!.y=v.movement!.to!.y;
          v.resumeAt==Math.trunc(new Date().getTime()/1000)+(selected=="3"?14400:7200);
          v.route!.chroms=[];
          apiMoment?.activePacks.splice(apiMoment.activePacks.findIndex(ap=>ap.id==v.pack?.id),1);
        }
      }else{
        if(!v.broken){
          if(v.location!.destination==true){
            shouldBeAddedToVehicles=false;
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
        }else if(v.resumeAt==Math.trunc(new Date().getTime()/1000)){
          shouldBeAddedToVehicles=false;
          return null;
        }
      }
      if(shouldBeAddedToVehicles){
        temporaryVehicles.push(v);
      }
      return v;
    });
    newVehicles = newVehicles!.filter((value)=>value!=null);
    apiMoment!.activeVehicles=temporaryVehicles;
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
    const intervalId = setInterval(() => {
      count=count+60;
      setCount(count);
      time = new Date();
      planTheRoutes();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
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
      apiMoment!.activeVehicles[damagedVehicleIndex].broken=true;
      //apiMoment?.activeVehicles.splice(damagedVehicleIndex,1);
      //setApiMoment(apiMoment);
      //call falla vehicular service
      setOpenPanel(false);
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
      apiMoment!.activeVehicles[damagedVehicleIndex].broken=true;
      //apiMoment!.activeVehicles[damagedVehicleIndex].route!.chroms=[];
      //apiMoment?.activeVehicles.splice(damagedVehicleIndex,1);
      //setApiMoment(apiMoment);
      //call falla vehicular service
      setOpenPanel(false);
      registerFault(vehicle!.code!,selected,seconds.toString());
    }
  }
  const onFileChange = (updatedList: any[], type: string) => {
    bFiles = updatedList;
    console.log(bFiles);
    setBFiles(bFiles);
  }

  const handleVehicleCodeChange = (formVehicleCode: number) => {
    vehicleCodeValue=formVehicleCode;
    setVehicleCodeValue(vehicleCodeValue);
    if(vehicleCodeValue<=0){
      vehicleCodeError = true;
      saveNeedsToBeDisabled = true;
      vehicleCodeErrorMessage = "El código debe ser mayor que 0";
    }else{
      let foundVehicle = apiMoment?.activeVehicles.find(v => v.code==selectedVehicleType+formVehicleCode.toString().padStart(3,"0"));
      if(foundVehicle==undefined){
        vehicleCodeError = true;
        saveNeedsToBeDisabled = true;
        vehicleCodeErrorMessage = "El vehículo no se encuentra en ruta";
      }else{
        if(foundVehicle!.broken){
          vehicleCodeError = true;
          saveNeedsToBeDisabled = true;
          vehicleCodeErrorMessage = "El vehículo ya está averiado";
        }else{
          vehicleCodeError = false;
          saveNeedsToBeDisabled = false;
          vehicleCodeErrorMessage = " ";
        }
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
  };

  const handleVehicleTypeChange = (selectedOption: String) => {
    selectedVehicleType=selectedOption;
    setSelectedVehicleType(selectedVehicleType);
  };

  const handleBlockageSubmit = (e:any) => {
    e.preventDefault();
    fileBlockages.forEach(f => {
      f.forEach(b => {
        insertBlockage(b);
      });
    });
    fileBlockages=[];
    setFileBlockages(fileBlockages);
    setOpenPanel(false); 
    setTypePanel(null); 
    setVehicle(undefined); 
    vehicleCodeError=false; 
    setVehicleCodeError(vehicleCodeError); 
    vehicleCodeErrorMessage=""; 
    setVehicleCodeErrorMessage(vehicleCodeErrorMessage); 
    saveNeedsToBeDisabled=true; 
    setSaveNeedsToBeDisabled(saveNeedsToBeDisabled);
    fileBlockages=[]; 
    setFileBlockages(fileBlockages);
  }

  const handlePackageFileSubmit = (e:any) => {
    e.preventDefault();
    filePackages=temporaryFilePackages;
    setFilePackages(filePackages);
  }

  const handleDrop = (acceptedFiles : any) => {
    mouseOver=!mouseOver;
    setMouseOver(mouseOver);
  }

  const insertBlockage = async(blockage: registerBlockageType) => {
    await BlockageService.insertBlockage(blockage).then((response) => {
      toast.success(`Registros creados exitosamente`);
    }).catch((err) => {
      console.log(err);
      toast.error(`Sucedió un error, intente de nuevo`);
    })
  }

  const readFile = (files: File[]) => {
    fileBlockages=[];
    files.forEach(f => {
      var reader = new FileReader();
      reader.onloadend = async (e) => { 
        let blockages : registerBlockageType[]=[];
        var text = e!.target!.result!.toString();
        let lines = text!.split('\n');
        lines.pop();
        lines.forEach(l => {
          let start = new Date(parseInt(f.name.substring(0,4)),
            parseInt(f.name.substring(4,6))-1,parseInt(l.substring(0,2)),
            parseInt(l.substring(3,5)),parseInt(l.substring(6,8))).getTime();
          let end = new Date(parseInt(f.name.substring(0,4)),
            parseInt(f.name.substring(4,6))-1,parseInt(l.substring(9,11)),
            parseInt(l.substring(12,14)),parseInt(l.substring(15,17))).getTime();
          let coordinates = l.substring(18,l.length-1).split(',');
          for(let i=0;i<coordinates.length-2;i+=2){
            let blockage : registerBlockageType = {id:0,node:{x:parseInt(coordinates[i]),y:parseInt(coordinates[i+1])},
              secondNode:{x:parseInt(coordinates[i+2]),y:parseInt(coordinates[i+3])},
              start:Math.trunc(start/1000).toString(),end:Math.trunc(end/1000).toString()};
            blockages.push(blockage);
          }
        });
        fileBlockages.push(blockages);
        setFileBlockages(fileBlockages);
      };
      reader.readAsText(f);
    });
    
  }

  const readPackageFile = (files: File[]) => {
    if(files.length==1){
      var reader = new FileReader();
      reader.onloadend = async (e) => { 
        temporaryFilePackages=[];
        var text = e!.target!.result!.toString();
        let lines = text!.split('\n');
        lines.pop();
        lines.forEach(l => {
          let lineTime = new Date();
          let details = l.substring(6,l.length-1).split(',');
          let pack : TPack = {id:0,idCustomer:parseInt(details[3]),time:0,fullfilled:0,
            originalTime:Math.trunc(new Date(parseInt(files[0].name.substring(6,10)),
              parseInt(files[0].name.substring(10,12)),
              parseInt(files[0].name.substring(12,14)),
              parseInt(l.substring(0,2)),
              parseInt(l.substring(3,5))).getTime()/1000),deadline:parseInt(details[4])*60*60,
            demand:parseInt(details[2]),location:{x:parseInt(details[0]),y:parseInt(details[1])},
            unassigned:parseInt(details[2])};
            temporaryFilePackages.push(pack);
        });
        console.log(temporaryFilePackages);
      };
      reader.readAsText(files[0]);
    }
  }

  function nameValidator(file:File) {
    if (file.name.length != 20) {
      return {
        code: "wrong-size",
        message: `Name is not ${20} characters`
      };
    }
    if (file.name.substring(6,16)!='bloqueadas'){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if (parseInt(file.name.substring(0,4))<2023){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if (parseInt(file.name.substring(4,6))<1 || parseInt(file.name.substring(4,6))>12){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }

    return null
  }

  function nameValidatorForPackages(file:File) {
    if (file.name.length != 18) {
      return {
        code: "wrong-size",
        message: `Name is not ${20} characters`
      };
    }
    if (file.name.substring(0,6)!='pedido'){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if (parseInt(file.name.substring(6,10))<2023){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    let month = parseInt(file.name.substring(10,12));
    if (month<1 || month>12){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    let day = parseInt(file.name.substring(12,14));
    if(day<1 || day>31){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if((month==4 || month==6 || month==9 || month==11)&&day>30){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if((month==2)&&day>28){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if(month != (new Date().getMonth())+1){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }
    if(day != new Date().getDate()){
      return {
        code: "wrong-format",
        message: `Name doesn't follow the format`
      };
    }

    return null
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
                  speed = {1/5}
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
                <Box>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => { setOpenPanel(true); setTypePanel(PanelType.create) }}
                    sx={{width:192}}
                  >
                    Carga de pedidos con archivo
                  </Button>
                </Box>
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
            <Box sx={{height:60}}/>
            <form autoComplete="off" onSubmit={handleBlockageSubmit}> 
              <Box sx={{height:200}}> 
                <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Registrar bloqueos:</Typography>
                <Box>
                <Dropzone 
                  onDrop={acceptedFiles => {readFile(acceptedFiles)}}
                  accept={{'text/plain': ['.txt']}}
                  validator={nameValidator}
                  >
                  {({getRootProps, getInputProps}) => (
                    <section>
                      <div {...getRootProps({
                        style:{flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: fileBlockages.length==0?'22.5px':'35px',
                          borderWidth: 2,
                          borderRadius: 15,
                          borderColor: fileBlockages.length==0?'#7d7d7d':'#03bf00',
                          borderStyle: 'dashed',
                          backgroundColor: '#fafafa',
                          color: fileBlockages.length==0?'#262626':'#03bf00',
                          textAlign:'center',
                          outline: 'none',
                          cursor:'pointer',
                          transition: 'border .24s ease-in-out',
                          height:fileBlockages.length==0?70:45}
                        })}>
                        <input {...getInputProps()} />
                        {fileBlockages.length==0?<p>Arrastra y suelta los archivos o haz click para seleccionar</p>:<p>{fileBlockages.length} archivo(s) ingresados</p>}
                      </div>
                    </section>
                  )}
                </Dropzone>
                </Box>
              </Box>
              <Button disabled={fileBlockages.length==0?true:false} variant="contained" color="secondary" type="submit">Guardar</Button>
            </form>
          </Box> : null
        }
        {typePanel == PanelType.create ?
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <form autoComplete="off" onSubmit={handlePackageFileSubmit}> 
              <Box sx={{height:200}}> 
                <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Registrar pedidos:</Typography>
                <Box>
                <Dropzone 
                  onDrop={acceptedFiles => {readPackageFile(acceptedFiles)}}
                  maxFiles={1}
                  accept={{'text/plain': ['.txt']}}
                  validator={nameValidatorForPackages}
                  >
                  {({getRootProps, getInputProps}) => (
                    <section>
                      <div {...getRootProps({
                        style:{flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: filePackages.length==0?'22.5px':'35px',
                          borderWidth: 2,
                          borderRadius: 15,
                          borderColor: filePackages.length==0?'#7d7d7d':'#03bf00',
                          borderStyle: 'dashed',
                          backgroundColor: '#fafafa',
                          color: filePackages.length==0?'#262626':'#03bf00',
                          textAlign:'center',
                          outline: 'none',
                          cursor:'pointer',
                          transition: 'border .24s ease-in-out',
                          height:filePackages.length==0?70:45}
                        })}>
                        <input {...getInputProps()} />
                        {filePackages.length==0?<p>Arrastra y suelta los archivos o haz click para seleccionar</p>:<p>Archivo ingresado</p>}
                        {filePackages.length==0?<em>(Solo se acepta 1 archivo)</em>:<></>}
                      </div>
                    </section>
                  )}
                </Dropzone>
                </Box>
              </Box>
              <Button disabled={filePackages.length==0?true:false} variant="contained" color="secondary" type="submit">Guardar</Button>
            </form>
          </Box> : null
        }
        {typePanel == PanelType.vehicleInfo && vehicle !== undefined &&
          <Box sx={{height: 600, paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Detalles del vehiculo:</Typography>
            <Typography sx={{marginBottom: 2}}><b>Código: </b>{vehicle.code}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Carga actual: </b>{vehicle.carry}</Typography>
            <Typography sx={{marginBottom: 2}}><b>Capacidad total: </b>{vehicle.capacity}</Typography>
            {vehicle.broken==false&&
              <Box>
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
        }
      </Box>
      {openPanel && <Box sx={panelStyles.overlay} onClick={ () => { setOpenPanel(false); setTypePanel(null); 
        setVehicle(undefined); vehicleCodeError=false; setVehicleCodeError(vehicleCodeError); 
        vehicleCodeErrorMessage=""; setVehicleCodeErrorMessage(vehicleCodeErrorMessage); 
        saveNeedsToBeDisabled=true; setSaveNeedsToBeDisabled(saveNeedsToBeDisabled);
        fileBlockages=[]; setFileBlockages(fileBlockages);}}/>}
      <ToastContainer />
    </>
  )
}/*
<h1>{JSON.stringify(apiMoment)}</h1>
<h1>The component has been rendered for {count} minutes. {seconds} seconds since beggining of day</h1>*/