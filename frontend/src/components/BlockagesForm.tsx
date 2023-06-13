import React, { useEffect, useState } from 'react';
import { OrderState, PanelType, TBlockage, TBlockageError, TOrder, TOrderError } from '../types/types';
import { Typography, TextField, Button, Box } from '@mui/material';
import BlockageService from '../services/BlockageService';
import functions from '../utils/functions';
import { toast } from 'react-toastify';

interface IBlockagesForm {
  blockage: TBlockage|undefined;
  type: PanelType;
  handlePanel: (open: boolean) => void;
  handleDeselect: () => void;
  loadBlockages: () => void;
}

const defaultOrder: TBlockage = {
  start: '',
  end: '',
  node: { x: 0, y: 0 },
  secondNode: {x:0,y:0}
}

export const BlockagesForm = ({ blockage, type, handlePanel, handleDeselect, loadBlockages }: IBlockagesForm) => {
  const [data, setData] = useState<TBlockage>( blockage ?? defaultOrder );
  const [error, setError] = useState<TBlockageError>({ start: false, end: false, x: false, y: false });
  var [dateStart, setDateStart] = useState<String>("2023-06-13")
  var [dateEnd, setDateEnd] = useState<String>("2023-07-13")
  var [timeStart, setTimeStart] = useState<String>("01:00")
  var [timeEnd, setTimeEnd] = useState<String>("23:00")
  var [start, setStart] = useState<Date>(new Date(parseInt(dateStart.substring(0,4)),
    parseInt(dateStart.substring(5,7))-1,parseInt(dateStart.substring(8,10)),
    parseInt(timeStart.substring(0,2)),parseInt(timeStart.substring(3,5))))
  var [end, setEnd] = useState<Date>(new Date(parseInt(dateEnd.substring(0,4)),
    parseInt(dateEnd.substring(5,7))-1,parseInt(dateEnd.substring(8,10)),
    parseInt(timeEnd.substring(0,2)),parseInt(timeEnd.substring(3,5))))
  var [valDates, setValDates] = useState<boolean>(false)
  var [valIniX, setValIniX] = useState<boolean>(false)
  var [iniX, setIniX] = useState<number>(0)
  var [valIniY, setValIniY] = useState<boolean>(false)
  var [iniY, setIniY] = useState<number>(0)
  var [valEndX, setValEndX] = useState<boolean>(false)
  var [endX, setEndX] = useState<number>(0)
  var [valEndY, setValEndY] = useState<boolean>(false)
  var [endY, setEndY] = useState<number>(0)
  var [valCoord, setValCoord] = useState<boolean>(false)

  useEffect(() => {
    setData( blockage ?? defaultOrder );
  }, [blockage]);

  const handleSubmit = async(e: any) => {
      e.preventDefault()
      let blockage : TBlockage = {node:{x:iniX,y:iniY},secondNode:{x:endX,y:endY},start:Math.trunc(start.getTime()/1000).toString(),end:Math.trunc(end.getTime()/1000).toString()};
      await BlockageService.insertBlockage(blockage).then((response) => {
        loadBlockages();
        toast.success(`Bloqueo registrado exitosamente`);
        handlePanel(false);
      }).catch((err) => {
        console.log(err);
        toast.error(`Sucedió un error, intente de nuevo`);
      })
  }

  const handleStartTimeChange = (time:String) => {
    timeStart=time;
    setTimeStart(timeStart);
    start=new Date(parseInt(dateStart.substring(0,4)),
    parseInt(dateStart.substring(5,7))-1,parseInt(dateStart.substring(8,10)),
    parseInt(timeStart.substring(0,2)),parseInt(timeStart.substring(3,5)));
    setStart(start);
    if(start.getTime()>=end.getTime()){
      valDates=true;
    }else{
      valDates=false;
    }
    setValDates(valDates);
  }

  const handleStartDateChange = (time:String) => {
    dateStart=time;
    setDateStart(dateStart);
    start=new Date(parseInt(dateStart.substring(0,4)),
    parseInt(dateStart.substring(5,7))-1,parseInt(dateStart.substring(8,10)),
    parseInt(timeStart.substring(0,2)),parseInt(timeStart.substring(3,5)));
    setStart(start);
    if(start.getTime()>=end.getTime()){
      valDates=true;
    }else{
      valDates=false;
    }
    setValDates(valDates);
  }

  const handleEndTimeChange = (time:String) => {
    timeEnd=time;
    setTimeEnd(timeEnd);
    end=new Date(parseInt(dateEnd.substring(0,4)),
    parseInt(dateEnd.substring(5,7))-1,parseInt(dateEnd.substring(8,10)),
    parseInt(timeEnd.substring(0,2)),parseInt(timeEnd.substring(3,5)));
    setEnd(end);
    if(start.getTime()>=end.getTime()){
      valDates=true;
    }else{
      valDates=false;
    }
    setValDates(valDates);
  }

  const handleEndDateChange = (time:String) => {
    dateEnd=time;
    setDateEnd(dateEnd);
    end=new Date(parseInt(dateEnd.substring(0,4)),
    parseInt(dateEnd.substring(5,7))-1,parseInt(dateEnd.substring(8,10)),
    parseInt(timeEnd.substring(0,2)),parseInt(timeEnd.substring(3,5)));
    setEnd(end);
    if(start.getTime()>=end.getTime()){
      valDates=true;
    }else{
      valDates=false;
    }
    setValDates(valDates);
  }

  const handleIniXChange = (coord:number) => {
    iniX = coord;
    setIniX(iniX);
    if(iniX >= 0 && iniX <= 69){
      valIniX=false;
    }else{
      valIniX=true;
    }
    setValIniX(valIniX);
    if(iniX==endX || iniY==endY){
      valCoord=false;
    }else{
      valCoord=true;
    }
    setValCoord(valCoord);
  }

  const handleIniYChange = (coord:number) => {
    iniY = coord;
    setIniY(iniY);
    if(iniY >= 0 && iniY <= 49){
      valIniY=false;
    }else{
      valIniY=true;
    }
    setValIniY(valIniY);
    if(iniX==endX || iniY==endY){
      valCoord=false;
    }else{
      valCoord=true;
    }
    setValCoord(valCoord);
  }

  const handleEndXChange = (coord:number) => {
    endX = coord;
    setEndX(endX);
    if(endX >= 0 && endX <= 69){
      valEndX=false;
    }else{
      valEndX=true;
    }
    setValEndX(valEndX);
    if(iniX==endX || iniY==endY){
      valCoord=false;
    }else{
      valCoord=true;
    }
    setValCoord(valCoord);
  }

  const handleEndYChange = (coord:number) => {
    endY = coord;
    setEndY(endY);
    if(endY >= 0 && endY <= 49){
      valEndY=false;
    }else{
      valEndY=true;
    }
    setValEndY(valEndY);
    if(iniX==endX || iniY==endY){
      valCoord=false;
    }else{
      valCoord=true;
    }
    setValCoord(valCoord);
  }
    
  return ( 
    <Box sx={{ paddingLeft: 3.5, paddingRight: 3.5 }}>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <Typography sx={{mb: 3}} >{type == PanelType.create ? 'Nuevo bloqueo' : 'Editar pedido'}</Typography>
        {(type == PanelType.edit) &&
          <TextField 
            label="Bloqueo"
            required
            variant="outlined"
            color="secondary"
            type="number"
            sx={{mb: 3}}
            fullWidth
            value={data.id}
            disabled={true}
          />
        }
        <Box display="flex" flexDirection="row">
          <TextField 
            label="Fecha inicial"
            onChange={(e:any)=>handleStartDateChange(e.target.value)}
            required
            variant="outlined"
            color="secondary"
            type="date"
            sx={{mb: 3}}
            fullWidth
            value={dateStart}
            error={valDates}
          />
          <TextField 
            onChange={(e:any)=>handleStartTimeChange(e.target.value)}
            required
            variant="outlined"
            color="secondary"
            type="time"
            sx={{mb: 3}}
            fullWidth
            value={timeStart}
            error={valDates}
          />
        </Box>
        <Box display="flex" flexDirection="row">
          <TextField 
            label="Fecha final"
            onChange={(e:any)=>handleEndDateChange(e.target.value)}
            required
            variant="outlined"
            color="secondary"
            type="date"
            sx={{mb: 3}}
            fullWidth
            value={dateEnd}
            error={valDates}
          />
          <TextField 
            onChange={(e:any)=>handleEndTimeChange(e.target.value)}
            required
            variant="outlined"
            color="secondary"
            type="time"
            sx={{mb: 3}}
            fullWidth
            value={timeEnd}
            error={valDates}
          />
        </Box>
        <TextField 
          label="Nodo inicial - Posicion X"
          onChange={(e:any)=>handleIniXChange(e.target.value)}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={iniX}
          error={valIniX||valCoord}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Nodo inicial - Posicion Y"
          onChange={(e:any)=>handleIniYChange(e.target.value)}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={iniY}
          error={valIniY||valCoord}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Nodo final - Posicion X"
          onChange={(e:any)=>handleEndXChange(e.target.value)}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={endX}
          error={valEndX||valCoord}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Nodo final - Posicion Y"
          onChange={(e:any)=>handleEndYChange(e.target.value)}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={endY}
          error={valEndY||valCoord}
          fullWidth
          sx={{mb: 3}}
        />
        <Button disabled={valCoord||valDates||valIniX||valIniY||valEndX||valEndY} variant="contained" color="secondary" type="submit">Guardar</Button>
      </form>
    </Box>
  );
}