import PropTypes from "prop-types";
import QRCodeScanner from "../components/QRCodeScanner";
import TakePicturePhoto from "../components/TakePicturePhoto";
import GetAndShowCurrentLocation from "../components/GetAndShowCurrentLocation";
import { UserAuth } from "../context/AuthContext";

const HomePageOld = ({ session }) => {
  const { session, signOut } = UserAuth();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Logo & Title */}
        <div className="text-center">
          <img className="mx-auto h-12 w-12" src="./vite.svg" alt="Logo" />
          <h2 className="mt-6 text-center text-3xl text-gray-900">
            Welcome, {session.user.email}!
          </h2>
        </div>

        {/* Logout Button */}
        <button
          onClick={signOut}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign out
        </button>

        {/* QR Scanner Section */}
        <div>
          <h6 className="mt-6 text-left text-gray-900">Scan QR Code:</h6>
          <QRCodeScanner onResult={handleQRCodeResult} />
        </div>

        {/* Camera Section */}
        <div>
          <h6 className="mt-6 text-left text-gray-900">
            Take Picture From Camera:
          </h6>
          <TakePicturePhoto />
        </div>

        {/* Location Section */}
        <div>
          <h6 className="mt-6 mb-5 text-left text-gray-900">
            Get and Show Current Location:
          </h6>
          <GetAndShowCurrentLocation />
        </div>
      </div>
    </div>
  );
};

HomePage.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default HomePageOld;
