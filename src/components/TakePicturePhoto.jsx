import Webcam from "react-webcam";
import { useCallback, useRef, useState } from "react";
import React from "react";

const TakePicturePhoto = () => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [mirrored, setMirrored] = useState(false);

    const retake = () => {
        setImgSrc(null);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    return (
        <div className="container">
            <h3>Result : </h3>
            {imgSrc && <img src={imgSrc} />}


            <h5 className="mt-3">Camera :</h5>
            <Webcam
                height={600}
                width={600}
                ref={webcamRef}
                mirrored={mirrored}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.8}
            />
            <div className="controls">
                <div>
                    <input
                        type="checkbox"
                        checked={mirrored}
                        onChange={(e) => setMirrored(e.target.checked)}
                    />
                    <label>Mirror</label>
                </div>
            </div>
            <div className="btn-container">
                {imgSrc ? (
                    <button
                        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={retake}
                    > Retake photo </button>
                ) : (
                    <button
                        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={capture}
                    > Capture photo </button>

                )}
            </div>
        </div>
    );
};

export default TakePicturePhoto;