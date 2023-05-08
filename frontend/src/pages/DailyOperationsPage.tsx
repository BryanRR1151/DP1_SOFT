import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { Button } from '@mui/material'
 
type Translation = {
  x: number;
  opacity: number;
};

type AnimatedProps = {
  from: Translation;
  to: Translation;
};

const AnimatedObject = () => {
  const translations = [{ x: 0, opacity: 1 }, { x: 50, opacity: 1 }, { x: 100, opacity: 1 }];

  const config = {
    duration: 1000,
  };

  const [animatedProps, set] = useSpring<any>(() => ({
    from: translations[0],
    to: translations[0],
    config,
  }));

  useEffect(() => {
    let i = 1;
    const intervalId = setInterval(() => {
      if(i == 2) clearInterval(intervalId);
      set({
        from: translations[i-1],
        to: translations[i],
        config,
      });
      i = (i + 1) % translations.length;
    }, config.duration);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <animated.div style={animatedProps}>
      <div
        style={{
          width: 10,
          height: 10,
          backgroundColor: '#000'
        }}
      >
      </div>
    </animated.div>
  );
};

type TObject = {
  key: number;
}

export const DailyOperationsPage = () => {

  const [objects, setObjects] = useState<TObject[]>([{key: 1}]);
  const [key, setKey] = useState<number>(1);

  const handleAdd = () => {
    setKey(key+1);
    setObjects([...objects, {key: key+1}])
  }

  return (
    <>
      <Button
        variant='contained'
        color='secondary'
        onClick={handleAdd}
      >
        Añadir
      </Button>
      {
        objects.map((o) => {
          return (
            <AnimatedObject key={o.key}/>
          )
        }) 
      }
    </>
  )
}