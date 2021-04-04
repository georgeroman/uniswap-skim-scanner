import { Multicall } from "ethereum-multicall";
import { ethers } from "ethers";

interface ICall {
  reference: string;
  methodName: string;
  methodParameters: any[];
}

interface IExecuteMulticallArgs {
  multicallAddress: string;
  contract: string;
  abi: any;
  calls: ICall[];
}

export const executeMulticall = async (
  provider: ethers.providers.JsonRpcProvider,
  args: IExecuteMulticallArgs
) => {
  const multicall = new Multicall({
    ethersProvider: provider,
    multicallCustomContractAddress: args.multicallAddress,
  });

  const calls = [
    {
      reference: "main",
      contractAddress: args.contract,
      abi: args.abi,
      calls: args.calls,
    },
  ];

  const { results } = await multicall.call(calls);
  return results.main.callsReturnContext.map(({ reference, returnValues }) => ({
    reference,
    // For our purposes, we only call functions that have a single return value
    value: returnValues[0],
  }));
};
