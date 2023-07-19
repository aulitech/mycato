import React, { useState, Fragment, useRef } from "react";
import { get, set, clear } from 'idb-keyval';

import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import FormatGestData from "./FormatGestData";

export const styles = {ACTIVE_RING : "ring-1 ring-blue-500"}

const ConfigureCato = ({classNames}) => {
  const [catoConnected, setCatoConnected] = useState(false);
  const [configSuccess, setConfigSuccess]  = useState(false);
  const [gestureNum, setGestureNum] = useState(0);
  const [gestData, setGestData] = useState(null);
  const [timer, setTimer] = useState('00');
  const [performGest, setPerformGest] = useState(false);

  // const [gestID, setGestID] = useState(0);
  // const handleGestID = (num) => {
  //   setGestID(num);
  // }


  const Ref = useRef(null);
 
  const getTimeRemaining = (e) => {
      const total = Date.parse(e) - Date.parse(new Date());
      const seconds = Math.floor((total / 1000) % 60);
      return {
          total, seconds
      };
  }

  const startTimer = (e) => {
      let { total, seconds }
                  = getTimeRemaining(e);
      if (total >= 0) {
          setTimer(
              (seconds > 5 ? seconds : '0' + seconds)
          )
      }
  }

  const clearTimer = (e) => { 
      setTimer('15');

      if (Ref.current) clearInterval(Ref.current);
      const id = setInterval(() => {
          startTimer(e);
      }, 1000)
      Ref.current = id;
  }

  const getDeadTime = () => {
      let deadline = new Date();

      deadline.setSeconds(deadline.getSeconds() + 10);
      return deadline;
  }

  const onClickReset = () => {
      clearTimer(getDeadTime());
      setPerformGest(false);
  }


  const gestures = [
    {id: 0, name: 'Select'},
    {id: 1, name: 'Nod up'},
    {id: 2, name: 'Nod down'},
    {id: 3, name: 'Nod right'},
    {id: 4, name: 'Nod left'},
    {id: 5, name: 'Tilt right'},
    {id: 6, name: 'Tilt left'},
    {id: 7, name: 'Shake vertical'},
    {id: 8, name: 'Shake horizontal'},
    {id: 9, name: 'Circle clockwise'},
    {id: 10, name: 'Circle counterclockwise'}
  ];
  const [selected, setSelected] = useState(gestures[0]);

  
  const reset = () => {
    clear();
    setCatoConnected(false);
    setConfigSuccess(false);
    setPerformGest(false);
  }


  const getDirectory = async() => {
    try {
      const dirHandleOrUndefined = await get('directory');

      if (dirHandleOrUndefined) {
        console.log("retrieved dir handle:", dirHandleOrUndefined.name);
        setCatoConnected(true);
        return;
      }

      const dirHandle = await window.showDirectoryPicker({
        id: 'AULI_CATO',
        mode: 'readwrite'
      });

      await set('directory', dirHandle);
      console.log('store dir handle:', dirHandle.name);
      setCatoConnected(true);
      
    }
    catch(error) {
      console.log("get directory error:", error);
    }
  }


  const writeConfig = async() => {
    try {
      const directory = await get('directory');
      console.log(directory);

      if(typeof directory !== 'undefined') {
        const perm = await directory.requestPermission()

        if(perm === 'granted') {
          const configFile = await directory.getFileHandle('config.cato', { create: true });
          
          console.log('Config.cato:', configFile);
          
          const writable = await configFile.createWritable();
          await writable.write(gestureNum);
          await writable.close();

          const checkConfig = await directory.getFileHandle('config.cato', { create: false })
          if(checkConfig !== null) {
            setConfigSuccess(true);
            onClickReset()
          };
        };
      }
    }
    catch(error) {
      console.log("write config.cato error:", error);
    }
  }

  const getGestureData = async() => {
    try {
      const directory = await get('directory');
      console.log(directory);

      if(typeof directory !== 'undefined') {

        const perm = await directory.requestPermission()

        if(perm === 'granted') {
          const logFile = await directory.getFileHandle('log.txt', { create: false });
          console.log(logFile);

          const dataFile = await logFile.getFile();
          const dataContents = await dataFile.text();
          console.log(dataContents);
          setGestData(dataContents);
        }
      }
    }
    catch(error) {
      console.log("get log.txt/ gesture data error:", error)
    }
  }


  // Action Panel #1
  const HandleConnectDirectoryUI = () => {
    return (        
      <div className={classNames(catoConnected ? "ring-1 ring-blue-500" : "", "bg-white shadow sm:rounded-lg sm:mx-auto sm:w-full md:max-w-md")}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Connect Cato</h3>
          <div className="mt-2 sm:flex sm:items-start sm:justify-between">
            <div className="max-w-xl text-sm text-gray-500">
              {catoConnected ? 
              <p className="text-blue-500">Connected</p> 
              : 
              <p>Allow access to Cato. Select AULI_CATO from your local computer.</p>
              }
            </div>
            <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
              <button
                type="button"
                className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={catoConnected ? reset : getDirectory}
              >
                {catoConnected ? 'Reset Connection' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Action Panel #2
  const HandleGesturePickerUI = () => {

    const shareGesture = (e) => {
      setSelected(e);
      setGestureNum(e.id);
    }

    function classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }

    return (
      <div className={classNames(gestureNum !== 0 ? "ring-1 ring-blue-500" : "", "bg-white shadow sm:rounded-lg sm:mx-auto sm:w-full md:max-w-md")}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Select Gesture</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Select gesture to record and map to your Cato.
            </p>
          </div>
          <div className="mt-5">
            <Listbox value={selected} onChange={shareGesture}>
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Gestures</Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 sm:text-sm sm:leading-6">
                    <span className="block truncate">{selected.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {gestures.map((gesture) => (
                        <Listbox.Option
                          key={gesture.id}
                          className={({ active }) =>
                            classNames(
                              active ? 'bg-gray-100 text-blue-500' : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                          }
                          value={gesture}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}> {gesture.name} </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-blue-500' : 'text-blue-300',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  <CheckIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>
      </div>
    </div>
    )
  }

  // Action Panel #3
  const HandleConfigUI = () => {
    return (
      <div className={classNames(configSuccess ? "ring-1 ring-blue-500" : "", "bg-white shadow sm:rounded-lg sm:mx-auto sm:w-full md:max-w-md")}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Share gesture with Cato</h3>
          <div className="mt-2 sm:flex sm:items-start sm:justify-between">
            <div className="max-w-xl text-sm text-gray-500">
              <p>
                {configSuccess ? 'Letting Cato know to get ready for gesture...' : 'Let Cato know what gesture you would like to record by clicking Share.'}                
              </p>
              <p className="mt-2">
                
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={writeConfig}
              className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    )
  };

  // Action Panel #4 
  const HandleCountDownUI = () => {
      return (
        <div className="bg-white shadow sm:rounded-lg sm:mx-auto sm:w-full md:max-w-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-blue-500">{timer}</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
            </div>
            <h3 className={classNames(performGest ? "text-blue-500" : "text-blue-200", "text-base font-semibold leading-6")}>
              Perform Gesture
            </h3>
          </div>
        </div>
    )
  };

  return (
    <>
    <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <HandleConnectDirectoryUI/>
      <br/>
      <HandleGesturePickerUI/>
      <br/>
      <HandleConfigUI/>
      <br/>
      <HandleCountDownUI/>
      <button
        type="button"
        onClick={getGestureData}
        className="mt-2 rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:rounded-lg sm:mx-auto sm:w-full sm:max-w-sm"
      >
        Save Data
      </button>
      {gestData !== null ? <FormatGestData logFile={gestData} gestures={gestures}/> : null}
      
    </div>
    </>
  )
}

export default ConfigureCato;