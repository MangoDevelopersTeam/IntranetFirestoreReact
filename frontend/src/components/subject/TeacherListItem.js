import React, { useCallback, useEffect, useState } from 'react';

import { ListItem, ListItemSecondaryAction, ListItemText, IconButton, Tooltip, Checkbox, FormGroup, FormControlLabel, CircularProgress } from '@material-ui/core';
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
        async () => {
            let teacherData = {
                id: teacher.id,
                name: Decrypt(teacher.data).name,
                surname: Decrypt(teacher.data).surname,
                email: Decrypt(teacher.data).email,
                courseCode: Decrypt(course)?.code,
                courseName: Decrypt(course)?.courseName,
                courseType: Decrypt(course)?.type,
                helper: false,
            };

            if (document.getElementById(`checkbox-${teacher.id}`) !== null)
            {
                if (document.getElementById(`checkbox-${teacher.id}`).checked === true)
                {
                    teacherData.helper = true;
                }
                else
                {
                    teacherData.helper = false;
                }
            }
            else
            {
                teacherData.helper = false;
            }

            let teacherObject = Encrypt(teacherData);
            let courseIdParam = Encrypt(subjectId);

            await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/set-teachers-course", {
                teacher: teacherObject
            }, {
                params: {
                    courseId: courseIdParam
                }
            })
            .then(result => {
                if (result.status === 201 && result.data.code === "PROCESS_OK")
                {
                    let data = Decrypt(result.data.data);
                    setTeachersCourse(data);
                }

                showMessage(result.data.message, result.data.type);
            })
            .catch(error => {
                if (error.response)
                {
                    showMessage(error.response.data.message, error.response.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setTeachersCourse(null);
                }
            });
        },
        [course, teacher, subjectId, setTeachersCourse],
    );

    /**
     * useCallback para remover el profesor en el curso
     */
    const handleRemoveTeacherCourse = useCallback(
        async () => {
            let teacherIdParam = Encrypt(teacher.id);
            let courseIdParam = Encrypt(subjectId);

            await axios.delete("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/remove-teacher-course", {
                data: {
                    helperState: helper
                },
                params: {
                    teacherId: teacherIdParam,
                    courseId: courseIdParam
                }
            })
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {   
                    let data = Decrypt(result.data.data);
                    setTeachersCourse(data);
                }

                showMessage(result.data.message, result.data.type);
            })
            .catch(error => {
                if (error.response)
                {
                    showMessage(error.response.data.message, error.response.data.type);
                }
            })
            .finally(() => {
                return () => {
                    setTeachersCourse(null);
                }
            });
        },
        [helper, teacher, subjectId, setTeachersCourse],
    );

    /**
     * useCallback para cambiar el nivel helper del usuario
     */
    const handleChangeHelperState = useCallback(
        async () => {
            if (called === false)
            {
                if (teacher !== null)
                {
                    setCalled(true);

                    let teacherIdParam = Encrypt(teacher.id);
                    let courseIdParam = Encrypt(subjectId);
                    let helperParam = helper;

                    await axios.put("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/change-helper-state", {
                        helperState: helperParam
                    }, {
                        params: {
                            courseId: courseIdParam,
                            teacherId: teacherIdParam
                        }
                    })
                    .then((result) => {
                        if (result.status === 200 && result.data.code === "PROCESS_OK")
                        {
                            let data = Decrypt(result.data.data);
                            setTeachersCourse(data);
                        }

                        showMessage(result.data.message, result.data.type);
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            showMessage(error.response.data.message, error.response.data.type);
                        }
                    })
                    .finally(() => {
                        setCalled(false);

                        return () => {
                            setTeachersCourse(null);
                        }
                    });
                }
            }
        },
        [called, helper, teacher, subjectId, setCalled, setTeachersCourse],
    );

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
            teacher === null ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                        <ListItemText primary={`${Decrypt(Decrypt(teacher.data).name)} ${Decrypt(Decrypt(teacher.data).surname)}`} secondary={Decrypt(Decrypt(teacher.data).rut)} security="true" />

                        <ListItemSecondaryAction security="true">
                        {
                            joined === true ? (
                                <FormGroup row>
                                    <React.Fragment>
                                    {
                                        length > 1 && (
                                            <Tooltip title="Si presiona el selector, este Docente será ayudante del Docente principal">
                                                <FormControlLabel control={<Checkbox id={`checkbox-${teacher.id}`} checked={helper} onChange={async () => await handleChangeHelperState()} />} label="Ayudante" />
                                            </Tooltip>
                                        )
                                    }   
                                    </React.Fragment>
                                    
                                    <Tooltip title="Eliminar Docente">
                                        <IconButton edge="end" onClick={handleRemoveTeacherCourse}>
                                            <PersonAddDisabled />
                                        </IconButton>
                                    </Tooltip>
                                </FormGroup>             
                            ) : (                    
                                <FormGroup row>
                                    <Tooltip title="Añadir Docente">
                                        <IconButton edge="end" onClick={handlePostTeacherCourse}>
                                            <PersonAdd />
                                        </IconButton>
                                    </Tooltip>
                                </FormGroup>
                            )   
                        }
                        </ListItemSecondaryAction>
                    </div>
                </div>
            )
        }
        </ListItem>
    )
}

export default TeacherListItem
