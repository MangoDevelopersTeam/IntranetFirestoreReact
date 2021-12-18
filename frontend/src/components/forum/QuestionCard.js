import React from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { blue } from '@material-ui/core/colors';

import { Decrypt } from '../../helpers/cipher/cipher';

import moment from 'moment';

const QuestionCard = ({ idUser, access, doc }) => {

    moment.locale('es', {
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
    });

    return (
        <Card style={{ marginTop: 15 }} variant="outlined">
            <CardHeader action={
                Decrypt(access) === "admin" ? (
                    <Tooltip title={<Typography>Eliminar Pregunta</Typography>}>{/** AQUI DEBO HACER ELIMINACIÓN LOGIA Y EDITAR COMO ALUMNO PROPIETARIO */}
                        <IconButton /* onClick={openConfirmDelete} */>
                            <Delete />
                        </IconButton>
                    </Tooltip>
                ) : Decrypt(access) === "student" && doc.data.created_by === idUser ? (
                    <Tooltip title={<Typography>Editar Pregunta</Typography>}>
                        <IconButton /* onClick={openConfirmDelete} */>
                            <Edit />
                            {/**AHORA DEBO HACER LA ELIMINACIÓN LOGICA AQUÍ */}
                        </IconButton>
                    </Tooltip>
                ) : (
                    <React.Fragment>
                    </React.Fragment>
                ) }
                
                title={
                    <Link to={`forum/${doc.id}`} style={{ textDecoration: 'none', color: blue[500] }} security="true">
                        <Typography variant="h5" component="p">{doc.data.question}</Typography>
                    </Link>}

                subheader={
                    <Typography>{`Creado el ${moment(new Date(doc.data.created_at._seconds * 1000)).format("D [de] MMMM [de] gggg[, a las ] HH:mm")} ${doc.data.name !== null ? `por ${Decrypt(doc.data.name)} ${Decrypt(doc.data.surname)}` : ``}`}</Typography>
                } />
            <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">{doc.data.description}</Typography>
            </CardContent>
        </Card>
    )
}

export default QuestionCard