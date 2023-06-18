import React, { useState, useEffect } from "react";
import data from './momentDefault.json';
import { Link } from 'react-router-dom'
import { AnimationGrid } from '../components/AnimationGrid';
import colorConfigs from '../configs/colorConfigs'
import BlockageService from '../services/BlockageService';
import Select, { GroupBase } from 'react-select'
import { ToastContainer, toast } from 'react-toastify';
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid, TextField } from '@mui/material';
import { TMoment, TBlockage, TPack, DailyPackDetail, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { PanelType, panelStyles } from "../types/types";
import Dropzone from 'react-dropzone'
import { TBlockage as registerBlockageType }  from '../types/types';
import { FaCarSide, FaMotorcycle } from 'react-icons/fa';

export const DailyOperationsPage = () => {

  var [dailyPackDetails, setDailyPackDetails] = useState<DailyPackDetail[]>([]);
  var [started, setStarted] = useState<boolean>(false);
  var [fileBlockages, setFileBlockages] = useState<registerBlockageType[][]>([]);
  var [filePackages, setFilePackages] = useState<TPack[]>([]);
  var [temporaryFilePackages, setTemporaryFilePackages] = useState<TPack[]>([]);
  var [vehicles, setVehicles] = useState<TVehicle[]>([]);
  var [todaysBlockages, setTodaysBlockages] = useState<TBlockage[]>([]);
  var [vehicleCodeError, setVehicleCodeError] = useState<boolean>(false);
  var [vehicleCodeErrorMessage, setVehicleCodeErrorMessage] = useState<String>(" ");
  var [saveNeedsToBeDisabled, setSaveNeedsToBeDisabled] = useState<boolean>(true);
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

  const initiateAlgorithm = async() => {
    await AlgorithmService.initDaily().then(() => {
      console.log('Algorithm initiated successfully');
    }).catch((err) => {
      console.log(err);
    });

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
    /*
    await AlgorithmService.planRoutes(currentTime.toString()).then((response) => {
      console.log(response.data);
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
            v.movement!.to!.x=parseFloat((v.movement!.from!.x+(v.speed/60)/10).toFixed(2));
          }else if(v.movement!.from!.x > v.route!.chroms[0].to.x){
            v.movement!.to!.x=parseFloat((v.movement!.from!.x-(v.speed/60)/10).toFixed(2));
          }else if(v.movement!.from!.y < v.route!.chroms[0].to.y){
            v.movement!.to!.y=parseFloat((v.movement!.from!.y+(v.speed/60)/10).toFixed(2));
          }else if(v.movement!.from!.y > v.route!.chroms[0].to.y){
            v.movement!.to!.y=parseFloat((v.movement!.from!.y-(v.speed/60)/10).toFixed(2));
          }
          if(v.movement!.to!.x == v.route!.chroms[0].to.x && v.movement!.to!.y == v.route!.chroms[0].to.y){
            v.route!.chroms.shift();
          }
      })
      setApiMoment(apiMoment);
      console.log('Routes planned successfully');
    }).catch((err) => {
      console.log(err);
    });
    */
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
    
    let updatedPackFromFileArray : TPack[] = [];
    filePackages.forEach(p => {
      if(p.originalTime==currentTime){
        AlgorithmService.insertPack(p).then((response) => {
          toast.success('Pedido registrado exitosamente');
        }).catch((err) => {
          updatedPackFromFileArray.push(p);
          toast.error('Ocurrió un error al registrar el pedido')
          console.log(err);
        });
      }else if(p.originalTime>currentTime){
        updatedPackFromFileArray.push(p);
      }
    });
    filePackages = updatedPackFromFileArray;
    setFilePackages(filePackages);
    
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
      setApiMoment(apiMoment);
    });
    apiMoment!.activeBlockages=apiMoment!.activeBlockages.concat(blockagesToAdd);

    dailyPackDetails.forEach(dpd => {
      dpd.secondsLeft-=6;
    });

    await AlgorithmService.planRoutes(currentTime.toString()).then((response) => {
      vehicles=parseVehicles(response.data);
      vehicles!.forEach( (v)=>{

        let foundDailyPackDetail = dailyPackDetails.find(p=>p.id==v!.pack!.id);
        if(foundDailyPackDetail==undefined){
          let dailyPackDetail : DailyPackDetail;
          dailyPackDetail = {id:v!.pack!.id, x:v.pack!.location.x, y:v.pack!.location.y, 
            secondsLeft:parseInt(((v.route!.chroms.length/v.speed)*3600).toFixed(0)),
            carAmount:v.type==VehicleType.auto?1:0, bikeAmount:v.type==VehicleType.moto?1:0};
          dailyPackDetails.push(dailyPackDetail);
        }else{
          v.type==VehicleType.auto?foundDailyPackDetail.carAmount+=1:foundDailyPackDetail.bikeAmount+=1;
          console.log()
          let newSecondsLeft = parseInt(((v.route!.chroms.length/v.speed)*3600).toFixed(0));
          if(newSecondsLeft > foundDailyPackDetail.secondsLeft){
            foundDailyPackDetail.secondsLeft = newSecondsLeft;
          }
        }

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
      console.log('Routes planned successfully');
    }).catch((err) => {
      console.log(err);
    });
    let temporaryVehicles:TVehicle[]=[];
    let newVehicles = apiMoment!.activeVehicles!.map((v,index) => {
      let shouldBeAddedToVehicles:boolean=true;
      if(v.route!.chroms.length!=0){
        if(v.broken==false || v.movement!.to!.x != v.route!.chroms[0].from.x || v.movement!.to!.y != v.route!.chroms[0].from.y){
          v.movement!.from!.x=v.movement!.to!.x;
          v.movement!.from!.y=v.movement!.to!.y;
          if(v.movement!.from!.x < v.route!.chroms[0].to.x){
            v.movement!.to!.x=parseFloat((v.movement!.from!.x+(v.speed/60)/10).toFixed(2));
          }else if(v.movement!.from!.x > v.route!.chroms[0].to.x){
            v.movement!.to!.x=parseFloat((v.movement!.from!.x-(v.speed/60)/10).toFixed(2));
          }else if(v.movement!.from!.y < v.route!.chroms[0].to.y){
            v.movement!.to!.y=parseFloat((v.movement!.from!.y+(v.speed/60)/10).toFixed(2));
          }else if(v.movement!.from!.y > v.route!.chroms[0].to.y){
            v.movement!.to!.y=parseFloat((v.movement!.from!.y-(v.speed/60)/10).toFixed(2));
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

            let dailyPackDetailIndex = dailyPackDetails.findIndex(dpd => dpd.id == v.pack?.id);
            v.type==VehicleType.auto?dailyPackDetails[dailyPackDetailIndex].carAmount-=1
              :dailyPackDetails[dailyPackDetailIndex].bikeAmount-=1;
            if(dailyPackDetails[dailyPackDetailIndex].carAmount==0 
              && dailyPackDetails[dailyPackDetailIndex].bikeAmount==0){
              dailyPackDetails.splice(dailyPackDetailIndex,1);
            }

            //notify package has been delivered
            apiMoment?.activePacks.splice(apiMoment!.activePacks.indexOf(v.pack!),1);
            AlgorithmService.completePack(v.id,currentTime.toString()).then((response) => {
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
    setDailyPackDetails(dailyPackDetails);
  }
  
  useEffect(() => {
    if(!started){
      started = true;
      setStarted(true);
      apiMoment=data.moment;
      initiateAlgorithm();
    }
  }, [apiMoment,started]);

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
      planTheRoutes();
    }, 6000);
    return () => {
      clearInterval(intervalId);
    };
  }, [filePackages,apiMoment,todaysBlockages]);  

  const registerFault = async(vehicle: String, fault: String, time: String) => {
    await AlgorithmService.setFault(vehicle,fault,time).then(() => {
      console.log('Fault registered successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    let fullTime = new Date();
    let currentTime = Math.trunc(fullTime.getTime()/1000)-fullTime.getSeconds();
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
      setOpenPanel(false);
      registerFault(selectedVehicleType+vehicleCodeValue.toString().padStart(3,"0"),selected,currentTime.toString());
      
      if(apiMoment!.activeVehicles[damagedVehicleIndex].location?.destination==false){
        apiMoment!.activeVehicles[damagedVehicleIndex].type==VehicleType.auto?
          dailyPackDetails.find(dpd=>dpd.id==apiMoment!.activeVehicles[damagedVehicleIndex]!.pack!.id)!.carAmount-=1
          :dailyPackDetails.find(dpd=>dpd.id==apiMoment!.activeVehicles[damagedVehicleIndex]!.pack!.id)!.bikeAmount-=1
      }
    }
  }
  const handleSubmitFromVehicle = (e: any) => {
    e.preventDefault()
    let fullTime = new Date();
    let currentTime = Math.trunc(fullTime.getTime()/1000)-fullTime.getSeconds();
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
      setOpenPanel(false);
      registerFault(vehicle!.code!,selected,currentTime.toString());

      if(apiMoment!.activeVehicles[damagedVehicleIndex].location?.destination==false){
        apiMoment!.activeVehicles[damagedVehicleIndex].type==VehicleType.auto?
          dailyPackDetails.find(dpd=>dpd.id==apiMoment!.activeVehicles[damagedVehicleIndex]!.pack!.id)!.carAmount-=1
          :dailyPackDetails.find(dpd=>dpd.id==apiMoment!.activeVehicles[damagedVehicleIndex]!.pack!.id)!.bikeAmount-=1
      }
    }
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
    let errors = false;
    fileBlockages.forEach(f => {
      f.forEach(b => {
        insertBlockage(b).catch((err) => {
          errors = true;
        });
      });
    });
    if(errors){
      toast.error(`Sucedió un error, intente de nuevo`);
    }else{
      toast.success(`Bloqueos registrados exitosamente`);
    }
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
    if(filePackages.length>0){
      toast.success(`Pedidos encolados exitosamente`);
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
      temporaryFilePackages=[];
      setTemporaryFilePackages(temporaryFilePackages);
    }else{
      toast.error(`Sucedió un error, intente de nuevo`);
    }
  }

  const insertBlockage = async(blockage: registerBlockageType) => {
    await BlockageService.insertBlockage(blockage).then((response) => {
      console.log(`Bloqueo creado exitosamente`);
    }).catch((err) => {
      console.log(err);
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
          let details = l.substring(6,l.length-1).split(',');
          let pack : TPack = {id:0,idCustomer:parseInt(details[3]),time:0,fullfilled:0,
            originalTime:Math.trunc(new Date(new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
              parseInt(l.substring(0,2)),
              parseInt(l.substring(3,5))).getTime()/1000),deadline:parseInt(details[4])*60*60,
            demand:parseInt(details[2]),location:{x:parseInt(details[0]),y:parseInt(details[1])},
            unassigned:parseInt(details[2])};
            temporaryFilePackages.push(pack);
        });
        setTemporaryFilePackages(temporaryFilePackages);
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

    return null
  }

  const getCards = () => {
    const rows = dailyPackDetails.map((dpd, index) => (
      <div style={{height:150}}>
      <div
        key={index}
        style={{ flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5px',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#7d7d7d',
        borderStyle: 'solid',
        backgroundColor: '#fafafa',
        textAlign:'start',
        outline: 'none',
        height:110,
      width:260}}
      >
        <div className="card-body">
        <div
        key={index}
        style={{ width:238,
        alignItems: 'start',
        padding: '10px',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#7d7d7d',
        borderStyle: 'solid',
        backgroundColor: '#fafafa',
        textAlign:'center',
        outline: 'none',
        height:20}}
      >
          <Typography>Id: {dpd.id}  |  x: {dpd.x} km, y: {dpd.y} km</Typography>
          </div>
          <div style={{padding: '10px', alignItems: 'center', textAlign:'center'}}>
            <Typography>Tiempo estimado: {Math.trunc(dpd.secondsLeft/60)} min</Typography>
            <div style={{height: 10}}></div>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', textAlign:'center'}}>
              <div style={{width:40}}></div>
              <FaCarSide size={20} color="black"/>
              <Typography>: {dpd.carAmount}</Typography>
              <div style={{width:75}}></div>
              <FaMotorcycle size={20}/>
              <Typography>: {dpd.bikeAmount}</Typography>
            </div>
          </div>
        </div>
      </div>
      </div>
    ));
    return rows;
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
                  speed = {1/6}
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
                <Box>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => { setOpenPanel(true); setTypePanel(PanelType.simulationDetails) }}
                    sx={{width:192}}
                  >
                    Detalles
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
                          padding: temporaryFilePackages.length==0?'22.5px':'35px',
                          borderWidth: 2,
                          borderRadius: 15,
                          borderColor: temporaryFilePackages.length==0?'#7d7d7d':'#03bf00',
                          borderStyle: 'dashed',
                          backgroundColor: '#fafafa',
                          color: temporaryFilePackages.length==0?'#262626':'#03bf00',
                          textAlign:'center',
                          outline: 'none',
                          cursor:'pointer',
                          transition: 'border .24s ease-in-out',
                          height:temporaryFilePackages.length==0?70:45}
                        })}>
                        <input {...getInputProps()} />
                        {temporaryFilePackages.length==0?<p>Arrastra y suelta los archivos o haz click para seleccionar</p>:<p>Archivo ingresado</p>}
                        {temporaryFilePackages.length==0?<em>(Solo se acepta 1 archivo)</em>:<></>}
                      </div>
                    </section>
                  )}
                </Dropzone>
                </Box>
              </Box>
              <Button disabled={temporaryFilePackages.length==0?true:false} variant="contained" color="secondary" type="submit">Guardar</Button>
            </form>
          </Box> : null
        }
        {typePanel == PanelType.simulationDetails ?
          <Box sx={{paddingRight: 3.5, paddingLeft: 3.5, paddingBottom: 3.5, overflowY: 'auto'}}>
            <Typography variant='h6' sx={{marginBottom: 2, fontSize: '18px'}}>Pedidos activos:</Typography>
            <Box sx={{height:600, overflowY: 'auto'}}> 
                {getCards()}
            </Box>
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
        fileBlockages=[]; setFileBlockages(fileBlockages);
        temporaryFilePackages=[]; setTemporaryFilePackages(temporaryFilePackages);}}/>}
      <ToastContainer />
    </>
  )
}/*
<h1>{JSON.stringify(apiMoment)}</h1>
<h1>The component has been rendered for {count} minutes. {seconds} seconds since beggining of day</h1>*/