import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Storage } from "aws-amplify";
import { message } from "antd";

import SearchInput from "./SearchInput";
import UnifiedSearchResults from "./UnifiedSearchResults";
import NoSearch from "./NoSearch";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function UnifiedSearch() {
  const query = useQuery();
  const searchTerm = query.get("q");

  const [byLineResult, setByLineResults] = useState(null);
  const [byBodyResult, setByBodyResults] = useState(null);
  const [lineLoading, setLineLoading] = useState(false);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [nameslist, setNamesList] = useState(null);

  useEffect(() => {
    const storageOptions = {
      customPrefix: {
        public: ""
      },
      level: "public",
      download: true
    };

    Storage.get("publishedNames.txt", storageOptions).then(result => {
      // We can't use result.Body.text() here as it is not supported in safari
      const fr = new FileReader();
      fr.onload = evt => {
        const text = evt.target.result;
        setNamesList(text.split("\n"));
      };
      fr.readAsText(result.Body);
    });
  }, []);

  useEffect(() => {
    setByLineResults(null);
    setByBodyResults(null);

    if (!searchTerm || !nameslist) {
      return;
    }

    if (searchTerm.length < 3) {
      message.error("Searches must have a minimum of 3 characters.");
      setByLineResults({
        error: "Searches must have a minimum of 3 characters.",
        results: []
      });
      setByBodyResults({
        error: "Searches must have a minimum of 3 characters.",
        results: []
      });
      return;
    }
    if (searchTerm.match(/\*(\*|\.)\*/)) {
      message.error("Ha ha, nice try");
      setByLineResults({ error: "Ha ha, nice try", results: [] });
      setByBodyResults({ error: "Ha ha, nice try", results: [] });
      return;
    }

    setLineLoading(true);
    setBodyLoading(true);

    const storageOptions = {
      customPrefix: {
        public: ""
      },
      level: "public",
      download: true
    };

    // get the list of names that match the query
    let matchedNames = [];

    if (nameslist) {
      const match = new RegExp(`^${searchTerm.replace(/\*/g, ".*")}$`, "i");
      matchedNames = nameslist.filter(item => {
        return item.match(match);
      });
    }

    // set a limit on the number of items that can be searched,
    // so we don't break the site. Need to think this over.
    matchedNames = matchedNames
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      )
      .slice(0, 100);

    const lineNames = matchedNames.filter(name => name.match(/[a-z]/i));
    const lineCombined = { results: [] };
    lineNames.forEach(name => {
      Storage.get(`metadata/by_line/${name}.json`, storageOptions)
        .then(metaData => {
          // We can't use metaData.Body.text() here as it is not supported in safari
          const fr = new FileReader();
          fr.onload = evt => {
            const text = evt.target.result;
            const newResults = JSON.parse(text);
            lineCombined.results.push(...newResults.results);
            setByLineResults({ ...lineCombined });
            setLineLoading(false);
          };
          fr.readAsText(metaData.Body);
        })
        .catch(error => {
          if (error === "No credentials") {
            // Log me out and prompt me to login again.
          }
          setByLineResults({ error, results: [] });
          setLineLoading(false);
        });
    });

    if (lineNames.length === 0) {
      setByLineResults({ results: [] });
      setLineLoading(false);
    }

    const bodyIds = matchedNames.filter(name => !name.match(/[a-z]/i));
    const bodyCombined = { results: [] };
    bodyIds.forEach(name => {
      Storage.get(`metadata/by_body/${name}.json`, storageOptions)
        .then(metaData => {
          // We can't use metaData.Body.text() here as it is not supported in safari
          const fr = new FileReader();
          fr.onload = evt => {
            const text = evt.target.result;
            const newResults = JSON.parse(text);
            bodyCombined.results.push(...newResults.results);
            setByBodyResults({ ...bodyCombined });
            setBodyLoading(false);
          };
          fr.readAsText(metaData.Body);
        })
        .catch(error => {
          if (error === "No credentials") {
            // Log me out and prompt me to login again.
          }
          setByBodyResults({ error, results: [] });
          setBodyLoading(false);
        });
    });

    if (bodyIds.length === 0) {
      setByBodyResults({ results: [] });
      setBodyLoading(false);
    }
  }, [searchTerm, nameslist]);

  return (
    <div>
      <SearchInput searchTerm={searchTerm} />
      {!searchTerm && !byLineResult && !byBodyResult && <NoSearch />}
      {(lineLoading || bodyLoading) && <p>loading...</p>}
      {byLineResult && byBodyResult && (
        <UnifiedSearchResults
          searchTerm={searchTerm}
          linesResult={byLineResult}
          skeletonsResult={byBodyResult}
        />
      )}
    </div>
  );
}
