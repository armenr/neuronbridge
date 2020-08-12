import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Storage, API, graphqlOperation } from "aws-amplify";
import { Divider } from "antd";
import Matches from "./Matches";
import * as queries from "../graphql/queries";
import config from "../config";

const storageOptions = {
  level: "private",
  download: true,
  bucket: config.SEARCH_BUCKET
};

export default function Results({ match }) {
  const searchId = match.params.id;
  const [searchMeta, setSearchMeta] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  useEffect(() => {
    if (searchId) {
      const query = graphqlOperation(queries.getSearch, {
        id: searchId
      });
      API.graphql(query)
        .then(results => setSearchMeta(results.data.getSearch))
        .catch(error => console.log(error));
    }
  }, [searchId]);

  useEffect(() => {
    if (searchMeta && searchMeta.searchDir) {
      const resultFile = searchMeta.upload.replace(/[^.]*$/, 'result');
      const resultsUrl = `${searchMeta.searchDir}/${resultFile}`;
      Storage.get(resultsUrl, storageOptions).then(results => {
        const fr = new FileReader();
        fr.onload = evt => {
          const text = evt.target.result;
          const newResults = JSON.parse(text);
          setSearchResults(newResults);
        };
        fr.readAsText(results.Body);
      });
    }
  }, [searchMeta]);

  if (!searchMeta || !searchResults) {
    return <p>...loading</p>;
  }

  const searchType = (searchMeta.searchType === "em2lm") ? "skeleton" : "lines";

  return (
    <div>
      <p>Results for {searchMeta.upload}</p>
      <Divider/>
      <Matches
        input={searchMeta}
        matches={searchResults}
        searchType={searchType}
      />
    </div>
  );
}

Results.propTypes = {
  match: PropTypes.object.isRequired
};
