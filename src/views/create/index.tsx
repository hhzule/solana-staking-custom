import { FC, useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import mpl from '@metaplex-foundation/js';
// Wallet
import { 
    MINT_SIZE, createInitializeMintInstruction,
    getMinimumBalanceForRentExemptMint,createMintToInstruction,createAssociatedTokenAccountInstruction,
    createBurnCheckedInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddress ,getMint
} from "@solana/spl-token";
import {PROGRAM_ID, createCreateMetadataAccountV3Instruction, createCreateMetadataAccountInstruction } from "@metaplex-foundation/mpl-token-metadata"
import { notify } from "../../utils/notifications";
import axios from "axios";
// Components

import pkg from '../../../package.json';

import { useRouter } from 'next/router';
// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { NetworkConfigurationProvider, useNetworkConfiguration } from '../../contexts/NetworkConfigurationProvider';
//constants

export const CreateView: FC = ({ }) => {
    const { connection : wconn } = useConnection(); 
    const {publicKey, sendTransaction} = useWallet();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  // const endpoint = () => clusterApiUrl(network)
  const wallet = useWallet();
  const [burnTrx, setBurnTrx] = useState("")
  const [supply, setSupply] = useState("")
  const [amount, setAmount] = useState("")
  const [connection, setConnection] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  //token create
  
  const [mintAddress, setMintAddress] = useState("")
  const [isloading, setIsLoading] = useState(false)
  const [token, setToken] = useState({
    name: "",
    symbol:"",
    decimals:"",
    amount:"",
    image:"",
    description:"",
  })
  const handleFormfieldchange = (fieldName: any, e : any) =>{
    setToken({...token, [fieldName]: e.target.value})
  }
const createToken = useCallback(async(token : any)=>{
    console.log("token data", token)
    setIsLoading(true)
    if(!token.name || !token.symbol || !token.amount || !token.description || !token.decimals){
        notify({type: "error", message:"fields missing required"}) 
        setIsLoading(false)
        return 
    }
const lamports : any = await getMinimumBalanceForRentExemptMint(connection)  
const mintKeyPair = Keypair.generate()
const tokenATA =await getAssociatedTokenAddress(
    mintKeyPair.publicKey,
    publicKey
)
try {
    const metadataUrl: any = await uploadMetadata(token) 
    console.log(metadataUrl)
    // const metadataUrl = "https://gateway.pinata.cloud/ipfs/QmdxcSSGeCegUBuqRG4D3mY3UpbEpEuRvK8neZNqPDWMXF"

const createNewTokenTransaction = new Transaction().add(
    SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeyPair.publicKey,
        space: MINT_SIZE,
        programId:TOKEN_PROGRAM_ID,
        lamports: lamports

    }), createInitializeMintInstruction(
        mintKeyPair.publicKey,
        Number(token.decimals),
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
    ),createAssociatedTokenAccountInstruction(
        publicKey,
        tokenATA,
        publicKey,
        mintKeyPair.publicKey
    ), createMintToInstruction(
        mintKeyPair.publicKey,
        tokenATA,
        publicKey,
        Number(token.amount) * Math.pow(10, Number(token.decimals))
    ), createCreateMetadataAccountV3Instruction({
        metadata: PublicKey.findProgramAddressSync([
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mintKeyPair.publicKey.toBuffer()
        ],
         PROGRAM_ID)[0],
         mint: mintKeyPair.publicKey,
         mintAuthority: publicKey,
         updateAuthority: publicKey,
         payer: publicKey
    },{
        createMetadataAccountArgsV3: {
            data: {
                name: token.name,
                symbol: token.symbol,
                uri: metadataUrl,
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null,
                // collectionDetails: null,
            },
            isMutable: true,
            collectionDetails: null
        }
    })
)

const signature = await sendTransaction(
    createNewTokenTransaction,
    connection,
    {signers: [mintKeyPair]}
)
setMintAddress(mintKeyPair.publicKey.toString())
notify({type: "success", message:"Token created successfully", txid: signature})
} catch (err) {
    setLoading(false)
    console.error(err)
    notify({type: "error", message:"Token created failed"})
}
setLoading(false)
},[publicKey, connection, sendTransaction])

const uploadMetadata = async(token : any) =>{
    setIsLoading(true)
    const {name, symbol,description, image} = token
    if(!name || !symbol || !description || !image) { return  notify({type: "error", message:"data missing"}) }
const data = JSON.stringify({
    name: name,
    symbol: symbol,
    description: description,
    image: image
})
try {
    const response = await axios({
        method:"POST",
        url:"https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers:{
            pinata_api_key:"",
            pinata_secret_api_key:"",
            "Content-Type": "application/json"
        }
    })
    const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    return url
} catch (error) {
    console.error(error)
    notify({type: "error", message:"upload failed"})
}
// setIsLoading(false)
}
const handleImageChange = async (e : any)=>{
    const file = e.target.files[0]
    console.log(file, "file")
    if(file){
        const imgUrl: any =await  uploadImagePinata(file)
        console.log(imgUrl, "imgUrl")
        setToken({...token, image :imgUrl })
    }
}
const uploadImagePinata = async (file : any)=>{
   setLoading(true)
    if(file){
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios({
                method:"post",
                url:"https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers:{
                    pinata_api_key:"",
                    pinata_secret_api_key:"",
                    "Content-Type": "multipart/form-data"
                }
            })
            const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
            return ImgHash
        } catch (error) {
            console.error(error)
            notify({type: "error", message:"upload image failed"}) 
        }
        setLoading(false)
    }
}


  useEffect(() => {
    console.log("useEffect", network)
if(network == "mainnet-beta"){
  if (wallet.publicKey ) {
    console.log(wallet.publicKey.toBase58())

    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=78c69964-e500-4354-8f43-eec127b47bd7");
  setConnection(connection)

  }
}else{
  if (wallet.publicKey ) {
    console.log(wallet.publicKey.toBase58())
    const connection = wconn
      setConnection(connection)

  } 
}

  }, [wallet.publicKey,network])
  useEffect(() => {

    if(connection){
   
      getUserSOLBalance(wallet.publicKey, connection)
    }

  }, [connection])
  


  const balance = useUserSOLBalanceStore((s) => s.balance)
  
 const burnTk = async () =>{
setLoading(true);
  setBurnTrx("")
  if(!connection){
    notify({ type: 'error', message: `Wallet not connected!` });
    console.log('error', `not connected!`);
    setLoading(false);
    return;
  }
  if (!publicKey) {
    notify({ type: 'error', message: `Wallet not connected!` });
    console.log('error', `Send Transaction: Wallet not connected!`);
    setLoading(false);
    return;
}

 }
   
 
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const onClick = () => {
    router.push("/")
}


  return (

    <div className=" mx-auto p-4">
          
      <div className="md:hero-content h-[500px] justify-around flex flex-col">
    
    
        <div className="flex flex-col justify-between h-[120px] relative group items-center">

          {/* <RequestAirdrop /> */}
          <h4 className="md:w-full text-2xl text-slate-300 my-2">
         
        
          {wallet &&
          <div className="flex flex-row justify-center">
            <div> Wallet Balance : {""}
              {(balance || 0).toLocaleString()}
              </div>
              <div className='text-slate-600 ml-2'>
                SOL
              </div>
          </div>
          }
          </h4>
    
    <p>name</p>
    <input
    value={token.name}
    onChange={(e) => handleFormfieldchange("name",e)}
    style={{color: 'black', marginBottom: '10px'}}
    />
       <p>symbol</p>
    <input
    value={token.symbol}
    onChange={(e) => handleFormfieldchange("symbol",e)}
    style={{color: 'black', marginBottom: '10px'}}
    />
        <p>description</p>
    <textarea
    value={token.description}
    onChange={(e) => handleFormfieldchange("description",e)}
    style={{color: 'black', marginBottom: '10px'}}
    />
    <p>supply</p>
    <input
    type='number'
    value={token.amount}
    onChange={(e) => handleFormfieldchange("amount",e)}
    style={{color: 'black', marginBottom: '10px'}}
    />

<p>decimals</p>
    <input
    type='number'
    value={token.decimals}
    onChange={(e) => handleFormfieldchange("decimals",e)}
    style={{color: 'black', marginBottom: '10px'}}
    />
{
    token.image ? <img src={token.image}
    width={100}
    height={100}
 alt='tokenImg' /> : <>
 <p>
 upload Image
 </p>


      <form >
      <input
        type="file"
        name="file"
        onChange={(e) => handleImageChange(e)}
      />
     
    </form>
 </>}
    <button 
    // disabled={isloading}
    className=' w-[90px] h-[40px] shadow-sm shadow-gray-400 rounded-[10px] bg-green-600' 
    onClick={()=>createToken(token)}>
{isloading ? "Creating ..." : "Create"}
    </button>
      </div >
      <div className="text-center ">
    
    {/* <p className="text-center "> 
      {burnTrx && 
      <div className=' flex flex-col h-[150px] justify-around items-center'> 
      <p className=' mb-[20px]'>View on explorer</p>
      <a href={burnTrx}><button className=' w-[90px] h-[40px] shadow-sm shadow-gray-400 rounded-[10px] bg-teal-500'>click</button>
      </a>
        <span>{`${burnTrx}`}</span>
      
        </div>}
       
      </p>  */}
      </div>
    
   </div>
    </div>
  );
};
