import styles from './Input.module.css';

// ===== NAYLA - PASO 2: Input reutilizable =====
// Muestra el label solo si llega, pinta el borde rojo con styles.error
// y muestra el mensaje de error debajo del campo. También acepta disabled.
const Input = ({ label, type = 'text', value, onChange, placeholder, error, disabled = false, className = '', name }) => {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && <label htmlFor={name} className={styles.label}>{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.error : ''}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;
