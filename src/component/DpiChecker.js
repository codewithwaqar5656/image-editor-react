import React, { useState } from 'react';
import ImageJS from 'image-js';
const DpiChecker = ({ onImageChange }) => {
  const [dpi, setDpi] = useState(null);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const image = await ImageJS.Image.load(file);
        const dpiX = image.metaData.density ? image.metaData.density[0] : null;
        const dpiY = image.metaData.density ? image.metaData.density[1] : null;
        setDpi({ x: dpiX, y: dpiY });
      } catch (error) {
        console.error('Error reading image:', error);
      }
    }
  };
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {dpi && (
        <div>
          <p>DPI (X): {dpi.x}</p>
          <p>DPI (Y): {dpi.y}</p>
        </div>
      )}
    </div>
  );
};
export default DpiChecker;