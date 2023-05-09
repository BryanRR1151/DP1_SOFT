import React, { useState, useEffect } from "react";
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';

export const DailyOperationsPage = () => {

  const [vehicles, setVehicles] = useState<TVehicle[]|undefined>(undefined);
  const [count, setCount] = useState(0);
  var time = new Date();
  const seconds = time.getHours()*60*60+time.getMinutes()*60+time.getSeconds();

  const parseRoutes = (vehicles: TVehicle[]) => {
    let newVehicles = vehicles.map((v, index) => {
      if (v.type == VehicleType.auto) {
        
      }
      return v;
    });
    return newVehicles;
  }

  const planTheRoutes = async() => {
    await AlgorithmService.planRoutes(seconds).then((response) => {
      setVehicles(parseRoutes(response.data));
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

  return (
    <>
    <h1>The component has been rendered for {count} minutes {seconds}</h1>
    </>
  )
}