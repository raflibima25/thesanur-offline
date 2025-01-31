const LoadingSpin = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#F1B81C]"></div>
    </div>
  );
};

export default LoadingSpin;
