interface SpinnerProps {
  /** Inline size, for use next to text inside a button. */
  small?: boolean;
}

function Spinner({ small = false }: SpinnerProps) {
  const size = small ? "w-5 h-5" : "w-24 h-24";
  const thickness = small ? "3px" : "8px";

  return (
    <div className="h-full flex items-center justify-center">
      <div
        className={`${size} rounded-full animate-spin`}
        style={{
          background: "conic-gradient(#0000 10%, #d6dee0)",
          WebkitMask: `radial-gradient(farthest-side, #0000 calc(100% - ${thickness}), #000 0)`,
          mask: `radial-gradient(farthest-side, #0000 calc(100% - ${thickness}), #000 0)`,
        }}
      ></div>
    </div>
  );
}

export default Spinner;
