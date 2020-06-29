import React, { useState } from "react";
import { Upload, message } from "antd";
import { faCloudUploadAlt } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Auth, Storage } from "aws-amplify";
import SearchUploadMeta from "./SearchUploadMeta";
import config from "../config";
import "./SearchUpload.css";

const { Dragger } = Upload;

export default function SearchUpload() {
  const [uploadedFile, setUploadedNames] = useState(null);

  function customRequest(upload) {
    window.foo = upload;

    Auth.currentCredentials().then(() => {
      Storage.put(`${upload.file.uid}/${upload.file.uid}`, upload.file, {
        progressCallback: progress => {
          const percent = (progress.loaded * 100) / progress.total;
          upload.onProgress({ percent });
        },
        contentType: upload.file.type,
        level: "private",
        bucket: config.SEARCH_BUCKET
      })
        .then(result => {
          setUploadedNames(upload.file);
          upload.onSuccess(result);
        })
        .catch(e => upload.onError(e));
    });
  }

  function onRemove(file) {
    Auth.currentCredentials().then(() => {
      Storage.remove(`${file.uid}/${file.uid}`, {
        level: "private",
        bucket: config.SEARCH_BUCKET
      })
        .then(() => {
          setUploadedNames(null);
        })
        .catch(e => message.error(e));
    });
  }

  return (
    <div className="uploader">
      {!uploadedFile && (
        <Dragger
          name="file"
          action=""
          withCredentials
          listType="picture"
          onRemove={onRemove}
          customRequest={customRequest}
          showUploadList
        >
          <p className="ant-upload-drag-icon">
            <FontAwesomeIcon icon={faCloudUploadAlt} size="5x" />
          </p>
          <p className="ant-upload-text">
            Click here or drag a file to this area to upload.
          </p>
        </Dragger>
      )}
      <SearchUploadMeta
        uploadedFile={uploadedFile}
        onSearchSubmit={() => setUploadedNames(null)}
      />
    </div>
  );
}
