import { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

// ===== NAYLA - PASO 4: Modal accesible =====
const Modal = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);
  // NAYLA: useRef guarda siempre la versión actual de onClose sin volver a registrar el listener
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const getFocusableElements = () =>
      dialog?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) || [];

    // NAYLA: al abrir, enfoca el primer elemento del modal
    const focusableElements = getFocusableElements();
    (focusableElements[0] || dialog)?.focus();

    const handleKeyDown = (event) => {
      // NAYLA: la tecla Escape cierra el modal
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusableElements = getFocusableElements();
      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      // NAYLA: Tab atrapado - del último elemento vuelve al primero (y con Shift+Tab al revés)
      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1];
      if (!dialog?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === firstElement || document.activeElement === dialog)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // NAYLA: al cerrar, el foco vuelve al elemento que abrió el modal
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // NAYLA: clic fuera (en el overlay) cierra el modal; role="dialog" y aria-modal = accesibilidad
  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Diálogo'}
        tabIndex="-1"
      >
        {title && (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
