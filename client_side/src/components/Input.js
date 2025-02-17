// Input.jsx
const Input = ({ type = "text", name, placeholder, value, onChange, className = "" }) => {
    return (
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md w-full ${className}`}
      />
    );
  };
  
  export default Input;
  