import Spinner from "./Spinner";

function SpinnerFullPage() {
  return (
    <div className="m-10 h-[calc(100vh-5rem)] bg-dark-1 flex items-center justify-center">
      <Spinner />
    </div>
  );
}

export default SpinnerFullPage;
