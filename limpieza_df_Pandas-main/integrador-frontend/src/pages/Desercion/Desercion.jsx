import Card from '../../components/common/Card';
import { getGraficoUrl } from '../../services/desercionService';
import { problemas, decisiones, preguntas, graficos, reflexiones } from './desercionData';
import styles from './Desercion.module.css';

const Desercion = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Análisis de deserción estudiantil</h1>
      <p className={styles.text}>
        Resultados del taller de limpieza de datos con Pandas. El archivo original tenía 10.150
        filas y 23 columnas; después de limpiar quedaron 9.687 filas.
      </p>

      <Card className={styles.card}>
        <h2 className={styles.subtitle}>Problemas encontrados</h2>
        <ul className={styles.list}>
          {problemas.map((problema) => (
            <li key={problema}>{problema}</li>
          ))}
        </ul>
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.subtitle}>Qué se hizo</h2>
        <ul className={styles.list}>
          {decisiones.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
        <a href="/desercion/decisiones.csv" download className={styles.link}>
          Descargar decisiones.csv
        </a>
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.subtitle}>Preguntas</h2>
        {preguntas.map((pregunta) => (
          <div key={pregunta.titulo} className={styles.question}>
            <h3 className={styles.questionTitle}>{pregunta.titulo}</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  {pregunta.columnas.map((columna) => (
                    <th key={columna}>{columna}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pregunta.filas.map((fila) => (
                  <tr key={fila[0]}>
                    {fila.map((valor, i) => (
                      <td key={i}>{valor}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.answer}>
              <strong>Respuesta:</strong> {pregunta.respuesta}
            </p>
          </div>
        ))}
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.subtitle}>Gráficos</h2>
        {graficos.map((grafico) => (
          <div key={grafico.archivo} className={styles.chart}>
            <h3 className={styles.questionTitle}>{grafico.titulo}</h3>
            <img src={getGraficoUrl(grafico.archivo)} alt={grafico.titulo} className={styles.image} />
          </div>
        ))}
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.subtitle}>Reflexiones</h2>
        {reflexiones.map((reflexion) => (
          <div key={reflexion.titulo} className={styles.question}>
            <h3 className={styles.questionTitle}>{reflexion.titulo}</h3>
            <p className={styles.text}>{reflexion.texto}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Desercion;
