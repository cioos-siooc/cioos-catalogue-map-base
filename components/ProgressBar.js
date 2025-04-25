const ProgressBar = ({ count, total }) => {
  const progress = Math.round((count / total) * 100);
  return (
    <div className="flex flex-col items-center justify-between text-xs font-medium ">
      <span className="pb-1 text-sm font-medium">{count} / {total} ( {progress} % )</span>
      <div className="w-full bg-gray-200 rounded-full">
        <div
          className="bg-gray-600  p-1 leading-none rounded-l-lg"
          style={{ width: `${progress}%` }}
        >
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
