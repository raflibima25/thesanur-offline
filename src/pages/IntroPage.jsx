import "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";

import bgIntro from "../../public/assets/images/bg-sanur-intro.png";

const IntroPage = () => {
  const navigate = useNavigate();
  const { session } = UserAuth();
  useEffect(() => {
    if (session) navigate("/info");
  }, [navigate, session]);

  const handleSignUpClick = () => {
    navigate("/register");
  };
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div>
      {/* <Header /> */}
      <header className="fixed z-50 flex px-6 md:px-12 lg:px-36 items-center justify-between w-full bg-gradient-to-b from-[rgba(0,0,0,0.5)] to-transparent">
        <div className="flex mx-auto md:mx-0 items-center mt-8 mb-8">
          <img src="/assets/logo/logo-ts.svg" alt="Sanur Logo" className="max-w-28 md:max-w-full " />
        </div>
      </header>
      <section className="flex flex-col">
        {/* Gambar Latar */}
        <img
          loading="lazy"
          src={bgIntro}
          className="fixed inset-0 h-full w-full object-cover object-center"
          alt="Bali sanctuary background"
        />

        {/* Vector Components */}
        <div className="flex flex-col">
          <svg
            className="fixed bottom-0 h-1/2 w-full"
            // preserveAspectRatio="xMidYMid slice"
            // check screen size
            preserveAspectRatio={window.innerWidth >= 768 ? "none" : "xMidYMid slice"}
            viewBox="0 0 1440 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_79_63)">
              <path
                d="M547.22 32.0047C298.365 110.611 -68.2685 388.269 -213.275 172.735C-358.282 -42.7983 -270.898 494.768 -270.898 494.768L185.019 529L1761.1 513.786C1788.75 329.737 1847 44 1700.31 52.2902C1553.62 60.5803 1520.48 331.85 1228.56 234.86C936.649 137.869 796.075 -46.602 547.22 32.0047Z"
                fill="#F1B81C"
              />
              <path
                opacity="0.6"
                d="M315.22 19.0047C66.3652 97.6113 -300.268 375.269 -445.275 159.735C-590.282 -55.7983 -502.898 481.768 -502.898 481.768L-46.9812 516L1529.1 500.786C1556.75 316.737 1615 31 1468.31 39.2902C1321.62 47.5803 1288.48 318.85 996.563 221.86C704.649 124.869 564.075 -59.602 315.22 19.0047Z"
                fill="#F1B81C"
              />
              <path
                opacity="0.4"
                d="M315.22 32.0047C66.3652 110.611 -300.268 388.269 -445.275 172.735C-590.282 -42.7983 -502.898 494.768 -502.898 494.768L-46.9812 529L1529.1 513.786C1556.75 329.737 1615 44 1468.31 52.2902C1321.62 60.5803 1288.48 331.85 996.563 234.86C704.649 137.869 564.075 -46.602 315.22 32.0047Z"
                fill="black"
              />
              <path
                opacity="0.4"
                d="M315.22 297.005C66.3652 375.611 -300.268 653.269 -445.275 437.735C-590.282 222.202 -502.898 759.768 -502.898 759.768L-46.9812 794L1529.1 778.786C1556.75 594.737 1615 309 1468.31 317.29C1321.62 325.58 1288.48 596.85 996.563 499.86C704.649 402.869 564.075 218.398 315.22 297.005Z"
                fill="black"
              />
            </g>
          </svg>
        </div>

        {/* Konten Utama */}
        <div className="absolute mx-auto mt-72 md:mt-80 lg:mt-96 px-6 md:px-12 lg:px-36 max-w-6xl font-inter items-center">
          <h1 className="text-white font-iowan font-bold text-5xl md:text-7xl lg:text-9xl leading-tight md:leading-none text-left">
            Bali&apos;s Lavish Sanctuary
          </h1>
          <p className="font-inter text-white font-light mt-6 md:mt-8 text-sm md:text-base text-left">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem{" "}
            <br className="md:block hidden" />
            Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an{" "}
            <br className="md:block hidden" />
            unknown printer took a galley of type and scrambled it to make a type specimen{" "}
            <br className="md:block hidden" />
            book. It has survived not only five centuries
          </p>
          <div className="mt-6 mb-20">
            <button
              onClick={handleSignUpClick}
              className="rounded-lg bg-gold2 text-black font-inter px-6 py-3 hover:bg-[#d9a018] transition ease-in-out duration-300 font-bold w-full md:w-auto"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroPage;
