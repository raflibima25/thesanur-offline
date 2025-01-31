import { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Cropper from "react-easy-crop";
import Webcam from "react-webcam";
import { getCroppedImg } from "../utils/imageUtils";
import ComputerIcon from "../../public/assets/icons/laptop.svg";
import CameraIcon from "../../public/assets/icons/camera.svg";

const PhotoUploadModal = ({ onClose, onSave, uploading }) => {
  const [photoMode, setPhotoMode] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mirrored, setMirrored] = useState(true);

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      setShowCropper(true);
    }
  };

  const handleCameraCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreviewUrl(imageSrc);
    setShowCropper(true);
    setIsCameraActive(false);
  }, [webcamRef]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSavePhoto = async () => {
    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
      onSave(croppedBlob);
    } catch (err) {
      console.error("Error saving photo:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full p-6 font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {!photoMode && !showCropper && (
          <div className="space-y-4 mb-4">
            <h3 className="text-lg font-semibold text-center">
              Choose a Photo Upload
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => {
                  setPhotoMode("upload");
                  document.getElementById("photo-upload").click();
                }}
                className="flex items-center gap-2 flex-1 py-2 px-4 bg-sky-200 text-sm rounded-lg hover:bg-sky-300"
              >
                <img
                  src={ComputerIcon}
                  alt="Computer icon"
                  className="w-6 h-6"
                />
                Upload from Computer
              </button>
              <button
                onClick={() => {
                  setPhotoMode("capture");
                  setIsCameraActive(true);
                }}
                className="flex items-center gap-2 text-center flex-1 py-2 px-4 bg-sky-200 text-sm rounded-lg hover:bg-sky-300"
              >
                <img src={CameraIcon} alt="Computer icon" className="w-6 h-6" />
                Take a Picture
              </button>
            </div>
          </div>
        )}

        {photoMode === "capture" && isCameraActive && (
          <div className="space-y-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
              mirrored={mirrored}
            />
            <div className="flex items-center gap-4 justify-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mirrored}
                  onChange={(e) => setMirrored(e.target.checked)}
                />
                Mirror
              </label>
              <button
                onClick={handleCameraCapture}
                className="py-2 px-4 bg-sky-200  rounded-lg hover:bg-sky-300"
              >
                Take photo
              </button>
              <button
                onClick={() => {
                  setIsCameraActive(false);
                  setPhotoMode(null);
                }}
                className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showCropper && (
          <div className="space-y-4">
            <div className="relative h-80">
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSavePhoto}
                disabled={uploading}
                className="flex-1 py-2 px-4 bg-sky-200  rounded-lg hover:bg-sky-300"
              >
                {uploading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setPhotoMode(null);
                  setPreviewUrl("");
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

PhotoUploadModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  uploading: PropTypes.bool.isRequired,
};

export default PhotoUploadModal;
