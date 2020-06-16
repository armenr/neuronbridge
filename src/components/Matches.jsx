import React, { useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation, useHistory } from "react-router-dom";
import {
  Switch,
  Row,
  Col,
  Pagination,
  Divider,
  Spin,
  Empty,
  message
} from "antd";
import { AppContext } from "../containers/AppContext";
import { FilterContext } from "../containers/FilterContext";
import LineSummary from "./LineSummary";
import MatchSummary from "./MatchSummary";
import SkeletonSummary from "./SkeletonSummary";
import MatchModal from "./MatchModal";
import HelpButton from "./HelpButton";
import FilterMenu from "./FilterMenu";
import FilterButton from "./FilterButton";
import { useQuery } from "../libs/hooksLib";

import config from "../config";

export default function Matches(props) {
  const { searchResult, searchType } = props;
  const { results } = searchResult;

  // const [page, setPage] = useState(1);

  const { matchId } = useParams();

  const query = useQuery();
  const location = useLocation();
  const history = useHistory();

  // get the current page number for the results, but prevent page
  // numbers below 0. Can't set the max value here, but if the user
  // is screwing around with the url, they know what is going to
  // happen.
  const page = Math.max(parseInt(query.get("page") || 1, 10), 1);
  // get the number of matches per page, but set the minimum and
  // maximum values, to prevent someone from changing the url to
  // -1 or 1000
  const matchesPerPage = Math.min(
    Math.max(parseInt(query.get("pc") || 30, 10), 10),
    100
  );

  const [matchMeta, setMatchMeta] = useState(null);
  const [modalOpen, setModalOpen] = useState(0);
  const [isLoading, setLoading] = useState(false);
  // const [matchesPerPage, setMatchesPerPage] = useState(30);
  const [appState, setAppState] = useContext(AppContext);
  const [filterState] = useContext(FilterContext);

  useEffect(() => {
    function getMatches() {
      setLoading(true);
      const path = `${config.MATCH_PATH}${matchId}.json`;
      fetch(path)
        .then(response => response.json())
        .then(json => {
          setMatchMeta(json);
          setLoading(false);
        })
        .catch(() => {
          message.error("Unable to load matches from the server");
          setLoading(false);
        });
    }

    getMatches();
  }, [matchId, searchResult]);

  function handlePageChange(newPage) {
    query.set("page", newPage);
    location.search = query.toString();
    history.push(location);
  }

  function handleChangePageSize(current, size) {
    query.set("pc", size);
    query.set("page", 1);
    location.search = query.toString();
    history.push(location);
  }

  function handleModalOpen(index) {
    const matchPosition = page * matchesPerPage - matchesPerPage + index + 1;
    setModalOpen(matchPosition);
  }

  const matchInput = results.filter(result => result.id === matchId)[0];
  const resultsPerLine = filterState.resultsPerLine || 1;

  if (!matchInput) {
    return <p>Loading...</p>;
  }

  let pageinatedList = [];
  let fullList = [];
  let matchSummaries = [];
  const countsByLibrary = {};

  function incrementLibCount(library) {
    if (!(library in countsByLibrary)) {
      countsByLibrary[library] = 0;
    }
    countsByLibrary[library] += 1;
  }

  const summary =
    searchType === "lines" ? (
      <LineSummary lineMeta={matchInput} />
    ) : (
      <SkeletonSummary metaInfo={matchInput} />
    );

  if (matchMeta) {
    // if isLM then a more complex sort is required.
    // - convert fullList into a list of lines where each line name
    //   has the max score and  all the channels as an array of children
    //   [
    //     {
    //       PublishedName: String,
    //       Channels: [{},{},{}],
    //       Score: Int <Max Score>
    //     },
    //     {...}
    //   ]
    //
    if (searchType !== "lines") {
      const byLines = {};
      matchMeta.results
        .forEach(result => {
          const { publishedName, libraryName } = result;
          const currentScore =
            filterState.sortResultsBy === 2
              ? result.matchingPixels
              : result.normalizedScore;

          if (publishedName in byLines) {
            byLines[publishedName].score = Math.max(
              parseInt(byLines[publishedName].score, 10),
              currentScore
            );
            byLines[publishedName].channels.push(result);
          } else {
            byLines[publishedName] = {
              score: parseInt(currentScore, 10),
              channels: [result],
              libraryName
            };
          }
        });
      const sortedByLine = Object.values(byLines).sort(
        (a, b) => b.score - a.score
      );
      const limitedByLineCount = sortedByLine.map(line =>
        line.channels
          .sort((a, b) => {
            if (filterState.sortResultsBy === 2) {
              return b.attrs["Matched pixels"] - a.attrs["Matched pixels"];
            }
            return b.normalizedScore - a.normalizedScore;
          })
          .slice(0, resultsPerLine)
      );

      limitedByLineCount.forEach(lines => {
        lines.forEach(line => incrementLibCount(line.libraryName));
      });

      // remove the filtered libraries
      const filteredByLibrary = limitedByLineCount.filter(
        result => !(result[0].libraryName in filterState.filteredLibraries)
      );

      fullList = [].concat(...filteredByLibrary);
    } else {
      fullList = matchMeta.results
        .filter(
          result => !(result.libraryName in filterState.filteredLibraries)
        )
        .sort((a, b) => {
          if (filterState.sortResultsBy === 2) {
            return b.attrs["Matched pixels"] - a.attrs["Matched pixels"];
          }
          return b.normalizedScore - a.normalizedScore;
        });

      matchMeta.results.forEach(line => {
        incrementLibCount(line.libraryName);
      });
    }

    pageinatedList = fullList.slice(
      page * matchesPerPage - matchesPerPage,
      page * matchesPerPage
    );

    matchSummaries = pageinatedList.map((result, index) => {
      const key = `${result.matchedId}_${result.score}_${result.matchedPixels}_${index}`;
      return (
        <React.Fragment key={key}>
          <MatchSummary
            match={result}
            isLM={!(searchType === "lines")}
            showModal={() => handleModalOpen(index)}
            gridView={appState.gridView}
          />
        </React.Fragment>
      );
    });
  }

  if (appState.gridView) {
    matchSummaries = <Row gutter={16}>{matchSummaries}</Row>;
  }

  if (pageinatedList.length === 0) {
    matchSummaries = (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            There are no results to show. Please try using less restrictive
            filters.
          </span>
        }
      />
    );
  }

  return (
    <div>
      <h3>Input Image</h3>
      {summary}
      <Divider />
      {isLoading && (
        <div className="searchLoader">
          <Spin size="large" />
        </div>
      )}
      {!isLoading && matchMeta && (
        <>
          <Row style={{ paddingBottom: "1em" }}>
            <Col md={24} lg={5}>
              <h3>
                {searchType === "lines" ? "LM to EM" : "EM to LM"} Matches{" "}
                <HelpButton
                  target={
                    searchType === "lines" ? "MatchesLMtoEM" : "MatchesEMtoLM"
                  }
                />
              </h3>
            </Col>
            <Col md={20} lg={14} style={{ textAlign: "center" }}>
              <Pagination
                current={page}
                pageSize={matchesPerPage}
                onShowSizeChange={handleChangePageSize}
                pageSizeOptions={[10, 30, 50, 100]}
                onChange={handlePageChange}
                responsive
                showLessItems
                total={fullList.length}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} matches`
                }
              />
            </Col>
            <Col md={4} lg={3} style={{ textAlign: "center" }}>
              <FilterButton />
            </Col>
            <Col lg={2} style={{ textAlign: "right" }}>
              <Switch
                checked={appState.gridView}
                checkedChildren="Grid"
                unCheckedChildren="List"
                onChange={() =>
                  setAppState({ ...appState, gridView: !appState.gridView })
                }
              />
            </Col>
          </Row>
          <FilterMenu
            searchType={searchType}
            countsByLibrary={countsByLibrary}
          />
          {matchSummaries}
          <Pagination
            current={page}
            pageSize={matchesPerPage}
            onShowSizeChange={handleChangePageSize}
            pageSizeOptions={[10, 30, 50, 100]}
            onChange={handlePageChange}
            responsive
            showLessItems
            total={fullList.length}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} matches`
            }
          />

          <MatchModal
            isLM={!(searchType === "lines")}
            open={modalOpen}
            setOpen={setModalOpen}
            matchesList={fullList}
            mask={matchInput}
          />
        </>
      )}
    </div>
  );
}

Matches.propTypes = {
  searchResult: PropTypes.object.isRequired,
  searchType: PropTypes.string.isRequired
};
