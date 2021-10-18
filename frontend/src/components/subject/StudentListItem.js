import React, { useCallback, useEffect, useState } from 'react';

import { FormGroup, IconButton, ListItem, ListItemSecondaryAction, ListItemText, Tooltip } from '@material-ui/core';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import axios from 'axios';
import { showMessage } from '../../helpers/message/handleMessage';
import { PersonAdd, PersonAddDisabled } from '@material-ui/icons';

const StudentListItem = ({ subjectId, course, student, students, studentsCourse, setStudentsCourse }) => {
    // useStates
    const [joined, setJoined] = useState(false);

    // useCallbacks
    /**
     * useCalback para añadir alumnos en el curso
     */
    const handlePostStudentCourse = useCallback(
        async (id, name, surname, email) => {
            const student = {
                id: id,
                name: name,
                surname: surname,
                email: email,
                courseCode: Decrypt(course)?.code,
                courseName: Decrypt(course)?.courseName,
                courseType: Decrypt(course)?.type,
            };

            let studentObject = Encrypt(student);
            let courseIdParam = Encrypt(subjectId);

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/set-students-course", {
                student: studentObject
            }, {
                params: {
                    courseId: courseIdParam
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    console.log(Decrypt(result.data.data));
                    setStudentsCourse(Decrypt(result.data.data));
                }

                showMessage(result.data.message, result.data.type);
            })
            .catch(error => {
                showMessage(error.message, "error");
            })
            .finally(() => {
                return () => {
                    setStudentsCourse(null);
                }
            });
        },
        [course, setStudentsCourse, subjectId],
    );

    /**
     * useCallback para remover el profesor en el curso
     */
    const handleRemoveStudentCourse = useCallback(
        async (id) => {
            let studentIdParam = Encrypt(id);
            let courseIdParam = Encrypt(subjectId);

            await axios.delete("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/remove-student-course", {
                params: {
                    studentId: studentIdParam,
                    courseId: courseIdParam
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    console.log(Decrypt(result.data.data));
                    setStudentsCourse(Decrypt(result.data.data));
                }

                showMessage(result.data.message, result.data.type);
            })
            .catch(error => {
                showMessage(error.message, "error");
            })
            .finally(() => {
                return () => {
                    setStudentsCourse(null);
                }
            });
        },
        [setStudentsCourse, subjectId],
    );

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            let lambda = studentsCourse.find(x => x.id === student.id) === undefined ? false : true;

            if (lambda === true)
            {
                setJoined(true);
            }
            else
            {
                setJoined(false);
            }
        }

        callQuery();

        return () => {
            setJoined(null);
        }
    }, [studentsCourse, student, students]);

    return (
        <ListItem>
            <ListItemText primary={`${Decrypt(Decrypt(student.data).name)} ${Decrypt(Decrypt(student.data).surname)}`} secondary={Decrypt(Decrypt(student.data).rut)} security="true" />

            <ListItemSecondaryAction security="true">
            {
                joined === true ? (
                    <FormGroup row>
                        <Tooltip title="Eliminar Alumno">
                            <IconButton edge="end" onClick={() => handleRemoveStudentCourse(student.id)}>
                                <PersonAddDisabled />
                            </IconButton>
                        </Tooltip>
                    </FormGroup>             
                ) : (                    
                    <FormGroup row>
                        <Tooltip title="Añadir Docente">
                            <IconButton edge="end" onClick={() => handlePostStudentCourse(student.id, student.data.name, student.data.surname, student.data.email)}>
                                <PersonAdd />
                            </IconButton>
                        </Tooltip>
                    </FormGroup>
                )   
            }
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default StudentListItem
