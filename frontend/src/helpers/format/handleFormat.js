import { format, register } from 'timeago.js'

export const checkRun = (run) => {
    // Despejar puntos y guión
    let valor = clean(run);

    // Divide el valor ingresado en dígito verificador y resto del RUT.
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();

    // Separa con un Guión el cuerpo del dígito verificador.
    run = formatRun(run);

    // Si no cumple con el mínimo ej. (n.nnn.nnn)
    if (cuerpo.length < 7) {
        return false;
    }

    // Calcular Dígito Verificador "Método del Módulo 11"
    let suma = 0;
    let multiplo = 2;

    // Para cada dígito del Cuerpo
    for (let i = 1; i <= cuerpo.length; i++) 
    {
        // Obtener su Producto con el Múltiplo Correspondiente
        let index = multiplo * valor.charAt(cuerpo.length - i);

        // Sumar al Contador General
        suma = suma + index;

        // Consolidar Múltiplo dentro del rango [2,7]
        if (multiplo < 7) 
        {
            multiplo = multiplo + 1;
        } 
        else 
        {
            multiplo = 2;
        }
    }

    // Calcular Dígito Verificador en base al Módulo 11
    let dvEsperado = 11 - (suma % 11);

    // Casos Especiales (0 y K)
    // eslint-disable-next-line
    dv = (dv == "K") ? 10 : dv;
    // eslint-disable-next-line
    dv = (dv == 0) ? 11 : dv;

    // eslint-disable-next-line
    if (dvEsperado != dv)
    {
        return false;
    } 
    else 
    {
        return true;
    }
}

const formatRun = (run) => {
    run = clean(run);

    let result = run.slice(-4, -1) + '-' + run.substr(run.length - 1);

    for (let i = 4; i < run.length; i += 3) {
        result = run.slice(-3 - i, -i) + '.' + result;
    }
  
    return result;
}

const clean = (run) => {
    return typeof run === "string" ? run.replace(/^0+|[^0-9kK]+/g, '').toUpperCase() : '';
}

/**
 * Función para validar el rut
 * @param {String} run Run
 * @returns Booleano de si es valido o no
 */
export const checkRut = (run) => {
    // Despejar puntos y guión
    let valor = run.replace('.', '');
    valor = valor.replace('-','');

    // Aislar Cuerpo y Dígito Verificador
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();

    // Formatear RUN
    run = `${cuerpo} - ${dv}`;

    // Si no cumple con el mínimo ej. (n.nnn.nnn)
    if (cuerpo.length < 7) 
    { 
        return false;
    }
    
    // Calcular Dígito Verificador
    let suma = 0;
    let multiplo = 2;

    // Para cada dígito del Cuerpo
    for(let i = 1; i <= cuerpo.length; i++) 
    {
        // Obtener su Producto con el Múltiplo Correspondiente
        let index = multiplo * valor.charAt(cuerpo.length - i);
        
        // Sumar al Contador General
        suma = suma + index;
        
        // Consolidar Múltiplo dentro del rango [2,7]
        if(multiplo < 7) 
        { 
            multiplo = multiplo + 1; 
        } 
        else 
        { 
            multiplo = 2; 
        }
    }
    
    // Calcular Dígito Verificador en base al Módulo 11
    let dvEsperado = 11 - (suma % 11);
    
    // Casos Especiales (0 y K)
    dv = (dv == 'K') ? 10 : dv;
    dv = (dv == 0) ? 11 : dv;
    
    // Validar que el Cuerpo coincide con su Dígito Verificador
    if (dvEsperado != dv) 
    { 
        return false; 
    }
    
    // Si todo sale bien, eliminar errores (decretar que es válido)
    return true;
};


register('es_ES', (number, index, total_sec) => [
    ['justo ahora', 'ahora mismo'],
    ['hace %s segundos', 'en %s segundos'],
    ['hace 1 minuto', 'en 1 minuto'],
    ['hace %s minutos', 'en %s minutos'],
    ['hace 1 hora', 'en 1 hora'],
    ['hace %s horas', 'in %s horas'],
    ['hace 1 dia', 'en 1 dia'],
    ['hace %s dias', 'en %s dias'],
    ['hace 1 semana', 'en 1 semana'],
    ['hace %s semanas', 'en %s semanas'],
    ['1 mes', 'en 1 mes'],
    ['hace %s meses', 'en %s meses'],
    ['hace 1 año', 'en 1 año'],
    ['hace %s años', 'en %s años']
][index]);

/**
 * Función para formatear la fecha, para indicar los dias, segundos, meses o años de creado
 * @param {String} timestamp fecha de timestamp server
 * @returns fecha formateada
 */
export const timeago = (timestamp) => format(timestamp, 'es_ES');