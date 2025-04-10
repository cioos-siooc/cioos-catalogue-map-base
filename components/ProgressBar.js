const ProgressBar = ({ count, total }) => {
  const progress = Math.round((count / total) * 100);
  return (
    <div className="flex flex-col items-center justify-between text-xs font-medium ">
      <span className="pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{count} / {total} ( {progress} % )</span>
      <div className="w-full bg-gray-200 rounded-full">
        <div
          className="bg-blue-600  p-1 leading-none rounded-full"
          style={{ width: `${progress}%` }}
        >
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
