const ProgressBar = ({ count, total }) => {
  const ratio = Math.round((count / total) * 100);
  if (count === total) {
    return (
      <div className="bg-primary-500 text-white text-xs rounded-md px-2 py-0.5">
        {count}
      </div>
    );
  }
  return (
    <div className="bg-primary-500 text-white text-xs rounded-md px-2 py-0.5">
      {count} / {total} ( {ratio} % )
    </div>
  );
};

export default ProgressBar;
