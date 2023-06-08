import { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { TMoment, TMovement, TVehicle, VehicleType } from '../test/movements';
import { FaCarSide, FaMotorcycle } from 'react-icons/fa';
import colorConfigs from '../configs/colorConfigs';

const GRID_COLS = 70;
const GRID_ROWS = 50;
const CELL_SIZE = 12;

interface CarProps {
  vehicle: TVehicle;
  openVehiclePopup: (vehicle: TVehicle) => void;
  speed: number;
}

const Car = ({ vehicle, openVehiclePopup, speed }: CarProps) => {
  const { from , to } = vehicle.movement as TMovement;

  const springs = useSpring({
    config: { duration: 1000/speed },
    from: { x: from!.x*CELL_SIZE, y: from!.y*CELL_SIZE },
    to: { x: to!.x*CELL_SIZE, y: to!.y*CELL_SIZE }
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
              top: '-10px',
              left: '-10px',
              zIndex: 1000,
              cursor: 'pointer'
            }}
          >
            {vehicle.type == VehicleType.auto ?
              vehicle.movement!.from!.x == vehicle.movement!.to!.x && vehicle.movement!.from!.y == vehicle.movement!.to!.y?
              <FaCarSide
                size={15}
                color="red"
                sx={{
                  cursor: 'pointer'
                }}
              /> :
              <FaCarSide
                size={15}
                sx={{
                  cursor: 'pointer'
                }}
              /> :
              vehicle.movement!.from!.x == vehicle.movement!.to!.x && vehicle.movement!.from!.y == vehicle.movement!.to!.y?
              <FaMotorcycle
                size={15}
                color= "red"
                sx={{
                  cursor: 'pointer'
                }}
              /> :
              <FaMotorcycle
                size={15}
                sx={{
                  cursor: 'pointer'
                }}
              />
            }
          </div>
        </animated.div>
      }
    </>
  );
};

interface IAnimationGrid {
  moment: TMoment | undefined;
  openVehiclePopup: (vehicle: TVehicle) => void;
  speed: number;
}

export const AnimationGrid = ({ moment, openVehiclePopup, speed }: IAnimationGrid) => {

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
                speed={speed}
              />
            )
          }) : null
        }
      </div>
      <div 
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
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
                              return b.node.x*CELL_SIZE == x && b.node.y*CELL_SIZE == y || b.secondNode.x*CELL_SIZE == x && b.secondNode.y*CELL_SIZE == y;  
                            })) ? colorConfigs.dots.block : colorConfigs.dots.normal))
            return (
              <div
                style={{
                  position: 'absolute',
                  width: color == colorConfigs.dots.normal ? 5 : 10,
                  height: color == colorConfigs.dots.normal ? 5 : 10,
                  backgroundColor: color,
                  borderRadius: 20,
                  top: color == colorConfigs.dots.normal ? y-2.5 : y-5,
                  left: color == colorConfigs.dots.normal ? x-2.5 : x-5
                }}
              >
              </div>
            )
          })
        }
        {
          moment !== undefined ? moment.activeVehicles.map( (v) => {
            if(v.route!= null && v.route!=undefined){
              return v.route.chroms.map((c)=>{
                let color = colorConfigs.dots.route;
                return (<div
                  style={{
                    position: 'absolute',
                    width: c.from.x - c.to.x == 0 ? 5 : CELL_SIZE,
                    height: c.from.y - c.to.y == 0 ? 5 : CELL_SIZE,
                    backgroundColor: color,
                    //borderRadius: 2,
                    top: c.from.y-c.to.y == 0 ? c.from.y*CELL_SIZE-2.5:(c.from.y<c.to.y?c.from.y*CELL_SIZE:c.to.y*CELL_SIZE),
                    left: c.from.x - c.to.x == 0 ? c.from.x*CELL_SIZE-2.5 : (c.from.x<c.to.x?c.from.x*CELL_SIZE:c.to.x*CELL_SIZE)
                  }}
                />)
              })
            }else{
              return (<></>);
            }
          }) : null
        }
        {
          moment !== undefined ? moment.activeBlockages.map( (b) => {
            return (<div
              style={{
                position: 'absolute',
                width: b.node.x - b.secondNode.x == 0 ? 5 : Math.abs(b.node.x - b.secondNode.x)*CELL_SIZE,
                height: b.node.y - b.secondNode.y == 0 ? 5 : Math.abs(b.node.y - b.secondNode.y)*CELL_SIZE,
                backgroundColor: colorConfigs.dots.block,
                //borderRadius: 2,
                top: b.node.y-b.secondNode.y == 0 ? b.node.y*CELL_SIZE-2.5:(b.node.y<b.secondNode.y?b.node.y*CELL_SIZE:b.secondNode.y*CELL_SIZE),
                left: b.node.x - b.secondNode.x == 0 ? b.node.x*CELL_SIZE-2.5 : (b.node.x<b.secondNode.x?b.node.x*CELL_SIZE:b.secondNode.x*CELL_SIZE)
              }}
            />)
          }) : null
        }
      </div>
    </>
  );
};