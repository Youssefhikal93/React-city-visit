function Message({ message }) {
  return (
    <p className="text-center text-xl w-4/5 my-8 mx-auto font-semibold text-light-0">
      <span role="img">👋</span> {message}
    </p>
  );
}

export default Message;
