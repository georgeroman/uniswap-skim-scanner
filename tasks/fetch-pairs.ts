import * as fs from "fs/promises";
import { task } from "hardhat/config";

import UniswapFactoryAbi from "../abis/UniswapFactory.json";
import { executeMulticall } from "../utils";

task("fetch-pairs", "Fetch token pairs from Uniswap factories").setAction(
  async (_args, hre) => {
    const network = hre.network.name;
    const config = hre.config.uniswapSkimScanner;

    if (network in config) {
      const multicallAddress = config[network].multicallAddress;
      const uniswapClones = config[network].uniswapClones;

      for (const [name, factoryAddress] of Object.entries(uniswapClones)) {
        console.log(`Retrieving token pairs of ${name}`);

        let numPairs = await executeMulticall(hre.ethers.provider, {
          multicallAddress,
          contract: factoryAddress,
          abi: UniswapFactoryAbi,
          calls: [
            {
              reference: "allPairsLength",
              methodName: "allPairsLength",
              methodParameters: [],
            },
          ],
        }).then((results) => Number(results[0].value.hex));

        console.log(`Detected ${numPairs} token pairs`);

        let allPairs: string[] = [];

        // On-chain read might timeout if we try to read too much data
        // so we need to cap the number of pairs we read at once
        const MAX_PAIRS_READ = 5000;
        while (numPairs > 0) {
          const pairs: string[] = await executeMulticall(hre.ethers.provider, {
            multicallAddress,
            contract: factoryAddress,
            abi: UniswapFactoryAbi,
            calls: [...Array(Math.min(numPairs, MAX_PAIRS_READ)).keys()].map(
              (index) => ({
                reference: `allPairs[${index}]`,
                methodName: "allPairs",
                methodParameters: [index],
              })
            ),
          }).then((results) => results.map((result) => result.value));

          allPairs = [...allPairs, ...pairs];
          numPairs -= MAX_PAIRS_READ;
        }

        await fs.writeFile(
          `./pairs/${name}.json`,
          JSON.stringify(allPairs, null, 2)
        );

        console.log(`Token pairs saved to './pairs/${name}.json'`);
      }
    } else {
      console.log("Unsupported network");
    }
  }
);
