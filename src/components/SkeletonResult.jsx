import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Row, Col } from "antd";
import PropTypes from "prop-types";
import ImageWithModal from "./ImageWithModal";
import SkeletonMeta from "./SkeletonMeta";

export default function SkeletonResult(props) {
  const location = useLocation();
  const { metaInfo } = props;

  const matchesUrl = `/search/skeletons/${metaInfo.attrs["Body Id"]}/matches/${metaInfo.id}`;


  // only use values in the metaInfo.attrs key to display on the site. The
  // other keys are for internal use only.
  return (
    <Row>
      <Col md={10}>
        <ImageWithModal thumbSrc={metaInfo.thumbnail_path} src={metaInfo.image_path} title={metaInfo.attrs["Body Id"]} />
      </Col>
      <Col md={8}>
        <SkeletonMeta attributes={metaInfo.attrs} />
      </Col>
      <Col md={6}>
        <Button type="primary" disabled={/matches$/.test(location.pathname)}>
          <Link to={matchesUrl}>View LM Matches</Link>
        </Button>
      </Col>
    </Row>
  );
}

SkeletonResult.propTypes = {
  metaInfo: PropTypes.object.isRequired
};
