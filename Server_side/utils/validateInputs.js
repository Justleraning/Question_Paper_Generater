const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return usernameRegex.test(username);
};

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

module.exports = { validateUsername, validatePassword };
