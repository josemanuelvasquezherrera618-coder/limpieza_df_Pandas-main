import styles from './Alert.module.css';

// ===== NAYLA: Alert - alertas info, error o success; styles[type] elige el color =====
const Alert = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <span className={styles.message}>{message}</span>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
