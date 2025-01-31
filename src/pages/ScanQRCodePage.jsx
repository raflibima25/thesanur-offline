import React from "react";
import QRScannerComponent from "../components/QRScannerComponent";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ScanQRCodePage = () => {
  const navigate = useNavigate();
  const [data, setData] = React.useState("Not Found");
  const handleQRCodeResult = (result) => {
    console.log("Scanned QR Code:", result);
    if (result) {
      try {
        // Validasi hasil scan
        const decodedText = result.toString().trim();
        if (!decodedText) {
          throw new Error("Hasil scan kosong");
        }
        alert(`Berhasil scan! Hasil: ${decodedText}`);
      } catch (err) {
        console.error("Error processing scan result:", err);
        alert("Gagal memproses hasil scan. Silakan coba lagi.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[url('/assets/background/Background.svg')]">
      <div className="container mx-auto px-4 py-6">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <ArrowLeft className="text-white h-6 w-6" />
          </button>
          <h1 className="justify-center text-2xl font-semibold text-white">Scan QR</h1>
        </div>

        <div className="max-w-md mx-auto">
          <QRScannerComponent onResult={handleQRCodeResult} />
        </div>
      </div>

    </div>
  );
};

export default ScanQRCodePage;
