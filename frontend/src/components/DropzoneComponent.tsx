import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../assets/drop-file-input.css';

interface IDropzoneComponent {
  onFileChange: (updatedList: any[]) => void;
}

export const DropzoneComponent = ({ onFileChange }: IDropzoneComponent) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);

  const onFileDrop = (e: any) => {
      if (e.target.files) {
          const updatedList = [...fileList, ...e.target.files];
          setFileList(updatedList);
          onFileChange(updatedList);
      }
  }

  const fileRemove = (file: any) => {
      const updatedList = [...fileList];
      updatedList.splice(fileList.indexOf(file), 1);
      setFileList(updatedList);
      onFileChange(updatedList);
  }

  return (
    <>
      <div
        className={`drop-file-input ${dragging ? 'dragover' : ''}`}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
      >
        <div className="drop-file-input__label">
          <p>Drag & Drop your files here</p>
        </div>
        <input type="file" multiple value="" onChange={onFileDrop}/>
      </div>
      {
        fileList.length > 0 ? (
          <div className="drop-file-preview">
            <p className="drop-file-preview__title">
              Ready to upload
            </p>
            {
              fileList.map((item, index) => (
                <div key={index} className="drop-file-preview__item">
                  <div className="drop-file-preview__item__info">
                    <p>{item.name}</p>
                    <p>{item.size}B</p>
                  </div>
                  <span className="drop-file-preview__item__del" onClick={() => fileRemove(item)}>x</span>
                </div>
              ))
            }
          </div>
        ) : null
      }
    </>
  );
}
