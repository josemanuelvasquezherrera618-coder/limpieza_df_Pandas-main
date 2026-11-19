from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

sns.set_theme(style="whitegrid", context="notebook", palette="deep")

pd.set_option("display.width", 200)
pd.set_option("display.max_columns", 30)

RAW = Path(__file__).parent / "Data" / "raw" / "datos_estudiantes.csv"
PROCESSED = Path(__file__).parent / "Data" / "processed"
GRAFICOS = PROCESSED / "graficos"

VALIDOS = {
    "programa": [
        "Administración de Empresas",
        "Contaduría Pública",
        "Derecho",
        "Psicología",
        "Ingeniería de Sistemas",
        "Ingeniería Industrial",
        "Enfermería",
        "Diseño Gráfico",
    ],
    "jornada": ["Diurna", "Nocturna", "Fin de semana"],
    "genero": ["Femenino", "Masculino"],
    "ciudad_procedencia": [
        "Bogotá",
        "Medellín",
        "Cali",
        "Bucaramanga",
        "Rionegro",
        "Barranquilla",
        "Otra ciudad",
    ],
}

CUARTILES = ["Q1", "Q2", "Q3", "Q4"]

DECISIONES = []


def registrar(paso, columna, accion, filas, justificacion):
    DECISIONES.append(
        {
            "paso": paso,
            "columna": columna,
            "accion": accion,
            "filas_afectadas": int(filas),
            "justificacion": justificacion,
        }
    )


def explorar(df):
    print("Forma del dataset (filas, columnas):", df.shape)
    df.info()
    print(df.describe())
    for col in ["programa", "jornada", "genero", "ciudad_procedencia", "estado"]:
        print(f"\nValores de {col}:")
        print(df[col].value_counts(dropna=False))


def auditar(df):
    horas = pd.to_numeric(df["horas_trabajo_semana"], errors="coerce")
    auditoria = {
        "Nulos reales por columna": df.isnull().sum(),
        "Guiones en asistencia_pct": df["asistencia_pct"].eq("-").sum(),
        "Porcentajes escritos con '%' en asistencia_pct": df["asistencia_pct"]
        .str.contains("%", regex=False)
        .sum(),
        "Guiones en horas_trabajo_semana": df["horas_trabajo_semana"].eq("-").sum(),
        "Horas de trabajo mayores a 100": (horas > 100).sum(),
        "Centinelas 999 en distancia_km": df["distancia_km"].eq(999).sum(),
        "Edades fuera de 15 a 60": ((df["edad"] < 15) | (df["edad"] > 60)).sum(),
        "Promedios fuera de 0 a 5": (
            (df["promedio_acumulado"] < 0) | (df["promedio_acumulado"] > 5)
        ).sum(),
        "Filas duplicadas": df.duplicated().sum(),
        "Fechas en formato DD/MM/AAAA": df["fecha_matricula"]
        .str.contains("/", regex=False)
        .sum(),
    }
    for nombre, resultado in auditoria.items():
        print(f"\n{nombre}:")
        print(resultado)


def convertir_numericos(df):
    asistencia = df["asistencia_pct"]
    con_porcentaje = asistencia.str.contains("%", regex=False).sum()
    guiones_asistencia = asistencia.eq("-").sum()
    registrar(
        "conversión numérica",
        "asistencia_pct",
        "quitar el símbolo '%'",
        con_porcentaje,
        "El símbolo impide tratar la columna como número; el valor numérico es el mismo sin él.",
    )
    registrar(
        "conversión numérica",
        "asistencia_pct",
        "convertir '-' en nulo",
        guiones_asistencia,
        "El guion es un faltante disfrazado: indica que no hay dato, no un porcentaje.",
    )
    df["asistencia_pct"] = pd.to_numeric(
        asistencia.str.replace("%", "", regex=False), errors="coerce"
    )

    guiones_horas = df["horas_trabajo_semana"].eq("-").sum()
    registrar(
        "conversión numérica",
        "horas_trabajo_semana",
        "convertir '-' en nulo y la columna a número",
        guiones_horas,
        "Las horas son una cantidad numérica y el guion es un faltante disfrazado.",
    )
    df["horas_trabajo_semana"] = pd.to_numeric(
        df["horas_trabajo_semana"], errors="coerce"
    )

    centinelas = df["distancia_km"].eq(999)
    registrar(
        "conversión numérica",
        "distancia_km",
        "reemplazar 999 por nulo",
        centinelas.sum(),
        "999 es un código centinela que significa 'sin dato', no una distancia real.",
    )
    df["distancia_km"] = df["distancia_km"].mask(centinelas)
    return df


def unificar_categorias(df):
    variantes = {
        "programa": {
            "psicologia": "Psicología",
            "ingenieria de sistemas": "Ingeniería de Sistemas",
        },
        "jornada": {},
        "genero": {"m": "Masculino", "f": "Femenino"},
        "ciudad_procedencia": {
            "bogota": "Bogotá",
            "medellin": "Medellín",
        },
    }

    for columna, mapa in variantes.items():
        mapa.update({valor.lower(): valor for valor in VALIDOS[columna]})

        original = df[columna].copy()
        df[columna] = original.str.strip().str.lower().replace(mapa)

        cambiadas = (original != df[columna]) & original.notna()
        registrar(
            "unificación de categorías",
            columna,
            "quitar espacios, pasar a minúsculas y unificar variantes",
            cambiadas.sum(),
            "Las variantes de escritura representan la misma categoría; sin unificarlas se contarían como grupos distintos.",
        )

        no_validos = df[columna].dropna()
        no_validos = no_validos[~no_validos.isin(VALIDOS[columna])]
        if not no_validos.empty:
            print(f"\nValores sin unificar en {columna}:")
            print(no_validos.value_counts())
    return df


def convertir_fechas(df):
    iso = pd.to_datetime(df["fecha_matricula"], format="%Y-%m-%d", errors="coerce")
    dmy = pd.to_datetime(df["fecha_matricula"], format="%d/%m/%Y", errors="coerce")
    registrar(
        "conversión de fechas",
        "fecha_matricula",
        "unificar AAAA-MM-DD y DD/MM/AAAA en una sola fecha",
        dmy.notna().sum(),
        "Cada formato se interpreta de forma explícita para no confundir día y mes.",
    )
    df["fecha_matricula"] = iso.fillna(dmy)
    print("\nFechas que no se pudieron convertir:", df["fecha_matricula"].isna().sum())
    return df


def eliminar_duplicados(df):
    filas = df.duplicated().sum()
    df = df.drop_duplicates().reset_index(drop=True)
    registrar(
        "duplicados",
        "todas",
        "eliminar filas duplicadas exactas",
        filas,
        "Son copias del mismo estudiante (mismo id_estudiante); inflarían conteos y tasas.",
    )
    return df


def tratar_faltantes(df):
    sin_promedio = df["promedio_acumulado"].isna().sum()
    df = df.dropna(subset=["promedio_acumulado"]).reset_index(drop=True)
    registrar(
        "faltantes",
        "promedio_acumulado",
        "eliminar filas sin promedio",
        sin_promedio,
        "Una nota no se puede inventar, y un promedio imputado alteraría la comparación académica.",
    )

    for columna in ["ciudad_procedencia", "tipo_colegio"]:
        faltantes = df[columna].isna().sum()
        df[columna] = df[columna].fillna("Sin dato")
        registrar(
            "faltantes",
            columna,
            "marcar como 'Sin dato'",
            faltantes,
            "Se conserva al estudiante y queda explícito que la categoría no fue informada.",
        )

    registrar(
        "faltantes",
        "asistencia_pct",
        "conservar nulos",
        df["asistencia_pct"].isna().sum(),
        "No se inventa un porcentaje de asistencia; esos estudiantes quedan fuera de los cuartiles.",
    )
    registrar(
        "faltantes",
        "distancia_km",
        "conservar nulos",
        df["distancia_km"].isna().sum(),
        "La distancia no se puede inferir y ninguna de las preguntas la usa.",
    )
    registrar(
        "faltantes",
        "motivo_retiro",
        "conservar nulos estructurales",
        df["motivo_retiro"].isna().sum(),
        "El motivo solo aplica a quienes desertaron; en activos y graduados el nulo es esperado.",
    )
    return df


def tratar_imposibles(df):
    fuera_edad = (df["edad"] < 15) | (df["edad"] > 60)
    mediana_edad = df.loc[~fuera_edad, "edad"].median()
    df.loc[fuera_edad, "edad"] = mediana_edad
    registrar(
        "valores imposibles",
        "edad",
        f"reemplazar edades fuera de 15 a 60 por la mediana válida ({mediana_edad:g})",
        fuera_edad.sum(),
        "Edades de 12 o 150 años son errores de registro; la mediana no se ve afectada por los extremos.",
    )

    fuera_promedio = (df["promedio_acumulado"] < 0) | (df["promedio_acumulado"] > 5)
    df = df.loc[~fuera_promedio].reset_index(drop=True)
    registrar(
        "valores imposibles",
        "promedio_acumulado",
        "eliminar promedios fuera de 0 a 5",
        fuera_promedio.sum(),
        "La escala es de 0 a 5; no se puede saber con certeza cuál era la nota real.",
    )

    no_trabaja_sin_horas = df["trabaja"].eq("no") & df["horas_trabajo_semana"].isna()
    df.loc[no_trabaja_sin_horas, "horas_trabajo_semana"] = 0
    registrar(
        "valores imposibles",
        "horas_trabajo_semana",
        "asignar 0 horas a quienes no trabajan",
        no_trabaja_sin_horas.sum(),
        "Si el estudiante no trabaja, cero horas es el valor coherente con la columna trabaja.",
    )

    horas_imposibles = df["horas_trabajo_semana"] > 100
    df.loc[horas_imposibles, "horas_trabajo_semana"] = pd.NA
    mediana_horas = df.loc[df["trabaja"].eq("sí"), "horas_trabajo_semana"].median()
    df.loc[horas_imposibles, "horas_trabajo_semana"] = mediana_horas
    registrar(
        "valores imposibles",
        "horas_trabajo_semana",
        f"reemplazar valores mayores a 100 por la mediana de quienes trabajan ({mediana_horas:g})",
        horas_imposibles.sum(),
        "Más de 100 horas semanales no es plausible; se usa la mediana del grupo comparable.",
    )
    return df


def crear_variables(df):
    df["desertor"] = df["estado"].eq("desertor")
    df["cuartil_asistencia"] = pd.qcut(df["asistencia_pct"], 4, labels=CUARTILES)
    print("\nDesertores:", df["desertor"].sum(), "de", len(df), "estudiantes.")
    return df


def guardar_grafico(fig, nombre):
    GRAFICOS.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(GRAFICOS / nombre, dpi=150)
    plt.close(fig)


def grafico_faltantes(df):
    fig, ax = plt.subplots(figsize=(13, 6))
    sns.heatmap(df.isna(), cbar=False, yticklabels=False, ax=ax)
    ax.set_title("Valores faltantes en el dataset original")
    ax.set_xlabel("Columnas")
    ax.set_ylabel("Estudiantes")
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right")
    guardar_grafico(fig, "faltantes_original.png")


def grafico_distribuciones(antes, despues):
    fig, ejes = plt.subplots(2, 2, figsize=(12, 9))
    for fila, (columna, titulo) in enumerate(
        [("promedio_acumulado", "Promedio acumulado"), ("edad", "Edad")]
    ):
        sns.boxplot(y=antes[columna], ax=ejes[fila, 0])
        ejes[fila, 0].set_title(f"{titulo} antes de limpiar")
        ejes[fila, 0].set_ylabel(titulo)
        sns.boxplot(y=despues[columna], ax=ejes[fila, 1])
        ejes[fila, 1].set_title(f"{titulo} después de limpiar")
        ejes[fila, 1].set_ylabel(titulo)
    guardar_grafico(fig, "distribuciones_antes_despues.png")


def grafico_tasa_programa(df):
    tasa = (
        df.groupby("programa")["desertor"].mean().sort_values(ascending=False)
    )
    fig, ax = plt.subplots(figsize=(12, 6))
    tasa.plot(kind="bar", color="#4C72B0", ax=ax)
    ax.set_title("Tasa de deserción por programa")
    ax.set_xlabel("Programa")
    ax.set_ylabel("Tasa de deserción")
    plt.setp(ax.get_xticklabels(), rotation=35, ha="right")
    guardar_grafico(fig, "tasa_desercion_por_programa.png")


def grafico_tasa_asistencia(df):
    tasa = df.groupby("cuartil_asistencia", observed=True)["desertor"].mean()
    fig, ax = plt.subplots(figsize=(8, 5))
    tasa.plot(kind="bar", color="#55A868", ax=ax)
    ax.set_title("Tasa de deserción por cuartil de asistencia")
    ax.set_xlabel("Cuartil de asistencia (Q1: menor, Q4: mayor)")
    ax.set_ylabel("Tasa de deserción")
    ax.tick_params(axis="x", rotation=0)
    guardar_grafico(fig, "tasa_desercion_por_asistencia.png")


def tasa_por_grupo(df, columna):
    return (
        df.groupby(columna, observed=True)
        .agg(
            estudiantes=("desertor", "size"),
            desertores=("desertor", "sum"),
            tasa_desercion=("desertor", "mean"),
        )
        .sort_values("tasa_desercion", ascending=False)
    )


def responder_preguntas(df):
    por_programa = tasa_por_grupo(df, "programa")
    print("\nPregunta 1: deserción por programa")
    print(por_programa.to_string())
    lider = por_programa.iloc[0]
    print(
        f"Mayor tasa: {por_programa.index[0]} "
        f"({int(lider['desertores'])} de {int(lider['estudiantes'])}, "
        f"{lider['tasa_desercion']:.1%})."
    )

    por_beca = tasa_por_grupo(df, "beca")
    print("\nPregunta 2: deserción según beca")
    print(por_beca.to_string())
    diferencia = por_beca.loc["no", "tasa_desercion"] - por_beca.loc["sí", "tasa_desercion"]
    print(f"Diferencia (no becados - becados): {diferencia * 100:.1f} puntos porcentuales.")

    por_jornada = (
        df.groupby("jornada")
        .agg(
            estudiantes=("promedio_acumulado", "size"),
            promedio_acumulado=("promedio_acumulado", "mean"),
        )
        .sort_values("promedio_acumulado")
    )
    print("\nPregunta 3: promedio acumulado por jornada")
    print(por_jornada.round(2).to_string())
    print(f"Menor promedio: {por_jornada.index[0]}.")

    no_graduados = df.loc[df["estado"].ne("graduado")]
    por_estado = (
        no_graduados.groupby("estado")
        .agg(
            estudiantes=("materias_reprobadas", "size"),
            promedio_reprobadas=("materias_reprobadas", "mean"),
        )
        .sort_values("promedio_reprobadas", ascending=False)
    )
    print("\nPregunta 4: materias reprobadas, desertores frente a activos")
    print(por_estado.round(2).to_string())

    por_cuartil = (
        df.groupby("cuartil_asistencia", observed=True)
        .agg(
            estudiantes=("desertor", "size"),
            desertores=("desertor", "sum"),
            asistencia_promedio=("asistencia_pct", "mean"),
            tasa_desercion=("desertor", "mean"),
        )
    )
    print("\nPregunta 5: deserción por cuartil de asistencia")
    print(por_cuartil.round(3).to_string())
    print(
        "Estudiantes sin asistencia (fuera de los cuartiles):",
        df["cuartil_asistencia"].isna().sum(),
    )
    if por_cuartil["tasa_desercion"].is_monotonic_decreasing:
        print("La deserción aumenta a medida que baja la asistencia.")
    else:
        print("La tasa no cambia de forma monotónica entre cuartiles.")


def guardar(df):
    PROCESSED.mkdir(parents=True, exist_ok=True)
    df.to_csv(PROCESSED / "dataset_limpio.csv", index=False)
    pd.DataFrame(DECISIONES).to_csv(PROCESSED / "decisiones.csv", index=False)
    print(f"\nDataset limpio guardado: {df.shape[0]} filas, {df.shape[1]} columnas.")


def main():
    original = pd.read_csv(RAW)
    df = original.copy()

    explorar(df)
    auditar(df)
    grafico_faltantes(df)

    df = convertir_numericos(df)
    df = unificar_categorias(df)
    df = convertir_fechas(df)
    df = eliminar_duplicados(df)
    df = tratar_faltantes(df)
    df = tratar_imposibles(df)
    df = crear_variables(df)

    grafico_distribuciones(original, df)
    grafico_tasa_programa(df)
    grafico_tasa_asistencia(df)

    responder_preguntas(df)
    print("\nTabla de decisiones:")
    print(pd.DataFrame(DECISIONES).to_string(index=False))
    guardar(df)


if __name__ == "__main__":
    main()
