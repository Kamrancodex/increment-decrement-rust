import { expect, test } from "bun:test";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { COUNTER_SIZE, schema } from "./types";
import * as borsh from "borsh";

const adminAccount = Keypair.generate();
const dataAccount = Keypair.generate();

const PROGRAM_ID = new PublicKey(
  "GnmNRqFoofYfnSMkF7YWpBnxMAdbiH67AnLBeLcXnkXt"
);

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

test("Account is Initialized", async () => {
  // Airdrop
  const sig = await connection.requestAirdrop(
    adminAccount.publicKey,
    1_000_000_000
  );

  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: sig,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  });

  // Rent exemption
  const lamports = await connection.getMinimumBalanceForRentExemption(
    COUNTER_SIZE
  );

  const ix = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    newAccountPubkey: dataAccount.publicKey,
    lamports,
    space: COUNTER_SIZE,
    programId: PROGRAM_ID,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = adminAccount.publicKey;
  tx.recentBlockhash = latest.blockhash;

  const signature = await connection.sendTransaction(tx, [
    adminAccount,
    dataAccount,
  ]);

  await connection.confirmTransaction({
    signature,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  });

  console.log("Account created:", dataAccount.publicKey.toBase58());

  const dataAccountInfo = await connection.getAccountInfo(
    dataAccount.publicKey
  );
  const counter = borsh.deserialize(schema, dataAccountInfo?.data);
  console.log(counter.count);
  expect(counter.count).toBe(0);
});
