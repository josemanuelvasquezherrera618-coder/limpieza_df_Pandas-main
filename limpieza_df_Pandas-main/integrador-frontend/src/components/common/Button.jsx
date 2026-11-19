import styles from './Button.module.css';

// ===== NAYLA - PASO 2: Button reutilizable =====
// variant puede ser primary, secondary, outline, danger o success.
// styles[variant] convierte la variante en una clase del CSS Module (ver className abajo).
const Button = ({ children, variant = 'primary', type = 'button', disabled = false, onClick, className = '' }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
