import React from "react";
import PropTypes from "prop-types";
import { Divider, Row, Col, Button } from "antd";
import ImageWithModal from "./ImageWithModal";
import LibraryType from "./LibraryType";
import ExternalLink from "./ExternalLink";

export default function MatchSummary(props) {
  const { match, showModal, isLM, gridView } = props;
  const publishedName =
    match.attrs["Published Name"] ||
    match.attrs.PublishedName ||
    match.attrs["Body Id"];

  if (gridView) {
    return (
      <Col xs={24} md={12} lg={8} xl={6}>
        <ImageWithModal
          thumbSrc={match.thumbnail_path}
          src={match.image_path}
          alt={publishedName}
          showModal={showModal}
        />
        <p style={{ paddingLeft: "2em" }}>
          <ExternalLink
            publishedName={publishedName}
            isLM={isLM}
            library={match.attrs.Library}
          />{" "}
          (Score: {Math.round(match.normalizedScore)})
        </p>
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
            alt={publishedName}
            showModal={showModal}
          />
        </Col>
        <Col span={8}>
          <p>
            <b>{isLM ? "Line Name" : "Body Id"}:</b>{" "}
            <ExternalLink
              publishedName={publishedName}
              isLM={isLM}
              library={match.attrs.Library}
            />
          </p>
          <p>
            <b>Score:</b> {Math.round(match.normalizedScore)}
          </p>
          {isLM && (
            <p>
              <b>Channel:</b> {match.attrs.Channel}
            </p>
          )}
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
