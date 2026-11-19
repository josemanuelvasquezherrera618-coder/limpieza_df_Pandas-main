import styles from './Card.module.css';

// ===== NAYLA: Card - contenedor visual reutilizable (Login, Register, Dashboard) =====
const Card = ({ children, className = '' }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
};

export default Card;
