import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Popover, Container, Breadcrumbs, Typography, Box, Button } from '@mui/material';
import colorConfigs from '../configs/colorConfigs';
import sizeConfigs from '../configs/sizeConfigs';
import { DataGrid, GridRenderCellParams, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { TOrder, OrderState, PanelType, panelStyles } from '../types/types';
import { TNode, TPack } from '../test/movements';
import { OrdersForm } from '../components/OrdersForm';
import { FaPen, FaTrash } from 'react-icons/fa';
import AlgorithmService from '../services/AlgorithmService';
import axios from 'axios';

interface GridColDef {
  field: string;
  headerName: string;
  minWidth: number;
  type?: string;
  renderCell?: any;
  valueGetter?: any;
  getActions?: any;
}

export const OrdersPage = () => {

  const [selected, setSelected] = useState<TOrder|undefined>(undefined);
  const [isOpenPanel, setIsOpenPanel] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [count, setCount] = useState(0);
  var [rowsToShow, setRowsToShow] = useState<TOrder[]>([]);
  var [packsToShow, setPacksToShow] = useState<TPack[]>([]);

  useEffect(() => {
    setLoading(false);
  });

  const handleEdit = (e: any, params: any) => {
    setSelected(params.row);
    setIsOpenPanel(true);
  }

  const handleDelete = (e: any, params: any) => {
    deletePack(params.row);
  }

  const handlePanel = (open: boolean) => {
    setIsOpenPanel(open);
  }

  const handleDeselect = () => {
    setSelected(undefined);
  }

  const parsePacks = (packs: TPack[]) => {
    return packs;
  }

  const deletePack = async(order: TOrder) => {
    await AlgorithmService.deletePack(order.id!).then((response) => {
      console.log('Pack deleted successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  const getPackList = async() => {
    await AlgorithmService.getPacks().then((response) => {
      packsToShow = parsePacks(response.data);
      setPacksToShow(parsePacks(response.data));
      rowsToShow = [];
      packsToShow.forEach(p => {
        let temporaryOrder: TOrder = {order:p.id.toString(), idCustomer: p.idCustomer, id: p.id, registerDate:p.time.toString(),
          quantity: p.demand, term: p.deadline, orderNode: {x:p.location.x,y:p.location.y}, state:p.fullfilled==0?OrderState.pending:p.fullfilled==p.demand?OrderState.fullfiled:OrderState.active}
          rowsToShow.push(temporaryOrder)
      });
      setRowsToShow(rowsToShow);
      console.log('Packs retrieved successfully');
    }).catch((err) => {
      console.log(err);
    });
  }

  var started = false;
  useEffect(() => {
    if(!started){
      started = true;
      getPackList();
    }
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      getPackList();
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
 /*
  const testRows: TOrder[] = [
    {
      id: 1,
      order: '1000001',
      quantity: 20,
      registerDate: '2023/05/07',
      term: 24,
      orderNode: {x: 20, y: 40} as TNode,
      state: OrderState.active
    },
    {
      id: 2,
      order: '1000002',
      quantity: 20,
      registerDate: '2023/05/07',
      term: 8,
      orderNode: {x: 30, y: 40} as TNode,
      state: OrderState.pending
    },
    {
      id: 3,
      order: '1000003',
      quantity: 20,
      registerDate: '2023/05/07',
      term: 16,
      orderNode: {x: 40, y: 40} as TNode,
      state: OrderState.active
    }
  ];*/

  const columns: GridColDef[] = [
    {
      field: 'order',
      headerName: 'Pedido',
      minWidth: 100
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      minWidth: 100
    },
    {
      field: 'idCustomer',
      headerName: 'Cliente',
      minWidth: 100
    },
    {
      field: 'term',
      headerName: 'Fecha Límite',
      valueGetter: (params: any) => `${new Date(params.value*1000).toLocaleString('en-GB')/*.getDay()/*+"/"+new Date(params.value*1000).getMonth()+"/"+new Date(params.value*1000).getFullYear()+", "+new Date(params.value*1000).getHours()*/}`,
      minWidth: 200
    },
    {
      field: 'orderNode',
      headerName: 'Punto de entrega',
      valueGetter: (params: any) => `X: ${params.value.x}km, Y: ${params.value.y}km`,
      minWidth: 200
    },
    {
      field: 'state',
      headerName: 'Estado',
      renderCell: (params: GridRenderCellParams<any>) => {
        let color = params.value == OrderState.active ? "#2E5AAC" : params.value == OrderState.pending ? "#4E9C4C" : "black";
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            border: `0.5px solid ${ color }`,
            borderRadius: '5px',
            padding: '2px 10px 2px 10px',
            color
          }}>
            { params.value }
          </div>
        )
      },
      minWidth: 150
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      minWidth: 50,
      getActions: (params: GridRowParams) => [
        //<GridActionsCellItem icon={<FaPen/>} label="Editar" onClick={(e) => handleEdit(e, params)} />,
        <GridActionsCellItem icon={<FaTrash/>} label="Eliminar" onClick={(e) => handleDelete(e, params)} />,
      ]
    }
  ];
  
  return (
    <>
      <Breadcrumbs 
        maxItems={2} 
        aria-label='breadcrumb'
        sx={{
          backgroundColor: colorConfigs.breadcrumb.bg
        }}
      >
        <Box
          sx={{
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingTop: '5px',
            paddingBottom: '5px'
          }}
        >
          <Typography>Pedidos</Typography>
        </Box>
      </Breadcrumbs>
      { !loading &&
      <>
        <Container>
          <Box
            sx={{
              padding: '20px'
            }}
          >
            <Box
              sx={{
                marginBottom: 2
              }}
            >
              <Button
                variant='contained'
                color='secondary'
                onClick={(event) => setIsOpenPanel(true) }
              >
                Nuevo
              </Button>
            </Box>
            <DataGrid rows={rowsToShow} columns={columns} />

          </Box>
        </Container>
        <Box
          sx={{ ...panelStyles.panel, ...(isOpenPanel && panelStyles.panelOpen) }}
          display="flex"
          flexDirection="column"
        >
          <OrdersForm 
            order={selected} 
            type={selected ? PanelType.edit : PanelType.create} 
            handlePanel={handlePanel} 
            handleDeselect={handleDeselect}
          />
        </Box>
        {isOpenPanel && <Box sx={panelStyles.overlay} onClick={ () => { setIsOpenPanel(false); handleDeselect() }}/>}
      
      </>
      }
    </>
  )
}
