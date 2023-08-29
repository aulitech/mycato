import React, { useState } from "react";
import { clear } from "idb-keyval";
import ConnectDirectory from "./ConnectDirectory";
import SelectGesture from "./SelectGesture";
import ConnectDevice from "./ConnectDevice";
import RecordGestures from "./RecordGestures";

export const styles = { ACTIVE_RING: "ring-1 ring-blue-500" };

const ConfigureGestures = ({ classNames, user }) => {
  const [catoConnected, setCatoConnected] = useState(false);
  const [gestName, setGestName] = useState("");
  // const [configSuccess, setConfigSuccess] = useState(false);
  const [goToRecord, setGoToRecord] = useState(false);


  const handleCatoConnected = (connectState) => {
    setCatoConnected(connectState);
    console.log(catoConnected);
  };

  const handleGestName = (name) => {
    setGestName(name);
  };

  // const handleConfigSuccess = (writeState) => {
  //   setConfigSuccess(writeState);
  //   console.log(configSuccess);
  // };

  const reset = () => {
    clear();
    setCatoConnected(false);
    // setConfigSuccess(false);
  };

  const goToRecordPage = () => {
    setGoToRecord(true);
  };

  const handleDoneRecording = () => {
    setGoToRecord(false);
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="shrink-0 bg-transparent border-b border-gray-200 px-4 sm:px-6 lg:px-8 pb-5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight py-1">
            Record Gestures
          </h2>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2 h-full mt-10">
        <div className="flex-1">
          <div className="border-gray-200 xl:border-b-0">
            {goToRecord ? (
              <RecordGestures
                gestName={gestName}
                user={user}
                classNames={classNames}
                handleDoneRecording={handleDoneRecording}
              />
            ) : (
              <div>
                <SelectGesture
                  classNames={classNames}
                  handleGestName={handleGestName}
                  user={user}
                  goToRecordPage={goToRecordPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureGestures;
