import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import styles from './Register.module.css';

// ===== NAYLA - PASO 5: Register - formulario controlado y validación =====
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  // NAYLA: formulario controlado - todos los valores viven en formData
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NAYLA: validateForm - usuario 3-50, correo válido y máx. 100, contraseña mín. 8, confirmación igual
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es obligatorio';
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = 'El usuario debe tener entre 3 y 50 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo no tiene un formato válido';
    } else if (formData.email.length > 100) {
      newErrors.email = 'El correo no puede tener más de 100 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // NAYLA: handleChange genérico por name; limpia el error del campo al escribir
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name] || (name === 'password' && errors.confirmPassword)) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        ...(name === 'password' ? { confirmPassword: '' } : {}),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      // NAYLA: error del backend -> details[0], se muestra con Alert
      setError(err.response?.data?.details?.[0] || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Registrarse</h1>
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ingresa tu usuario"
            error={errors.username}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa tu correo"
            error={errors.email}
          />
          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña (mínimo 8 caracteres)"
            error={errors.password}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Escribe nuevamente tu contraseña"
            error={errors.confirmPassword}
          />
          {/* NAYLA: botón deshabilitado mientras se envía */}
          <Button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>
        <p className={styles.loginLink}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
