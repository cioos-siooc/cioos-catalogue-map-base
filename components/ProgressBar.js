const ProgressBar = ({ count, total }) => {
  const progress = Math.round((count / total) * 100);
  if (count === total) {
    return <>{count}</>;
  }
  return (
    <>
      {count} / {total} ( {progress} % )
    </>
  );
};

export default ProgressBar;
