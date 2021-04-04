import * as fs from "fs/promises";
import { task } from "hardhat/config";

import { executeMulticall } from "../utils";

task("scan-pairs", "Scan Uniswap pairs for skim opportunities").setAction(
  async (_args, hre) => {
    const network = hre.network.name;
    const config = hre.config.uniswapSkimScanner;

    if (network in config) {
      const multicallAddress = config[network].multicallAddress;
      const uniswapClones = config[network].uniswapClones;

      for (const [name, factoryAddress] of Object.entries(uniswapClones)) {
        console.log(`Scanning token pairs of ${name}`);

        const pairs = JSON.parse(
          (
            await fs.readFile(`./pairs/${name}.json`).catch(() => "[]")
          ).toString()
        );
        if (pairs.length > 0) {
          // TODO: Scan pairs
        } else {
          console.log("No local pairs found (tip: run 'fetch-pairs')");
        }
      }
    } else {
      console.log("Unsupported network");
    }
  }
);
