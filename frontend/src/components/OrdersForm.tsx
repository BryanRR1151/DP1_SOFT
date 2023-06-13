import React, { useEffect, useState } from 'react';
import { OrderState, PanelType, TOrder, TOrderError } from '../types/types';
import { Typography, TextField, Button, Box } from '@mui/material';
import { TPack } from '../test/movements';
import AlgorithmService from '../services/AlgorithmService';
import { toast } from 'react-toastify';

interface IOrdersForm {
  order: TOrder|undefined;
  type: PanelType;
  handlePanel: (open: boolean) => void;
  handleDeselect: () => void;
}

const defaultOrder: TOrder = {
  idCustomer: 0,
  quantity: 0,
  term: 0,
  orderNode: { x: 0, y: 0 }
}

export const OrdersForm = ({ order, type, handlePanel, handleDeselect }: IOrdersForm) => {
  const [disabledIdCustomer, setDisabledIdCustomer] = useState<boolean>(true);
  const [disabledQuantity, setDisabledQuantity] = useState<boolean>(true);
  const [disabledTerm, setDisabledTerm] = useState<boolean>(true);
  const [disabledX, setDisabledX] = useState<boolean>(false);
  const [disabledY, setDisabledY] = useState<boolean>(false);
  const [errorMessageIdCustomer, setErrorMessageIdCustomer] = useState<String>(" ");
  const [errorMessageQuantity, setErrorMessageQuantity] = useState<String>(" ");
  const [errorMessageTerm, setErrorMessageTerm] = useState<String>(" ");
  const [errorMessageX, setErrorMessageX] = useState<String>(" ");
  const [errorMessageY, setErrorMessageY] = useState<String>(" ");
  const [data, setData] = useState<TOrder>( order ?? defaultOrder );
  const [error, setError] = useState<TOrderError>({ idCustomer: false, quantity: false, term: false, x: false, y: false });
  var [packToSend, setPackToSend] = useState<TPack>({id: 0, idCustomer: 0, originalTime: 0, deadline: 0,
    time: 0, demand: 0, fullfilled: 0, unassigned: 0, location: {x:-1,y:-1}});

  useEffect(() => {
    setData( order ?? defaultOrder );
  }, [order]);

  const registerPack = async(pack: TPack) => {
    await AlgorithmService.insertPack(pack).then((response) => {
      toast.success(`Pedido registrado exitosamente`);
      handlePanel(false);
    }).catch((err) => {
      console.log(err);
      toast.error(`Sucedió un error, intente de nuevo`);
    });
  }

  const setErrorQuantity = (booleanValue:boolean , stringValue:String) => {
    setErrorMessageQuantity(stringValue);
    setDisabledQuantity(booleanValue);
    setError({idCustomer: error.idCustomer, quantity: booleanValue, term: error.term, x: error.x, y: error.y});
  }

  const setErrorIdCustomer = (booleanValue:boolean , stringValue:String) => {
    setErrorMessageIdCustomer(stringValue);
    setDisabledIdCustomer(booleanValue);
    setError({idCustomer: booleanValue, quantity: error.quantity, term: error.term, x: error.x, y: error.y});
  }

  const setErrorTerm = (booleanValue:boolean , stringValue:String) => {
    setErrorMessageTerm(stringValue);
    setDisabledTerm(booleanValue);
    setError({idCustomer: error.idCustomer, quantity: error.quantity, term: booleanValue, x: error.x, y: error.y});
  }

  const setErrorX = (booleanValue:boolean , stringValue:String) => {
    setErrorMessageX(stringValue);
    setDisabledX(booleanValue);
    setError({idCustomer: error.idCustomer, quantity: error.quantity, term: error.term, x: booleanValue, y: error.y});
  }

  const setErrorY = (booleanValue:boolean , stringValue:String) => {
    setErrorMessageY(stringValue);
    setDisabledY(booleanValue);
    setError({idCustomer: error.idCustomer, quantity: error.quantity, term: error.term, x: error.x, y: booleanValue});
  }

  const handleSubmit = (e: any) => {
      e.preventDefault()
      let newError: TOrderError = { idCustomer: false, quantity: false, term: false, x: false, y: false };
      
      if (!data.idCustomer || data.idCustomer <= 0) {
        newError.idCustomer = true;
      }
      if (!data.quantity || data.quantity <= 0) {
        newError.quantity = true;
      }
      if (!data.term || data.quantity <= 0) {
        newError.term = true;
      }
      if (!data.orderNode.x || (data.orderNode.x < 0 || data.orderNode.x > 69)) {
        newError.x = true;
      }
      if (!data.orderNode.y || (data.orderNode.y < 0 || data.orderNode.y > 49)) {
        newError.y = true;
      }

      if (Object.values(newError).find((e) => e == true)) {
        setError(newError);
        return;
      }

      handlePanel(false);
      handleDeselect();
      packToSend.idCustomer=data.idCustomer!;
      packToSend.demand=data.quantity;
      packToSend.deadline=data.term*60*60;
      packToSend.location.x=data.orderNode.x;
      packToSend.location.y=data.orderNode.y;
      //packToSend.originalTime=new Date().getHours()*60+new Date().getMinutes();
      packToSend.unassigned=data.quantity;
      registerPack(packToSend);
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
          onChange={(e: any) => {setData({ ...data, quantity: e.target?.value });e.target?.value>0?setErrorQuantity(false," "):setErrorQuantity(true,"Debe ingresar un valor mayor a 0");}}
          required
          variant="outlined"
          color="secondary"
          type="number"
          sx={{mb: 3}}
          fullWidth
          value={data.quantity}
          error={error.quantity}
          helperText={errorMessageQuantity}
        />
        <TextField 
          label="Cliente"
          onChange={(e: any) => {setData({ ...data, idCustomer: e.target?.value });e.target?.value>0?setErrorIdCustomer(false," "):setErrorIdCustomer(true,"Debe ingresar un valor mayor a 0");}}
          required
          variant="outlined"
          color="secondary"
          type="number"
          sx={{mb: 3}}
          fullWidth
          value={data.idCustomer}
          error={error.idCustomer}
          helperText={errorMessageIdCustomer}
        />
        <TextField 
          label="Plazo (Horas)"
          onChange={(e: any) => {setData({ ...data, term: e.target?.value });e.target?.value>0?setErrorTerm(false," "):setErrorTerm(true,"Debe ingresar un valor mayor a 0");}}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.term}
          error={error.term}
          fullWidth
          sx={{mb: 3}}
          helperText={errorMessageTerm}
        />
        <TextField 
          label="Posicion X"
          onChange={(e: any) => {setData({ ...data, orderNode: { ...data.orderNode, x: e.target?.value } });e.target?.value>=0&&e.target?.value<=69?setErrorX(false," "):setErrorX(true,"Debe ingresar un valor entre 0 y 69");}}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.orderNode.x}
          error={error.x}
          fullWidth
          sx={{mb: 3}}
          helperText={errorMessageX}
        />
        <TextField 
          label="Posicion Y"
          onChange={(e: any) => {setData({ ...data, orderNode: { ...data.orderNode, y: e.target?.value } });e.target?.value>=0&&e.target?.value<=49?setErrorY(false," "):setErrorY(true,"Debe ingresar un valor entre 0 y 49");}}
          required
          variant="outlined"
          color="secondary"
          type="number"
          value={data.orderNode.y}
          error={error.y}
          fullWidth
          sx={{mb: 3}}
          helperText={errorMessageY}
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
        <Button variant="contained" color="secondary" type="submit" disabled={disabledIdCustomer||disabledQuantity||disabledTerm||disabledX||disabledY}>Guardar</Button>
      </form>
    </Box>
  );
}