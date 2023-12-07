// Import necessary modules
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SDK from "weavedb-sdk"
import LoadingSpinner from '@/components/Spinner';
import lf from "localforage"
import { isNil } from "ramda"

const contractTxId = "Ng20dHZFTnbgIiwCfFJ1wO8K2x23FiUVuobnQVcMsi0"

const GiftPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [db, setDb] = useState(null)
    const [initDB, setInitDb] = useState(false)
    const [workers, setWorkers] = useState(null);
    const [giftData, setGiftData] = useState(null);
    const [user, setUser] = useState(null)


    const setupWeaveDB = async () => {
        try {
            const _db = new SDK({
                contractTxId
            });
            await _db.init();
            setDb(_db);
            setInitDb(true);
        } catch (e) {
            console.error("setupWeaveDB", e);
        }
    };

    const checkUser = async () => {
        const wallet_address = await lf.getItem(`temp_address:current`)
        if (!isNil(wallet_address)) {
            const identity = await lf.getItem(
                `temp_address:${contractTxId}:${wallet_address}`
            )
            if (!isNil(identity))
                setUser({
                    wallet: wallet_address,
                    privateKey: identity.privateKey,
                })
        }
    }

    useEffect(() => {
        // Fetch data for the specific ID from WeaveDB or any other data source
        const getCreatedLinks = async () => {
            try {
                // Check if db is initialized before using it
                if (initDB && db) {
                    const res = await db.cget('Workers');
                    setWorkers(res);
                    setGiftData(res); 
                    console.log('getWorkers()', res);
                }
            } catch (e) {
                console.error(e);
            }
        };

        // Call getCreatedLinks only if db is initialized
        if (initDB) {
            getCreatedLinks();
        }
    }, [initDB]);


    const getGiftDataById = () => {
        try {
          if (initDB && db && id && workers) {
            // Find the worker with the matching giftId
            const giftDataById = workers.find(worker => worker.data.giftId === id);
    
            if (giftDataById) {
              setGiftData(giftDataById.data);
              console.log('getGiftDataById()', giftDataById.data);
            } else {
              console.log('Gift data not found for id:', id);
              // Handle case when gift data is not found
            }
          }
        } catch (e) {
          console.error(e);
        }
      };

    useEffect(() => {
        checkUser()
        setupWeaveDB();
    }, []);

    useEffect(() => {
        // Fetch data for the specific ID from WeaveDB or any other data source
        if (initDB && db && id) {
          getGiftDataById();
        }
        // ... (other code)
      }, [initDB, id, workers]);

    // console.log(workers)

    // if (!giftData) {
    //     // You can show a loading spinner or some other loading indicator here
    //     return <div className='flex justify-center items-center'>

    //     </div>;
    // }

    // Render your gift page using the fetched data
    return (
        <div className='grid justify-center place-items-center my-auto py-10 px-10'>
            <h1>Gift Page</h1>
            {!giftData ? (
                <div className='flex flex-col justify-center py-20 items-center gap-1'>
                    <LoadingSpinner />
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    <p>ID: {id}</p>
                    {/* Render other details from giftData */}
                </>
            )}
        </div>
    );
};

export default GiftPage;
