/**
 * Valida que una fecha en formato YYYY-MM-DD sea válida:
 * - Año de fin <= año actual
 * - Mes entre 1 y 12
 * - Día correcto según mes/año
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {boolean} validarAnioActual - Si true, valida que el año no supere al actual
 * @returns {object} { valido: boolean, mensaje: string }
 */

export function validarFecha(fecha, validarAnioActual = false) {
    const partes = fecha.includes("/") ? fecha.split("/") : fecha.split("-");
    const [yearStr, monthStr, dayStr] = partes;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    const currentYear = new Date().getFullYear();

    // Validar mes
    if (month < 1 || month > 12) {
        return { valido: false, mensaje: "Los meses deben estar entre 1 (Enero) y 12 (Diciembre)." };
    }

    // Obtener días en el mes (considera años bisiestos)
    const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
    const maxDays = getDaysInMonth(year, month);

    if (day < 1 || day > maxDays) {
        return { valido: false, mensaje: `La fecha no es válida. El mes ${month} tiene máximo ${maxDays} días.` };
    }

    // Validar año si corresponde
    if (validarAnioActual && year > currentYear) {
        return { valido: false, mensaje: "El año no puede ser mayor al actual." };
    }

    return { valido: true, mensaje: "Fecha válida." };
}

    
export function validarRangoFechas(fechaInicio, fechaFin) {
    const inicio = validarFecha(fechaInicio);
    if (!inicio.valido) return inicio;

    const fin = validarFecha(fechaFin, true);
    if (!fin.valido) return fin;

    // Comparar fechas reales
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);

    if (startDate > endDate) {
        return { valido: false, mensaje: "La fecha de inicio no puede ser mayor que la de fin." };
    }

    return { valido: true, mensaje: "Rango de fechas válido." };
}
