import React, { useCallback, useEffect, useState } from 'react';

import { PersonAdd, PersonAddDisabled } from '@material-ui/icons';
import { CircularProgress, Divider, FormGroup, IconButton, ListItem, ListItemSecondaryAction, ListItemText, Tooltip, Typography } from '@material-ui/core';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { showMessage } from '../../helpers/message/handleMessage';

import axios from 'axios';


const StudentListItem = ({ subjectId, course, student, studentsCourse, setStudentsCourse }) => {
    // useStates
    const [joined, setJoined] = useState(false);

    // useCallbacks
    /**
     * useCalback para añadir el alumno en el curso
     */
    const handlePostStudentCourse = useCallback(
        async () => {
            let object = {
                id: student.id,
                name: Decrypt(student.data).name,
                surname: Decrypt(student.data).surname,
                email: Decrypt(student.data).email,
                courseCode: Decrypt(course)?.code,
                courseName: Decrypt(course)?.courseName,
                courseType: Decrypt(course)?.type,
            };

            let studentObject = Encrypt(object);
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
        [course, student, setStudentsCourse, subjectId],
    );

    /**
     * useCallback para remover el alumno en el curso
     */
    const handleRemoveStudentCourse = useCallback(
        async () => {
            let studentIdParam = Encrypt(student.id);
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
        [student, subjectId, setStudentsCourse],
    );

    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            if (student !== null && studentsCourse !== null)
            {
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
        }

        callQuery();

        return () => {
            setJoined(null);
        }
    }, [studentsCourse, student]);

    return (
        <ListItem>
        {
            student === null ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress style={{ color: "#2074d4" }} />
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                        <ListItemText primary={<Typography>{`${Decrypt(Decrypt(student.data).name)} ${Decrypt(Decrypt(student.data).surname)}`}</Typography>} secondary={<Typography color="textSecondary">{Decrypt(Decrypt(student.data).rut)}</Typography>} security="true" />

                        <ListItemSecondaryAction security="true">
                        {
                            joined === true ? (
                                <FormGroup row>
                                    <Tooltip title={<Typography>Remover alumno de la asignatura</Typography>}>
                                        <IconButton edge="end" onClick={handleRemoveStudentCourse}>
                                            <PersonAddDisabled />
                                        </IconButton>
                                    </Tooltip>
                                </FormGroup>             
                            ) : (                    
                                <FormGroup row>
                                    <Tooltip title={<Typography>Añadir alumno a la asignatura</Typography>}>
                                        <IconButton edge="end" onClick={handlePostStudentCourse}>
                                            <PersonAdd />
                                        </IconButton>
                                    </Tooltip>
                                </FormGroup>
                            )   
                        }
                        </ListItemSecondaryAction>
                    </div>

                    <Divider style={{ width: "100%" }} />
                </div>
            )
        }
        </ListItem>
    );
};

export default StudentListItem;