import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { FaWindowClose } from 'react-icons/fa';
import '../assets/drop-file-input.css';

interface IDropzoneComponent {
  onFileChange: (updatedList: any[], type: string) => void;
  type: string;
  files: any[];
}

export const DropzoneComponent = ({ onFileChange, type, files }: IDropzoneComponent) => {
  const [fileList, setFileList] = useState<any[]>(files);
  const [dragging, setDragging] = useState<boolean>(false);

  const onFileDrop = (e: any) => {
    e.preventDefault();
    if (e.target.files) {
      const allowedFiles = [...e.target.files].filter((f: any) => f.type == 'text/plain');
      const updatedList = [...fileList, ...allowedFiles];
      setFileList(updatedList);
      onFileChange(updatedList, type);
    }
  }

  const fileRemove = (file: any) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
    onFileChange(updatedList, type);
  }

  return (
    <>
      <Box
        className={`drop-file-input ${dragging ? 'dragover' : ''}`}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
      >
        <Box className="drop-file-input__label">
          <Typography>Arrastra y suelta archivos aquí</Typography>
        </Box>
        <input type="file" multiple onChange={onFileDrop} accept=".txt" />
      </Box>
      {
        fileList.length > 0 ? (
          <Box className="drop-file-preview">
            {
              fileList.map((item, index) => (
                <Box key={index} className="drop-file-preview__item">
                  <Box className="drop-file-preview__item__info">
                    <Box>
                      <Typography sx={{fontSize: '15px'}}>{item.name}</Typography>
                    </Box>
                    <Box>
                      <span className="drop-file-preview__item__del" onClick={() => fileRemove(item)}>
                        <FaWindowClose />
                      </span>
                    </Box>
                  </Box>
                </Box>
              ))
            }
          </Box>
        ) : null
      }
    </>
  );
}
