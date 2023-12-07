import Web3 from "web3";


export const dynamic = 'force-dynamic';

// Connect to an Ethereum node (Infura is commonly used for this)
const web3 = new Web3('https://rpc-mainnet.maticvigil.com/');

// ERC20 token contract address (replace with your actual token address)
const tokenAddress = '0xa375fEfcA27a639361139718145dffc29A44cB6d';

// User's wallet address (replace with the actual user's address)
const userWalletAddress = '0xC5a0547309eD6eFB8aA69182773bb88D7eCB9601';

export async function POST(req) {
    try {
        const { amount, beneficiaries, role, walletAddress } = req.body;

        // Validate that the sender is an admin
        if (role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Instantiate the RandomTokenSender contract
        const contract = new Web3.eth.Contract(contractAbi, contractAddress);

        // Call the sendTokens function on the contract
        const transaction = await contract.methods.sendTokens(beneficiaries, amount).send({ from: walletAddress });

        // Construct the link to share with participants
        const link = `https://your-frontend-url.com/participate?transaction=${transaction.transactionHash}`;

        res.json({ link });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}