import { expect, test } from "bun:test";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { COUNTER_SIZE } from "./types";

let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();

const PROGRAM_ID = new PublicKey(
  "GnmNRqFoofYfnSMkF7YWpBnxMAdbiH67AnLBeLcXnkXt"
);

const connection = new Connection("http://127.0.0.1:8899");
test("Account is Initialized", async () => {
  const txn = await connection.requestAirdrop(
    adminAccount.publicKey,
    1 * 1000000000
  );
  await connection.confirmTransaction(txn);
  const data = await connection.getAccountInfo(adminAccount.publicKey);

  const lamports = await connection.getMinimumBalanceForRentExemption(
    COUNTER_SIZE
  );

  const ix = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    lamports,
    space: COUNTER_SIZE,
    programId: PROGRAM_ID,
    newAccountPubkey: dataAccount.publicKey,
  });
  const createAccountTx = new Transaction();
  createAccountTx.add(ix);
  const signature = await connection.sendTransaction(createAccountTx, [
    adminAccount,
    dataAccount,
  ]);
  await connection.confirmTransaction(signature);
  console.log(dataAccount.publicKey);
});
