import React, {useEffect, useState} from 'react';
import config from "../config";
import {Button, Row, Input} from "antd";
import EntryList2 from "./EntryList2";
import MyContext from "./MyContext";

const { Search } = Input;

export default function SearchLines(props) {

  const [selectedValue, setSelectedValue] = React.useState(props.elemId);
  const [currResult, setCurrResult] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = value => {
    setOpen(false);
  };

  const handleSearch = value => {
    setSelectedValue(value);
  };

  function getLineInformation(name){
    if (name) {
      const path = config.LINE_PATH + name + '.json';
      fetch(path)
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          setCurrResult(json['results']);
        }).catch(function(error) {
          console.log(error);
        });
      }
  };

  return (
      <MyContext.Consumer>
        {context => (
            <div className="mt3">
             <h2>New Search</h2>
             <Search
               placeholder="input search text"
               enterButton="Find Lines"
               size="large"
               defaultValue="BJD_SS02256"
               onSearch={value => context.getInformation(value, config.LINE_PATH)}
             />
           </div>
        )}
      </MyContext.Consumer>
  );
}