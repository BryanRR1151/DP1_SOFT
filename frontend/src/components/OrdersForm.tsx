import React, { useEffect, useState } from 'react';
import { OrderState, PanelType, TOrder, TOrderError } from '../types/types';
import { Typography, TextField, Button, Box } from '@mui/material';

interface IOrdersForm {
  order: TOrder|undefined;
  type: PanelType;
  handlePanel: (open: boolean) => void;
  handleDeselect: () => void;
}

const defaultOrder: TOrder = {
  quantity: 0,
  term: 0,
  orderNode: { x: 0, y: 0 }
}

export const OrdersForm = ({ order, type, handlePanel, handleDeselect }: IOrdersForm) => {
  const [data, setData] = useState<TOrder>( order ?? defaultOrder );
  const [error, setError] = useState<TOrderError>({ quantity: false, term: false, x: false, y: false });

  useEffect(() => {
    setData( order ?? defaultOrder );
  }, [order]);

  const handleSubmit = (e: any) => {
      e.preventDefault()
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
      handleDeselect();
  }
    
  return ( 
    <Box sx={{ paddingLeft: 3.5, paddingRight: 3.5 }}>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <Typography sx={{mb: 3}} >{type == PanelType.create ? 'Nuevo pedido' : 'Editar pedido'}</Typography>
        {(type == PanelType.edit) &&
          <TextField 
            label="Pedido"
            required
            variant="outlined"
            color="secondary"
            type="text"
            sx={{mb: 3}}
            fullWidth
            value={data.order}
            disabled={true}
          />
        }
        <TextField 
          label="Cantidad"
          onChange={(e: any) => setData({ ...data, quantity: e.target?.value })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          sx={{mb: 3}}
          fullWidth
          value={data.quantity}
          error={error.quantity}
        />
        <TextField 
          label="Plazo (Horas)"
          onChange={(e: any) => setData({ ...data, term: e.target?.value })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.term}
          error={error.term}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Posicion X"
          onChange={(e: any) => setData({ ...data, orderNode: { ...data.orderNode, x: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.orderNode.x}
          error={error.x}
          fullWidth
          sx={{mb: 3}}
        />
        <TextField 
          label="Posicion Y"
          onChange={(e: any) => setData({ ...data, orderNode: { ...data.orderNode, y: e.target?.value } })}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.orderNode.y}
          error={error.y}
          fullWidth
          sx={{mb: 3}}
        />
        {(type == PanelType.edit) &&
          <TextField 
            label="Estado"
            required
            variant="outlined"
            color="secondary"
            type="text"
            sx={{mb: 3}}
            fullWidth
            value={data.state == OrderState.active ? 'Activo' : data.state == OrderState.pending ? 'Pendiente' : 'Entregado'}
            disabled={true}
          />
        }
        <Button variant="contained" color="secondary" type="submit">Guardar</Button>
      </form>
    </Box>
  );
}