import { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import colorConfigs from '../configs/colorConfigs';

const GRID_COLS = 70;
const GRID_ROWS = 50;
const CELL_SIZE = 15;

interface CarProps {
  vehicle: TVehicle;
  openVehiclePopup: (vehicle: TVehicle) => void;
}

const Car = ({ vehicle, openVehiclePopup }: CarProps) => {
  const { movement: { from, to }} = vehicle;

  const springs = useSpring({
    config: { duration: 1000 },
    from: { x: from.x*CELL_SIZE, y: from.y*CELL_SIZE },
    to: { x: to.x*CELL_SIZE, y: to.y*CELL_SIZE }
  })

  return (
    <>
      {
        <animated.div
          style={{
            ...springs
          }}
        >
          <div 
            onClick={() => openVehiclePopup(vehicle)}
            style={{
              position: 'absolute',
              top: -10,
              left: -10,
              zIndex: 1000
            }}
          >
            <LocalShippingIcon
              sx={{
                width: 20,
                height: 20,
                cursor: 'pointer'
              }}
            />
          </div>
        </animated.div>
      }
    </>
  );
};

interface IAnimationGrid {
  moment: TMoment | undefined;
  openVehiclePopup: (vehicle: TVehicle) => void;
}

export const AnimationGrid = ({ moment, openVehiclePopup }: IAnimationGrid) => {

  const gridCells = Array.from({ length: (GRID_ROWS + 1) * (GRID_COLS + 1) }, (_, index) => {
    const row = Math.floor(index / (GRID_COLS + 1));
    const col = index % (GRID_COLS + 1);
    return {
      position: {
        x: col * CELL_SIZE,
        y: row * CELL_SIZE
      }
    };
  });

  return (
    <>
      <div style={{ 
        position: 'relative',
        top: '0px',
        left: '0px',
        zIndex: 1000
      }}>
        {
          moment !== undefined ? moment.activeVehicles.map((v) => {
            return (
              <Car
                key={v.id} 
                vehicle={v} 
                openVehiclePopup={openVehiclePopup}
              />
            )
          }) : null
        }
      </div>
      <div 
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 15px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 15px)`,
          zIndex: 0
        }}
      >
        {
          gridCells.map((cell, index) => 
            <div 
              style={{
                backgroundColor: 'white',
                border: `0.5px solid rgb(231, 231, 231)`,
                zIndex: 0
              }}
            />)
        }
        {
          gridCells.map(({ position: { x, y } }, index) => {
            let color = moment === undefined ? ((x == 45*CELL_SIZE && y == 30*CELL_SIZE) ? colorConfigs.dots.depot : colorConfigs.dots.normal) :
                        ((x == 45*CELL_SIZE && y == 30*CELL_SIZE) 
                        ? colorConfigs.dots.depot 
                        : (moment?.activePacks.some((p) => {
                          return p.location.x*CELL_SIZE == x && p.location.y*CELL_SIZE == y;
                        }) ? colorConfigs.dots.pack
                            : (moment?.activeBlockages.some((b) => {
                              return b.node.x*CELL_SIZE == x && b.node.y*CELL_SIZE == y;  
                            })) ? colorConfigs.dots.block : colorConfigs.dots.normal))
            return (
              <div
                style={{
                  position: 'absolute',
                  width: color == colorConfigs.dots.normal ? 5 : 7,
                  height: color == colorConfigs.dots.normal ? 5 : 7,
                  backgroundColor: color,
                  borderRadius: 20,
                  top: color == colorConfigs.dots.normal ? y-2.5 : y-3.5,
                  left: color == colorConfigs.dots.normal ? x-2.5 : x-3.5
                }}
              >
              </div>
            )
          })
        }
      </div>
    </>
  );
};