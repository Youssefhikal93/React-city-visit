function Spinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div
        className="w-24 h-24 rounded-full animate-spin"
        style={{
          background: "conic-gradient(#0000 10%, #d6dee0)",
          WebkitMask:
            "radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0)",
        }}
      ></div>
    </div>
  );
}

export default Spinner;
