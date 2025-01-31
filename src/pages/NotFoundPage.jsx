import React from 'react';

const ErrorPage = () => {
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center bg-black2">
      <h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
      <div className="bg-gold2 px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-5 relative inline-block text-sm font-medium text-gold2 group active:text-[#f19c1c] focus:outline-none focus:ring"
      >
        <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-gold2 group-hover:translate-y-0 group-hover:translate-x-0"></span>
        <span className="relative block px-8 py-3 bg-black2 border border-current">
          Go Back
        </span>
      </button>
    </main>
  );
};

export default ErrorPage;
