import React, { useRef } from "react";

const SingleAccount = ({ id, name, accountBalance, deleteAccount, processCSV }) => {
  const fileInputRef = useRef(null); //native file selector

  const csvClick = () => {
    fileInputRef.current.click();
  };

  const uploadCSV = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      processCSV(id, file);
    } else {
      alert("Please select a valid CSV file");
    }
    event.target.value = ""; //clear the input to allow selecting the same file again
  };

  return (
    <div className="flex justify-between items-center w-full border-b-2 border-gray-600/40 p-2">
      <span className="text-sm text-gray-200">{name}</span>
      <span className="text-sm text-gray-200">{accountBalance}</span>
      <button
        className="bg-green-400 flex w-10 h-10 justify-center items-center rounded-2xl hover:scale-110 transition-all duration-300"
        onClick={deleteAccount(id)}
      >
        <svg
          viewBox="0 0 1024 1024"
          className="icon"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          fill="#000000"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M667.8 362.1H304V830c0 28.2 23 51 51.3 51h312.4c28.4 0 51.4-22.8 51.4-51V362.2h-51.3z"
              fill="#CCCCCC"
            ></path>
            <path
              d="M750.3 295.2c0-8.9-7.6-16.1-17-16.1H289.9c-9.4 0-17 7.2-17 16.1v50.9c0 8.9 7.6 16.1 17 16.1h443.4c9.4 0 17-7.2 17-16.1v-50.9z"
              fill="#CCCCCC"
            ></path>
            <path
              d="M733.3 258.3H626.6V196c0-11.5-9.3-20.8-20.8-20.8H419.1c-11.5 0-20.8 9.3-20.8 20.8v62.3H289.9c-20.8 0-37.7 16.5-37.7 36.8V346c0 18.1 13.5 33.1 31.1 36.2V830c0 39.6 32.3 71.8 72.1 71.8h312.4c39.8 0 72.1-32.2 72.1-71.8V382.2c17.7-3.1 31.1-18.1 31.1-36.2v-50.9c0.1-20.2-16.9-36.8-37.7-36.8z m-293.5-41.5h145.3v41.5H439.8v-41.5z m-146.2 83.1H729.5v41.5H293.6v-41.5z m404.8 530.2c0 16.7-13.7 30.3-30.6 30.3H355.4c-16.9 0-30.6-13.6-30.6-30.3V382.9h373.6v447.2z"
              fill="#211F1E"
            ></path>
            <path
              d="M511.6 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.4 9.3 20.7 20.8 20.7zM407.8 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0.1 11.4 9.4 20.7 20.8 20.7zM615.4 799.6c11.5 0 20.8-9.3 20.8-20.8V467.4c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.5 9.3 20.8 20.8 20.8z"
              fill="#211F1E"
            ></path>
          </g>
        </svg>
      </button>

      {/* hidden input to upload .csv file */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={uploadCSV}
        style={{ display: "none" }}
      />
      <button
        className="bg-green-400 flex w-10 h-10 justify-center items-center rounded-2xl hover:scale-110 transition-all duration-300"
        onClick={csvClick}
      >
        CSV
      </button>
    </div>
  );
};

export default SingleAccount;
