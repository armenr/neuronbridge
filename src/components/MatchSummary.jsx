import React from "react";
import PropTypes from "prop-types";
import { Divider, Row, Col, Button } from "antd";
import ImageWithModal from "./ImageWithModal";
import LibraryType from "./LibraryType";

export default function MatchSummary(props) {
  const { match, showModal, isLM, gridView } = props;

  if (gridView) {
    return (
      <Col span={6}>
        <ImageWithModal
          thumbSrc={match.thumbnail_path}
          src={match.image_path}
          alt={match.attrs.PublishedName}
          showModal={showModal}
        />
        <p>
          <b>{isLM ? "Line Name" : "Body Id"}:</b> {match.attrs.PublishedName}
        </p>
        <p>
          <b>Matched Pixels:</b> {match.attrs["Matched slices"]}
        </p>
        <LibraryType type={match.attrs.Library} />
      </Col>
    );
  }

  return (
    <>
      <Row className="matchSummary">
        <Col span={8}>
          <ImageWithModal
            thumbSrc={match.thumbnail_path}
            src={match.image_path}
            alt={match.attrs.PublishedName}
            showModal={showModal}
          />
        </Col>
        <Col span={8}>
          <p>
            <b>{isLM ? "Line Name" : "Body Id"}:</b> {match.attrs.PublishedName}
          </p>
          <p>
            <b>Matched Pixels:</b> {match.attrs["Matched slices"]}
          </p>
          <LibraryType type={match.attrs.Library} />
        </Col>
        <Col span={8}>
          <Button onClick={showModal}>Select</Button>
        </Col>
      </Row>
      <Divider dashed />
    </>
  );
}

MatchSummary.propTypes = {
  match: PropTypes.object.isRequired,
  showModal: PropTypes.func.isRequired,
  isLM: PropTypes.bool,
  gridView: PropTypes.bool.isRequired
};

MatchSummary.defaultProps = {
  isLM: true
};
