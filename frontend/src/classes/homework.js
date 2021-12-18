export class homework {
    /**
     * @param {string} remainingTime tiempo restante en string
     * @param {boolean} inTime booleano que indica si se subio a tiempo
     * @param {string} date tiempo en que se subio el archivo 
     * @param {boolean} calificated si fue calificado o no
     * @param {string} url la url del archivo subido 
     */
    constructor (remainingTime, inTime, date, calificated, url)
    {
        this.remainingTime = remainingTime;
        this.inTime = inTime;
        this.date = date;
        this.calificated = calificated;
        this.url = url;
    }

    /**
     * Función Set para asignar el tiempo restante
     * @param {String} remainingTime tiempo restante
     */
    setRemainingTime(remainingTime)
    {
        if(remainingTime !== "" || typeof(remainingTime) !== "number")
        {
            this.remainingTime = remainingTime;
        }
    };

    /**
     * Función Set para asignar la propiedad inTime
     * @param {boolean} inTime si se subio antes o no
     */
    setInTime(inTime)
    {
        if(inTime !== "" || typeof(inTime) !== "boolean")
        {
            this.inTime = inTime;
        }
    };

    /**
     * Función Set para asignar la fecha de subida
     * @param {string} date tiempo de subida de la tarea
     */
    setDate(date)
    {
        if(date !== "" || typeof(date) !== "string")
        {
            this.date = date;
        }
    };

    /**
     * Función Set para asignar si la tarea ha sido asignada o no
     * @param {boolean} calificated boolean de si ha sido calificado o no
     */
    setCalificated(calificated)
    {
        if(calificated !== "" || typeof(calificated) !== "boolean")
        {
            this.calificated = calificated;
        }
    };

    /**
     * Función Set para asignar la url del archivo
     * @param {string} url url del archivo
     */
    setUrl(url)
    {
        if(url !== "" || typeof(url) !== "string")
        {
            this.url = url;
        }
    };
};