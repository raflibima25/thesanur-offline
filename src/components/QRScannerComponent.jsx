import React from "react";
import QRCodeScanner from "./QRCodeScanner";
import PropTypes from "prop-types";

const QRScannerComponent = ({ onResult }) => {
  return (
    <div className="rounded-2xl overflow-hidden">
      <QRCodeScanner onResult={onResult} />
    </div>
  );
};

QRScannerComponent.propTypes = {
  onResult: PropTypes.func.isRequired,
};

export default QRScannerComponent;