function Button({ children, onClick, type }) {
  let base =
    "uppercase px-4 py-2 font-manrope text-base rounded cursor-pointer border-none ";
  let variant = "";
  if (type === "primary") {
    variant = "font-bold bg-brand-2 text-dark-1";
  } else if (type === "back") {
    variant = "font-semibold bg-none border border-current";
  } else if (type === "position") {
    variant =
      "font-bold absolute z-[1000] text-sm bottom-16 left-1/2 -translate-x-1/2 bg-brand-2 text-dark-1 shadow-lg";
  }
  return (
    <button onClick={onClick} className={base + variant}>
      {children}
    </button>
  );
}

export default Button;
