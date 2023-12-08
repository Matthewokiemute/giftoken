import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SDK from "weavedb-sdk"
import LoadingSpinner from '@/components/Spinner';
import lf from "localforage"
import { isNil } from "ramda"
import { FaCopy, FaRegCopy } from "react-icons/fa6";

const contractTxId = "Ng20dHZFTnbgIiwCfFJ1wO8K2x23FiUVuobnQVcMsi0"

const AllLinks = () => {
    const router = useRouter();
    const { id } = router.query;
    const [db, setDb] = useState(null)
    const [initDB, setInitDb] = useState(false)
    const [workers, setWorkers] = useState(null);
    const [giftData, setGiftData] = useState(null);
    const [userLinks, setUserLinks] = useState([]);
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

    console.log(user?.wallet)

    const getUserLinks = async () => {
        try {
            if (initDB && db && user) {
                // Fetch all links
                const allLinks = await db.cget("Workers");
                console.log(allLinks)

                // Filter links for the current user
                const userLinks = allLinks?.filter(link => link?.data?.setter === user?.wallet);

                setUserLinks(userLinks);
                console.log("getUserLinks()", userLinks);
            }
        } catch (e) {
            console.error(e);
        }
    };


    useEffect(() => {
        checkUser();
        setupWeaveDB();
    }, []);

    useEffect(() => {
        // Fetch user links when user and database are initialized
        if (initDB && db && user) {
            getUserLinks();
        }
    }, [initDB, user]);



    return (
        <>
            <div className="fixed top-0 left-0 w-screen h-[100vh] bg-gray-800 flex flex-col gap-4 items-center justify-center">
                <h1>User Links Page</h1>
                {userLinks?.length ? (
                    <div className='flex flex-col justify-center py-20 items-center gap-1'>
                        <p>No links found for the user.</p>
                    </div>
                ) : (
                    <div className="relative bg-white text-black h-auto w-auto py-10 px-6 rounded-md flex flex-col gap-6 items-center">
                        <p>User Wallet: {user?.wallet}</p>
                        <p>Number of Links: {userLinks?.length}</p>
                        <div>
                            {userLinks?.map((link, index) => (
                                <div key={index} className="text-gray-800 border-[0.5px] transistion-all ease-in-out duration-500 border-gray-300 focus:border-gray-700 rounded-lg px-4 py-3 my-2">
                                    <p>Link {index + 1}:</p>
                                    <p>{link?.data?.giftLink}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default AllLinks;