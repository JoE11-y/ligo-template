import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { buf2hex } from "@taquito/utils";
import chalk from "chalk";
import { Spinner } from "cli-spinner";
import dotenv from "dotenv";
import code from "../compiled/main.json";
import metadata from "./metadata.json";

// Read environment variables from .env file
dotenv.config();

const pk = process.env.PK;
const rpcUrl = process.env.RPC_URL;

const missingEnvVarLog = (name: string) =>
  console.log(
    chalk.redBright`Missing ` +
    chalk.red.bold.underline(name) +
    chalk.redBright` env var. Please add it in ` +
    chalk.red.bold.underline(`deploy/.env`)
  );

const makeSpinnerOperation = async <T>(
  operation: Promise<T>,
  {
    loadingMessage,
    endMessage,
  }: {
    loadingMessage: string;
    endMessage: string;
  }
): Promise<T> => {
  const spinner = new Spinner(loadingMessage);
  spinner.start();
  const result = await operation;
  spinner.stop();
  console.log("");
  console.log(endMessage);

  return result;
};

if (![pk, rpcUrl].find((v) => !!v)) {
  console.log(
    chalk.redBright`Couldn't find env variables. Have you renamed ` +
    chalk.red.bold.underline`deploy/.env.dist` +
    chalk.redBright` to ` +
    chalk.red.bold.underline(`deploy/.env`)
  );

  process.exit(-1);
}

if (!pk) {
  missingEnvVarLog("PK");
  process.exit(-1);
}

if (!rpcUrl) {
  missingEnvVarLog("RPC_URL");
  process.exit(-1);
}

// enter all the storage data information
const storage = {
  current_stock: 0,
  max_price: 0
}

// Initialize RPC connection
const Tezos = new TezosToolkit(rpcUrl);

// Deploy to configured node with configured secret key
const deploy = async () => {
  try {
    const signer = await InMemorySigner.fromSecretKey(pk);

    Tezos.setProvider({ signer });

    // create a JavaScript object to be used as initial storage
    // https://tezostaquito.io/docs/originate/#a-initializing-storage-using-a-plain-old-javascript-object
    storage["metadata"] = MichelsonMap.fromLiteral({
      "": buf2hex(Buffer.from("tezos-storage:contents")),
      contents: buf2hex(Buffer.from(JSON.stringify(metadata))),
    });
    // ^ contract metadata (tzip-16)
    // https://tzip.tezosagora.org/proposal/tzip-16/

    const origination = await makeSpinnerOperation(
      Tezos.contract.originate({ code, storage }),
      {
        loadingMessage: chalk.yellowBright`Deploying contract`,
        endMessage: chalk.green`Contract deployed!`,
      }
    );

    await makeSpinnerOperation(origination.contract(), {
      loadingMessage:
        chalk.yellowBright`Waiting for contract to be confirmed at: ` +
        chalk.yellow.bold(origination.contractAddress),
      endMessage: chalk.green`Contract confirmed!`,
    });

    console.log(
      chalk.green`\nContract address: \n- ` +
      chalk.green.underline`${origination.contractAddress}`
    );
  } catch (e) {
    console.log("");
    console.log(chalk.redBright`Error during deployment:`);
    console.log(e);

    process.exit(1);
  }
};

deploy();
