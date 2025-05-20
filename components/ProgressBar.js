const ProgressBar = ({ count, total }) => {
  const progress = Math.round((count / total) * 100);
  return (
    <div className="flex flex-col items-center justify-between text-xs font-medium ">
      <span className="pb-1 text-sm font-medium">
        {count} / {total} ( {progress} % )
      </span>
    </div>
  );
};

export default ProgressBar;
