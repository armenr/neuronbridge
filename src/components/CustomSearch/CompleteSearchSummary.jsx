import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tooltip, Button, Row, Col } from "antd";
import { CloseOutlined, WarningOutlined } from "@ant-design/icons";
import { formatRelative } from "date-fns";
import { Link } from "react-router-dom";
import { faFileImage } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteSearch, signedLink } from "../../libs/awsLib";
import neuronbridgeLogo from "../../neuronbridge_logo.png";

import "./CompleteSearchSummary.css";

export default function CompleteSearchSummary({ search }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const searchLink = `/results/${search.id}`;

  useEffect(() => {
    if (search.displayableMask) {
      const uploadUrl = `${search.searchDir}/${search.displayableMask}`;
      signedLink(uploadUrl).then(result => {
        setThumbnailUrl(result);
      });
    } else {
      setThumbnailUrl(neuronbridgeLogo);
    }
  }, [search]);

  let thumbnail = (
    <div className="completeThumbnailMissing">
      <FontAwesomeIcon icon={faFileImage} size="2x" />
    </div>
  );
  if (search.displayableMask) {
    thumbnail = (
      <img
        className="completeThumbnail"
        src={thumbnailUrl}
        alt={search.upload}
      />
    );
  }

  const searchType = search.searchType === "em2lm" ? "LM" : "EM";

  const searchMessage = search.errorMessage ? (
    <>
      <span style={{ color: "red" }}>
        <WarningOutlined style={{ color: "#f00", fontSize: "1.5em" }} /> Search
        failed. <br />
        Please try again.
      </span>
    </>
  ) : (
    <Link to={searchLink} disabled={Boolean(search.errorMessage)}>
      {search.nTotalMatches} {searchType} matches
    </Link>
  );

  return (
    <Row gutter={16} align="middle">
      <Col lg={4}>{thumbnail}</Col>
      <Col lg={6}>
        <Tooltip title={search.upload}>
          <Link
            to={searchLink}
            disabled={Boolean(search.errorMessage)}
            style={{
              display: "block",
              textWrap: "none",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {search.upload}
          </Link>
        </Tooltip>
      </Col>
      <Col lg={6}>{searchMessage}</Col>
      <Col lg={6}>
        Started {formatRelative(new Date(search.createdOn), new Date())}
      </Col>
      <Col>
        <Tooltip title="Delete">
          <Button
            danger
            size="small"
            shape="circle"
            onClick={() => deleteSearch(search)}
            icon={<CloseOutlined />}
          />
        </Tooltip>
      </Col>
    </Row>
  );
}

CompleteSearchSummary.propTypes = {
  search: PropTypes.object.isRequired
};
