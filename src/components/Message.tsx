function Message({ message }: { message: string }) {
  return (
    <p className="text-center text-xl w-4/5 my-8 mx-auto font-semibold text-light-0">
      {message}
    </p>
  );
}

export default Message;
