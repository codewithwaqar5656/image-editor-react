import React, { useState } from 'react';
import './style/main.scss';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { GrRotateLeft, GrRotateRight } from 'react-icons/gr';
import { CgMergeVertical, CgMergeHorizontal } from 'react-icons/cg';
import { IoMdUndo, IoMdRedo, IoIosImage } from 'react-icons/io';
import axios from 'axios'; // Import Axios
import storeData from './LinkedList';

const Main = () => {
  const filterElement = [
    {
      name: 'brightness',
      maxValue: 200,
    },
    {
      name: 'grayscale',
      maxValue: 200,
    },
    {
      name: 'sepia',
      maxValue: 200,
    },
    {
      name: 'saturate',
      maxValue: 200,
    },
    {
      name: 'contrast',
      maxValue: 200,
    },
    {
      name: 'hueRotate',
    },
  ];

  const [property, setProperty] = useState({
    name: 'brightness',
    maxValue: 200,
  });

  const [details, setDetails] = useState('');
  const [crop, setCrop] = useState('');
  const [state, setState] = useState({
    image: '',
    brightness: 100,
    grayscale: 0,
    sepia: 0,
    saturate: 100,
    contrast: 100,
    hueRotate: 0,
    rotate: 0,
    vartical: 1,
    horizental: 1,
  });

  const [density, setDensity] = useState(null);
  const [sharpImage, setSharpImage] = useState(null);

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const leftRotate = () => {
    setState({
      ...state,
      rotate: state.rotate - 90,
    });

    const stateData = { ...state };
    storeData.insert(stateData);
  };

  const rightRotate = () => {
    setState({
      ...state,
      rotate: state.rotate + 90,
    });
    const stateData = { ...state };
    storeData.insert(stateData);
  };

  const varticalFlip = () => {
    setState({
      ...state,
      vartical: state.vartical === 1 ? -1 : 1,
    });
    const stateData = { ...state };
    storeData.insert(stateData);
  };

  const horizentalFlip = () => {
    setState({
      ...state,
      horizental: state.horizental === 1 ? -1 : 1,
    });
    const stateData = { ...state };
    storeData.insert(stateData);
  };

  const redo = () => {
    const data = storeData.redoEdit();
    if (data) {
      setState(data);
    }
  };

  const undo = () => {
    const data = storeData.undoEdit();
    if (data) {
      setState(data);
    }
  };

  const imageHandle = (e) => {
    if (e.target.files.length !== 0) {
      const reader = new FileReader();

      reader.onload = () => {
        setState({
          ...state,
          image: reader.result,
        });

        const stateData = {
          image: reader.result,
          brightness: 100,
          grayscale: 0,
          sepia: 0,
          saturate: 100,
          contrast: 100,
          hueRotate: 0,
          rotate: 0,
          vartical: 1,
          horizental: 1,
        };
        storeData.insert(stateData);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const imageCrop = () => {
    const canvas = document.createElement('canvas');
    const scaleX = details.naturalWidth / details.width;
    const scaleY = details.naturalHeight / details.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      details,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const base64Url = canvas.toDataURL('image/jpg');

    setState({
      ...state,
      image: base64Url,
    });
  };

  const saveImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = details.naturalHeight;
    canvas.height = details.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.filter = `brightness(${state.brightness}%) brightness(${state.brightness}%) sepia(${state.sepia}%) saturate(${state.saturate}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) hue-rotate(${state.hueRotate}deg)`;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.scale(state.vartical, state.horizental);

    ctx.drawImage(
      details,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );

    const link = document.createElement('a');
    link.download = 'image_edit.jpg';
    link.href = canvas.toDataURL();
    link.click();
  };

  const postData = async () => {
    try {
      const metadataApiUrl = 'https://d012-59-103-23-21.ngrok-free.app/metadata';

      // Prepare the data to be sent in the request body
      const postData = {
        image: state.image,
        brightness: state.brightness,
        grayscale: state.grayscale,
        sepia: state.sepia,
        saturate: state.saturate,
        contrast: state.contrast,
        hueRotate: state.hueRotate,
        rotate: state.rotate,
        vartical: state.vartical,
        horizental: state.horizental,
      };

      // Make the POST request to metadata API using Axios
      const metadataResponse = await axios.post(metadataApiUrl, postData);

      // Log the entire metadata response object to inspect its structure
      console.log('Metadata Response:', metadataResponse);

      // You can access the density property if it exists in the response
      const responseDensity = metadataResponse.data?.density;
      console.log('Density:', responseDensity);

      // Update the state with the density value
      setDensity(responseDensity);

      // Make the POST request to sharp API using Axios
      const sharpApiUrl = 'https://d012-59-103-23-21.ngrok-free.app/sharp';
      const sharpResponse = await axios.post(sharpApiUrl, postData);

      // Handle the response from sharp API
      console.log('Sharp Response:', sharpResponse);

      // Check if the 'url' property exists in the sharp response
      const sharpImageUrl = sharpResponse.data?.url;

      if (sharpImageUrl) {
        console.log('Sharp Image URL:', sharpImageUrl);

        // Update the state with the sharp image URL
        setSharpImage(sharpImageUrl);
      } else {
        console.error('Sharp Image URL is undefined in the response.');
      }

      // You can add any further logic based on the sharp API response if needed
    } catch (error) {
      // Handle errors
      console.error('Error:', error.message);
    }
  };

  return (
    <div className='image_editor'>
      <div className="card">
        <div className="card_header">
          <h2>------ Image Editor ------</h2>
        </div>
        <div className="card_body">
          <div className="sidebar">
            <div className="side_body">
              <div className="filter_section">
                <span>Filters</span>
                <div className="filter_key">
                  {filterElement.map((v, i) => (
                    <button
                      className={property.name === v.name ? 'active' : ''}
                      onClick={() => setProperty(v)}
                      key={i}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter_slider">
                <div className="label_bar">
                  <label htmlFor="range">Rotate</label>
                  <span>100%</span>
                </div>
                <input
                  name={property.name}
                  onChange={inputHandle}
                  value={state[property.name]}
                  max={property.maxValue}
                  type="range"
                />
              </div>
              <div className="rotate">
                <label htmlFor="">Rotate & Filp</label>
                <div className="icon">
                  <div onClick={leftRotate}>
                    <GrRotateLeft />
                  </div>
                  <div onClick={rightRotate}>
                    <GrRotateRight />
                  </div>
                  <div onClick={varticalFlip}>
                    <CgMergeVertical />
                  </div>
                  <div onClick={horizentalFlip}>
                    <CgMergeHorizontal />
                  </div>
                </div>
              </div>
            </div>
            <div className="reset">
              <button onClick={saveImage}>Save Image</button>
              <button onClick={postData}>Send POST Request</button>
              {density !== null && (
                <div>
                  <strong>Density:</strong> {density}
                </div>
              )}
              {sharpImage && (
                <div>
                  <strong>Sharp Image:</strong>
                  <img src={sharpImage} alt="SharpImage" />
                </div>
              )}
            </div>
          </div>
          <div className="image_section">
            <div className="image">
              {state.image ? (
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
                  <div className="image-container">
                    <img
                      onLoad={(e) => setDetails(e.currentTarget)}
                      style={{
                        filter: `brightness(${state.brightness}%) brightness(${state.brightness}%) sepia(${state.sepia}%) saturate(${state.saturate}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) hue-rotate(${state.hueRotate}deg)`,
                        transform: `rotate(${state.rotate}deg) scale(${state.vartical},${state.horizental})`,
                      }}
                      src={state.image}
                      alt=""
                    />
                  </div>
                </ReactCrop>
              ) : (
                <label htmlFor="choose">
                  <IoIosImage />
                  <span>Choose Image</span>
                </label>
              )}
            </div>
            <div className="image_select">
              <button onClick={undo} className='undo'>
                <IoMdUndo />
              </button>
              <button onClick={redo} className='redo'>
                <IoMdRedo />
              </button>
              {crop && (
                <button onClick={imageCrop} className='crop'>
                  Crop Image
                </button>
              )}
              <label htmlFor="choose">Choose Image</label>
              <input onChange={imageHandle} type="file" id='choose' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
