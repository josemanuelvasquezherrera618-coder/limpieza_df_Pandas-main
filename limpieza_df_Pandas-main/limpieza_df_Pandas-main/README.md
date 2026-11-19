## Mis decisiones y respuestas

### Diccionario de datos

| Columna | Tipo | Descripción | Rol |
|---|---|---|---|
| `id_estudiante` | Texto | Código único de cada estudiante (EST00001…). | Identificación |
| `programa` | Categórica | Programa académico en el que está matriculado. | Explicativa |
| `facultad` | Categórica | Facultad a la que pertenece el programa. | Explicativa |
| `jornada` | Categórica | Jornada de estudio: Diurna, Nocturna o Fin de semana. | Explicativa |
| `semestre` | Numérica (entera) | Semestre que cursa, de 1 a 10. | Explicativa |
| `promedio_acumulado` | Numérica (decimal) | Promedio de notas en escala de 0 a 5. | Explicativa |
| `creditos_aprobados` | Numérica (entera) | Créditos aprobados hasta el momento. | Explicativa |
| `materias_reprobadas` | Numérica (entera) | Número de materias perdidas. | Explicativa |
| `asistencia_pct` | Numérica (llega como texto) | Porcentaje de asistencia a clases; trae `%` y guiones. | Explicativa |
| `sesiones_tutoria` | Numérica (entera) | Sesiones de tutoría a las que asistió. | Explicativa |
| `cambios_programa` | Numérica (entera) | Veces que cambió de programa (0 o 1). | Explicativa |
| `estrato` | Numérica (ordinal) | Estrato socioeconómico de 1 a 6. Variable sensible. | Explicativa |
| `beca` | Categórica | Indica si recibe beca (sí o no). | Explicativa |
| `trabaja` | Categórica | Indica si trabaja además de estudiar (sí o no). | Explicativa |
| `horas_trabajo_semana` | Numérica (llega como texto) | Horas de trabajo por semana; trae guiones. | Explicativa |
| `distancia_km` | Numérica (decimal) | Distancia entre su vivienda y la institución; trae el centinela 999. | Explicativa |
| `edad` | Numérica (entera) | Edad en años. Variable sensible. | Explicativa |
| `genero` | Categórica | Género registrado. Variable sensible. | Explicativa |
| `ciudad_procedencia` | Categórica | Ciudad de origen. Puede funcionar como proxy socioeconómico. | Explicativa |
| `tipo_colegio` | Categórica | Colegio de procedencia: Público o Privado. Puede funcionar como proxy socioeconómico. | Explicativa |
| `fecha_matricula` | Fecha (llega como texto) | Fecha de matrícula, en dos formatos mezclados. | Explicativa |
| `estado` | Categórica | Situación del estudiante: activo, desertor o graduado. | Resultado |
| `motivo_retiro` | Categórica | Motivo del retiro; solo existe para desertores. | Resultado (no sirve para predecir) |

### Diagnóstico de calidad

El archivo original tiene **10.150 filas y 23 columnas**, lo mismo que describe el enunciado.

- **Nulos reales:** `promedio_acumulado` (304), `distancia_km` (199), `ciudad_procedencia` (103), `tipo_colegio` (152) y `motivo_retiro` (6.877). Los de `motivo_retiro` son esperados: corresponden exactamente a los estudiantes activos y graduados.
- **Faltantes disfrazados:** 202 guiones en `asistencia_pct`, 2.822 guiones en `horas_trabajo_semana` (todos de estudiantes que no trabajan) y 152 valores 999 en `distancia_km`.
- **Formato inconsistente:** `asistencia_pct` y `horas_trabajo_semana` llegan como texto; 300 asistencias tienen el signo `%`. `fecha_matricula` tiene 3.052 fechas en DD/MM/AAAA y el resto en AAAA-MM-DD.
- **Valores imposibles:** 12 edades fuera de 15–60 (cuatro de 12 años y ocho de 150), 17 promedios fuera de 0–5 (45, 62 y 78, que parecen estar en escala de 0 a 100) y 30 registros con más de 100 horas de trabajo semanales (máximo 200).
- **Duplicados:** 150 filas idénticas, con el mismo `id_estudiante`. Dos estudiantes distintos no pueden compartir el identificador, así que son copias.
- **Errores tipográficos:** `programa` (260: "Ingenieria de Sistemas" y "Psicologia" sin tilde), `jornada` (485: "diurna", "nocturna", "NOCTURNA"), `genero` (559: "M", "F", "femenino") y `ciudad_procedencia` (542: "BOGOTÁ", "Bogota", "bogota", "Medellin", "medellin").

En el mapa de faltantes la franja más visible es `motivo_retiro`, seguida de `promedio_acumulado`, `distancia_km`, `tipo_colegio` y `ciudad_procedencia`: coincide con los nulos contados. Los guiones y el 999 no aparecen en el mapa porque Pandas no los reconoce como nulos; por eso hubo que buscarlos aparte.

### Decisiones de limpieza

Cada acción, con su número de filas, está en `Data/processed/decisiones.csv`. Los conteos de esa tabla corresponden al momento del paso en que se registraron.

1. **Conversión numérica:** se quitó el `%` de 300 asistencias, y los 202 guiones de asistencia y los 2.822 de horas pasaron a ser nulos reales. Los 152 centinelas 999 de distancia también se convirtieron en nulos.
2. **Categorías:** se quitaron espacios, se pasó a minúsculas y se unificaron las variantes a la forma oficial (con tildes). Después de unificar, cada columna solo tiene los valores válidos.
3. **Fechas:** se convirtieron los dos formatos de forma explícita y se unieron; ninguna fecha quedó sin convertir.
4. **Duplicados:** se eliminaron las 150 filas repetidas, porque inflarían los conteos y las tasas.
5. **Faltantes:**
   - Se eliminaron 298 filas sin promedio, porque una nota no se puede inventar.
   - Las ciudades (96) y los tipos de colegio (145) faltantes se marcaron como `Sin dato`, para conservar al estudiante sin inventar su origen.
   - Se dejaron como nulos la asistencia (197) y la distancia (333 en el archivo final). No se pueden inferir; los estudiantes sin asistencia quedan fuera de los cuartiles.
   - Se dejaron los nulos de `motivo_retiro` (6.551 en el archivo final), porque son estructurales.
6. **Valores imposibles:**
   - Las 12 edades fuera de rango se reemplazaron por la mediana de las edades válidas (22 años).
   - Se eliminaron los 15 promedios fuera de 0–5 que quedaban tras quitar duplicados. Aunque parecen estar en escala de 0 a 100, convertirlos sería suponer una escala que no se puede comprobar.
   - A los 2.703 estudiantes que no trabajan y no tenían horas se les asignaron 0 horas.
   - Los 29 valores mayores a 100 horas que quedaban se reemplazaron por la mediana de quienes trabajan (24 horas).
7. **Variables nuevas:** `desertor` (True si el estado es desertor: 3.136 de 9.687) y `cuartil_asistencia` (Q1 a Q4 con `pd.qcut`). Se usan cuartiles porque forman cuatro grupos de tamaño parecido y permiten comparar tasas; con valores exactos habría decenas de grupos con muy pocos estudiantes.

El dataset limpio tiene **9.687 filas y 25 columnas**.

En los boxplots, el promedio antes de limpiar estaba estirado hasta 78 por los valores en otra escala; después queda entre 1,17 y 5,0. Siguen apareciendo puntos por debajo de 1,9, pero se dejan porque un promedio bajo es posible: son estudiantes con bajo rendimiento, no errores. La edad pasó de un rango de 12 a 150 a uno de 17 a 29. Los puntos en 28 y 29 años se conservan porque son edades reales de estudiantes.

### Respuestas a las preguntas

Todas las cifras corresponden al dataset limpio.

1. **Programa con mayor deserción:** Ingeniería Industrial, con **511 desertores de 1.271 estudiantes (40,2%)**. Le sigue Ingeniería de Sistemas con 530 de 1.386 (38,2%), y la menor tasa es la de Psicología, con 296 de 1.137 (26,0%). El programa más pequeño, Diseño Gráfico, tiene 848 estudiantes, así que ningún grupo es tan pequeño como para que su tasa sea inestable. Aun así, la diferencia de 2 puntos entre las dos ingenierías es pequeña.
2. **Beca:** entre los no becados desertaron **2.548 de 7.004 (36,4%)**; entre los becados, **588 de 2.683 (21,9%)**. Los becados desertan 14,5 puntos porcentuales menos. Esa diferencia no prueba que la beca cause la permanencia (ver la reflexión 1).
3. **Jornada con menor promedio:** la Nocturna, con un promedio de **3,46 entre 2.666 estudiantes**. Le siguen Fin de semana (3,70 entre 949) y Diurna (3,72 entre 6.072).
4. **Materias reprobadas:** los desertores reprueban en promedio **3,07 materias (3.136 estudiantes)**; los activos, **0,62 (5.692 estudiantes)**. Se excluyó a los 859 graduados porque no son ni desertores ni activos. Además, ya terminaron la carrera, así que incluirlos mezclaría un tercer grupo y distorsionaría la comparación.
5. **Asistencia y deserción:** sí, la deserción aumenta a medida que baja la asistencia.

   | Cuartil | Asistencia promedio | Desertores / estudiantes | Tasa |
   |---|---|---|---|
   | Q1 (menor) | 73,9% | 1.476 / 2.385 | 61,9% |
   | Q2 | 84,4% | 875 / 2.386 | 36,7% |
   | Q3 | 91,3% | 487 / 2.348 | 20,7% |
   | Q4 (mayor) | 98,7% | 224 / 2.371 | 9,4% |

   Los cuartiles no incluyen a los 197 estudiantes sin dato de asistencia. El patrón no prueba una causa: la baja asistencia puede ser una señal de que el estudiante ya se está alejando por otras razones, como el trabajo, la situación económica o el bajo rendimiento, y no el motivo de su retiro.

### Reflexión 1: asociación y causalidad

La deserción es menor entre los becados, pero eso no demuestra que la beca cause la permanencia. Las becas suelen darse por mérito académico o por un seguimiento institucional, así que los becados pueden ser estudiantes que ya tenían mejor desempeño o más acompañamiento y que permanecerían de todos modos. Para distinguir causa de asociación habría que comparar estudiantes parecidos en todo lo demás (promedio previo, estrato, si trabaja), o hacer un estudio en el que la beca se asigne de forma controlada y se mida el cambio.

### Reflexión 2: variables que no deberían usarse para predecir

`motivo_retiro` solo existe cuando el estudiante ya desertó, así que no puede usarse para predecir la deserción antes de que ocurra. Si se incluyera, el modelo "acertaría" porque ya conoce la respuesta: es una fuga de información. Tiene el mismo problema `estado`, que es el resultado mismo. También hay que tener cuidado con `promedio_acumulado`, `creditos_aprobados`, `materias_reprobadas` y `semestre` si se registraron al final o en el momento del retiro. Para una alerta temprana, solo deberían usarse los valores que se conocían en el momento de la predicción.

### Reflexión 3: variables sensibles

Aunque género, estrato o ciudad de procedencia aparezcan asociados a la deserción, la institución no debería usarlos por sí solos para decidir quién recibe apoyo. Hacerlo puede convertir una desigualdad social en un criterio de selección, estigmatizar a grupos completos y dejar sin apoyo a estudiantes en riesgo que no pertenecen a esos grupos. Además, `ciudad_procedencia` y `tipo_colegio` pueden funcionar como sustitutos del estrato. Lo más adecuado es basar las alertas en señales de comportamiento académico, como la asistencia o las materias reprobadas, y usar las variables sensibles solo para revisar que los apoyos lleguen de forma equitativa a todos los grupos, con revisión humana de cada caso.
