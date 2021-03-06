import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Divider, Typography, Button, Tooltip, Row, Col, Alert } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { AppContext } from "../../containers/AppContext";
import { deleteSearch } from "../../libs/awsLib";
import SearchSteps from "./SearchSteps";

const { Text } = Typography;

function AlignmentWarning() {
  return (
    <Alert
      type="warning"
      showIcon
      message="The alignment step can take more than 30 minutes to complete, and only one alignment will process at a time. This page will automatically update once the alignment is finished."
    />
  );
}

function ErrorMessage({ error }) {
  if (error) {
    const message = `There was an error performing this search: ${error}`;
    return (
      <Alert
        type="error"
        showIcon
        message={message}
      />
    );
  }
  return null;
}

ErrorMessage.propTypes = {
  error: PropTypes.string
};

ErrorMessage.defaultProps = {
  error: null
};

export default function SearchList({ searches }) {
  const [appContext] = useContext(AppContext);
  const searchesInProgress = searches
    .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
    .map(search => {
      return (
        <div key={search.id}>
          <Row>
            <Col span={23}>
              <Text strong> &raquo; {search.upload}</Text>{" "}
              <Text type="secondary">
                {appContext.debug ? search.id : null}
              </Text>
            </Col>
            <Col span={1}>
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
          <Row>
            <Col span={24} style={{ marginTop: "1em" }}>
              <SearchSteps search={search} />
              {search.step === 1 && !search.errorMessage && <AlignmentWarning />}
              <ErrorMessage error={search.errorMessage} />
            </Col>
          </Row>
          <Divider style={{margin: '0.2em 0 1em 0'}}/>
        </div>
      );
    });

  if (searchesInProgress.length === 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message="You don't have any searches currently running. Start a new search by uploading an image above."
        style={{ marginBottom: "1em" }}
      />
    );
  }

  return <div>{searchesInProgress}</div>;
}

SearchList.propTypes = {
  searches: PropTypes.arrayOf(PropTypes.object).isRequired
};
