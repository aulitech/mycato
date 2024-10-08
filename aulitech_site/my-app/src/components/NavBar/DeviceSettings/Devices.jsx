import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../../firebase';
import debounce from 'lodash.debounce';
import { /*collection, getDocs, query, where,*/ updateDoc, doc, deleteDoc } from 'firebase/firestore';

// styles
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { KeyOptions, getKeyOption } from './KeyOptions';
import { fetchAndCompareConfig, overwriteConfigFile, /*deleteConfigFileIfExists */ } from '../RegisterDevices/ReplaceConfig';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// images
import flatImage from '../images/flatImage.png';
import leftImage from '../images/leftImage.png';
import rightImage from '../images/rightImage.png';

// classes

const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// ToolTip must be used with a parent element that has the class 'group'
const ToolTip = ({ tip }) => {
  return (
    <span className="flex pointer-events-none absolute -top-6 left-4 px-2 py-0.5 rounded-md text-xs bg-slate-500 text-white w-max opacity-0 transition-opacity group-hover:opacity-100 delay-[1500ms]">
      {tip}
    </span>
  )
}

const PlusButton = ({ onClick }) => {
  return (
    <button className=" px-2 rounded-md "
      onClick={onClick}>
      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60.364 60.364"
        className="stroke-green-600 fill-green-600 h-3 w-3 hover:h-4 hover:w-4">
        <g>
          <path d="M54.454,23.18l-18.609-0.002L35.844,5.91C35.845,2.646,33.198,0,29.934,0c-3.263,0-5.909,2.646-5.909,5.91v17.269L5.91,23.178C2.646,23.179,0,25.825,0,29.088c0.002,3.264,2.646,5.909,5.91,5.909h18.115v19.457c0,3.267,2.646,5.91,5.91,5.91c3.264,0,5.909-2.646,5.91-5.908V34.997h18.611c3.262,0,5.908-2.645,5.908-5.907C60.367,25.824,57.718,23.178,54.454,23.18z" />
        </g>
      </svg>
    </button>
  );
};

const EditIcon = ({ onClick }) => {
  return (
    <button className="px-2 rounded-md"
      onClick={onClick}>
      <svg data-name="Layer 1" id="Layer_1" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"
        className="stroke-green-600 fill-green-600 h-3 w-3 hover:h-4 hover:w-4">
        <path d="M51.41,13.08,39,.66A2,2,0,0,0,37.59.08a2,2,0,0,0-1.42.58l-30,30h0L4.43,32.41a2,2,0,0,0-.54,1L.05,49.46a2,2,0,0,0,2,2.46,1.61,1.61,0,0,0,.44-.05L18.7,48.19a2.08,2.08,0,0,0,1-.54l1.76-1.76h0l30-30A2,2,0,0,0,51.41,13.08ZM4.69,47.26,7.63,34.92l9.52,9.52ZM20,41.65l-9.59-9.59L37.59,4.91l9.58,9.58Z" /><path d="M17.61,31.64a2,2,0,0,0,0,2.83,2,2,0,0,0,2.83,0L40,14.91a2,2,0,0,0-2.82-2.83Z" />
      </svg>
    </button>
  );
};

const SaveButton = ({ handler }) => {
  return (
    <button
      onClick={handler}
      className="p-2 text-xs stroke-green-700" >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        className="w-4 h-4  hover:w-5 hover:h-5 stroke-[1.5] fill-none">
        <g><g><g><path d="M24.1281738,35.2246094c-2.8320313,0-5.6640625-1.078125-7.8203125-3.2338867L6.1599121,21.8422852l15.640625-15.640625     l10.1484375,10.1479492c4.3120117,4.3120117,4.3120117,11.3286133,0,15.6411133l0,0     C29.7927246,34.1464844,26.9606934,35.2246094,24.1281738,35.2246094z M8.9880371,21.8422852l8.7338867,8.734375     c3.5336914,3.5327148,9.2807617,3.5317383,12.8125,0l0.7070313,0.7070313l-0.706543-0.7070313     c3.5317383-3.5327148,3.5317383-9.2802734,0-12.8129883l-8.734375-8.7338867L8.9880371,21.8422852z" /></g></g><g><g><path d="M10.4470215,20.4389648l-8.527832-8.527832l9.9501953-9.9501953l8.5273438,8.527832L10.4470215,20.4389648z      M4.7473145,11.9111328l5.699707,5.699707l7.121582-7.1220703l-5.6992188-5.699707L4.7473145,11.9111328z" /></g></g><g><g><rect height="3.0183239" transform="matrix(0.7071068 -0.7071068 0.7071068 0.7071068 -3.0814509 11.4039812)" width="1.9997864" x="11.2252045" y="7.9124689" /></g></g><g><g><rect height="3.0183239" transform="matrix(0.7071068 -0.7071068 0.7071068 0.7071068 -5.9266658 10.2254543)" width="1.9997864" x="8.3799896" y="10.7576838" /></g></g><g><g><path d="M48.5856934,50.0390625l-2.8930664-3.2558594c-1.4135742-1.5908203-3.3476563-2.6635742-5.4458008-3.0205078     c-4.5957031-0.7817383-8.2133789-4.2290039-9.215332-8.7822266l-0.7666016-3.4819336l1.953125-0.4296875l0.7666016,3.4819336     c0.8261719,3.7539063,3.8085938,6.5957031,7.5976563,7.2402344c2.5449219,0.4331055,4.890625,1.734375,6.6054688,3.6640625     l2.8930664,3.2558594L48.5856934,50.0390625z" /></g></g></g>
      </svg>
    </button>
  )
}

const DeleteButton = ({ handler }) => {
  return (
    <button
      onClick={handler}
      className="p-2 stroke-red-700" >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-4 h-4 hover:w-5 hover:h-5 stroke-[1.5] fill-none">
        <path d="M6,12v15c0,1.654,1.346,3,3,3h14c1.654,0,3-1.346,3-3V12H6z M12,25c0,0.552-0.448,1-1,1s-1-0.448-1-1v-9  c0-0.552,0.448-1,1-1s1,0.448,1,1V25z M17,25c0,0.552-0.448,1-1,1s-1-0.448-1-1v-9c0-0.552,0.448-1,1-1s1,0.448,1,1V25z M22,25  c0,0.552-0.448,1-1,1s-1-0.448-1-1v-9c0-0.552,0.448-1,1-1s1,0.448,1,1V25z" id="XMLID_237_" /><path d="M27,6h-6V5c0-1.654-1.346-3-3-3h-4c-1.654,0-3,1.346-3,3v1H5C3.897,6,3,6.897,3,8v1c0,0.552,0.448,1,1,1h24  c0.552,0,1-0.448,1-1V8C29,6.897,28.103,6,27,6z M13,5c0-0.551,0.449-1,1-1h4c0.551,0,1,0.449,1,1v1h-6V5z" id="XMLID_243_" />
      </svg>
    </button>
  )
}

const HardwareUIDField = ({ hardwareUID }) => {
  return (
    <div className='flex-col'>
      <p className='text-xs font-bold'>Hardware ID</p>
      <p className='text-sm'>{hardwareUID}</p>
    </div>
  );
};

const getCurrentUserId = () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userId = currentUser.uid;
    return userId;
  } else {
    return null;
  }
};


const DarkYellowSlider = styled(Slider)(({ theme }) => ({
  color: '#B8860B',
  '& .MuiSlider-thumb': {
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark' ? 'rgb(218 165 32 / 16%)' : 'rgb(218 165 32 / 16%)'}`,
    },
    '&.Mui-active': {
      boxShadow: `0px 0px 0px 14px ${theme.palette.mode === 'dark' ? 'rgb(218 165 32 / 16%)' : 'rgb(218 165 32 / 16%)'}`,
    },
  },
  '& .MuiSlider-rail': {
    opacity: 0.28,
  },
}));


const EditableCollapsible = ({ title, onChange, children }) => {

  return (

    <details className='group py-2' >
      <summary className='text-sm font-bold pb-2'>
        <input className="hidden group-open:flex text-sm font-bold pb-2" id={title} value={title} onChange={onChange} />
        <span className="group-open:hidden text-sm font-bold pb-2">{title}</span>
      </summary>
      <div className='flex w-full flex-row flex-wrap align-items-baseline gap-x-8 gap-y-4 justify-start'>
        {children}
      </div>
    </details>
  )
}

const Collapsible = ({ title, children }) => {
  return (
    <details open className='py-2' >
      <summary className='text-sm font-bold pb-2'>{title}
      </summary>
      <div className='flex w-full flex-row flex-wrap align-items-baseline gap-x-8 gap-y-4 justify-start'>
        {children}
      </div>
    </details>)
}


const CheckboxOption = ({ checked, onChange, title, description }) => {
  return (
    <div className="flex w-full sm:w-[45%] lg:w-[30%] xl:w-[22%] flex-row gap-x-4 items-baseline justify-start group relative">
      <label
        htmlFor={title + '_checkbox'}
        className='pb-1 text-xs'
      > {title}
      </label>
      <ToolTip tip={description} />
      <input
        name={title + '_checkbox'}
        className='text-xs'
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};


const InputSlider = ({ value, onChange, min, max, step, sliderTitle, unit, sliderDescription, sliderLabel }) => {
  const [sliderValue, setSliderValue] = useState(value || 0);
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (event) => {
    const newValue = event.target.value === '' ? '' : Number(event.target.value);
    setInputValue(newValue);
  };

  const handleInputCommit = (event) => {
    let newValue = event.target.value === '' ? min : Number(event.target.value);
    newValue = newValue < min ? min : newValue > max ? max : newValue;
    setInputValue(newValue);
    setSliderValue(newValue);
    onChange({ target: { value: newValue } });
  };

  useEffect(() => {
    setSliderValue(value || 0);
  }, [value]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    setInputValue(newValue);
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    if (onChange) {
      onChange({ target: { value: newValue } });
    }
  };

  return (
    <div className="flex w-full sm:w-[45%] lg:w-[30%] xl:w-[22%] flex-col align-center justify-between">
      <div className="flex flex-row w-fit align-center justify-left gap-x-1 group relative">
        <label
          htmlFor={sliderLabel}
          className='flex font-normal pb-1  text-xs'
        > {sliderTitle}
        </label>
        <p className='flex text-xs'>({unit})</p>
        <ToolTip tip={sliderDescription} />
      </div>

      <div className='flex w-full flex-row align-baseline justify-start gap-x-1'>

        <input
          className='flex-none w-12 h-5 p-0 text-xs focus:font-bold text-end bg-slate-200 rounded-md'
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputCommit}
          min={min}
          max={max}
          step={step}
        />


        <div className='flex-1 px-2'>
          <DarkYellowSlider
            id={sliderLabel}
            value={sliderValue}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            aria-labelledby={sliderLabel}
            valueLabelDisplay="off"
            step={step}
            min={min}
            max={max}
          />
        </div>
      </div>
    </div>
  );
};

const Dropdown = ({ value, onChange, title, description, options }) => {
  const formattedOptions = options.map((option) =>
    typeof option === 'object' ? option : { value: option, label: option.toString() }
  );

  return (
    <div className="flex w-fit flex-row align-center gap-x-2 justify-start">
      <div className="flex flex-row w-fit align-center justify-left  group relative">
        <label
          htmlFor={title + '_dropdown'}
          className='flex appearance-none text-xs'>
        </label>{title}
        <ToolTip tip={description} />

        <select className='bg-transparent rounded-md text-xs hover:text-sm hover:font-bold hover:italic hover:bg-slate-600 hover:text-yellow-400 flex w-fit appearance-none focus:outline-none'
          name="title + '_dropdown'" id="title + '_dropdown'" onChange={onChange} value={value}>
          {formattedOptions.map((option) => ( //map through options
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}


const Devices = ({ devices }) => {
  const editButtonRef = useRef(null);
  const inputRef = useRef(null);

  const [originalConnectionName, setOriginalConnectionName] = useState('');

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editedConnectionName, setEditedConnectionName] = useState('');
  const popupRef = useRef();

  const [editingConnectionIndex, setEditingConnectionIndex] = useState(null);
  const [temporaryConnectionName, setTemporaryConnectionName] = useState('');

  const { deviceName } = useParams();
  const navigate = useNavigate();

  const [isUniversalSettingsExpanded, setIsUniversalSettingsExpanded] = useState(true);
  const [isConnectionsExpanded, setIsConnectionsExpanded] = useState(true);

  const [editedGlobalSettings, setEditedGlobalSettings] = useState(null);
  const [editedConnectionsSettings, setEditedConnectionsSettings] = useState(null);
  const [connectionsList, setConnectionsList] = useState([]);

  const toggleUniversalSettings = () => {
    setIsUniversalSettingsExpanded(!isUniversalSettingsExpanded);
  };

  const toggleConnections = () => {
    setIsConnectionsExpanded(!isConnectionsExpanded);
  };

  const thisDevice = devices.find(device => device.data.device_info.device_nickname === deviceName);

  const handleRegisterInterface = () => {
    navigate(`/devices/${deviceName}/register-interface`);
  };

  const startEditing = (connection, index) => {
    setOriginalConnectionName(connection.name);
    setTemporaryConnectionName(connection.name);
    setEditingConnectionIndex(index);
  };

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target) &&
      editButtonRef.current && !editButtonRef.current.contains(event.target)) {
      setTemporaryConnectionName(originalConnectionName);
      setEditingConnectionIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [originalConnectionName]);


  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
  };

  const handleSaveEditedName = async () => {
    if (editingConnectionIndex === null) {
      console.error("No connection selected for editing");
      return;
    }

    console.log("Saving edited name for index:", editingConnectionIndex);

    const updatedConnections = [...connectionsList];
    updatedConnections[editingConnectionIndex] = {
      ...updatedConnections[editingConnectionIndex],
      name: temporaryConnectionName,
    };

    setConnectionsList(updatedConnections);
    setEditedConnectionsSettings(updatedConnections);

    setEditingConnectionIndex(null);
    setTemporaryConnectionName('');

    try {
      const userId = getCurrentUserId();
      const userCatoDocRef = doc(db, "users", userId, "userCatos", thisDevice.id);

      await updateDoc(userCatoDocRef, {
        connections: updatedConnections
      });

      console.log("Connection name updated successfully in Firestore");
      closeEditPopup();
    } catch (error) {
      console.error("Error updating connection name in Firestore: ", error);
    }

  };

  const DeviceNameField = ({ intialDeviceName, onNameChange }) => {
    const [editedDeviceName, setEditedDeviceName] = useState(intialDeviceName);

    const handleNameChange = (event) => {
      setEditedDeviceName(event.target.value);
    };

    const handleNameCommit = (event) => {
      onNameChange(event.target.value);
    }

    return (
      <div className="flex-col" >
        <p className='text-xs font-bold'>Device Name</p>
        <input
          className='text-base bg-transparent rounded-md focus:outline-none hover:text-yellow-600 hover:font-bold focus:font-bold focus:italic focus:bg-slate-600 focus:text-yellow-600'
          value={editedDeviceName}
          onChange={handleNameChange}
          onBlur={handleNameCommit}
          type="text"
          placeholder="Device Name"
        />
      </div>
    );
  };

  const handleGlobalConfigChange = (keyList) => {
    return debounce((value) => {
      const newEditedGlobalSettings = deepCopy(editedGlobalSettings);
      let currentConfig = newEditedGlobalSettings;
      for (let i = 0; i < keyList.length - 1; i++) {
        currentConfig = currentConfig[keyList[i]];
      }
      currentConfig[keyList[keyList.length - 1]] = value;
      setEditedGlobalSettings(newEditedGlobalSettings);
    }, 100);

  };

  const handleConnectionDeletion = async (connectionName) => {
    if (!thisDevice || !connectionName) {
      console.error("Device or connection name not provided");
      return;
    }

    // Prompt the user for confirmation
    const confirmed = window.confirm(
      "Deleting the connection removes it from your cloud database. Press Save after deleting to update Cato. Are you sure you want to delete this connection?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const userId = getCurrentUserId();
      const userCatoDocRef = doc(db, "users", userId, "userCatos", thisDevice.id);

      //find connection to delete
      const updatedConnections = editedConnectionsSettings.filter(conn => conn.name !== connectionName);

      //firebase
      await updateDoc(userCatoDocRef, {
        'connections': updatedConnections

      });

      //local states
      setEditedConnectionsSettings(updatedConnections);
      setConnectionsList(updatedConnections);

      console.log("Connection deleted successfully");
    } catch (error) {
      console.error("Error deleting connection: ", error);
    }
  };

  // what should happen as soon as we get thisDevice
  useEffect(() => {
    if (thisDevice) {
      // Get the global settings
      const getGlobalSettings = async () => {
        let globalSettingsString = thisDevice["data"]["device_info"]["global_config"];
        let globalSettings = (JSON.parse(globalSettingsString))["global_info"];
        setEditedGlobalSettings(deepCopy(globalSettings));
      };
      getGlobalSettings();

      const getConnectionsSettings = async () => {
        // make a deep copy of the connections list
        let connectionsList = thisDevice["data"]["connections"];
        setEditedConnectionsSettings(deepCopy(connectionsList));
      };
      getConnectionsSettings();
    }
  }, [thisDevice]);

  useEffect(() => {
    if (editedConnectionsSettings) {
      const getConnectionsList = async () => {
        let connectionsList = [];
        for (let i = 0; i < editedConnectionsSettings.length; i++) {
          let connection = editedConnectionsSettings[i]; // pass the reference to each connection into the list
          connectionsList.push(connection);
        }
        setConnectionsList(connectionsList);
      };
      getConnectionsList();
    };
  }, [editedConnectionsSettings]);

  const GlobalInfoSection = () => {

    if (!editedGlobalSettings) {
      return <div>Loading...</div>;
    }

    const handleDeviceNameChange = (value) => {
      const newEditedGlobalSettings = deepCopy(editedGlobalSettings);
      newEditedGlobalSettings["name"]["value"] = value;
      setEditedGlobalSettings(newEditedGlobalSettings);
    }

    const OrientationSection = () => {
      const [selectedOrientation, setSelectedOrientation] = useState('');

      useEffect(() => {
        const fetchedOrientation = editedGlobalSettings.orientation.value;
        const orientationKey = Object.keys(orientations).find(key =>
          JSON.stringify(orientations[key].config) === JSON.stringify(fetchedOrientation)
        );
        setSelectedOrientation(orientationKey);
      }, [editedGlobalSettings.orientation.value]);

      const orientations = {
        flat: {
          config: {
            front: {
              label: "front",
              value: "-x"
            },
            bottom: {
              label: "bottom",
              value: "-z"
            },
            left: {
              label: "left",
              value: "-y"
            }
          },
          image: flatImage
        },
        left: {
          config: {
            front: {
              label: "front",
              value: "+y"
            },
            bottom: {
              label: "bottom",
              value: "-x"
            },
            left: {
              label: "left",
              value: "+z"
            }
          },
          image: leftImage
        },
        right: {
          config: {
            front: {
              label: "front",
              value: "-y"
            },
            bottom: {
              label: "bottom",
              value: "-x"
            },
            left: {
              label: "left",
              value: "-z"
            }
          },
          image: rightImage
        },
      };

      const handleOrientationSelect = (orientationKey) => {
        setSelectedOrientation(orientationKey);

        const orientationConfig = orientations[orientationKey].config;
        const newEditedGlobalSettings = deepCopy(editedGlobalSettings);

        newEditedGlobalSettings.orientation.value = orientationConfig;
        setEditedGlobalSettings(newEditedGlobalSettings);
      };

      return (
        <Collapsible title="Orientation">
          <div className="flex flex-row w-full justify-between align-center">
            {Object.entries(orientations).map(([key, { image }]) => (
              <div className="flex flex-col align-center"
                key={key}
                onClick={() => handleOrientationSelect(key)}
              >
                <img className="object-fill p-1 w-18 h-14" src={image} alt={key} width={200} height={200} />
                <p style={{
                  textAlign: 'center',
                  backgroundColor: selectedOrientation === key ? '#f9da6b' : 'transparent',
                  padding: selectedOrientation === key ? '5px' : '0'
                }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </Collapsible>
      );
    };

    return (
      <div className="flex flex-col overflow-hidden">
        <header className="flex w-full py-4 justify-between align-center border-b-2 border-slate-400">
          <div className="flex w-4/6 justify-between">
            <DeviceNameField intialDeviceName={editedGlobalSettings["name"]["value"]} onNameChange={handleDeviceNameChange} />
            <HardwareUIDField hardwareUID={editedGlobalSettings["HW_UID"]["value"]} />
          </div>
          <div className="flex w-1/6 justify-end">
            <SaveButton handler={handleSave} />
            <DeleteButton handler={handleDeviceDelete} />
          </div>
        </header>
        <div className="flex-1 py-2 overflow-hidden ">

          <OrientationSection />

          <Collapsible title="Sleep">
            <InputSlider
              sliderLabel={'sleepTimeout'}
              value={editedGlobalSettings.sleep.value.timeout.value}
              onChange={(e) => handleGlobalConfigChange(['sleep', 'value', 'timeout', 'value'])(parseInt(e.target.value))}
              min={10}
              max={1200}
              step={10}
              sliderTitle={'Sleep Timeout'}
              unit={'s'}
              sliderDescription={'Seconds before Cato sleeps if no movement is detected'}
            />
            <InputSlider
              sliderLabel={'sleepThreshold'}
              value={editedGlobalSettings["sleep"]["value"]["threshold"]["value"]}
              onChange={(e) => handleGlobalConfigChange(['sleep', 'value', 'threshold', 'value'])(parseFloat(e.target.value))}
              min={2.0}
              max={10.0}
              step={0.5}
              sliderTitle={'Sleep Threshold'}
              unit={'deg/sec'}
              sliderDescription={'Minimum Movement level below which Cato starts counting towards sleep'}
            />
          </Collapsible>

        </div>
      </div>

    )
  };

  const AccordionList = ({ data }) => {

    if (data.length === 0) { //no connections display
      return (
        <div className='justify-center align-center'>
          No connections yet. Add a connection to begin.
        </div>
      );
    }

    const ConnectionAccordion = ({ connection, onDelete, makePrimary, index }) => {
      const [isExpanded, setIsExpanded] = useState(false);

      const [fetchedConnectionConfig, setFetchedConnectionConfig] = useState(null);
      const [editedConnectionConfig, setEditedConnectionConfig] = useState(null);
      const [activeOperationMode, setActiveOperationMode] = useState(connection["current_mode"]);

      const [fetchedGestureMouseConfig, setFetchedGestureMouseConfig] = useState(null);
      const [editedGestureMouseConfig, setEditedGestureMouseConfig] = useState(null);

      const [fetchedTVRemoteConfig, setFetchedTVRemoteConfig] = useState(null);
      const [editedTVRemoteConfig, setEditedTVRemoteConfig] = useState(null);

      const [fetchedPointerConfig, setFetchedPointerConfig] = useState(null);
      const [editedPointerConfig, setEditedPointerConfig] = useState(null);

      const [fetchedClickerConfig, setFetchedClickerConfig] = useState(null);
      const [editedClickerConfig, setEditedClickerConfig] = useState(null);

      useEffect(() => {
        if (connection) {
          // Get the connection settings
          const getConnectionSettings = async () => {
            let connectionSettingsString = connection["connection_config"];
            let connectionSettings = (JSON.parse(connectionSettingsString));
            setFetchedConnectionConfig(deepCopy(connectionSettings));
            setEditedConnectionConfig(connectionSettings);
          };
          getConnectionSettings();
          setActiveOperationMode(connection["current_mode"]);

          const getGestureMouseConfig = async () => {
            let gestureMouseConfigString = connection["mode"]["gesture_mouse"]
            let gestureMouseConfig = (JSON.parse(gestureMouseConfigString));
            setFetchedGestureMouseConfig(deepCopy(gestureMouseConfig));
            setEditedGestureMouseConfig(deepCopy(gestureMouseConfig));
          };
          getGestureMouseConfig();

          const getTVRemoteConfig = async () => {
            let tvRemoteConfigString = connection["mode"]["tv_remote"]
            let tvRemoteConfig = (JSON.parse(tvRemoteConfigString));
            setFetchedTVRemoteConfig(deepCopy(tvRemoteConfig));
            setEditedTVRemoteConfig(deepCopy(tvRemoteConfig));
          };
          getTVRemoteConfig();

          const getPointerConfig = async () => {
            let pointerConfigString = connection["mode"]["pointer"]
            let pointerConfig = (JSON.parse(pointerConfigString));
            setFetchedPointerConfig(deepCopy(pointerConfig));
            setEditedPointerConfig(deepCopy(pointerConfig));
          };
          getPointerConfig();

          const getClickerConfig = async () => {
            let clickerConfigString = connection["mode"]["clicker"]
            let clickerConfig = (JSON.parse(clickerConfigString));
            setFetchedClickerConfig(deepCopy(clickerConfig));
            setEditedClickerConfig(deepCopy(clickerConfig));
          };
          getClickerConfig();
        }
      }, []);

      const toggleIsExpanded = () => {
        setIsExpanded(!isExpanded);
      };

      const handleConnectionConfigChange = (keyList) => {
        return debounce((value) => {
          const newEditedConnectionConfig = deepCopy(editedConnectionConfig);
          let currentConfig = newEditedConnectionConfig;
          for (let i = 0; i < keyList.length - 1; i++) {
            currentConfig = currentConfig[keyList[i]];
          }
          currentConfig[keyList[keyList.length - 1]] = value;
          setEditedConnectionConfig(newEditedConnectionConfig);
        }, 100);
      }

      const handleModeConfigChange = (keyList, mode) => {
        return debounce((value) => {
          if (mode == "gesture_mouse") {
            const newEditedGestureMouseConfig = deepCopy(editedGestureMouseConfig);
            let currentConfig = newEditedGestureMouseConfig;
            for (let i = 0; i < keyList.length - 1; i++) {
              currentConfig = currentConfig[keyList[i]];
            }
            currentConfig[keyList[keyList.length - 1]] = value;
            setEditedGestureMouseConfig(newEditedGestureMouseConfig);
          } else if (mode == "tv_remote") {
            const newEditedTVRemoteConfig = deepCopy(editedTVRemoteConfig);
            let currentConfig = newEditedTVRemoteConfig;
            for (let i = 0; i < keyList.length - 1; i++) {
              currentConfig = currentConfig[keyList[i]];
            }
            currentConfig[keyList[keyList.length - 1]] = value;
            setEditedTVRemoteConfig(newEditedTVRemoteConfig);
          } else if (mode == "pointer") {
            const newEditedPointerConfig = deepCopy(editedPointerConfig);
            let currentConfig = newEditedPointerConfig;
            for (let i = 0; i < keyList.length - 1; i++) {
              currentConfig = currentConfig[keyList[i]];
            }
            currentConfig[keyList[keyList.length - 1]] = value;
            setEditedPointerConfig(newEditedPointerConfig);
          } else if (mode == "clicker") {
            const newEditedClickerConfig = deepCopy(editedClickerConfig);
            let currentConfig = newEditedClickerConfig;
            for (let i = 0; i < keyList.length - 1; i++) {
              currentConfig = currentConfig[keyList[i]];
            }
            currentConfig[keyList[keyList.length - 1]] = value;
            setEditedClickerConfig(newEditedClickerConfig);
          }
        }, 100);
      }

      useEffect(() => {
        connection["current_mode"] = activeOperationMode;
      }, [activeOperationMode]);

      useEffect(() => {
        if (editedConnectionConfig) {
          connection["connection_config"] = JSON.stringify(editedConnectionConfig);
        }
      }, [editedConnectionConfig]);

      useEffect(() => {
        if (editedGestureMouseConfig) {
          connection["mode"]["gesture_mouse"] = JSON.stringify(editedGestureMouseConfig);
        }
      }, [editedGestureMouseConfig]);

      useEffect(() => {
        if (editedTVRemoteConfig) {
          connection["mode"]["tv_remote"] = JSON.stringify(editedTVRemoteConfig);
        }
      }, [editedTVRemoteConfig]);

      useEffect(() => {
        if (editedPointerConfig) {
          connection["mode"]["pointer"] = JSON.stringify(editedPointerConfig);
        }
      }, [editedPointerConfig]);

      useEffect(() => {
        if (editedClickerConfig) {
          connection["mode"]["clicker"] = JSON.stringify(editedClickerConfig);

        }
      }, [editedClickerConfig]);

      const ConnectionSpecificSettings = () => {
        const [collapsedSections, setCollapsedSections] = useState({});

        const toggleSection = (sectionKey) => {
          setCollapsedSections((prevSections) => ({
            ...prevSections,
            [sectionKey]: !prevSections[sectionKey],
          }));
        };

        return (
          <Collapsible title="Screen Size">
            <InputSlider
              sliderLabel={'screenSizeWidth'}
              value={editedConnectionConfig.screen_size.value.width.value}
              onChange={(e) => handleConnectionConfigChange(['screen_size', 'value', 'width', 'value'])(e.target.value)}
              min={640}
              max={8640}
              step={320}
              sliderTitle={"Width"}
              unit={"px"}
              sliderDescription={"Total horizontal pixels"}
            />
            <InputSlider
              sliderLabel={'screenSizeHeight'}
              value={editedConnectionConfig.screen_size.value.height.value}
              onChange={(e) => handleConnectionConfigChange(['screen_size', 'value', 'height', 'value'])(e.target.value)}
              min={480}
              max={4320}
              step={60}
              sliderTitle={"Height"}
              unit={"px"}
              sliderDescription={"Total vertical pixels"}
            />
          </Collapsible>
        );
      };

      const MouseOptions = (config) => {

        return (
          <div>
            <Collapsible title="Linear Scaling">
              <InputSlider
                sliderLabel={'mouseScaleX'}
                value={config.config.mouse.value.scale_x.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'scale_x', 'value'], activeOperationMode)(e.target.value)}
                min={0.1}
                max={4.0}
                step={0.1}
                unit={"multiplier"}
                sliderTitle="Horizontal Scale"
                sliderDescription="Sensitivity to horizontal movement"
              />
              <InputSlider
                sliderLabel={'mouseScaleY'}
                value={config.config.mouse.value.scale_y.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'scale_y', 'value'], activeOperationMode)(e.target.value)}
                min={0.1}
                max={4.0}
                step={0.1}
                unit={"multiplier"}
                sliderTitle="Vertical Scale"
                sliderDescription="Sensitivity to vertical movement"
              />
            </Collapsible>

            <Collapsible title="Dynamic Acceleration Limits">
              <InputSlider
                sliderLabel={'dynamicMouseInputSlowMovement'}
                value={config.config.mouse.value.dynamic_mouse.value.input.value.slow.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'dynamic_mouse', 'value', 'input', 'value', 'slow', 'value'], activeOperationMode)(parseInt(e.target.value))}
                min={0}
                max={400}
                step={1}
                sliderTitle="Acceleration Floor"
                unit={"deg/sec"}
                sliderDescription="Rotation speed floor below which scale remains constant."
              />
              <InputSlider
                sliderLabel={'dynamicMouseInputFastMovement'}
                value={config.config.mouse.value.dynamic_mouse.value.input.value.fast.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'dynamic_mouse', 'value', 'input', 'value', 'fast', 'value'], activeOperationMode)(parseInt(e.target.value))}
                min={0}
                max={500}
                step={1}
                sliderTitle="Acceleration Ceiling"
                unit={"deg/sec"}
                sliderDescription="Rotation speed ceiling above which scale remains constant."
              />
            </Collapsible>
            <Collapsible title="Dynamic Scaling">
              <InputSlider
                sliderLabel={'dynamicMouseOutputSlowMovement'}
                value={config.config.mouse.value.dynamic_mouse.value.output.value.slow.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'dynamic_mouse', 'value', 'output', 'value', 'slow', 'value'], activeOperationMode)(parseFloat(e.target.value))}
                min={0.1}
                max={2.0}
                step={0.1}
                sliderTitle="Slow Scaling"
                unit={"multiplier"}
                sliderDescription="Scale factor below the Acceleration Floor."
              />
              <InputSlider
                sliderLabel={'dynamicMouseOutputFastMovement'}
                value={config.config.mouse.value.dynamic_mouse.value.output.value.fast.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'dynamic_mouse', 'value', 'output', 'value', 'fast', 'value'], activeOperationMode)(parseFloat(e.target.value))}
                min={1.0}
                max={6.0}
                step={0.1}
                sliderTitle="Fast Scaling"
                unit={""}
                sliderDescription="Scale factor at (and above) fastest input speed."
              />
            </Collapsible>
            <Collapsible title="Idle">


              <InputSlider
                sliderLabel={'mouseIdleThreshold'}
                value={config.config.mouse.value.idle_threshold.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'idle_threshold', 'value'], activeOperationMode)(parseInt(e.target.value))}
                min={5}
                max={12}
                step={1}
                sliderTitle="Mouse Idle Threshold"
                unit={"deg/sec"}
                sliderDescription="Value of move speed below which is considered idle. Causes mouse exit; High value: easier to idle out; Low value: mouse stays active."
              />
              <InputSlider
                sliderLabel={'minMouseRuntime'}
                value={config.config.mouse.value.min_run_cycles.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'min_run_cycles', 'value'], activeOperationMode)(parseInt(e.target.value))}
                min={0}
                max={100}
                step={1}
                sliderTitle="Minimum Mouse Runtime"
                unit={".01s"}
                sliderDescription="Minimum time (in .01 second increments) that mouse will always run before checking idle conditions for exit"
              />
              <InputSlider
                sliderLabel={'mouseIdleDuration'}
                value={config.config.mouse.value.idle_duration.value}
                onChange={(e) => handleModeConfigChange(['mouse', 'value', 'idle_duration', 'value'], activeOperationMode)(parseInt(e.target.value))}
                min={30}
                max={150}
                step={1}
                unit={".01s"}
                sliderTitle="Idle Timeout Cycles"
                sliderDescription="Amount of idle time (in .01 second increments) required to trigger mouse exit"
              />
            </Collapsible>
          </div>
        )
      }

      const ClickerOptions = (config) => {

        return (
          <Collapsible title="Tap Settings">

            <InputSlider
              value={config.config.clicker.value.max_click_spacing.value}
              onChange={(e) => handleModeConfigChange(['clicker', 'value', 'max_click_spacing', 'value'], activeOperationMode)(parseFloat(e.target.value))}
              min={0.1}
              max={1.0}
              step={0.1}
              unit={"s"}
              sliderTitle={"Max Click Spacing"}
              sliderDescription={"Time to wait for next tap before counting."}
              sliderLabel={"clickerMaxClickSpacing"}
            />
            <InputSlider
              value={config.config.clicker.value.tap_ths.value}
              onChange={(e) => handleModeConfigChange(['clicker', 'value', 'tap_ths', 'value'], activeOperationMode)(parseFloat(e.target.value))}
              min={0}
              max={31}
              step={1}
              unit={"level"}
              sliderTitle={"Tap Threshold"}
              sliderDescription={"Level of impact needed to trigger a click. Lower -> more sensitive"}
              sliderLabel={"clickerTapThreshold"}
            />
            <InputSlider
              value={config.config.clicker.value.quiet.value}
              onChange={(e) => handleModeConfigChange(['clicker', 'value', 'quiet', 'value'], activeOperationMode)(parseInt(e.target.value))}
              min={0}
              max={3}
              step={1}
              unit={"level"}
              sliderTitle={"Quiet"}
              sliderDescription={"Amount of quiet required after counting taps"}
              sliderLabel={"clickerQuiet"}
            />
            <InputSlider
              value={config.config.clicker.value.shock.value}
              onChange={(e) => handleModeConfigChange(['clicker', 'value', 'shock', 'value'], activeOperationMode)(parseInt(e.target.value))}
              min={0}
              max={3}
              step={1}
              unit={"s"}
              sliderTitle={"Shock"}
              sliderDescription={"Max duration of over threshold event"}
              sliderLabel={"clickerShock"}
            />

          </Collapsible>
        );
      };


      const GestureOptions = (config) => {
        return (
          <Collapsible title="Gesture Settings">

            <InputSlider
              sliderLabel={'mouseShakeSize'}
              value={config.config.mouse.value.shake_size.value}
              onChange={(e) => handleModeConfigChange(['mouse', 'value', 'shake_size', 'value'], activeOperationMode)(e.target.value)}
              min={0}
              max={20}
              step={1}
              unit={"px"}
              sliderTitle="Shake Size"
              sliderDescription="Size of cursor movement for gesturer indicator"
            />
            <InputSlider
              sliderLabel={'mouseNumberShakes'}
              value={config.config.mouse.value.num_shake.value}
              onChange={(e) => handleModeConfigChange(['mouse', 'value', 'num_shake', 'value'], activeOperationMode)(e.target.value)}
              min={1}
              max={4}
              step={1}
              sliderTitle="Number of Shakes"
              unit={"shakes"}
              sliderDescription="Number of times to repeat gesture ready indicator"
            />

            <InputSlider
              sliderLabel={'mouseDwellDuration'}
              value={config.config.mouse.value.dwell_duration.value}
              onChange={(e) => handleModeConfigChange(['mouse', 'value', 'dwell_duration', 'value'], activeOperationMode)(parseInt(e.target.value))}
              min={20}
              max={100}
              step={1}
              unit={"cs"}
              sliderTitle="Dwell Trigger Cycles"
              sliderDescription="Amount of idle time (in .01 second increments) needed to trigger action in dwell_click"
            />

            {/* <div style={sliderContainerStyle}> */}
            {/* <p style={descriptionStyle}>Adjust your gesture collection settings below:</p> */}

            <InputSlider
              sliderLabel={'gestureConfidenceThreshold'}
              value={config.config.gesture.value.confidence_threshold.value}
              onChange={(e) => handleModeConfigChange(['gesture', 'value', 'confidence_threshold', 'value'], activeOperationMode)(parseFloat(e.target.value))}
              min={0.55}
              max={0.90}
              step={0.01}
              sliderTitle="Gesture Confidence Threshold"
              unit={""}
              sliderDescription="Threshold of gesture confidence probability [0, 1], for Cato to accept gesture and execute command. Low value -> few dry-fires, more frequent misinterpretation. High value -> frequent dry-fires, rare misinterpretation"
            />

            <InputSlider
              sliderLabel={'gestureTimeout'}
              value={config.config.gesture.value.timeout.value}
              onChange={(e) => handleModeConfigChange(['gesture', 'value', 'timeout', 'value'], activeOperationMode)(parseFloat(e.target.value))}
              min={0.1}
              max={3.0}
              step={0.05}
              sliderTitle="Gesture Timeout"
              unit={"s"}
              sliderDescription="Maximum Time (seconds) to wait for a gesture to start"
            />

            <CheckboxOption
              checked={config.config.mouse.value.dwell_repeat.value}
              onChange={(e) => handleModeConfigChange(['mouse', 'value', 'dwell_repeat', 'value'], activeOperationMode)(e.target.checked)}
              title="Dwell Click"
              description="Continuously click while dwelling"
            />

          </Collapsible>
        );
      };

      const TVRemoteOptions = (config) => {
        return (
          <Collapsible title="Gesture Remote"  >
            <CheckboxOption
              checked={config.config.tv_remote.value.await_actions.value}
              onChange={(e) => handleModeConfigChange(['tv_remote', 'value', 'await_actions', 'value'], activeOperationMode)((e.target.checked))}
              title="Await Actions"
              description="Wait for previous action to end before reading a new gesture"
            />
          </Collapsible>
        );
      };

      const BindingsPanel = ({ config, mode }) => {
        // const [isBindingsExpanded, setIsBindingsExpanded] = useState(true);
        // const toggleBindings = () => {
        //   setIsBindingsExpanded(!isBindingsExpanded);
        // };
        const [isExpanded, setIsExpanded] = useState(true);
        const toggleExpanded = () => {
          setIsExpanded(!isExpanded);
        };
        function generateDescription(binding) {
          switch (binding.command) {
            case "noop":
              return "Does nothing.";
            case "quick_sleep":
              return "Puts Cato in sleep mode with tap to wake.";
            case "pointer_sleep":
              return "Puts Cato in pointer sleep, wake with a gesture.";
            case "quick_calibrate":
              return "Runs quick calibration for drift removal.";
            case "dwell_click":
              if (binding.args[0] && binding.args[1]) {
                return `Moves cursor and taps ${buttonMapping(binding.args[0])} on dwell, tilts at speed ${binding.args[1]} to cancel.`;
              }
              return "Moves cursor and taps on dwell, tilt to cancel.";
            case "_scroll":
              return "Freezes cursor, look up/down to scroll, look left/right to cancel.";
            case "_scroll_lr":
              return "Freezes cursor, look up/down to scroll horizontally, look left/right to cancel.";
            case "button_action":
              return `Cato ${actionMapping(binding.args[1])} the ${actorMapping(binding.args[0])} on ${buttonMapping(binding.args[2])}.`;
            default:
              return "Unknown command.";
          }
        }
        function actorMapping(actor) {
          return actor == "0" ? "Mouse" : "Keyboard";
        }
        function actionMapping(action) {
          const actionMappings = {
            "tap": "taps",
            "double_tap": "double taps",
            "press": "presses and holds",
            "release": "releases",
            "toggle": "toggles press/release",
            "hold_until_idle": "holds until idle",
            "hold_until_sig_motion": "holds until significant motion detected"
          };
          return actionMappings[action] || "Unknown action";
        }
        function buttonMapping(button) {
          if (button === "1") return "Left Click";
          if (button === "2") return "Right Click";
          if (button === "4") return "Scroll Click";
          if (button === "8") return "Button 4";
          if (button === "16") return "Button 5";
          else {
            return getKeyOption(button);
          }
        }
        const toggleStyle = {
          // backgroundColor: collapsedSections['bindingsPanel'] ? '#1A202C' : '#fcdc6d',
          // color: collapsedSections['bindingsPanel'] ? '#FFFFFF' : '#000000',
          // borderRadius: '.625rem',
          // padding: '5px 15px',
          display: 'inline-block',

          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          width: 'fit-content',
          marginBottom: '.625rem',
          marginLeft: '1.3rem',
        };
        const handleCommandChange = (index, value) => {
          let updatedBindings = [...config["bindings"]["value"]];
          let currentBinding = updatedBindings[index];

          // Set default settings only when the command changes for the first time
          if (currentBinding.command !== value) {
            switch (value) {
              case 'dwell_click':
                updatedBindings[index]["args"][0] = 1;
                updatedBindings[index]["args"][1] = 2;
                updatedBindings[index]["args"][2] = '';
                break;
              case 'button_action':
                updatedBindings[index]["args"][0] = 0;
                updatedBindings[index]["args"][1] = 'tap';
                updatedBindings[index]["args"][2] = 1;
                break;
              default:
                // Reset settings for other commands, if necessary
                updatedBindings[index]["args"] = [];
                break;
            }
          }
          updatedBindings[index].command = value;

          switch (activeOperationMode) {
            case "gesture_mouse":
              const newEditedGestureMouseConfig = deepCopy(editedGestureMouseConfig);
              newEditedGestureMouseConfig.bindings.value = updatedBindings;
              setEditedGestureMouseConfig(newEditedGestureMouseConfig);
              break;
            case "tv_remote":
              const newEditedTVRemoteConfig = deepCopy(editedTVRemoteConfig);
              newEditedTVRemoteConfig.bindings.value = updatedBindings;
              setEditedTVRemoteConfig(newEditedTVRemoteConfig);
              break;
            case "pointer":
              const newEditedPointerConfig = deepCopy(editedPointerConfig);
              newEditedPointerConfig.bindings.value = updatedBindings;
              setEditedPointerConfig(newEditedPointerConfig);
              break;
            case "clicker":
              const newEditedClickerConfig = deepCopy(editedClickerConfig);
              newEditedClickerConfig.bindings.value = updatedBindings;
              setEditedClickerConfig(newEditedClickerConfig);
              break;
            default:
          }

        };

        const handleSettingsChange = (index, settingNumber, value) => {

          let updatedBindings = [...config["bindings"]["value"]];
          let currentBinding = updatedBindings[index];

          if (currentBinding.command == 'button_action') {
            if (settingNumber == 0) {  // If the actor is being changed
              // Set defaults based on the new actor value
              currentBinding.args[1] = 'tap'; // Default action remains the same
              currentBinding.args[2] = (value == '0') ? 1 : 4; // Default button based on actor
            }
          }
          currentBinding["args"][settingNumber] = isNaN(value) ? value : +value;

          switch (activeOperationMode) {
            case "gesture_mouse":
              const newEditedGestureMouseConfig = deepCopy(editedGestureMouseConfig);
              newEditedGestureMouseConfig.bindings.value = updatedBindings;
              setEditedGestureMouseConfig(newEditedGestureMouseConfig);
              break;
            case "tv_remote":
              const newEditedTVRemoteConfig = deepCopy(editedTVRemoteConfig);
              newEditedTVRemoteConfig.bindings.value = updatedBindings;
              setEditedTVRemoteConfig(newEditedTVRemoteConfig);
              break;
            case "pointer":
              const newEditedPointerConfig = deepCopy(editedPointerConfig);
              newEditedPointerConfig.bindings.value = updatedBindings;
              setEditedPointerConfig(newEditedPointerConfig);
              break;
            case "clicker":
              const newEditedClickerConfig = deepCopy(editedClickerConfig);
              newEditedClickerConfig.bindings.value = updatedBindings;
              setEditedClickerConfig(newEditedClickerConfig);
              break;
            default:
          }
        };
        let gesturesList;
        let bindingsSettings;
        if (mode === "clicker") {
          gesturesList = ['None', 'Single', 'Double', 'Triple'];
          bindingsSettings = config.bindings.value;
        } else {
          gesturesList = [
            'None',
            'Nod Up',
            'Nod Down',
            'Nod Right',
            'Nod Left',
            'Tilt Right',
            'Tilt Left'
          ];
          bindingsSettings = config.bindings.value;
        }

        return (
          <div>


            <Collapsible title={mode === "clicker" ? "Taps" : "Bindings"}>
              <table className='table-fixed bg-slate-300 border-4 divide-y-4'>
                <thead>
                  <tr>
                    <th className="w-2/12 p-2 text-start">Gesture</th>
                    <th className="w-2/12 p-2 ">Command</th>
                    <th className="w-6/12 p-2 ">Settings</th>
                    <th className="w-6/12 p-2 ">Description</th>
                  </tr>
                </thead>
                <tbody className='divide-y-4'>
                  {bindingsSettings.map((binding, index) => {
                    console.log(binding);
                    console.log(index);
                    if (gesturesList[index] && index !== 0) { //temporary solution for the first item being ignored
                      return (
                        <tr key={index} className="max-h-16  text-black text-sm ">

                          <td className="p-2 font-bold">
                            {gesturesList[index]}
                          </td>

                          <td className="p-2">
                            <select
                            className='bg-transparent text-center text-sm hover:bg-slate-400'
                              value={binding.command}
                              onChange={(e) => handleCommandChange(index, e.target.value)}
                            >
                              <option value="noop">None (noop)</option>
                              <option value="quick_sleep">Quick Sleep</option>
                              <option value="pointer_sleep">Pointer Sleep</option>
                              <option value="quick_calibrate">Quick Calibrate</option>
                              <option value="dwell_click">Dwell Click</option>
                              <option value="_scroll">Vertical Scroll</option>
                              <option value="_scroll_lr">Horizontal Scroll</option>
                              <option value="button_action">Button Action</option>
                            </select>
                          </td>

                          <td className= 'p-2'>
                            {binding.command === 'dwell_click' ? (
                              <div className="w-full h-full flex flex-row ">
                                <div className='w-full flex-0 flex flex-col items-center'>
                                  <th className="w-full px-2 text-center text-xs">Button</th>
                                  <select className='py-1 text-sm text-center bg-transparent  hover:bg-slate-400'
                                    value={binding.args[0]}
                                    onChange={(e) => handleSettingsChange(index, 0, e.target.value)}
                                  >
                                    <option value={1}>Left Mouse</option>
                                    <option value={2}>Right Mouse</option>
                                    <option value={4}>Scroll Wheel</option>
                                    <option value={8}>Button 4</option>
                                    <option value={16}>Button 5</option>
                                  </select>
                                </div>

                                <div className='w-full flex-0 flex flex-col items-center'>
                                  <th className="w-full px-4 text-center text-xs">Cancel Speed</th>
                                  <select className='py-1 text-sm text-center bg-transparent  hover:bg-slate-400'
                                    value={binding.args[1]}
                                    onChange={(e) => handleSettingsChange(index, 1, e.target.value)}
                                  >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={6}>6</option>
                                    <option value={7}>7</option>
                                    <option value={8}>8</option>
                                    <option value={9}>9</option>
                                    <option value={10}>10</option>
                                  </select>
                                </div>
                              </div>
                            ) : <div className="w-full h-full" />}
                            {binding.command === 'button_action' ? (
                              <div className="w-full h-full flex flex-row">
                                {/* ACTOR */}
                                <div className='w-full px-3 flex-0 flex flex-col items-center'>
                                  <th className="w-full px-1 text-center text-xs">Actor</th>
                                  <select className='py-1 text-sm text-center bg-transparent   hover:bg-slate-400'
                                    value={binding.args[0]}
                                    onChange={(e) => handleSettingsChange(index, 0, e.target.value)}
                                  >
                                    <option selected="selected" value={0}>Mouse</option>
                                    <option value={1}>Keyboard</option>

                                  </select>
                                </div>

                                {/* ACTION */}
                                <div className='w-full px-3 flex-0 flex flex-col items-center'>
                                  <th className="w-full px-1 text-center text-xs">Action</th>
                                  <select className='w-fit py-1 text-sm text-center bg-transparent  hover:bg-slate-400'
                                    value={binding.args[1]}
                                    onChange={(e) => handleSettingsChange(index, 1, e.target.value)}
                                  >
                                    <option value={'tap'}>Tap</option>
                                    <option value={'double_tap'}>Double Tap</option>
                                    <option value={'press'}>Press and Hold</option>
                                    <option value={'release'}>Release</option>
                                    <option value={'toggle'}>Toggle</option>
                                    <option value={'hold_until_idle'}>Hold Until Idle</option>
                                    <option value={'hold_until_sig_motion'}>Hold Until Significant Motion</option>=
                                  </select>
                                </div>
                                {/* BUTTON */}
                                {binding.args[0] == "1" ? (
                                  <div className='px-3 w-full flex-0 flex flex-col items-center'>
                                    <th className="w-full px-1 text-center text-xs">Button</th>
                                    <select className='py-1 text-sm text-center  bg-transparent  hover:bg-slate-400'
                                      value={binding.args[2]}
                                      onChange={(e) => handleSettingsChange(index, 2, e.target.value)}>
                                      <KeyOptions />
                                    </select>
                                  </div>
                                ) : (
                                  <div className='px-3 w-full flex-0 flex flex-col items-center'>
                                    <th className="w-full px-1 text-center text-xs">Button</th>
                                    <select className='py-1 text-sm text-center  bg-transparent  hover:bg-slate-400'
                                      value={binding.args[2]}
                                      onChange={(e) => handleSettingsChange(index, 2, e.target.value)}>
                                      <option value={1}>Left Mouse</option>
                                      <option value={2}>Right Mouse</option>
                                      <option value={4}>Scroll Wheel</option>
                                      <option value={8}>Button 4</option>
                                      <option value={16}>Button 5</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            ) : <div className="w-full h-full" />}
                          </td>

                          {/* Description Cell */}
                          <td className=" text-sm overflow-hidden">
                            <div className="max-h-16">
                              {generateDescription(binding)}
                            </div>
                          </td>
                        </tr>

                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </Collapsible>
          </div >
        );
      }

      const DemoVideo = () => {
        return (
          <details className='relative flex flex-row w-full justify-end'>
            <summary className='w-fit absolute top-4 right-4 list-none px-1 py-0.5 rounded-md hover:bg-slate-400 bg-transparent '>Demo Video</summary>

            <iframe width="400" height="225" src="https://www.youtube.com/embed/aiT06Bs-OH0" title="Cato Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </details>
        )
      }

      const GestureMouseSetting = () => {
        if (!fetchedGestureMouseConfig) {
          return <div>Loading...</div>;
        }
        return (
          <div>
            <DemoVideo />
            <MouseOptions config={editedGestureMouseConfig} />
            <GestureOptions config={editedGestureMouseConfig} />
            <BindingsPanel config={editedGestureMouseConfig} mode={"gesture_mouse"} />
          </div>
        );
      }

      const ClickerSetting = () => {
        const [collapsedSections, setCollapsedSections] = useState({});

        if (!fetchedClickerConfig) {
          return <div>Loading...</div>;
        }
        return (
          <div>
            <ClickerOptions
              config={editedClickerConfig}
              collapsedSections={collapsedSections}
              setCollapsedSections={setCollapsedSections}
            />
            <BindingsPanel config={editedClickerConfig} mode="clicker" />
          </div>
        );
      }

      const TVRemoteSetting = () => {
        if (!fetchedTVRemoteConfig) {
          return <div>Loading...</div>;
        }
        return (
          <div>
            <DemoVideo />
            <TVRemoteOptions config={editedTVRemoteConfig} />
            <GestureOptions config={editedTVRemoteConfig} />
            <BindingsPanel config={editedTVRemoteConfig} mode={"tv_remote"} />
          </div>
        );
      };

      const PointerSetting = () => {
        if (!fetchedPointerConfig) {
          return <div>Loading...</div>;
        }
        return (
          <div>
            <MouseOptions config={editedPointerConfig} />
           </div>
        );
      }

      return (
        <div>{/*}
          <EditableCollapsible
            title={connection.name || temporaryConnectionName }
            onChange={(e) => setTemporaryConnectionName(e.target.value)}
            onConfirm={handleSaveEditedName(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEditedName(index);
              }
            }}
            >
          <div className="flex-1  overflow-x-hidden overflow-y-scroll">
              <ConnectionSpecificSettings connectionConfig={editedConnectionConfig} />
              {activeOperationMode === "gesture_mouse" && <GestureMouseSetting />}
              {activeOperationMode === "clicker" && <ClickerSetting />}
              {activeOperationMode === "tv_remote" && <TVRemoteSetting />}
              {activeOperationMode === "pointer" && <PointerSetting />}
            </div>
          </EditableCollapsible>
          {*/}

          <div className='flex flex-row w-full justify-between items-center bg-slate-400'>
            <div className='flex flex-row w-full gap-8 justify-start align-baseline  items-center'>
              {editingConnectionIndex === index ? (
                <div >
                  <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={temporaryConnectionName}
                    onChange={(e) => setTemporaryConnectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEditedName(index);
                      }
                    }}
                    className='w-fit px-2 text-slate-800'
                  />
                </div>
              ) : (
                <div className='flex flex-row items-center'>
                  <EditIcon onClick={() => startEditing(connection, index)} />
                  <button
                    onClick={toggleIsExpanded}
                    className='font-bold text-sm text-slate-800'
                  >
                    {(index + 1) + ': ' + connection.name}
                  </button>
                </div>
              )}

              <Dropdown
                value={activeOperationMode}
                onChange={(e) => { setActiveOperationMode(e.target.value) }}
                title=""
                description="Select the operation mode"
                options={[
                  { value: "pointer", label: "Pointer" },
                  { value: "clicker", label: "Tapper" },
                  { value: "gesture_mouse", label: "Gesture Mouse" },
                  { value: "tv_remote", label: "Gesture Remote" }
                ]}
              ></Dropdown>
            </div>

            <DeleteButton handler={() => handleConnectionDeletion(connection.name)} />

          </div>


          {isExpanded && (
            <div className="flex-1  overflow-x-hidden overflow-y-auto">
              <ConnectionSpecificSettings connectionConfig={editedConnectionConfig} />
              {activeOperationMode == "gesture_mouse" && <GestureMouseSetting />}
              {activeOperationMode == "clicker" && <ClickerSetting />}
              {activeOperationMode == "tv_remote" && <TVRemoteSetting />}
              {activeOperationMode == "pointer" && <PointerSetting />}
            </div>)}

        </div>

      )

    }

    return (
      <div className='overflow-y-auto'>
        {data.map((item, index) => (
          <div key={index}>
            <ConnectionAccordion
              connection={item}
              onDelete={handleConnectionDeletion} //delete connections
              index={index}
            >
            </ConnectionAccordion>
          </div>
        ))}
      </div>
    );
  };

  const handleSave = async () => {
    // if the connections array is empty, return
    if (editedConnectionsSettings.length === 0) {
      console.error("No connections to save");
      toast.error("Must add at least one connection to save.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    const webAppHwUid = editedGlobalSettings["HW_UID"]["value"];
    let calibratedWithFirebase = false;
    const hwUidMatch = await fetchAndCompareConfig(webAppHwUid);

    if (!hwUidMatch) {
      console.error("HW_UID does not match with the connected device.");
      // create a prompt to inform the user that the HW_UID does not match and that if they press continue, they will only be editing the web settings
      const confirmed = window.confirm("The HW_UID does not match with the connected device. If you continue, you will only be editing the web settings. Do you want to continue?");
      if (!confirmed) {
        return;
      } else {
        calibratedWithFirebase = false;
      }
    }

    const userId = getCurrentUserId();
    const userCatoDocId = thisDevice.id;
    const userCatoDocRef = doc(db, "users", userId, "userCatos", userCatoDocId);

    try {
      const globalConfigUpdate = {
        "global_info": editedGlobalSettings,
      };

      if (hwUidMatch) {
        await updateDoc(userCatoDocRef, {
          'device_info.device_nickname': editedGlobalSettings["name"]["value"],
          'device_info.global_config': JSON.stringify(globalConfigUpdate),
          'connections': editedConnectionsSettings,
        });
      } else {
        await updateDoc(userCatoDocRef, {
          'device_info.device_nickname': editedGlobalSettings["name"]["value"],
          'device_info.global_config': JSON.stringify(globalConfigUpdate),
          'connections': editedConnectionsSettings,
          'device_info.calibrated': calibratedWithFirebase,
        });
      }
      console.log("Web settings updated successfully");

    } catch (error) {
      console.error("Error updating web settings: ", error);
      toast.error("Error updating web settings. Aborting save operation.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    if (hwUidMatch) {
      const deviceConfig = {
        "connections": [],
        "global_info": editedGlobalSettings,
      };

      for (let i = 0; i < editedConnectionsSettings.length; i++) {
        let connection = editedConnectionsSettings[i];
        let connectionConfig = JSON.parse(connection["connection_config"]);
        let currentModeConfig = null;
        if (connection["current_mode"] === "practice") {
          currentModeConfig = JSON.parse(thisDevice["data"]["device_info"]["practice_config"]);
        } else {
          currentModeConfig = JSON.parse(connection["mode"][connection["current_mode"]]);
        }

        connectionConfig["connection_name"]["value"] = connection.name;

        let pushedConnection = {
          ...connectionConfig,
          ...currentModeConfig,
        };
        deviceConfig["connections"].push(pushedConnection);
      };
      const overwriteSuccess = await overwriteConfigFile(deviceConfig);

      if (overwriteSuccess) {
        toast.success('Device settings updated successfully', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        calibratedWithFirebase = true;
      } else {
        toast.error("Error updating device settings. Device not in sync with web.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        calibratedWithFirebase = false;
      };
      await updateDoc(userCatoDocRef, {
        'device_info.calibrated': calibratedWithFirebase,
      });
    };
    const newDeviceName = editedGlobalSettings["name"]["value"];

    navigate(`/devices/${newDeviceName}`);
    window.location.reload(); //TODO: change later for permission?


  };

  if (!thisDevice) {
    return (
      <div className="ml-90">
        <header
          className="shrink-0 bg-transparent border-b border-gray-200"
          onClick={toggleUniversalSettings}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex h-16 max-w-7xl items-center justify-between">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Device Settings
            </h2>
          </div>
        </header>
        <div className="mt-4 ml-4">
          <p className="text-lg text-gray-700">
            This device is not registered yet.
          </p>
          <p className="text-lg text-gray-700 mt-6">
            Likely reasons you're here:
            <ul className="list-disc ml-5">
              <li>You entered the URL incorrectly</li>
              <li>You have a bookmark to a device that has since been renamed</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  const handleDeviceDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your device? All associated data will be deleted.");
    if (!confirmed) {
      return;
    }

    if (thisDevice) {
      const deviceRef = doc(db, 'users', getCurrentUserId(), 'userCatos', thisDevice.id);
      try {
        await deleteDoc(deviceRef);
        console.log('device deleted');
      } catch {
        console.log('error deleting device');
      }
    }

    const deviceRef = doc(db, 'users', getCurrentUserId(), 'userCatos', thisDevice.id);
    try {
      await deleteDoc(deviceRef);
      console.log('Device deleted successfully');
    } catch (error) {
      console.error('Error deleting device: ', error);
    }

    setTimeout(() => {
      navigate('/devices');
      window.location.reload();
    }, 2000);
  }

  return (
    <div id="devices">
      {isEditPopupOpen && (
        <div
          ref={popupRef}

          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '.65rem',
            border: '1px solid black',
            borderRadius: '.625rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
          <input
            type="text"
            value={editedConnectionName}
            onChange={(e) => setEditedConnectionName(e.target.value)}
          />
          <button onClick={handleSaveEditedName}>Save</button>
        </div>
      )}

      <div className="flex flex-col h-screen overflow-y-hidden">
        <div><GlobalInfoSection /></div>
        <div className='flex flex-row align-center justify-start pt-2'>
          <span className='pr-4 font-bold'>Connections</span>
          <PlusButton onClick={handleRegisterInterface} />
        </div>
        <AccordionList data={connectionsList} />
      </div>
      <ToastContainer />
    </div>);

};
export default Devices;
