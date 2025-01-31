import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import AuthButton from "../components/AuthButton";
import { UserAuth } from "../context/AuthContext";

const LoginPage = () => {
    const navigate = useNavigate();

    const { session, emailPasswordAuth, socialProviderAuth } = UserAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session) navigate("/home");
    }, [navigate, session]);

    const handleLoginEmailPassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const auth = await emailPasswordAuth(email, password, true);

            setLoading(false);
            if (auth.success) {
                navigate("/home");
            } else {
                setError(auth.error);
            }
        } catch (error) {
            setLoading(false);
            setError(error.message);
        }
    };

    const handleLoginSocialProvider = async (provider) => {
        console.log("Login From Social Provider");

        try {
            setLoading(true);
            const auth = await socialProviderAuth(provider);
            console.log(auth);

            setLoading(false);
            if (auth.success) {
                navigate("/home");
            } else {
                setError(auth.error);
            }
        } catch (error) {
            setLoading(false);
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen min-w-[320px] flex items-center justify-center relative overflow-hidden sm:bg-transparent bg-[#313131]">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="hidden sm:block absolute inset-0 from-[#B88217] to-[#B88217] bg-center bg-cover bg-no-repeat bg-[url('/assets/background/Background.svg')]" />
            </div>

            {/* Card Container */}
            <div className="relative w-full sm:max-w-[1128px] sm:mx-4 bg-[#313131] sm:rounded-[36px] min-h-screen sm:min-h-[680px] md:min-h-[582px] lg:h-[582px]">
                <div className="flex h-full items-center justify-center flex-col lg:flex-row py-4 sm:py-0">
                    {/* Left Section - Logo & Social */}
                    <div className="w-full lg:w-1/2 p-8 md:p-10 lg:p-12 md:px-20 sm:px-20 flex flex-col">
                        {/* Logo Section */}
                        <div className="mb-8 md:mb-12 mt-[-20px] sm:mt-0 lg:mt-[-60px] justify-items-center">
                            <img
                                src="/assets/logo/logo-ts.svg"
                                alt="The Sanur"
                                className="w-48 lg:w-64 mb-2 mx-auto md:mx-0"
                            />
                        </div>

                        {/* Login Title Section */}
                        <div className="mb-8">
                            <h2 className="text-3xl sm:text-4xl text-white font-semibold mb-5 font-iowan">Login</h2>
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

                        {/* Social Buttons */}
                        <div className="space-y-3">
                            <AuthButton
                                provider="google"
                                onClick={() => handleLoginSocialProvider("google")}
                                loading={loading}
                                isLogin={true}
                                className="mb-4"
                            />
                            <AuthButton
                                provider="facebook"
                                onClick={() => handleLoginSocialProvider("facebook")}
                                loading={loading}
                                isLogin={true}
                                className="mt-3"
                            />
                        </div>
                    </div>

                    {/* Divider Section */}
                    {/* Desktop - Vertical Divider */}
                    <div className="hidden lg:flex w-[1px] bg-white/70 relative h-5/6">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#313131] py-2 text-white text-sm whitespace-nowrap">
                            Or
                        </span>
                    </div>

                    {/* Mobile - Horizontal Divider */}
                    <div className="w-full lg:hidden py-4">
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-[36%] h-[1px] bg-white/70"></div>
                            <span className="text-white text-sm">Or</span>
                            <div className="w-[36%] h-[1px] bg-white/70"></div>
                        </div>
                    </div>

                    {/* Right Section - Email Form */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-8 md:p-10 lg:p-12 md:px-20 mb-12 lg:mb-0">
                        <div className="text-white text-xs sm:text-sm font-semibold font-inter mb-3 sm:mb-5">
                            Continue with email:
                        </div>

                        <form onSubmit={handleLoginEmailPassword} className="space-y-4 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                {/* Email Input dengan Label */}
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="block text-white text-xs sm:text-sm font-inter">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border border-white/80 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-[#F3CC30]"
                                    />
                                </div>

                                {/* Password Input dengan Label */}
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="block text-white text-xs sm:text-sm font-inter">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-transparent border border-white/80 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-[#F3CC30]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="h-2">
                                    {error && <p className="text-red-500 text-xs sm:text-sm font-inter">{error}</p>}
                                </div>
                            </div>

                            {/* Forgot Password di tengah */}
                            <div className="flex justify-center">
                                <button type="button" className="text-sm text-white hover:text-[#F3CC30] font-inter">
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#F1B81C] hover:bg-[#F3CC30]/90 text-[#231F20] rounded-lg py-2.5 sm:py-3 text-sm sm:text-base font-bold font-inter"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
