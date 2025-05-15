import React, { useState } from 'react';

const WinBonusPage: React.FC = () => {
  // State to track if the iframe is loading
  const [isLoading, setIsLoading] = useState(true);

  // Function to call when the iframe finishes loading
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Define a fixed height for the container to prevent layout shift while loading
  const containerHeight = '472px'; // Match iframe height

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">赢得奖金</h1>

      {/* Container for the iframe and loading overlay */}
      {/* We use relative positioning here to absolute position the loader inside */}
      <div className="relative flex justify-center items-center" style={{ height: containerHeight }}>

        {/* Loading Indicator Overlay */}
        {/* This div is absolutely positioned over the iframe area */}
        {/* It's only rendered when isLoading is true */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-50/80 z-10 rounded-lg">
            {/* Simple Spinner Animation (using Tailwind CSS) */}
            <div className="w-12 h-12 border-4 border-dashed rounded-full border-blue-500 animate-spin mb-4"></div>
            {/* Loading Text */}
            <p className="text-gray-700 text-lg">正在加载中，请稍候...</p>
          </div>
        )}

        {/* The Iframe itself */}
        {/* We add an onLoad handler to detect when it's done */}
        {/* We also use opacity to hide/show it smoothly */}
        <iframe
          width="700"
          height="472"
          frameBorder="0"
          scrolling="no"
          src="https://1drv.ms/x/c/96184a10b02b5c8b/IQRM7HqJFaVDR6l0KPjhAwcaATTNhQ2romgXLAkhUhcuaXc?em=2&wdHideGridlines=True&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True"
          title="赢得奖金 Spreadsheet" // Added for accessibility
          onLoad={handleIframeLoad} // Call this function when iframe loads
          // Use Tailwind classes to control visibility based on isLoading
          // transition-opacity and duration-500 provide a fade effect
          className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          // Optional: If you need the iframe to not be interactive while loading, you could add pointer-events-none class conditionally
          // className={`transition-opacity duration-500 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        ></iframe>
      </div>
    </div>
  );
}

export default WinBonusPage;