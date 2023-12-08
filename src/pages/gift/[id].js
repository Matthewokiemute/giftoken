
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SDK from "weavedb-sdk"
import LoadingSpinner from '@/components/Spinner';
import lf from "localforage"
import { isNil } from "ramda"
import { FaCopy, FaFileArrowUp, FaRegCopy } from "react-icons/fa6";

const contractTxId = "Ng20dHZFTnbgIiwCfFJ1wO8K2x23FiUVuobnQVcMsi0"

const GiftPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [db, setDb] = useState(null)
    const [initDB, setInitDb] = useState(false)
    const [whenClick, setWhenClick] = useState(false)
    const [workers, setWorkers] = useState(null);
    const [giftData, setGiftData] = useState(null);
    const [fullData, setFullData] = useState(null);
    const [user, setUser] = useState(null)
    const [formData, setFormData] = useState({
        wallet: '',
    })

    const handleWalletChange = (wallet) => {
        setFormData((prevData) => ({
            ...prevData,
            wallet: wallet,
        }));
    };



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
                    setFullData(giftDataById);
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

    }, [initDB, id, workers]);


    const formatWalletAddress = (address) => {
        const start = address.substring(0, 4);
        const end = address.substring(address.length - 4);
        return `${start}...${end}`;
      };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(giftData.giftLink);
            setWhenClick(!whenClick)
            // alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Unable to copy to clipboard', error);
        }
    };

    // Render your gift page using the fetched data
    return (
        <div className="fixed top-0 left-0 w-screen h-[100vh] bg-gray-800 flex flex-col gap-4 items-center justify-center">
            <h1>Make everyone smile 🙂</h1>
            {!giftData ? (
                <div className='flex flex-col justify-center py-20 items-center gap-1'>
                    <LoadingSpinner />
                    <p>Loading...</p>
                </div>
            ) : (
                <>

                    <div className={`relative bg-white text-black h-auto w-auto py-10 px-6 rounded-md flex flex-col gap-6 items-center ${whenClick ? 'border-t-[4px] border-green-600' : 'border-none'}`}>
                        <p>Account: {formatWalletAddress(fullData?.setter)}</p>
                        {/* Render other details from giftData */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className='flex items-center justify-center'>
                                <div className="text-black mr-20">Share Link With Members</div>
                                <div className='flex items-center text-center ml-auto'>
                                    {whenClick ? (<span className='text-white py-1 px-3 bg-green-600 rounded-lg'>Copied</span>) : ''}
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 w-full border-[0.5px] border-gray-300 focus:border-gray-700 rounded-lg px-4 py-3 ${whenClick ? 'border-t-[2px] border-green-600' : 'border-[0.5px]'}`}>
                                <input onChange={(e) => handleWalletChange(e.target.value)} placeholder='Enter your Wallet Address' type="text" className="outline:none text-gray-800 placeholder:text-gray-800 transistion-all ease-in-out duration-500" />
                                
                                <div className='h-full w-[0.5px] bg-gray-700'></div>
                                <div className='' onClick={copyToClipboard} style={{ cursor: 'pointer' }}>
                                    <FaFileArrowUp className={`w-5 h-5 ${whenClick ? 'text-green-600' : 'text-gray-600'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default GiftPage;
