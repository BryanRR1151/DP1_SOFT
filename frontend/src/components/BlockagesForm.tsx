import React, { useEffect, useState } from 'react';
import { OrderState, PanelType, TBlockage, TBlockageError, TOrder, TOrderError } from '../types/types';
import { Typography, TextField, Button, Box } from '@mui/material';

interface IBlockagesForm {
  blockage: TBlockage|undefined;
  type: PanelType;
  handlePanel: (open: boolean) => void;
  handleDeselect: () => void;
}

const defaultOrder: TBlockage = {
  initialDate: '',
  finishDate: '',
  blockNode: { x: 0, y: 0 }
}

export const BlockagesForm = ({ blockage, type, handlePanel, handleDeselect }: IBlockagesForm) => {
  const [data, setData] = useState<TBlockage>( blockage ?? defaultOrder );
  const [error, setError] = useState<TBlockageError>({ initialDate: false, finishDate: false, x: false, y: false });

  useEffect(() => {
    setData( blockage ?? defaultOrder );
  }, [blockage]);

  const handleSubmit = (e: any) => {
      e.preventDefault()
      let newError: TBlockageError = { initialDate: false, finishDate: false, x: false, y: false };
      
      if (data.initialDate > data.finishDate) {
        newError.finishDate = true;
      }
      if (!data.blockNode.x || (data.blockNode.x < 0 || data.blockNode.x > 70)) {
        newError.x = true;
      }
      if (!data.blockNode.y || (data.blockNode.y < 0 || data.blockNode.y > 50)) {
        newError.y = true;
      }

      if (Object.values(newError).find((e) => e == true)) {
        setError(newError);
        return;
      }

      handlePanel(false);
      handleDeselect();
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
          onChange={(e: any) => setData({ ...data, initialDate: e.target?.value })}
          required
          variant="outlined"
          color="secondary"
          type="date"
          sx={{mb: 3}}
          fullWidth
          value={data.initialDate}
          error={error.initialDate}
        />
        <TextField 
          label="Fecha de fin"
          onChange={(e: any) => setData({ ...data, finishDate: e.target?.value })}
          required
          variant="outlined"
          color="secondary"
          type="date"
          sx={{mb: 3}}
          fullWidth
          value={data.finishDate}
          error={error.finishDate}
        />
        <TextField 
          label="Posicion X"
          onChange={(e: any) => setData({ ...data, blockNode: { ...data.blockNode, x: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.blockNode.x}
          error={error.x}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Posicion Y"
          onChange={(e: any) => setData({ ...data, blockNode: { ...data.blockNode, y: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.blockNode.y}
          error={error.y}
          fullWidth
          sx={{mb: 3}}
        />
        <Button variant="contained" color="secondary" type="submit">Guardar</Button>
      </form>
    </Box>
  );
}