const ProgressBar = ({ count, total }) => {
  const ratio = Math.round((count / total) * 100);
  if (count === total) {
    return (
      <div className="bg-primary-500 rounded-md px-2 py-0.5 text-xs text-white">
        {count}
      </div>
    );
  }
  return (
    <div className="bg-primary-500 rounded-md px-2 py-0.5 text-xs text-white">
      {count} / {total} ( {ratio} % )
    </div>
  );
};

export default ProgressBar;
