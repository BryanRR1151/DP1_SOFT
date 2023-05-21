import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Popover, Container, Breadcrumbs, Typography, Box, Button } from '@mui/material';
import colorConfigs from '../configs/colorConfigs';
import sizeConfigs from '../configs/sizeConfigs';
import { DataGrid, GridRenderCellParams, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { TOrder, OrderState, PanelType, panelStyles } from '../types/types';
import { TNode } from '../test/movements';
import { TBlockage, TBlockageError } from '../types/types';
import { OrdersForm } from '../components/OrdersForm';
import { FaPen, FaTrash } from 'react-icons/fa';
import { BlockagesForm } from '../components/BlockagesForm';

interface GridColDef {
  field: string;
  headerName: string;
  minWidth: number;
  type?: string;
  renderCell?: any;
  valueGetter?: any;
  getActions?: any;
}

export const BlockagesPage = () => {

  const [selected, setSelected] = useState<TBlockage|undefined>(undefined);
  const [isOpenPanel, setIsOpenPanel] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  });

  const handleEdit = (e: any, params: any) => {
    setSelected(params.row);
    setIsOpenPanel(true);
  }

  const handleDelete = (e: any, params: any) => {

  }

  const handlePanel = (open: boolean) => {
    setIsOpenPanel(open);
  }

  const handleDeselect = () => {
    setSelected(undefined);
  }
 
  const testRows: TBlockage[] = [
    {
      id: 1,
      initialDate: '2023/05/07',
      finishDate: '2023/05/07',
      registerDate: '2023/05/07',
      blockNode: {x: 30, y: 40} as TNode,
    },
    {
      id: 2,
      initialDate: '2023/05/07',
      finishDate: '2023/05/07',
      registerDate: '2023/05/07',
      blockNode: {x: 30, y: 40} as TNode,
    },
    {
      id: 3,
      initialDate: '2023/05/07',
      finishDate: '2023/05/07',
      registerDate: '2023/05/07',
      blockNode: {x: 30, y: 40} as TNode,
    }
  ];

  const columns: GridColDef[] = [
    {
      field: 'blockage',
      headerName: 'Bloqueo',
      minWidth: 100
    },
    {
      field: 'initialDate',
      headerName: 'Fecha de inicio',
      minWidth: 100
    },
    {
      field: 'finishDate',
      headerName: 'Fecha de fin',
      minWidth: 100
    },
    {
      field: 'blockNode',
      headerName: 'Lugar',
      valueGetter: (params: any) => `X: ${params.value.x}km, Y: ${params.value.y}km`,
      minWidth: 200
    },
    {
      field: 'registerDate',
      headerName: 'Fecha de registro',
      minWidth: 150
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      minWidth: 50,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem icon={<FaPen/>} label="Editar" onClick={(e) => handleEdit(e, params)} />,
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
          <Typography>Bloqueos</Typography>
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
              <Button
                variant='outlined'
                color='secondary'
                sx={{
                  marginLeft: 2
                }}
              >
                Filtrar
              </Button>
            </Box>
            <DataGrid rows={testRows} columns={columns} />

          </Box>
        </Container>
        <Box
          sx={{ ...panelStyles.panel, ...(isOpenPanel && panelStyles.panelOpen) }}
          display="flex"
          flexDirection="column"
        >
          <BlockagesForm 
            blockage={selected} 
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