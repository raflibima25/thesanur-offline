import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import PropTypes from "prop-types";
import { Camera, CameraOff, RefreshCcw, Upload } from "lucide-react";

const QRCodeScanner = ({ onResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [cameraList, setCameraList] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const fileInputRef = useRef(null);

  const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    showTorchButtonIfSupported: true,
  };

  const stopScanner = useCallback(async () => {
    if (html5QrCode?.isScanning) {
      try {
        await html5QrCode.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  }, [html5QrCode]);

  const handleScanSuccess = useCallback(
    async (decodedText) => {
      try {
        onResult(decodedText);
        await stopScanner();
      } catch (err) {
        console.error("Error in scan success handler:", err);
      }
    },
    [onResult, stopScanner]
  );

  // Inisialisasi scanner
  useEffect(() => {
    const qrCode = new Html5Qrcode("qr-reader");
    setHtml5QrCode(qrCode);

    // Get daftar kamera
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices?.length) {
          setCameraList(devices);
          const rearCamera = devices.find(device => device.label.toLowerCase().includes("back")) || devices[0];
          setSelectedCamera(rearCamera.id);
          setCurrentCameraIndex(devices.indexOf(rearCamera));
        }
      })
      .catch((err) => console.error("Error getting cameras", err));

    return () => {
      if (qrCode?.isScanning) {
        qrCode.stop().catch((err) => console.error("Error stopping scanner", err));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!html5QrCode || !selectedCamera) return;

    try {
      await html5QrCode.start(
        { deviceId: cameraList[currentCameraIndex].id },
        qrConfig,
        handleScanSuccess,
        (errorMessage) => {
          if (!errorMessage.includes("NotFound")) {
            console.error(errorMessage);
          }
        }
      );
      setIsScanning(true);
      await handleSwitchCamera();
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const handleFileScan = async (event) => {
    const file = event.target.files[0];
    if (!file || !html5QrCode) return;

    try {
      if (isScanning) await stopScanner();
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      console.error("Error scanning file:", err);
    } finally {
      event.target.value = "";
    }
  };

  const handleSwitchCamera = async () => {
    if (cameraList.length > 1) {
      const nextCameraIndex = (currentCameraIndex + 1) % cameraList.length;
      setCurrentCameraIndex(nextCameraIndex);
      if (isScanning) {
        await stopScanner();
        await startScanner();
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Camera View */}
      <div className="relative aspect-square bg-black rounded-xl overflow-hidden">
        <div
          id="qr-reader"
          className="w-full h-full"
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center dark:bg-gray-800 bg-white">
            <CameraOff className="w-16 h-16 text-gray-500" />
          </div>
        )}

        {/* Button */}
        {cameraList.length > 1 && isScanning && (
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-4 right-20 p-2 bg-gray-300/80 hover:bg-gray-600 rounded-full transition-colors"
            >
              <Upload className="w-6 h-6" />
            </button>
              <button
                onClick={handleSwitchCamera}
                className="absolute top-4 right-4 p-2 bg-gray-300/80 hover:bg-gray-600 rounded-full transition-colors"
              >
                <RefreshCcw className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <button
          onClick={isScanning ? stopScanner : startScanner}
          className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2
            ${isScanning 
              ? "bg-slate-800 hover:bg-slate-900" 
              : "bg-slate-800 hover:bg-slate-900"
            }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="w-5 h-5" />
              Stop Scanning
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Start Scanning
            </>
          )}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden w-full py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload QR Image
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileScan}
      />
    </div>
  );
};

QRCodeScanner.propTypes = {
  onResult: PropTypes.func.isRequired,
};

export default QRCodeScanner;