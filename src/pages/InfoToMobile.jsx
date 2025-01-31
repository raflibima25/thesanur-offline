import { useEffect } from "react";
import LogoTs from "../../public/assets/logo/logo-ts.svg";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const InfoToMobile = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Force desktop mode jika di mobile
        const viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.content = "width=1024";
        }
    }, []);

    return (
        <div className="min-h-screen bg-[url('/assets/background/Background.svg')] bg-cover bg-center flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md bg-[#313131] rounded-3xl shadow-xl p-12 text-center">
                <img src={LogoTs} alt="The Sanur" className="w-48 mx-auto mb-8" />

                <h1 className="text-3xl text-white font-iowan font-semibold mb-6">Mobile Only Access</h1>

                <p className="mb-8 text-white/80 font-inter">
                    This feature is only available on mobile devices. Please access this website to login.
                </p>

                <div className="bg-white/10 rounded-xl p-6 mb-8 flex justify-center">
                    <QRCodeSVG
                        value={window.location.origin}
                        size={200}
                        level="H"
                        fgColor="#F1B81C"
                        bgColor="transparent"
                        includeMargin={true}
                    />
                </div>

                <p className="mt-4 text-white/60 text-sm">Scan this QR code with your mobile device</p>

                <div className="mt-6">
                    <p className="text-sm text-white/60 font-inter">Desktop version is limited to registration only</p>
                    <p className="text-sm text-white/80 font-inter mt-2">
                        Don&apos;t have an account?{" "}
                        <span
                            className="text-[#F3CC30] cursor-pointer hover:underline font-bold"
                            onClick={() => navigate("/register")}
                        >
                            Sign Up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InfoToMobile;
