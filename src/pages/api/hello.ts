// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

type Data = {
  name: string
}
const getBal = async() =>{
  // const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  // const connection = new Connection("https://go.getblock.io/037b9d5178ff4ef29cb7f3dda754ceba");
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=78c69964-e500-4354-8f43-eec127b47bd7");
let wallet = new PublicKey("");
console.log(
  `${(await connection.getBalance(wallet)) / LAMPORTS_PER_SOL} SOL`
);
}
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
let bal = getBal()
console.log("API",bal )
  res.status(200).json({ name: 'John Doe' })
}
