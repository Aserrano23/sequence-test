import "./button.css";

const Button = ({ text, onclick, disabled = false }) => {
  return (
    <button onClick={() => onclick()} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;
