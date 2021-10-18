import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'

const Testing = () => {
    const [lastRef, setLastRef] = useState(null);
    const [firstRef, setFirstRef] = useState(null);

    const getDocuments = useCallback(
        async () => {
            console.log(lastRef);
            await axios.get("https://us-central1-open-intranet-api-rest.cloudfunctions.net/api/test-pagination", {
                params: {
                    lastRef: lastRef,
                    firstRef: firstRef,
                }
            })
            .then(result => {
                console.log(result)
            })
            .catch(error => {
                console.log(error);
            });
        },
        [lastRef, firstRef],
    );

    /* useEffect(() => {
        let callQuery = async () => {
            await getDocuments();
        }

        return callQuery();
    }, [getDocuments]) */

    /* data: {
        lastRef: lastRef,
        firstRef: firstRef
    } */

    return (
        <div>
            Probando PAGINACION
            <button onClick={() => getDocuments()}>GET DOCUMENTS</button>
        </div>
    )
}

export default Testing
