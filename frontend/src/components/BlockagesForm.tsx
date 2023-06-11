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
  node: { x: 0, y: 0 }
}

export const BlockagesForm = ({ blockage, type, handlePanel, handleDeselect, loadBlockages }: IBlockagesForm) => {
  const [data, setData] = useState<TBlockage>( blockage ?? defaultOrder );
  const [error, setError] = useState<TBlockageError>({ start: false, end: false, x: false, y: false });

  useEffect(() => {
    setData( blockage ?? defaultOrder );
  }, [blockage]);

  const handleSubmit = async(e: any) => {
      e.preventDefault()
      
      let newError: TBlockageError = { start: false, end: false, x: false, y: false };
      
      if (data.start > data.end) {
        newError.end = true;
      }
      if (!data.node.x || (data.node.x < 0 || data.node.x > 70)) {
        newError.x = true;
      }
      if (!data.node.y || (data.node.y < 0 || data.node.y > 50)) {
        newError.y = true;
      }

      if (Object.values(newError).find((e) => e == true)) {
        setError(newError);
        return;
      }

      handlePanel(false);
      handleDeselect();

      if (data.id) {
        let dataSend = { ...data, start: functions.dateToInt(data.start).toString(), end: functions.dateToInt(data.end).toString() };
        await BlockageService.editBlockage(dataSend).then((response) => {
          loadBlockages();
          toast.success(`Registro editado exitosamente`);
        }).catch((err) => {
          console.log(err);
          toast.error(`Sucedió un error, intente de nuevo`);
        })
      }
      else {
        let dataSend = { ...data, start: functions.dateToInt(data.start).toString(), end: functions.dateToInt(data.end).toString() };
        await BlockageService.insertBlockage(dataSend).then((response) => {
          loadBlockages();
          toast.success(`Registro creado exitosamente`);
        }).catch((err) => {
          console.log(err);
          toast.error(`Sucedió un error, intente de nuevo`);
        })
      }
  }
    
  return ( 
    <Box sx={{ paddingLeft: 3.5, paddingRight: 3.5 }}>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <Typography sx={{mb: 3}} >{type == PanelType.create ? 'Nuevo pedido' : 'Editar pedido'}</Typography>
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
        <TextField 
          label="Fecha inicial"
          onChange={(e: any) => setData({ ...data, start: e.target?.value })}
          required
          variant="outlined"
          color="secondary"
          type="date"
          sx={{mb: 3}}
          fullWidth
          value={data.start.replaceAll('/', '-')}
          error={error.start}
        />
        <TextField 
          label="Fecha de fin"
          onChange={(e: any) => setData({ ...data, end: e.target?.value })}
          required
          variant="outlined"
          color="secondary"
          type="date"
          sx={{mb: 3}}
          fullWidth
          value={data.end.replaceAll('/', '-')}
          error={error.end}
        />
        <TextField 
          label="Nodo inicial - Posicion X"
          onChange={(e: any) => setData({ ...data, node: { ...data.node, x: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.node.x}
          error={error.x}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Nodo inicial - Posicion Y"
          onChange={(e: any) => setData({ ...data, node: { ...data.node, y: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.node.y}
          error={error.y}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Nodo final - Posicion X"
          onChange={(e: any) => setData({ ...data, node: { ...data.node, x: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.node.x}
          error={error.x}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Nodo final - Posicion Y"
          onChange={(e: any) => setData({ ...data, node: { ...data.node, y: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.node.y}
          error={error.y}
          fullWidth
          sx={{mb: 3}}
        />
        <Button variant="contained" color="secondary" type="submit">Guardar</Button>
      </form>
    </Box>
  );
}