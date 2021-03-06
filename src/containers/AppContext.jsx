import React, { useState } from "react";
import PropTypes from "prop-types";

const AppContext = React.createContext([{}, () => {}]);

const AppProvider = (props) => {
  const [state, setState] = useState({
    username: null,
    searchType: 'lines',
    gridView: true,
    showHelp: false,
    helpTarget: null,
    showFilterMenu: false,
    paths: {},
    debug: false
  });
  const { children } = props;
  return (
    <AppContext.Provider value={[state, setState]}>
        {children}
    </AppContext.Provider>
  );
}

AppProvider.propTypes = {
  children: PropTypes.object.isRequired
}

export { AppContext, AppProvider };
