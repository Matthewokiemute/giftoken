

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./Spinner";
import SDK from "weavedb-sdk"
import lf from "localforage"
import { isNil } from "ramda"
import { ethers } from "ethers"
import Web3 from "web3";
import { FaRegCopy } from "react-icons/fa6";

const contractTxId = "Ng20dHZFTnbgIiwCfFJ1wO8K2x23FiUVuobnQVcMsi0"
const contractAddress = ''

const SwapBox = () => {
    const router = useRouter();
    const [closeSwap, setCloseSwap] = useState();
    const [initDB, setInitDb] = useState(false)
    const [workers, setWorkers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [whenClick, setWhenClick] = useState(false);
    // const [recipientAddresses, setRecipientAddresses] = useState('');
    // const [tokenAmount, setTokenAmount] = useState('');
    // const [wallet, setWallet] = useState(initialState);
    const [giftLink, setGiftLink] = useState('');
    const [user, setUser] = useState(null)
    const [db, setDb] = useState(null)
    const [formData, setFormData] = useState({
        token: '',
        beneficials: '',
        totalAmount: '',
    })

    const handleAmountChange = (token) => {
        setFormData((prevData) => ({
            ...prevData,
            token: token,
            totalAmount: token * prevData.beneficials,
        }));
    };

    const handleBeneficialsChange = (beneficials) => {
        setFormData((prevData) => ({
            ...prevData,
            beneficials: beneficials,
            totalAmount: prevData.token * beneficials,
        }));
    };

    const handleTotalAmount = (totalAmount) => {
        setFormData({
            ...formData,
            totalAmount: totalAmount,
        })
    }

    console.log(formData)
    const { token, beneficials } = { ...formData }
    console.log(token, beneficials);


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
        checkUser()
        setupWeaveDB();
    }, []);


    const handleClose = () => {
        router.push('/')
    }

    // Function to retrieve all people's data from the database.
    const getCreatedLinks = async () => {
        try {
            const res = await db.cget("Workers")
            setWorkers(res)
            console.log("getWorkers()", res)

        } catch (e) {
            console.error(e)
        }
    }

    const totalAmount = (token * beneficials);
    // Function to generate a random six-digit number
    const generateRandomSixDigitNumber = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };

    const handleSubmit = async () => {
        setLoading(true)
        console.log('Hello...')
        const giftId = generateRandomSixDigitNumber();
        const res = await db.add({ ...formData, giftId: giftId.toString(), giftLink: `https://giftoken.vercel.app/gift/${giftId}` }, "Workers");
        console.log("submitted: ", res)
        if (res) {
            // alert('Data submitted sucessfully')
            setLoading(false);
            // Retrieve the ID of the newly created record
            // const newId = res?.data && res?.data?.id;
            // router.push(`/gift/${giftId}`);
            setGiftLink(`https://giftoken.vercel.app/gift/${giftId}`)
            // window.reload();
        } else {
            alert('Error while submitting')
        }
        console.log(res);

        await getCreatedLinks();
    };

    // const sendTokens = async () => {
    //     const addresses = recipientAddresses.split(',');
    //     const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mainnet.matic.network'));
    //     const contract = new web3.eth.Contract(contractABI, contractAddress);

    //     for (const address of addresses) {
    //         try {
    //             await contract.methods.transfer(address, tokenAmount).send({ from: 'YourSenderAddress' });
    //             console.log(`Tokens sent to ${address}`);
    //         } catch (error) {
    //             console.error(`Error sending tokens to ${address}: ${error.message}`);
    //         }
    //     }
    // };

    console.log(workers);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(giftLink);
            setWhenClick(!whenClick)
            // alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Unable to copy to clipboard', error);
        }
    };

    
  function refreshPage() {
    window.location.reload(false);
  }



    return (
        <div>
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 w-screen h-[100vh] bg-gray-800 flex flex-col gap-4 items-center justify-center"
            >

                {/* Your new component goes here */}
                <div className="relative bg-white h-auto w-[300px] md:w-auto py-10 px-6 rounded-md flex flex-col gap-6 items-center">
                    <button className="absolute text-white -right-7 -top-1 hover:bg-gray-600 duration-500 rounded-full transition-all ease-in-out p-1 w-6 h-6 flex items-center justify-center" onClick={refreshPage}>x</button>
                    {/* Display the gift link if available */}
                    {giftLink && <div className={`flex items-center gap-2 w-full border-[0.5px] border-gray-300 focus:border-gray-700 rounded-lg px-4 py-3 ${whenClick ? 'border-t-[2px] border-green-600' : 'border-[0.5px]'}`}>
                        <div className="text-gray-800 transistion-all ease-in-out duration-500">
                            {giftLink}
                        </div>
                        <div className='h-full w-[0.5px] bg-gray-700'></div>
                        <div className='' onClick={copyToClipboard} style={{ cursor: 'pointer' }}>
                            <FaRegCopy className={`w-5 h-5 ${whenClick ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                    </div>
                    }
                    <div className="flex flex-col gap-2 items-start w-full">
                        <label className="text-black">Amount of token</label>
                        <input type="number" placeholder="20 ICX" onChange={(e) => handleAmountChange(e.target.value)} required className="w-full text-zinc-800 border-[0.5px] transistion-all ease-in-out duration-500 border-gray-300 focus:border-gray-700 rounded-lg px-4 py-3" />
                    </div>
                    <div className="flex flex-col gap-2 items-start">
                        <label className="text-black">Recipient Addresses, separatedby comma: 🍰</label>
                        <textarea type="number" placeholder="1 - 100 persons max"
                            onChange={(e) => handleBeneficialsChange(e.target.value)} rows="4"
                            required className="w-full text-zinc-800 border-[0.5px] transistion-all ease-in-out duration-500 border-gray-300 focus:border-gray-700 rounded-lg px-4 py-3"></textarea>
                    </div>
                    <div className="flex flex-col gap-2 items-start">
                        <label value={totalAmount} className="text-black" onChange={(e) => handleTotalAmount(e.target.value)}>Total Amount: 🍰 {totalAmount}</label>
                    </div>
                    <button onClick={handleSubmit} className="disabled:block bg-zinc-800/30 hover:bg-zinc-800 transistion-all ease-in-out duration-500 font-semibold w-full from-zinc-200 cursor-pointer px-5 py-3 rounded-md text-center">{!loading ? 'Create Gift Link' : <LoadingSpinner />}</button>
                </div>

                <span className="text-xs text-gray-400 underline">As a demo project we&apos;re only currently working with <span className="text-white">BNB faucets tokens.</span></span>
            </motion.div>
        </div>
    )
}

export default SwapBox;