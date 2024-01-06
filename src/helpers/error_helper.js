export const createError = ({ status = 500, message = 'Something went wrong' }) => {
  const error = new Error(message);
  error.status = status;

  return error;
};
