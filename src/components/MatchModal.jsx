import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Row, Col } from "antd";
import ImageComparison from "./ImageComparison";
import LibraryType from "./LibraryType";
import ExternalLink from "./ExternalLink";

export default function MatchModal(props) {
  const { open, setOpen, matchesList, mask, isLM } = props;

  const [maskOpen, setMaskOpen] = useState(true);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(open);
  }, [open]);

  function downHandler({ key }) {
    if (/^Arrow(Left|Down)$/.test(key)) {
      setSelected(current => {
        if (current > 1) {
          return current - 1;
        }
        return current;
      });
    }
    if (/^Arrow(Right|Up)$/.test(key)) {
      setSelected(current => {
        if (current < matchesList.length) {
          return current + 1;
        }
        return current;
      });
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  });

  const selectedMatch = matchesList[selected - 1];

  let metaBlock = <p>Loading...</p>;

  if (mask) {
    if (!isLM) {
      metaBlock = (
        <>
          <p>
            <b>Line Name:</b> {mask.attrs["Published Name"]}
          </p>
          <p>
            <b>Slide Code:</b> {mask.attrs["Slide Code"]}
          </p>
          <p>
            <b>Channel:</b> {mask.attrs.Channel}
          </p>
          <LibraryType type={mask.attrs.Library} />
        </>
      );
    } else {
      // skeleton type from EM
      metaBlock = (
        <>
          <p>
            <b>Body Id:</b> {mask.attrs["Body Id"]}
          </p>
          <LibraryType type={mask.attrs.Library} />
        </>
      );
    }
  }

  if (!selectedMatch) {
    return null;
  }

  return (
    <Modal
      visible={Boolean(open)}
      onCancel={() => setOpen(0)}
      footer={[
        <Button
          key="prev"
          type="primary"
          disabled={selected <= 1}
          onClick={() =>
            setSelected(current => {
              if (current > 1) {
                return current - 1;
              }
              return current;
            })
          }
        >
          Previous
        </Button>,
        <Button
          key="next"
          type="primary"
          disabled={selected >= matchesList.length}
          onClick={() =>
            setSelected(current => {
              if (current < matchesList.length) {
                return current + 1;
              }
              return current;
            })
          }
        >
          Next
        </Button>,
        <Button
          key="mask"
          type="primary"
          onClick={() => setMaskOpen(!maskOpen)}
        >
          {maskOpen ? "Hide Mask" : "Show Mask"}
        </Button>,
        <Button key="back" type="primary" onClick={() => setOpen(0)}>
          Done
        </Button>
      ]}
      width="90%"
    >
      <Row>
        <Col sm={12}>
          <h3>Input Image</h3>
          {metaBlock}
        </Col>
        <Col sm={12}>
          <h3>
            Match {selected} of {matchesList.length}
          </h3>
          <p>
            <b>{isLM ? "Line Name" : "Body Id"}:</b>{" "}
            <ExternalLink
              publishedName={selectedMatch.attrs.PublishedName}
              isLM={isLM}
            />
          </p>
          <p>
            <b>Score:</b> {selectedMatch.attrs["Matched pixels"]}
          </p>
          <LibraryType type={selectedMatch.attrs.Library} />
        </Col>
      </Row>
      <ImageComparison
        maskOpen={maskOpen}
        maskPath={mask.image_path}
        matchPath={selectedMatch.image_path}
      />
    </Modal>
  );
}

MatchModal.propTypes = {
  open: PropTypes.number.isRequired,
  setOpen: PropTypes.func.isRequired,
  matchesList: PropTypes.arrayOf(PropTypes.object),
  mask: PropTypes.object,
  isLM: PropTypes.bool.isRequired
};

MatchModal.defaultProps = {
  matchesList: [],
  mask: {}
};
