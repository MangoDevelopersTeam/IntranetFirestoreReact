import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ThemeProvider, useTheme } from '@material-ui/styles';
import { Delete, Edit, ExpandMore, NavigateNext, Queue, Unarchive } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Breadcrumbs, Button, Card, CardContent, Checkbox, CircularProgress, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, Grid, IconButton, Input, LinearProgress, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, TextField, Tooltip, Typography, useMediaQuery, withStyles } from '@material-ui/core';

import { Decrypt, Encrypt } from '../../helpers/cipher/cipher';
import { showMessage } from '../../helpers/message/handleMessage';

import StudentListItem from '../subject/StudentListItem';

import { myExtensions } from './../../utils/allExtensions'

import { storage } from './../../firebase';

import axios from 'axios';

const InputTheme = createTheme({
    palette: {
        primary: {
            main: "#2074d4"
        }
    },
});

const DetailedSubject = () => {
    // uses
    const { id } = useParams();
    const themeApp = useTheme();
    const fullScreen = useMediaQuery(themeApp.breakpoints.down('sm'));



    // useStates
    const [subject, setSubject] = useState(null);
    const [errorSubject, setErrorSubject] = useState(false);
    const [loadingSubject, setLoadingSubject] = useState(true);
    const [errorCode, setErrorCode] = useState(null);

    const [unitFiles, setUnitFiles] = useState(null);
    const [errorUnitFiles, setErrorUnitFiles] = useState(false);
    const [loadingUnitFiles, setLoadingUnitFiles] = useState(true);

    const [authorized,   setAuthorized] = useState(null);
    const [errorAuthorized, setErrorAuthorized] = useState(false);
    const [loadingAuthorized, setLoadingAuthorized] = useState(true);

    const [access,   setAccess] = useState(null);
    const [errorAccess, setErrorAccess] = useState(false);
    const [loadingAccess, setLoadingAccess] = useState(true);

    const [students, setStudents] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [studentsCourse, setStudentsCourse] = useState(null);

    const [studentsDialog, setStudentsDialog] = useState(false);
    const [unitsFileDialog, setUnitsFileDialog] = useState(false);
    const [errorFileDialog, setErrorFileDialog] = useState(false);

    const [editUnitFileDialog, setEditUnitFileDialog] = useState(false);

    const [editFile, setEditFile] = useState(false);
    const [actualUrlFile, setActualUrlFile] = useState("");
    const [selectedUnitFile, setSelectedUnitFile] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    const [unitName, setUnitName] = useState(null);
    const [unitNumber, setUnitNumber] = useState(null);
    const [unitId, setUnitId] = useState(null);

    const [name, setName] = useState("");
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState("");

    const [cancel, setCancel] = useState(false);
    const [editor, setEditor] = useState(false);
    const [uploadReference, setUploadReference] = useState(null);
    const [loadingUpload, setLoadingUpload] = useState(false);
    


    // useCallbacks
    /* ------ SUBJECT CALLBACK ------ */
    /**
     * useCallback para obtener el detalle de la asignatura
     */
    const handleGetDetailedSubject = useCallback(
        async () => {
            if (id !== null)
            {
                setLoadingSubject(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-detailed-course", {
                    params: {
                        courseID: Encrypt(id)
                    }
                })
                .then(result => {
                    if (Decrypt(Decrypt(result.data.data).subject)[0].data === undefined)
                    {
                        setErrorSubject(true);
                        setSubject(undefined);
                        setErrorCode(result.data.code);
                    }
                    else
                    {
                        setErrorSubject(false);
                        setSubject(Decrypt(result.data.data));
                        setErrorCode(null);
                    }

                    setLoadingSubject(false);
                })
                .catch(error => {
                    setErrorSubject(true);
                    setSubject(undefined);
                    
                    if (error.response)
                    {
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_DETAILED_SUBJECT_ERROR");
                    }

                    setLoadingSubject(false);   
                })
                .finally(() => {
                    return () => {
                        setSubject(null); 
                        setErrorSubject(null);
                        setErrorCode(null);
                        setLoadingSubject(null);
                    }
                });
            }
        },
        [id, setSubject, setErrorSubject, setErrorCode, setLoadingSubject],
    );

    /**
     * useCallback para obtener los archivos de las unidades de la asignatura
     */
    const handleGetUnitFiles = useCallback(
        async () => {
            if (subject !== null && id !== null)
            {
                setLoadingUnitFiles(true);

                let array = [];
                
                await Decrypt(subject.units).forEach(async doc => {
                    await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-unit-files", {
                        params: {
                            idSubjectParam: Encrypt(id),
                            idUnitParam: Encrypt(doc.id)
                        }
                    })
                    .then(result => {
                        console.log("RESULT IS: ", result);
                        if (result.status === 200 && result.data.code === "PROCESS_OK")
                        {
                            array.push(result.data.data);

                            if (array.length === Decrypt(subject.units).length)
                            {
                                console.log("the results are", array);
                                setErrorUnitFiles(false);
                                setLoadingUnitFiles(false);
                                setUnitFiles(array);
                            }
                        }
                        else
                        {
                            setErrorUnitFiles(true);
                            setUnitFiles(null);
                            setErrorCode(result.data.code);
                            setLoadingUnitFiles(false);
                        }
                    })
                    .catch(error => {
                        setErrorUnitFiles(true);
                        setUnitFiles(null);    

                        if (error.response)
                        {
                            setErrorCode(error.response.data.code);
                        }
                        else
                        {
                            setErrorCode("GET_UNIT_FILES_ERROR");
                        }

                        setLoadingUnitFiles(false); 
                    })
                    .finally(() => {
                        return () => {
                            setErrorCode(null);
                            setErrorUnitFiles(null);
                            setLoadingUnitFiles(null);
                        }
                    });
                });
            }
        },
        [id, subject, setErrorCode ,setUnitFiles, setErrorUnitFiles, setLoadingUnitFiles],
    );
    /* ------ SUBJECT CALLBACK ------ */



    /* ------ ACCESS CALLBACKS ------ */
    /**
     * useCallback para verificar si el alumno o profesor tiene asignación a este recurso
     */
    const handleGetAuthorizedAccess = useCallback(
        async () => {
            if (id !== null)
            {
                setLoadingAuthorized(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-authorized-access", {
                    params: {
                        idCourse: Encrypt(id)
                    }
                })
                .then(result => {
                    console.log("the result is:", result);
                    if (result.data.data !== null && typeof(result.data.data) === "boolean")
                    {
                        setErrorAuthorized(false);
                        setAuthorized(result.data.data);
                        setErrorCode(null);
                    }
                    else
                    {
                        setErrorAuthorized(true);
                        setAuthorized(false);
                        setErrorCode(result.data.code);
                    }

                    setLoadingAuthorized(false);
                })
                .catch(error => {
                    setErrorAuthorized(true);
                    setAuthorized(false);

                    if (error.response)
                    {
                        setErrorCode(error.response.data.code);
                    }
                    else
                    {
                        setErrorCode("GET_UNIT_FILES_ERROR");
                    }

                    setLoadingAuthorized(false);
                })
                .finally(() => {
                    return () => {
                        setAuthorized(null);
                        setErrorAuthorized(null);
                        setErrorCode(null);
                    }
                });
            }
        },
        [id, setAuthorized, setErrorAuthorized, setErrorCode],
    );

    /**
     * useCallback para obtener el nivel de acceso del usuario
     */
    const handleGetAccess = useCallback(
        async () => {
            setLoadingAccess(true);

            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-access")
            .then(result => {
                if (result.status === 200 && result.data.code === "PROCESS_OK")
                {
                    setErrorAccess(false);
                    setAccess(result.data.data);
                    setErrorCode(null);
                }
                else
                {
                    setErrorAccess(true);
                    setAccess(null);
                    setErrorCode(result.data.code);
                }

                setLoadingAccess(false);
            })
            .catch(error => {
                setErrorAccess(true);
                setAccess(null);

                if (error.response)
                {
                    setErrorCode(error.response.data.code);
                }
                else
                {
                    setErrorCode("GET_ACCESS_ERROR");
                }

                setLoadingAccess(false);
            })
            .finally(() => {
                return () => {
                    setAccess(null);
                    setErrorAccess(null);
                    setErrorCode(null);
                    setLoadingAccess(null);
                }
            });
        },
        [setAccess, setErrorAccess, setErrorCode, setLoadingAccess],
    );
    /* ------ ACCESS CALLBACKS ------ */



    /* ------ STUDENTS CALLBACK ------ */
    /**
     * useCallback para obtener los estudiantes de la asignatura relacionadas con el curso
     */
    const handleGetStudentsCourse = useCallback(
        async () => {
            if (id !== null && subject !== null)
            {
                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students-courses", {
                    params: {
                        id: id
                    }
                })
                .then(result => {
                    if (result.data.code === "PROCESS_OK")
                    {   
                        setStudentsCourse(Decrypt(result.data.data));
                    }
                    else
                    {
                        setStudentsCourse([]);
                    }
                })
                .catch(error => {
                    showMessage(error.message, "error");
                    setStudentsCourse([]);
                })
                .finally(() => {
                    return () => {
                        setStudentsCourse(null);
                    }
                });
            }
        },
        [id, subject, setStudentsCourse],
    );

    /**
     * useCallback para obtener a los alumnos del sistema, que esten vinculados al curso de la asignatura
     */
    const handleGetStudents = useCallback(
        async () => {
            if (subject !== null)
            {
                setLoadingStudents(true);

                await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/get-students", {
                    params: {
                        number: Decrypt(subject.subject)[0].data.number,
                        letter: Decrypt(subject.subject)[0].data.letter,
                        grade: Decrypt(subject.subject)[0].data.grade
                    }
                })
                .then(async result => {
                    if (result.data.code === "PROCESS_OK")
                    {
                        setStudents(Decrypt(result.data.data));
                        await handleGetStudentsCourse()
                    }
                    else
                    {
                        setStudents([]); 
                    }
                })
                .catch(error => {
                    showMessage(error.message, "error");
                    console.log(error);
                    setStudents([]);
                })
                .finally(() => {
                    setLoadingStudents(false);

                    return () => {
                        setStudents(null);
                    }
                });
            }
        },
        [subject, setStudents, setLoadingStudents, handleGetStudentsCourse],
    );
    /* ------ STUDENTS CALLBACK ------ */



    /* ------ DIALOG CALLBACKS ------ */
    /**
     * useCallback para mostrar el dialogo de estudiantes
     */
    const handleOpenStudentsDialog = useCallback(
        async () => {
            if (students === null)
            {
                await handleGetStudents();
            }
    
            setStudentsDialog(true);
        },
        [students, handleGetStudents, setStudentsDialog],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseStudentsDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            return setStudentsDialog(false);
        },
        [setStudentsDialog],
    );


    /**
     * useCallback para mostrar el dialogo de estudiantes
     */
    const handleOpenFilesUnitDialog = useCallback(
        async (id, name, number) => {
            setUnitId(id);
            setUnitName(name);
            setUnitNumber(number);

            setUnitsFileDialog(true);
        },
        [setUnitsFileDialog, setUnitId, setUnitName, setUnitNumber],
    );

    /**
     * useCallback para cerrar el dialogo de estudiantes
     */
    const handleCloseFilesUnitDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setUnitId(null);
            setUnitName(null);
            setUnitNumber(null);

            return setUnitsFileDialog(false);
        },
        [setUnitsFileDialog, setUnitId, setUnitName, setUnitNumber],
    );


    /**
     * useCallback para mostrar el dialogo de editar archivo de la unidad
     */
    const handleOpenEditFileUnitDialog = useCallback(
        async (id, name, number, unitFile, unit) => {
            if (id !== null && name !== null && number !== null && unitFile !== null && unit !== null)
            {
                if (typeof(id) === "string" && typeof(name) === "string" && typeof(number) === "number")
                {
                    setUnitId(id);
                    setUnitName(name);
                    setUnitNumber(number);
                    
                    setName(Decrypt(unitFile.data.name));
                    setDescription(Decrypt(unitFile.data.description));
                    setActualUrlFile(Decrypt(unitFile.data.url));

                    setSelectedUnitFile(unitFile);
                    setSelectedUnit(unit);

                    setEditUnitFileDialog(true);
                }
            }
        },
        [setUnitId, setUnitName, setUnitNumber, setName, setDescription, setActualUrlFile, setSelectedUnitFile, setEditUnitFileDialog],
    );

    /**
     * useCallback para cerrar el dialogo de editar archivo de la unidad
     */
    const handleCloseEditFileUnitDialog = useCallback(
        (event, reason) => {
            if (reason === 'backdropClick' || reason === "escapeKeyDown") 
            {
                return;
            }

            setUnitId(null);
            setUnitName(null);
            setUnitNumber(null);
                    
            setName("");
            setFile(null);
            setDescription("");

            setEditUnitFileDialog(false);
        },
        [setUnitId, setUnitName, setUnitNumber, setName, setFile, setDescription, setEditUnitFileDialog],
    );
    /* ------ DIALOG CALLBACKS ------ */



    /* ------ HANDLE FILE CALLBACKS ------ */
    /**
     * useCallback para cancelar la suba del archivo
     */
    const handleCancelUpload = useCallback(
        () => {
            if (uploadReference !== null)
            {
                uploadReference.cancel();
                setProgress(0);
            }

            return;
        },
        [uploadReference, setProgress],
    );

    /**
     * useCallback para limpiar los useState y campos de texto del formulario cargar archivo
     */
    const handleClearFileParams = useCallback(
        () => {
            setDescription("");
            setFile(null);
            setName("");

            setCancel(false);
            setLoadingUpload(false);
            setProgress(0);
        },
        [setDescription, setFile, setName, setCancel, setLoadingUpload, setProgress],
    );

    /**
     * useCallback para setear la imagen en el estado de react
     */
    const handleSetFile = useCallback(
        (e) => {
           if (e.target.files[0])
           {
                setFile(e.target.files[0])
           } 
        },
        [setFile],
    );

    /**
     * useCallback para verificar si la extensión del archivo es valida o no
     */
    const handleVerifyFileExtension = useCallback(
        () => {
            if (file !== null && myExtensions !== null)
            {
                return (new RegExp('(' + myExtensions.join('|').replace(/\./g, '\\.') + ')$', "i")).test(file.name);
            }
        },  
        [file],
    );

    /**
     * useCallback para subir un archivo que retornará el enlace y lo enviará al backend
     */
    const handleUploadFile = useCallback(
        async () => {
            if (subject === null || id === null)
            {
                showMessage("No puede realizar esta operación, se requieren datos importantes, intentelo nuevamente", "error");
            }

            if (file === null || name === "" || description === "")
            {
                return showMessage("Complete todos los valores", "info");
            }

            if (handleVerifyFileExtension() !== true)
            {
                return showMessage("La extensión del archivo es invalido, intentelo nuevamente", "info");
            }

            let fileName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            let uploadFile = storage.ref(`course/${id}/unit/${unitId}/${fileName}`).put(file);

            setUploadReference(uploadFile);
            setLoadingUpload(true);
            setCancel(true);

            let object = {
                name: null,
                description: null,
                url: null
            };

            uploadFile.on('state_changed', snapshot => {
                let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(progress);
            }, (error) => {
                if (error.code === "storage/canceled")
                {
                    showMessage("La subida del archivo ha sido cancelada", "info");
                }
                else
                {
                    showMessage(error.code, "error");
                }

                setUploadReference(null);
                setLoadingUpload(false);
                setCancel(false);
            }, async () => {
                await storage.ref(`course/${id}/unit/${unitId}`).child(fileName).getDownloadURL()
                .then(async url => {
                    object.url = Encrypt(url);
                    object.name = Encrypt(name);
                    object.description = Encrypt(description);

                    await axios.post("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/post-file-course", {
                        objectData: Encrypt(object)
                    }, {
                        params: {
                            idSubjectParam: Encrypt(id),
                            idUnitParam: Encrypt(unitId)
                        }
                    })
                    .then(async () => {
                        await handleGetUnitFiles();
                        
                        setErrorUnitFiles(false);

                        setUnitName(null);
                        setUnitNumber(null);
                        setUnitId(null);
                        setUploadReference(null);

                        setUnitsFileDialog(false);
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            console.log(error.message);
                            //showMessage(error.response.message, "error");
                        }

                        setErrorUnitFiles(true);
                    });

                    handleClearFileParams();
                })
                .catch(error => {
                    if (error.response)
                    {
                        console.log("GET DOWNLOAD URL", error.response);
                    }

                    handleClearFileParams();
                    
                    return;
                });
            });
        },
        [id, subject, unitId, file, name, description, handleVerifyFileExtension, setUploadReference, setCancel, setLoadingUpload, setProgress, handleClearFileParams, handleGetUnitFiles],
    );

    const handleEditFile = useCallback(
        async () => {
            if (subject !== null && id !== null && selectedUnitFile !== null && selectedUnit !== null)
            {
                if (name === "" || description === "")
                {
                    return showMessage("Complete todos los campos", "info");
                }

                let object = {
                    name: null,
                    description: null,
                    url: null
                };

                if (editFile === true)
                {
                    if (file === null)
                    {
                        return showMessage("Complete el campo de archivo", "info");
                    }

                    let fileName = decodeURI(actualUrlFile.split(RegExp("%2..*%2F(.*?)alt"))[1].replace("?", ""));

                    if (handleVerifyFileExtension() !== true)
                    {
                        return showMessage("La extensión del archivo es invalido, intentelo nuevamente", "info");
                    }

                    await storage.ref(`course/${id}/unit/${selectedUnit.id}/${fileName}`).delete()
                    .catch(error => {
                        if (error.response)
                        {
                            console.log("DELETE FILE ERROR", error.response);
                        }
                    });


                    let uploadFile = storage.ref(`course/${id}/unit/${selectedUnit.id}/${file.name}`).put(file);
                    
                    setUploadReference(uploadFile);
                    setLoadingUpload(true);
                    setCancel(true);

                    uploadFile.on('state_changed', snapshot => {
                        let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        setProgress(progress);
                    }, (error) => {
                        if (error.code === "storage/canceled")
                        {
                            showMessage("La subida del archivo ha sido cancelada", "info");
                        }
                        else
                        {
                            showMessage(error.code, "error");
                        }

                        setUploadReference(null);
                        setLoadingUpload(false);
                        setCancel(false);
                    }, async () => {
                        await storage.ref(`course/${id}/unit/${selectedUnit.id}`).child(file.name).getDownloadURL()
                        .then(async url => {
                            object.name = Encrypt(name);
                            object.description = Encrypt(description);
                            object.url = Encrypt(url);

                            await axios.put("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/edit-unit-file", {
                                objectData: Encrypt(object),
                                editFileData: Encrypt(editFile)
                            }, {
                                params: {
                                    idSubjectParam: Encrypt(id),
                                    idUnitParam: Encrypt(selectedUnit.id),
                                    idUnitFileParam: Encrypt(selectedUnitFile.id) 
                                }
                            })
                            .then(async result => {
                                console.log(result);

                                if (result.status === 200 && result.data.code === "PROCESS_OK")
                                {
                                    setErrorFileDialog(false);
                                    setErrorCode(null);

                                    setSelectedUnit(null);
                                    setSelectedUnitFile(null);

                                    setUnitName(null);
                                    setUnitNumber(null);
                                    setUnitId(null);
                                    
                                    setName("");
                                    setDescription("");
                                    setFile(null);
                                    setUploadReference(null);
                                    setEditUnitFileDialog(false);
                                    setEditFile(false);

                                    handleClearFileParams();
                                    await handleGetUnitFiles();

                                    showMessage("Archivo editado Exitosamente", "success");
                                }
                                else
                                {
                                    setErrorFileDialog(true);
                                    setLoadingUpload(false);
                                    setErrorCode(result.data.code);
                                }
                            })
                            .catch(error => {
                                if (error.response)
                                {
                                    console.log(error.response);

                                    if (error.response.status === 400)
                                    {
                                        showMessage(error.response.data.message, error.response.data.type);
                                    }
                                    else if (error.response.status === 500)
                                    {
                                        setErrorCode(error.response.data.code);
                                        setErrorFileDialog(true);
                                        setLoadingUpload(false);
                                    }                   
                                }
                                else
                                {
                                    setErrorCode(error.response.data.code);
                                    setErrorFileDialog(true);
                                    setLoadingUpload(false);
                                }
                            })
                            .finally(() => {
                                return () => {
                                    setErrorFileDialog(null);
                                    setErrorCode(null);
                                    setLoadingUpload(null);
                                }
                            });
                        })
                        .catch(error => {
                            setErrorCode(error.response.data.code);
                            setErrorFileDialog(true);
                            setLoadingUpload(false);
                        });
                    });
                }
                else
                {
                    object.name = Encrypt(name);
                    object.description = Encrypt(description);

                    await axios.put("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/edit-unit-file", {
                        objectData: Encrypt(object),
                        editFileData: Encrypt(editFile)
                    }, {
                        params: {
                            idSubjectParam: Encrypt(id),
                            idUnitParam: Encrypt(selectedUnit.id),
                            idUnitFileParam: Encrypt(selectedUnitFile.id) 
                        }
                    })
                    .then(async result => {
                        if (result.status === 200 && result.data.code === "PROCESS_OK")
                        {
                            console.log(result);

                            setErrorFileDialog(false);
                            setErrorCode(null);

                            setSelectedUnit(null);
                            setSelectedUnitFile(null);

                            setUnitName(null);
                            setUnitNumber(null);
                            setUnitId(null);
                                    
                            setName("");
                            setDescription("");
                            setEditUnitFileDialog(false);
                            setEditFile(false);

                            handleClearFileParams();
                            await handleGetUnitFiles();

                            showMessage("Archivo editado Exitosamente", "success");
                        }
                        else
                        {
                            setErrorFileDialog(true);
                            setLoadingUpload(false);
                            setErrorCode(result.data.code);
                        }
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            console.log(error.response);

                            if (error.response.status === 400)
                            {
                                showMessage(error.response.data.message, error.response.data.type);
                            }
                            else if (error.response.status === 500)
                            {
                                setErrorCode(error.response.data.code);
                                setErrorFileDialog(true);
                                setLoadingUpload(false);
                            }                   
                        }
                        else
                        {
                            setErrorCode(error.response.data.code);
                            setErrorFileDialog(true);
                            setLoadingUpload(false);
                        }
                    })
                    .finally(() => {
                        return () => {
                            setErrorFileDialog(null);
                            setErrorCode(null);
                            setLoadingUpload(null);
                        }
                    });
                }     
            }
        },
        [subject, id, file, name, description, editFile, selectedUnitFile, selectedUnit, actualUrlFile, handleVerifyFileExtension, handleGetUnitFiles, handleClearFileParams],
    )

    /**
     * useCallback para remover el archivo
     */
    const handleRemoveFile = useCallback(
        async (fileId, unitId) => {
            if (id !== null)
            {
                await axios.delete("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/delete-unit-file", {
                    params: {
                        idSubjectParam: Encrypt(id),
                        idUnitParam: Encrypt(unitId),
                        idFileParam: Encrypt(fileId)
                    }
                })
                .then(async result => {
                    if (result.status === 200 && result.data.code === "PROCESS_OK")
                    {   
                        showMessage("Archivo borrado exitosamente", "success");

                        await handleGetUnitFiles()
                    }
                    else
                    {
                        setErrorUnitFiles(true);
                        setUnitFiles(null);
                        setErrorCode(result.data.code);
                    }
                })
                .catch(error => {
                    if (error.response)
                    {
                        if (error.response.status === 400)
                        {
                            showMessage(error.response.data.message, error.response.data.type);
                        }
                        else if (error.response.status === 500)
                        {
                            setErrorCode(error.response.data.code);
                            setErrorUnitFiles(true);
                            setUnitFiles(null);

                            setLoadingUnitFiles(false);
                        }                   
                    }
                    else
                    {
                        setErrorCode(error.response.data.code);
                        setErrorUnitFiles(true);
                        setUnitFiles(null);
                                
                        setLoadingUnitFiles(false);
                    }
                })
                .finally(() => {
                    return () => {
                        setErrorCode(null);
                        setErrorUnitFiles(null);
                        setLoadingUnitFiles(null);
                    }
                });
            }
        },
        [id, setErrorCode, setErrorUnitFiles, setLoadingUnitFiles, handleGetUnitFiles],
    );
    /* ------ HANDLE FILE CALLBACKS ------ */



    // useEffects
    useEffect(() => {
        let callQuery = async () => {
            await handleGetAuthorizedAccess();
        }

        callQuery();

        return () => {
            setAuthorized(null)
        }
    }, [handleGetAuthorizedAccess, setAuthorized]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetAccess();
        }

        if (authorized === true)
        {
            callQuery();

            return () => {
                setAccess(null);
            }
        }
    }, [authorized, handleGetAccess, setAccess]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetDetailedSubject();
        }

        if (authorized === true)
        {
            return callQuery();
        }
    }, [authorized, handleGetDetailedSubject]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetStudentsCourse();
        }

        if (authorized === true)
        {
            callQuery();

            return () => {
                setStudentsCourse(null);
            }
        }
    }, [authorized, handleGetStudentsCourse, setStudentsCourse]);

    useEffect(() => {
        let callQuery = async () => {
            await handleGetUnitFiles();
        }

        if (authorized === true && subject !== null)
        {
            return callQuery();
        }
    }, [authorized, subject, handleGetUnitFiles]);



    return (
        <div>
        {
            authorized === null || loadingAuthorized === true ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CircularProgress style={{ color: "#2074d4" }} />
                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                    </div>
                </div>
            ) : (
                authorized === false ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Typography>No tienes acceso a esta asignatura, contactese con el administrador</Typography>
                        </div>
                    </div>
                ) : (
                    loadingSubject === true || loadingAccess === true ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress style={{ color: "#2074d4" }} />
                                <Typography style={{ marginTop: 15 }}>Cargando Datos</Typography>
                            </div>
                        </div>
                    ) : (
                        errorSubject === true || errorAuthorized === true || errorAccess === true ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography>Ha ocurrido un error al momento de cargar la asignatura</Typography>
                                    <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={() => handleGetDetailedSubject}>
                                        <Typography>Recargar Contenido</Typography>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            subject === null || access === null ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: "calc(10% + 110px)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <CircularProgress style={{ color: "#2074d4" }} />
                                        <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                    </div>
                                </div>
                            ) : (
                                <React.Fragment>
                                    <Paper style={{ padding: 20, marginBottom: 15 }} variant="outlined">
                                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                                            <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                                                Home
                                            </Link>
                                            <Link to="/my-subjects" style={{ textDecoration: "none", color: "#333" }}>
                                                Mis Asignaturas
                                            </Link>
                                            <Typography style={{ color: "#2074d4" }}>{Decrypt(subject.subject)[0].data.code}</Typography>
                                        </Breadcrumbs>
                                    </Paper>

                                    <Grid container spacing={2}>
                                        <Grid item container md={9} style={{ marginTop: 15 }}>
                                            <Card variant="outlined" style={{ width: "100%" }}>
                                                <CardContent>
                                                    <Typography variant="h5" color="textSecondary">{Decrypt(Decrypt(subject.subject)[0].data.courseName)}</Typography>
                                                    <Typography variant="subtitle1" style={{ marginBottom: 15 }}>{Decrypt(Decrypt(subject.subject)[0].data.description)}</Typography>

                                                    <List>
                                                    {
                                                        Decrypt(subject.units).map(doc => (
                                                            <div key={doc.id}>
                                                                <ListItem>
                                                                    <ListItemText primary={`Unidad ${doc.data.numberUnit} : ${doc.data.unit}`} />
                                                                </ListItem>

                                                                <React.Fragment>
                                                                {
                                                                    editor === true && (
                                                                        <Tooltip title={<Typography variant="subtitle1">{`Añadir archivos en la unidad ${doc.data.numberUnit}`}</Typography>}>
                                                                            <IconButton onClick={() => handleOpenFilesUnitDialog(doc.id, doc.data.unit, doc.data.numberUnit)}>
                                                                                <Queue />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )
                                                                }
                                                                </React.Fragment>

                                                                <React.Fragment>
                                                                {
                                                                    loadingUnitFiles === true ? (
                                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: 5 }}>
                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                                <Typography style={{ marginTop: 15 }}>Cargando</Typography>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        errorUnitFiles === true ? (
                                                                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                                                                <Typography style={{ textAlign: "center" }}>Ha ocurrido un error al obtener los archivos de la unidad</Typography>
                                                                                <Button style={{ color: "#2074d4", marginTop: 15 }} onClick={async () => await handleGetUnitFiles()}>Recargar archivos de la unidad</Button>
                                                                            </div>
                                                                        ) : (
                                                                            unitFiles === null ? (
                                                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto", marginTop: 5 }}>
                                                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                                                        <Typography style={{ marginTop: 15 }}>Cargando Archivos</Typography>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <ListItem>
                                                                                    <List>
                                                                                    {
                                                                                        unitFiles.filter(x => x.idUnit === doc.id)[0].data.length > 0 && (
                                                                                            unitFiles.filter(x => x.idUnit === doc.id)[0].data.map(docFile => (
                                                                                                <ListItem button key={docFile.id} component="a" target="_blank" href={Decrypt(docFile.data.url)} style={{ height: "fit-content", marginBottom: 5, color: "#000" }}>
                                                                                                    <ListItemText primary={<Typography>{Decrypt(docFile.data.name)}</Typography>} style={{ marginRight: 70 }} />
                                                                                                    {
                                                                                                        Decrypt(access) === "teacher" && (
                                                                                                            editor === true && (
                                                                                                                <ListItemSecondaryAction>
                                                                                                                    <React.Fragment>
                                                                                                                        <Tooltip title={<Typography>Eliminar este Archivo</Typography>}>
                                                                                                                            <IconButton edge="end" onClick={() => handleRemoveFile(docFile.id, doc.id)}>
                                                                                                                                <Delete />
                                                                                                                            </IconButton>
                                                                                                                        </Tooltip>
                                                                                                                        <Tooltip title={<Typography>Editar este Archivo</Typography>}>
                                                                                                                            <IconButton edge="end" onClick={() => handleOpenEditFileUnitDialog(doc.id, doc.data.unit, doc.data.numberUnit, docFile, doc)} style={{ marginLeft: 15 }}>
                                                                                                                                <Edit />
                                                                                                                            </IconButton>
                                                                                                                        </Tooltip>
                                                                                                                    </React.Fragment>
                                                                                                                </ListItemSecondaryAction>
                                                                                                            )
                                                                                                        )
                                                                                                    }
                                                                                                </ListItem>
                                                                                            ))
                                                                                        )
                                                                                    }
                                                                                    </List>
                                                                                </ListItem>
                                                                            )
                                                                        )
                                                                    )                                       
                                                                }
                                                                </React.Fragment>

                                                                <Divider style={{ marginTop: 5, marginBottom: 15 }} /> 
                                                            </div>
                                                        ))
                                                    }
                                                    </List>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        <Grid item container md={3} style={{ marginTop: 15 }}>
                                            <Card variant="outlined" style={{ width: "100%" }}>
                                                <CardContent>
                                                    <React.Fragment>
                                                    {
                                                        Decrypt(access) === "teacher" && (
                                                            <React.Fragment>
                                                                <Button fullWidth style={{ color: "#2074d4", marginBottom: 15 }} onClick={() => handleOpenStudentsDialog()}>
                                                                    <Typography>Asignar Estudiantes</Typography>
                                                                </Button>

                                                                <Button fullWidth style={{ color: "#34495E", marginBottom: 15 }} onClick={() => setEditor(!editor)}>
                                                                {
                                                                    editor === false ? (
                                                                        <Typography>Abrir editor para subir archivos</Typography>
                                                                    ) : (
                                                                        <Typography>Cerrar Editor para subir archivos</Typography>
                                                                    )
                                                                }
                                                                </Button>

                                                                <Link to={`/subject/students/${id}`} style={{ textDecoration: "none", marginBottom: 15 }}>
                                                                    <Button fullWidth style={{ color: "#2074d4" }}>
                                                                        <Typography>Ver Estudiantes</Typography>
                                                                    </Button>
                                                                </Link>
                                                            </React.Fragment>
                                                        )
                                                    }
                                                    </React.Fragment>
                                                
                                                    <React.Fragment>
                                                    {
                                                        Decrypt(access) === "student" && (
                                                            <React.Fragment>
                                                                <Link to={`/subject/my-grades/${id}`} style={{ textDecoration: "none", marginBottom: 15 }}>
                                                                    <Button fullWidth style={{ color: "#2074d4", marginBottom: 15 }}>
                                                                        <Typography variant="button">Ver mis calificaciones</Typography>
                                                                    </Button>
                                                                </Link>

                                                                {/* <Link to={`/subject/my-annotations/${id}`} style={{ textDecoration: "none", marginBottom: 15 }}>
                                                                    <Button fullWidth style={{ color: "#2074d4", marginBottom: 15 }}>
                                                                        <Typography variant="button">Ver mis anotaciones</Typography>
                                                                    </Button>
                                                                </Link> */}


                                                                
                                                                {/* <Link to={`/subject/students/${id}`} style={{ textDecoration: "none", marginBottom: 15 }}>
                                                                    <Button fullWidth style={{ color: "#2074d4" }}>
                                                                        <Typography>Ver Estudiantes</Typography>
                                                                    </Button>
                                                                </Link> */}
                                                            </React.Fragment>
                                                        )
                                                    }
                                                    </React.Fragment>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                    
                                    <React.Fragment>
                                    {
                                        Decrypt(access) === "teacher" && (
                                            <React.Fragment>
                                                <Dialog open={studentsDialog} maxWidth={"md"} fullWidth={true} onClose={handleCloseStudentsDialog} fullScreen={fullScreen} scroll="paper">
                                                {
                                                    subject === null ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        <React.Fragment>
                                                            <DialogTitle>Asignar estudiantes a la asignatura {Decrypt(Decrypt(subject.subject)[0].data.courseName)}</DialogTitle>
                                                            <DialogContent>
                                                                <DialogContentText>Asigna estudiantes del curso {Decrypt(subject.subject)[0].data.grade} {`${Decrypt(subject.subject)[0].data.grade} ${Decrypt(subject.subject)[0].data.number}º${Decrypt(subject.subject)[0].data.letter}`} para la asignatura {Decrypt(subject.subject)[0].data.type}</DialogContentText>

                                                                <Accordion variant="outlined">
                                                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                                                        <Typography>Ver Alumnos</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails>
                                                                        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                                                        {
                                                                            loadingStudents === true ? (
                                                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                    <CircularProgress style={{ color: "#2074d4" }} />
                                                                                </div>
                                                                            ) : (
                                                                                students !== null && studentsCourse !== null ? (
                                                                                    students.length > 0 ? (
                                                                                        <React.Fragment>
                                                                                            <List style={{ width: "100%" }}>
                                                                                            {
                                                                                                students.map(doc => (
                                                                                                    <StudentListItem key={doc.id} subjectId={id} course={Encrypt(Decrypt(subject.subject)[0].data)} student={doc} students={students} studentsCourse={studentsCourse} setStudentsCourse={setStudentsCourse} />
                                                                                                ))
                                                                                            }
                                                                                            </List> 

                                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                                <Button onClick={async () => await handleGetStudents()} style={{ color: "#2074d4" }}>
                                                                                                    <Typography>Recargar Estudiantes</Typography>
                                                                                                </Button>
                                                                                            </div>
                                                                                        </React.Fragment>
                                                                                    ) : (
                                                                                        <React.Fragment>
                                                                                            <Typography style={{ textAlign: "center" }}>No existen alumnos a esta asignatura del curso</Typography>
                                                                                                    
                                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                                <Divider style={{ width: 270, marginBottom: 15, marginTop: 15 }} />
                                                                                                <Button onClick={async () => await handleGetStudents()} style={{ color: "#2074d4" }}>Recargar Estudiantes</Button>
                                                                                            </div>
                                                                                        </React.Fragment>
                                                                                    )
                                                                                ) : (
                                                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                                        <CircularProgress style={{ color: "#2074d4" }} />
                                                                                    </div>
                                                                                )
                                                                            )
                                                                        }
                                                                        </div>
                                                                    </AccordionDetails>
                                                                </Accordion>                                       
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button color="inherit" onClick={() => setStudentsDialog(false)}>
                                                                    <Typography>Cerrar Esta Ventana</Typography>
                                                                </Button>
                                                            </DialogActions>
                                                        </React.Fragment>
                                                    )
                                                }
                                                </Dialog>

                                                <Dialog open={unitsFileDialog} maxWidth={"md"} onClose={handleCloseFilesUnitDialog} fullScreen={fullScreen} scroll="paper">
                                                {
                                                    unitId === null || unitName === null || unitNumber === null ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        <React.Fragment>
                                                            <DialogTitle>Asigna archivos de estudio para la unidad Nº{unitNumber} : {unitName}</DialogTitle>
                                                            <DialogContent>
                                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                                    {
                                                                        loadingUpload === true ? (
                                                                            <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                                <Typography style={{ textAlign: "center", marginTop: 15 }}>El archivo se esta subiendo, espere un momento</Typography>
                                                                            </div>
                                                                        ) : (
                                                                            <React.Fragment>
                                                                                <Typography style={{ color: "#2074d4" }}>Datos del Archivo</Typography>
                                                                                <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />
                                                                                    
                                                                                <ThemeProvider theme={InputTheme}>
                                                                                    <TextField type="text" label="Nombre"      variant="outlined" security="true" value={name} fullWidth onChange={(e) => setName(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                    <TextField type="text" label="Descripción" variant="outlined" security="true" value={description} fullWidth onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                    <TextField type="file" variant="outlined"  security="true" fullWidth onChange={handleSetFile} style={{ marginBottom: 15 }} />
                                                                                </ThemeProvider>
                                                                            </React.Fragment>
                                                                        )
                                                                    }
                                                                
                                                                    <Typography style={{ marginTop: 15, color: "#2074d4" }}>Progreso de la Carga</Typography>
                                                                    <Divider style={{ height: 2, backgroundColor: "#2074d4" }} />

                                                                    <ThemeProvider theme={InputTheme}>
                                                                        <div style={{ display: "flex", justifyContent: "center", marginTop: 15 }}>
                                                                            <Typography>{`${progress}%`}</Typography>
                                                                            <LinearProgress variant="determinate" style={{ marginLeft: "auto", marginTop: 8, width: "calc(100% - 50px)" }} value={progress} />
                                                                        </div>
                                                                    </ThemeProvider>
                                                                </div>
                                                            </DialogContent>
                                                            <DialogActions>
                                                            {
                                                                cancel === true ? (
                                                                    <Button style={{ color: "#34495E" }} onClick={() => handleCancelUpload()}>
                                                                        <Typography>Cancelar Subida</Typography>
                                                                    </Button>
                                                                ) : (
                                                                    <React.Fragment>
                                                                        <Button style={{ color: "#2074d4" }} onClick={() => handleUploadFile()}>
                                                                            <Typography>Subir Archivo</Typography>
                                                                        </Button>

                                                                        <Button color="inherit" onClick={() => handleCloseFilesUnitDialog()}>
                                                                            <Typography>Cerrar Esta Ventana</Typography>
                                                                         </Button>
                                                                    </React.Fragment>                    
                                                                )
                                                            }
                                                            </DialogActions>
                                                        </React.Fragment>
                                                    )
                                                }
                                                </Dialog>

                                                <Dialog open={editUnitFileDialog} maxWidth={"md"} onClose={handleCloseEditFileUnitDialog} fullScreen={fullScreen} scroll="paper">
                                                {
                                                    unitId === null || unitName === null || unitNumber === null ? (
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: 15 }}>
                                                            <CircularProgress style={{ color: "#2074d4" }} />
                                                        </div>
                                                    ) : (
                                                        <React.Fragment>
                                                            <DialogTitle>Editar Archivo de la unidad Nº{unitNumber} : {unitName}</DialogTitle>
                                                            <DialogContent>
                                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                                    <React.Fragment>
                                                                    {
                                                                        loadingUpload === true ? (
                                                                            <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                                                                <CircularProgress style={{ color: "#2074d4" }} />
                                                                                <Typography style={{ textAlign: "center", marginTop: 15 }}>El archivo se esta subiendo, espere un momento</Typography>
                                                                            </div>
                                                                        ) : (
                                                                            <React.Fragment>
                                                                                <Typography style={{ color: "#2074d4" }}>Datos del Archivo</Typography>
                                                                                <Divider style={{ height: 2, marginBottom: 15, backgroundColor: "#2074d4" }} />
                                                                                                                
                                                                                <ThemeProvider theme={InputTheme}>
                                                                                    <TextField type="text" label="Nombre"      variant="outlined" security="true" value={name} fullWidth onChange={(e) => setName(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                    <TextField type="text" label="Descripción" variant="outlined" security="true" value={description} fullWidth onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 15 }} />
                                                                                </ThemeProvider>

                                                                                <FormControlLabel
                                                                                    control={<Tooltip title={editFile === true ? "Si desea mantener el archivo, quite esta opción" : "Si desea cambiar el archivo, seleccione esta opción"}>
                                                                                                <Checkbox style={{ color: "#2074d4" }} security="true" checked={editFile} onChange={(e) => setEditFile(e.target.checked)} />
                                                                                            </Tooltip>}
                                                                                    label="Editar Archivo Subido"
                                                                                />

                                                                                <div>
                                                                                {
                                                                                    editFile === true && (
                                                                                        <React.Fragment>
                                                                                            <Typography style={{ marginTop: 15, color: "#2074d4" }}>Archivo Actual Subido</Typography>
                                                                                            <Divider style={{ height: 2, marginBottom: 10, backgroundColor: "#2074d4" }} />

                                                                                            <ThemeProvider theme={InputTheme}>
                                                                                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                                                                                                    <Typography style={{ marginRight: 10 }}>Archivo Actual Subido :</Typography>
                                                                                                    <Typography style={{ color: "black" }} component="a" target="_blank" href={actualUrlFile}>{decodeURI(actualUrlFile.split(RegExp("%2..*%2F(.*?)alt"))[1].replace("?", ""))}</Typography>
                                                                                                </div>
                                                                                                    
                                                                                                <TextField type="file" variant="outlined" security="true" fullWidth onChange={handleSetFile} style={{ marginBottom: 15 }} />
                                                                                            </ThemeProvider>
                                                                                        </React.Fragment>
                                                                                    )
                                                                                }
                                                                                </div>
                                                                            </React.Fragment>
                                                                        )
                                                                    }
                                                                    </React.Fragment>

                                                                    <React.Fragment>
                                                                    {
                                                                        editFile === true && (
                                                                            <React.Fragment>
                                                                                <Typography style={{ marginTop: 15, color: "#2074d4" }}>Progreso de la Carga</Typography>
                                                                                <Divider style={{ height: 2, backgroundColor: "#2074d4" }} />
                                                                                                            
                                                                                <ThemeProvider theme={InputTheme}>
                                                                                    <div style={{ display: "flex", justifyContent: "center", marginTop: 15 }}>
                                                                                        <Typography>{`${progress}%`}</Typography>
                                                                                        <LinearProgress variant="determinate" style={{ marginLeft: "auto", marginTop: 8, width: "calc(100% - 50px)" }} value={progress} />
                                                                                    </div>
                                                                                </ThemeProvider>
                                                                            </React.Fragment>
                                                                        )
                                                                    }
                                                                    </React.Fragment> 
                                                                </div>
                                                            </DialogContent>
                                                            <DialogActions>
                                                            {
                                                                cancel === true ? (
                                                                    <Button style={{ color: "#34495E" }} onClick={() => handleCancelUpload()}>
                                                                        <Typography variant="button">Cancelar Editar Archivo</Typography>
                                                                    </Button>
                                                                ) : (
                                                                    <React.Fragment>
                                                                        <Button style={{ color: "#2074d4" }} onClick={() => handleEditFile()}>
                                                                            <Typography variant="button">Editar Archivo</Typography>
                                                                        </Button>

                                                                        <Button color="inherit" onClick={handleCloseEditFileUnitDialog}>
                                                                            <Typography variant="button">Cerrar Esta Ventana</Typography>
                                                                        </Button>
                                                                    </React.Fragment>                    
                                                                )
                                                            }
                                                            </DialogActions>
                                                        </React.Fragment>
                                                    )
                                                }
                                                </Dialog>
                                            </React.Fragment>
                                        )
                                    }
                                    </React.Fragment>
                                </React.Fragment>
                            )
                        )
                    )
                )
            )
        }
        </div>
    );
};

export default DetailedSubject;