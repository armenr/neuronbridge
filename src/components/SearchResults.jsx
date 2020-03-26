import React from "react";
import PropTypes from "prop-types";
import { Spin, Divider } from "antd";
import LineResult from "./LineResult";
import SkeletonResult from "./SkeletonResult";

export default function SearchResults(props) {
  const { searchResult, searchType } = props;

  if (searchResult) {
    const { results, error } = searchResult;
    if (error) {
      return (
        <div className="results">
          <p>Search returned an error</p>
        </div>
      );
    }

    const resultsList = results.map(result => {
      if (searchType === "lines") {
        return (
          <>
            <LineResult metaInfo={result} key={result.id} />
            <Divider dashed />
          </>
        );
      }
      return (
        <>
          <SkeletonResult metaInfo={result} key={result.id} />
          <Divider dashed />
        </>
      );
    });

    return (
      <div className="results">
        <p>
          Results 1 - {resultsList.length} of {resultsList.length}
        </p>
        {resultsList}
      </div>
    );
  }
  return (
    <div className="results">
      <Spin tip="Loading..." size="large" />
    </div>
  );
}

SearchResults.propTypes = {
  searchResult: PropTypes.object.isRequired,
  searchType: PropTypes.string
};

SearchResults.defaultProps = {
  searchType: "lines"
};
