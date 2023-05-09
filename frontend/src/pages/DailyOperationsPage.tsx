import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { AnimationGrid } from '../components/AnimationGrid';
import colorConfigs from '../configs/colorConfigs'
import { Accordion, AccordionSummary, AccordionDetails, Button, Breadcrumbs, Box, Typography, Container, Grid } from '@mui/material';
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';

export const DailyOperationsPage = () => {

  const [vehicles, setVehicles] = useState<TVehicle[]|undefined>(undefined);
  const [count, setCount] = useState(0);
  const [apiMoment, setApiMoment] = useState<TMoment|undefined>(undefined);
  var time = new Date();
  var started = true;
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

  const initiateAlgorithm = async() => {
    await AlgorithmService.initDaily().then((response) => {
      console.log('Algorithm initiated successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  useEffect(() => {
    setInterval(() => {
      setCount(prevCount => prevCount + 1);
      time = new Date();
      planTheRoutes;
    }, 60000);
  }, []);

  useEffect(() => {
    if(count==0 && started){
      started=false;
      initiateAlgorithm;
    }
  }, []);

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
            <AnimationGrid 
              moment = {undefined}
              openVehiclePopup={openVehiclePopup}
            />
          </Box>
        </Box>
      </Container>

      <h1>The component has been rendered for {count} minutes. {seconds} seconds since beggining of day</h1>
    </>
  )
}