import { ethers } from "ethers";
import * as fs from "fs/promises";
import { task } from "hardhat/config";

import ERC20Abi from "../abis/ERC20.json";
import UniswapPairAbi from "../abis/UniswapPair.json";
import Multicall from "../utils/multicall";

task("scan-pairs", "Scan Uniswap pairs for skim opportunities").setAction(
  async (_args, hre) => {
    const network = hre.network.name;
    const config = hre.config.uniswapSkimScanner;

    if (network in config) {
      const multicallAddress = config[network].multicallAddress;
      const uniswapClones = config[network].uniswapClones;

      const multicall = new Multicall(hre.ethers.provider, multicallAddress);

      const erc20Interface = new ethers.utils.Interface(ERC20Abi);
      const uniswapPairInterface = new ethers.utils.Interface(UniswapPairAbi);

      for (const [name] of Object.entries(uniswapClones)) {
        console.log(`Scanning token pairs of ${name}`);

        const pairs = JSON.parse(
          (
            await fs.readFile(`./pairs/${name}.json`).catch(() => "[]")
          ).toString()
        );
        if (pairs.length === 0) {
          console.log("No local pairs found (tip: run 'fetch-pairs' first)");
        }

        for (const pairAddress of pairs) {
          const [
            token0Data,
            token1Data,
            getReservesData,
          ] = await multicall.aggregate(uniswapPairInterface, [
            {
              target: pairAddress,
              method: "token0",
              args: [],
            },
            {
              target: pairAddress,
              method: "token1",
              args: [],
            },
            {
              target: pairAddress,
              method: "getReserves",
              args: [],
            },
          ]);

          const token0: string = token0Data[0];
          const token1: string = token1Data[0];
          const reserve0: ethers.BigNumber = getReservesData[0];
          const reserve1: ethers.BigNumber = getReservesData[1];

          const [balanceOf0Data, balanceOf1Data] = await multicall.aggregate(
            erc20Interface,
            [
              {
                target: token0,
                method: "balanceOf",
                args: [pairAddress],
              },
              {
                target: token1,
                method: "balanceOf",
                args: [pairAddress],
              },
            ]
          );

          const balanceOf0: ethers.BigNumber = balanceOf0Data[0];
          const balanceOf1: ethers.BigNumber = balanceOf1Data[0];

          console.log(
            balanceOf0.sub(reserve0).toString(),
            balanceOf1.sub(reserve1).toString()
          );
        }
      }
    } else {
      console.log("Unsupported network");
    }
  }
);
