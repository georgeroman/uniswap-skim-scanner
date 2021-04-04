import { ethers } from "ethers";

import MulticallAbi from "../abis/Multicall.json";

interface ICall {
  target: string;
  method: string;
  args: any[];
}

export default class Multicall {
  private multicall: ethers.Contract;

  public constructor(
    provider: ethers.providers.Provider,
    multicallAddress: string
  ) {
    this.multicall = new ethers.Contract(
      multicallAddress,
      MulticallAbi,
      provider
    );
  }

  public async aggregate(
    callsInterface: ethers.utils.Interface,
    calls: ICall[]
  ) {
    const rawResults = await this.multicall.callStatic.aggregate(
      calls.map(({ target, method, args }) => {
        return [target, callsInterface.encodeFunctionData(method, args)];
      })
    );

    return (rawResults[1] as string[]).map((rawReturnValue, i) =>
      callsInterface.decodeFunctionResult(calls[i].method, rawReturnValue)
    );
  }
}
