import React from "react";

const Header = () => {
  return (
    <header
      className="relative z-50 flex items-center justify-between w-full h-[15vh] px-6"
      style={{
        // background: "linear-gradient(to bottom, #000000, #FF0000)",
        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent)",
      }}
    >
      <div className="flex items-center ml-[8%]">
      {/* <div className="flex items-center justify-center ml-[8%] py-4"> */}
        <img
          src="/assets/logo/logo-ts.svg"
          alt="Sanur Logo"
          // className="w-[80%] h-[80%]"
          // className="h-[100px] md:h-[80px] sm:h-[60px]"
          className="max-h-[100px] md:max-h-[80px] sm:max-h-[60px] max-w-full"
        />
      </div>
    </header>
  );
};

export default Header;
