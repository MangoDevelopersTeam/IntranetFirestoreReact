export class course {
    /**
     * Clase para crear un objeto clase
     * @param {String} code codigo de la asignatura
     * @param {String} type tipo de asignatura
     * @param {String} grade grado del curso 
     * @param {String} number numero del curso
     * @param {String} letter letra del curso  
     * @param {String} courseName nombre de la asignatura
     * @param {String} description decripción de la asignatura
     */
    constructor(code, type, grade, number, letter, courseName, description) 
    {
        this.code = code;
        this.type = type;
        this.grade = grade;
        this.number = number;
        this.letter = letter;
        this.courseName = courseName;
        this.description = description;
    }

    /**
     * Función Set para asignar el code del curso
     * @param {String} code codigo del curso
     */
    setCode(code)
    {
        if(code !== "" || typeof(code) !== "number")
        {
            this.code = code;
        }
    }

    /**
     * Función Set para asignar el tipo del curso
     * @param {String} type tipo del curso
     */
    setType(type)
    {
        if(type !== "" || typeof(type) !== "number")
        {
            this.type = type;
        }
    }

    /**
     * Función Set para asignar el grado del curso
     * @param {String} grade grado del curso
     */
    setGrade(grade)
    {
        if ((grade !== "" || typeof grade) !== "number")
        {
            this.grade = grade;
        }
    }

    /**
     * Función Set para asignar el numero del curso
     * @param {String} number numero del curso
     */
    setNumber(number)
    {
        if ((number !== "" || typeof number) !== "number")
        {
            this.number = number;
        }
    }

    /**
     * Función Set para asignar la letra del curso
     * @param {Number} letter letra del curso
     */
    setLetter(letter)
    {
        if ((letter !== "" || typeof letter) !== "number")
        {
            this.letter = letter;
        }
    }

    /**
     * Función Set para asignar el nombre del curso
     * @param {String} courseName nombre del curso
     */
    setCourseName(courseName)
    {
        if ((courseName !== "" || typeof courseName) !== "number")
        {
            this.courseName = courseName;
        }
    }

    /**
     * Función Set para asignar la descripción del curso
     * @param {String} description descripción del curso
     */
    setDescription(description)
    {
        if ((description !== "" || typeof description) !== "number")
        {
            this.description = description;
        }
    }
}