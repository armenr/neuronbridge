import React from "react";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
// import { LoadingOutlined, WarningOutlined } from "@ant-design/icons";
import MaskSelectionStep from "./MaskSelectionStep";
import FileUploadStep from "./FileUploadStep";
import ImageAlignmentStep from "./ImageAlignmentStep";
import ColorDepthSearchStep from "./ColorDepthSearchStep";
import CompleteStep from "./CompleteStep";
import "./SearchSteps.less";

// const { Step } = Steps;

/* const steps = [
  "Files Uploaded",
  "Image Alignment",
  "Mask Selection",
  "Color Depth Search",
  "Complete"
]; */

function stepState(step, current, error) {
  if (step === current && error) {
    return 'error';
  }
  if (step === current) {
    return 'active';
  }
  if (step > current) {
    return 'pending';
  }
  // step < current
  return 'complete';
}

export default function SearchSteps({ search }) {
  const { errorMessage } = search;
  const searchLink = `/results/${search.id}`;
  // there are 5 steps in the process stored in the database, but we
  // only display 3 in this component, so need this replaces 2 of them
  // with the step that we want to show.
  let currentStep = search.step;
  if (search.step === 4 && search.cdsFinished) {
    currentStep = 5;
  }

    /*   const formattedSteps = steps.map((step, i) => {
    // by default we want to show the spinning loading icon
    // to indicate that something is happening.
    let icon = <LoadingOutlined />;
    // if we are on a step that is waiting for user input, then we need
    // to remove the spinning loader icon. This is after the alignment step
    // before the searchMask has been chosen.
    if (search.step === 2 && !search.searchMask) {
      icon = null;
    }
    if (currentStep === i) {
      // if search has an errorMessage then show error icon for the
      // currently active step
      if (errorMessage) {
        icon = <WarningOutlined />;
      }
      return <Step key={step} icon={icon} title={step} />;
    }
    return <Step key={step} title={step} />;
  });

  let status = "process";
  if (errorMessage) {
    status = "error";
  } */

  return (
    <div className="searchSteps">
      {/* <Steps size="small" current={currentStep} status={status}>
        {formattedSteps}
      </Steps> */}
      <Row>
        <Col xs={5}>
          <FileUploadStep state={stepState(0, currentStep, errorMessage)} date={search.createdOn} />
        </Col>
        <Col xs={5}>
          <ImageAlignmentStep state={stepState(1, currentStep, errorMessage)} search={search} />
                </Col>
        <Col xs={5}>
          <MaskSelectionStep search={search} state={stepState(2, currentStep, errorMessage)} />
        </Col>

        <Col xs={5}>
          <ColorDepthSearchStep date={search.cdsFinished} state={stepState(3, currentStep, errorMessage)} />
        </Col>
        <Col xs={4}>
          <CompleteStep resultsUrl={searchLink} matches={search.nTotalMatches} state={stepState(4, currentStep, errorMessage)} />
        </Col>
      </Row>
    </div>
  );
}

SearchSteps.propTypes = {
  search: PropTypes.object.isRequired
};
