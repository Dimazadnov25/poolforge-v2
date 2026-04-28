import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

const POSITION_ADDRESS = "MkajHWsrmJrHpgxq6z64M26GDiGKazjSmpSaJnX5S1p";
const OWNER = "BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj";
const OPERATOR = "CEZLAd4XHjVNmJUfQujfVSd6g1NZX1QiuH6WCC7B4r61";
const DLMM_PROGRAM = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");

export default async function handler(req, res) {
  try {
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");
    const ownerPubkey = new PublicKey(OWNER);
    const operatorPubkey = new PublicKey(OPERATOR);
    const positionPubkey = new PublicKey(POSITION_ADDRESS);

    const [eventAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("__event_authority")], DLMM_PROGRAM
    );

    const discriminator = Buffer.from([202, 184, 103, 143, 180, 191, 116, 217]);
    const data = Buffer.concat([discriminator, operatorPubkey.toBuffer()]);

    const instruction = new TransactionInstruction({
      programId: DLMM_PROGRAM,
      keys: [
        { pubkey: positionPubkey, isSigner: false, isWritable: true },
        { pubkey: ownerPubkey, isSigner: true, isWritable: false },
        { pubkey: eventAuthority, isSigner: false, isWritable: false },
        { pubkey: DLMM_PROGRAM, isSigner: false, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction();
    tx.add(instruction);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = ownerPubkey;

    const serialized = tx.serialize({ requireAllSignatures: false });
    const base64 = Buffer.from(serialized).toString("base64");

    return res.status(200).json({ transaction: base64 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
