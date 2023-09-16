import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../Styles/Upload.css";
import convertToBase64 from "../helper/fileutil";

const UploadFile = ({ closeModal, Filename, setFilename, setDocument }) => {
  const { id } = useParams();
  const [updatedFiles, setUpdatedFiles] = useState([]);
  // console.log(id);

  const handleFileSubmit = (e) => {
    const selectedFiles = e.target.files;
    const filesToUpload = [];

    const filePromises = Array.from(selectedFiles).map((file) =>
      convertToBase64(file)
        .then((res) => {
          const updatedFile = { name: file.name, base64: res };
          return updatedFile;
        })
        .catch((error) => {
          console.error(`Error converting ${file.name} to base64:`, error);
          return null;
        })
    );

    Promise.all(filePromises)
      .then((updatedFiles) => {
        const filteredFiles = updatedFiles.filter((file) => file !== null);
        setUpdatedFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
      })
      .catch((error) => {
        console.error("Error converting files to base64:", error);
      });

    filesToUpload.push(...selectedFiles);
    setFilename((prevFilename) => [...prevFilename, ...filesToUpload]);
  };

  // console.log(updatedFiles);

  const saveFiles = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ENDPOINT}/saveFiles/${id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedFiles),
        }
      );
      if (response.status === 200) {
        // Files saved successfully
        window.location.reload(false);
      } else {
        throw new Error("Error saving files");
      }
    } catch (error) {
      console.error(error);
    }
    closeModal(false);
  };

  return (
    <div className="modal-background">
      <div className="frame-6">
        <div className="frame-3 screen">
          <div className="overlap-group">
            <div className="upload-files-to-attach valign-text-middle poppins-medium-bunting-14px">
              Upload files to attach
            </div>
            <div className="frame-4">
              <input
                type="file"
                className="fileinput"
                onChange={handleFileSubmit}
                value={""}
                multiple // Allow multiple file selection
              />
              <div className="drag-and-drop-files valign-text-middle">
                <div className="container-center-horizontal">
                  <span className="span0">Drag and drop files here or</span>
                  <button className="span1 browse poppins-medium-azure-radiance-14px">
                    browse
                  </button>
                </div>
              </div>
            </div>
            <div className="uploaded-files  valign-text-middle poppins-medium-bunting-14px">
              Uploaded Files
            </div>
            {Filename.length === 0 ? (
              <>
                <svg
                  width="58"
                  height="58"
                  viewBox="0 0 58 58"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.83358 9.66667V53.1667H48.5002V58H9.83358C7.17524 58 5.00024 55.825 5.00024 53.1667V9.66667H9.83358ZM36.4169 16.9167H49.7086L36.4169 3.625V16.9167ZM19.5002 0H38.8336L53.3336 14.5V43.5C53.3336 46.1825 51.1827 48.3333 48.5002 48.3333H19.5002C18.2184 48.3333 16.989 47.8241 16.0826 46.9177C15.1761 46.0113 14.6669 44.7819 14.6669 43.5V4.83333C14.6669 2.15083 16.8177 0 19.5002 0ZM41.2502 38.6667V33.8333H19.5002V38.6667H41.2502ZM48.5002 29V24.1667H19.5002V29H48.5002Z"
                    fill="#0478FF"
                  />
                </svg>
                <div className="no-file-upload-yet  valign-text-middle">
                  No file upload yet
                </div>
              </>
            ) : (
              <ul className="filelist">
                {Filename.map((file, index) => {
                  return <span key={index}>{file.name}</span>;
                })}
              </ul>
            )}
            <div className="frame-5">
              <button
                onClick={() => {
                  closeModal(false);
                  window.location.reload(false);
                }}
                className="cancel valign-text-middle poppins-medium-azure-radiance-14px"
              >
                Cancel
              </button>
              <button
                className="attach-file valign-text-middle "
                onClick={() => {
                  saveFiles();
                }}
              >
                Attach File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
