// components/AuthButton.jsx
import PropTypes from "prop-types";

const AuthButton = ({
  provider,
  onClick,
  loading,
  isLogin = false,
  className = "",
}) => {
  const buttonConfig = {
    google: {
      icon: "https://www.svgrepo.com/show/475656/google-color.svg",
      text: `Sign ${isLogin ? "In" : "Up"} with Google`,
    },
    facebook: {
      icon: "https://www.svgrepo.com/show/475647/facebook-color.svg",
      text: `Sign ${isLogin ? "In" : "Up"} with Facebook`,
    },
  };

  const config = buttonConfig[provider];

  return (
    <button
      type="button"
      className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-bold font-nunito text-black bg-white hover:bg-gray-50 ${className}`}
      onClick={onClick}
      disabled={loading}
    >
      <img
        className="h-5 w-5 mr-2"
        src={config.icon}
        alt={`${provider} Logo`}
      />
      {config.text}
    </button>
  );
};

AuthButton.propTypes = {
  provider: PropTypes.oneOf(["google", "facebook"]).isRequired,
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  isLogin: PropTypes.bool,
  className: PropTypes.string,
};

export default AuthButton;
