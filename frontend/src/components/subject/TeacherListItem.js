import React, { useCallback, useEffect, useState } from 'react';

import { ListItem, ListItemSecondaryAction, ListItemText, IconButton, Tooltip, Checkbox, FormGroup, FormControlLabel } from '@material-ui/core';
import { PersonAdd, PersonAddDisabled } from '@material-ui/icons';

import { showMessage } from '../../helpers/message/handleMessage';
import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';

import axios from 'axios';

const TeacherListItem = ({ subjectId, course, teacher, teachers, teachersCourse, setTeachersCourse }) => {
    // useStates
    const [joined, setJoined] = useState(false);
    const [helper, setHelper] = useState(false);
    const [length, setLength] = useState(0);
    const [called, setCalled] = useState(false);
    
    // useCallbacks
    /**
     * useCalback para añadir profesor en el curso
     */
    const handlePostTeacherCourse = useCallback(
        async (id, name, surname, email) => {

            let teacher = {
                id: id,
                name: name,
                surname: surname,
                email: email,
                courseCode: Decrypt(course)?.code,
                courseName: Decrypt(course)?.courseName,
                courseType: Decrypt(course)?.type,
                helper: false,
            };

            if (document.getElementById(`checkbox-${id}`) !== null)
            {
                if (document.getElementById(`checkbox-${id}`).checked === true)
                {
                    teacher.helper = true;
                }
                else
                {
                    teacher.helper = false;
                }
            }
            else
            {
                teacher.helper = false;
            }

            let teacherObject = Encrypt(teacher);
            let courseIdParam = Encrypt(subjectId);

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/set-teachers-course", {
                teacher: teacherObject
            }, {
                params: {
                    courseId: courseIdParam
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {
                    let data = Decrypt(result.data.data);
                    setTeachersCourse(data);
                }

                let message = result.data.message;
                let type = result.data.type;
                showMessage(message, type);
            })
            .catch(error => {
                let message = error.response.data.code;
                showMessage(message, "error");
            })
            .finally(() => {
                return () => {
                    setTeachersCourse(null);
                }
            });
        },
        [course, subjectId, setTeachersCourse],
    );

    /**
     * useCallback para remover el profesor en el curso
     */
    const handleRemoveTeacherCourse = useCallback(
        async (id) => {
            let teacherIdParam = Encrypt(id);
            let courseIdParam = Encrypt(subjectId);

            await axios.delete("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/remove-teacher-course", {
                params: {
                    teacherId: teacherIdParam,
                    courseId: courseIdParam
                }
            })
            .then(result => {
                if (result.data.code === "PROCESS_OK")
                {   
                    let data = Decrypt(result.data.data);
                    setTeachersCourse(data);
                }

                let message = result.data.message;
                let type = result.data.type;
                showMessage(message, type);
            })
            .catch(error => {
                let message = error.response.data.code;
                showMessage(message, "error");
            })
            .finally(() => {
                return () => {
                    setTeachersCourse(null);
                }
            });
        },
        [ subjectId, setTeachersCourse],
    );

    /**
     * useCallback para cambiar el nivel helper del usuario
     */
    const handleChangeHelperState = useCallback(
        /**
         * Función para cambiar el nivel helper del usuario
         * @param {Boolean} actualHelperState estado boolenado actual del nivel helper
         * @param {String} teacherId id del profesor
         */
        async (actualHelperState, teacherId) => {
            if (called === false)
            {
                setCalled(true);

                let teacherIdParam = Encrypt(teacherId);
                let courseIdParam = Encrypt(subjectId);

                await axios.put("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/change-helper-state", {
                    helperState: actualHelperState
                }, {
                    params: {
                        courseId: courseIdParam,
                        teacherId: teacherIdParam
                    }
                })
                .then((result) => {
                    if (result.data.code === "PROCESS_OK")
                    {
                        let data = Decrypt(result.data.data);
                        setTeachersCourse(data);
                    }

                    let message = result.data.message;
                    let type = result.data.type;
                    showMessage(message, type);
                })
                .catch((error) => {
                    let message = error.response.data.code;
                    showMessage(message, "error");
                })
                .finally(() => {
                    setCalled(false);

                    return () => {
                        setTeachersCourse(null);
                    }
                });
            }
        },
        [setTeachersCourse, subjectId, called, setCalled],
    )

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            let lambda = teachersCourse.find(x => x.id === teacher.id) === undefined ? false : true;

            if (lambda === true)
            {
                setJoined(true);
            }
            else
            {
                setJoined(false);
            }

            setLength(teachers.length);
        }

        callQuery();

        return () => {
            setJoined(null);
            setLength(null);
        }
    }, [teachersCourse, teacher, teachers]);

    useEffect(() => {
        let callQuery = async () => {
            let lambda = teachersCourse.find(x => Decrypt(x.data).helper === true && x.id === teacher.id) === undefined ? false : true;

            if (lambda === true)
            {
                setHelper(true);
            }
            else
            {
                setHelper(false);
            }
        }

        return callQuery();
    }, [teacher, teachersCourse]);

    return (
        <ListItem>
            {
                teachers === null ? (
                    console.log("es null")
                ) : (
                    console.log("no es null")
                )
            }
            
            <ListItemText primary={`${Decrypt(Decrypt(teacher.data).name)} ${Decrypt(Decrypt(teacher.data).surname)}`} secondary={Decrypt(Decrypt(teacher.data).rut)} security="true" />

            <ListItemSecondaryAction security="true">
            {
                joined === true ? (
                    <FormGroup row>
                    {
                        length > 1 && (
                            <Tooltip title="Si presiona el selector, este Docente será ayudante del Docente principal">
                                <FormControlLabel control={<Checkbox id={`checkbox-${teacher?.id}`} checked={helper} onChange={() => handleChangeHelperState(helper, teacher?.id)} />} label="Ayudante" />
                            </Tooltip>
                        )
                    }
                        <Tooltip title="Eliminar Docente">
                            <IconButton edge="end" onClick={() => handleRemoveTeacherCourse(teacher?.id)}>
                                <PersonAddDisabled />
                            </IconButton>
                        </Tooltip>
                    </FormGroup>             
                ) : (                    
                    <FormGroup row>
                        <Tooltip title="Añadir Docente">
                            <IconButton edge="end" onClick={() => handlePostTeacherCourse(teacher.id, teacher.data.name, teacher.data.surname, teacher.data.email)}>
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

export default TeacherListItem
