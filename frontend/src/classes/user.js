export class user {
    /**
     * Clase para crear un objeto usuario
     * @param {String} rut run de la persona
     * @param {String} name nombre de la persona
     * @param {String} surname apellido de la persona 
     * @param {String} region region de donde es la persona
     * @param {String} commune comuna de donde es la persona
     * @param {String} email email de la persona
     * @param {String} level el nivel de la persona
     * @param {String} password la contraseña de la persona
     * @param {String} passwordRepeat la propiedad repetir contraseña
     */
    constructor(run, name, surname, region, commune, email, level, password, passwordRepeat) 
    {
        this.rut = run;
        this.name = name;
        this.surname = surname;
        this.region = region;
        this.commune = commune;
        this.email = email;
        this.level = level;
        this.password = password;
        this.passwordRepeat = passwordRepeat;
    }

    /**
     * Función Set para asignar el run de la persona
     * @param {String} run run de la persona
     */
    setRut(run)
    {
        if(run !== "" || typeof(run) !== "number")
        {
            this.run = run;
        }
    }

    /**
     * Función Set para asignar el nombre de la persona
     * @param {String} name nombre de la persona
     */
    setName(name)
    {
        if(name !== "" || typeof(name) !== "number")
        {
            this.name = name;
        }
    }

    /**
     * Función Set para asignar el apellido de la persona
     * @param {String} surname apellido de la persona
     */
    setLastName(surname)
    {
        if(surname !== "" || typeof(surname) !== "number")
        {
            this.surname = surname;
        }
    }

    /**
     * Función Set para asignar la región de donde es la persona
     * @param {String} region región de donde viene la persona
     */
    setRegion(region)
    {
        if(region !== "" || typeof(region) !== "number")
        {
            this.region = region;
        }
    }

    /**
     * Función Set para asignar la comuna de donde es la persona
     * @param {String} commune comuna de donde viene la persona
     */
    setCommune(commune)
    {
        if(commune !== "" || typeof(commune) !== "number")
        {
            this.commune = commune;
        }
    }

    /**
     * Función Set para asignar el email de la persona
     * @param {String} email email de la persona
     */
    setEmail(email)
    {
        if(email !== "" || typeof(email) !== "number")
        {
            this.email = email;
        }
    }

    /**
     * Función Set para asignar la contraseña de la persona
     * @param {String} password contraseña de la persona
     */
    setPassword(password)
    {
        if(password !== "" || typeof(password) !== "number")
        {
            this.password = password;
        }
    }

    /**
     * Función Set para asignar la propiedad repetir contraseña contraseña
     * @param {String} passwordRepeat propiedad repetir contraseña
     */
    setPasswordRepeat(passwordRepeat)
    {
        if(passwordRepeat !== "" || typeof(passwordRepeat) !== "number")
        {
            this.passwordRepeat = passwordRepeat;
        }
    }

    /**
     * Función Set para asignar el nivel de la persona
     * @param {String} level level de la persona
     */
    setLevel(level)
    {
        if(level !== "" || typeof(level) !== "number")
        {
            this.level = level;
        }
    }
}