// function Footer() {
//   return (
//     <footer className="mt-auto p-6 text-center">
//       <p className="text-sm text-light-1">
//         &copy; Made in {new Date().getFullYear()} by Youssef Hikal 💚
//       </p>
//     </footer>
//   );
// }
// function Footer() {
//   return (
//     <footer className="mt-auto p-4 md:p-6 text-center">
//       <p className="text-sm text-light-1">
//         &copy; Made in {new Date().getFullYear()} by Youssef Hikal 💚
//       </p>
//     </footer>
//   );
// }

// export default Footer;
function Footer() {
  return (
    <footer className="mt-auto p-4 text-center w-full">
      <p className="text-xs text-light-1/80 font-medium">
        &copy; Made in {new Date().getFullYear()} by{" "}
        <span className="text-brand-1 font-semibold">Youssef Hikal</span> 💚
      </p>
    </footer>
  );
}
export default Footer;
