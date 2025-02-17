// Button.jsx
const Button = ({ onClick, children, type = "button", className = "" }) => {
    return (
      <button 
        type={type} 
        onClick={onClick} 
        className={`px-4 py-2 rounded-md font-semibold transition ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export default Button;