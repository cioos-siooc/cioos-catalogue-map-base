const ProgressBar = ({ progress }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full">
        <div
          className="bg-blue-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full"
          style={{ width: `${progress}%` }}
        >
          {progress}%
        </div>
      </div>
    );
  };
  
  export default ProgressBar;
  