export const problemas = [
  'Nulos reales en promedio_acumulado (304), distancia_km (199), ciudad_procedencia (103), tipo_colegio (152) y motivo_retiro (6.877, esperados).',
  'Faltantes disfrazados: 202 guiones en asistencia_pct, 2.822 en horas_trabajo_semana y 152 valores 999 en distancia_km.',
  'asistencia_pct y horas_trabajo_semana venían como texto, y fecha_matricula tenía dos formatos de fecha.',
  'Valores imposibles: 12 edades fuera de 15 a 60, 17 promedios fuera de 0 a 5 y 30 registros con más de 100 horas de trabajo.',
  '150 filas duplicadas.',
  'Errores de escritura en programa, jornada, genero y ciudad_procedencia (por ejemplo "Psicologia", "NOCTURNA", "M", "bogota").',
];

export const decisiones = [
  'Se quitó el % de la asistencia y los guiones y el 999 se volvieron nulos.',
  'Se unificaron las categorías mal escritas (tildes, mayúsculas, espacios).',
  'Se convirtieron las fechas de los dos formatos.',
  'Se eliminaron las 150 filas duplicadas.',
  'Se eliminaron 298 filas sin promedio porque una nota no se puede inventar.',
  "Las ciudades y tipos de colegio vacíos se marcaron como 'Sin dato'.",
  'Las edades imposibles se cambiaron por la mediana (22) y los promedios fuera de 0 a 5 se eliminaron.',
  'A los que no trabajan se les puso 0 horas, y las horas mayores a 100 se cambiaron por la mediana (24).',
  'Se crearon las columnas desertor y cuartil_asistencia.',
];

export const preguntas = [
  {
    titulo: '1. ¿Qué programa tiene la tasa de deserción más alta?',
    columnas: ['Programa', 'Estudiantes', 'Desertores', 'Tasa'],
    filas: [
      ['Ingeniería Industrial', '1.271', '511', '40,2%'],
      ['Ingeniería de Sistemas', '1.386', '530', '38,2%'],
      ['Diseño Gráfico', '848', '302', '35,6%'],
      ['Enfermería', '1.132', '354', '31,3%'],
      ['Derecho', '1.447', '442', '30,5%'],
      ['Administración de Empresas', '1.304', '387', '29,7%'],
      ['Contaduría Pública', '1.162', '314', '27,0%'],
      ['Psicología', '1.137', '296', '26,0%'],
    ],
    respuesta: 'Ingeniería Industrial, con 40,2%.',
  },
  {
    titulo: '2. ¿Hay diferencia entre becados y no becados?',
    columnas: ['Beca', 'Estudiantes', 'Desertores', 'Tasa'],
    filas: [
      ['No', '7.004', '2.548', '36,4%'],
      ['Sí', '2.683', '588', '21,9%'],
    ],
    respuesta: 'Sí, los becados desertan 14,5 puntos menos, pero eso no prueba que la beca sea la causa.',
  },
  {
    titulo: '3. ¿Qué jornada tiene el menor promedio acumulado?',
    columnas: ['Jornada', 'Estudiantes', 'Promedio'],
    filas: [
      ['Nocturna', '2.666', '3,46'],
      ['Fin de semana', '949', '3,70'],
      ['Diurna', '6.072', '3,72'],
    ],
    respuesta: 'La jornada Nocturna, con 3,46.',
  },
  {
    titulo: '4. Materias reprobadas: desertores vs activos',
    columnas: ['Estado', 'Estudiantes', 'Promedio reprobadas'],
    filas: [
      ['Desertor', '3.136', '3,07'],
      ['Activo', '5.692', '0,62'],
    ],
    respuesta: 'Los desertores reprueban muchas más materias. Se dejaron por fuera los 859 graduados.',
  },
  {
    titulo: '5. ¿La deserción aumenta cuando baja la asistencia?',
    columnas: ['Cuartil', 'Asistencia promedio', 'Estudiantes', 'Tasa'],
    filas: [
      ['Q1', '73,9%', '2.385', '61,9%'],
      ['Q2', '84,4%', '2.386', '36,7%'],
      ['Q3', '91,3%', '2.348', '20,7%'],
      ['Q4', '98,7%', '2.371', '9,4%'],
    ],
    respuesta: 'Sí, entre menos asistencia más deserción. No incluye a 197 estudiantes sin dato de asistencia.',
  },
];

export const graficos = [
  { archivo: 'faltantes_original.png', titulo: 'Mapa de faltantes' },
  { archivo: 'distribuciones_antes_despues.png', titulo: 'Promedio y edad antes y después de limpiar' },
  { archivo: 'tasa_desercion_por_programa.png', titulo: 'Tasa de deserción por programa' },
  { archivo: 'tasa_desercion_por_asistencia.png', titulo: 'Tasa de deserción por cuartil de asistencia' },
];

export const reflexiones = [
  {
    titulo: 'Asociación y causalidad',
    texto:
      'Que los becados deserten menos no quiere decir que la beca sea la causa. Muchas becas se dan por buen rendimiento, entonces esos estudiantes igual iban a seguir. Para saberlo habría que comparar estudiantes parecidos en todo lo demás.',
  },
  {
    titulo: 'Variables que no sirven para predecir',
    texto:
      'motivo_retiro solo existe cuando el estudiante ya se retiró, entonces no sirve para predecir antes. Lo mismo pasa con estado. También hay que tener cuidado con datos que se tomaron al final, como el promedio o las materias reprobadas.',
  },
  {
    titulo: 'Variables sensibles',
    texto:
      'No se debería decidir quién recibe apoyo solo por género, estrato o ciudad, porque se puede discriminar a grupos completos y dejar por fuera a estudiantes que sí lo necesitan. Es mejor usar cosas como la asistencia o las materias perdidas.',
  },
];
