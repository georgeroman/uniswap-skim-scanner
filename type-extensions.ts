import "hardhat/types/config";

declare module "hardhat/types/config" {
  interface UniswapSkimScannerConfig {
    uniswapSkimScanner: {
      [key: string]: {
        multicallAddress: string;
        uniswapClones: { [key: string]: string };
      };
    };
  }

  export interface HardhatUserConfig extends UniswapSkimScannerConfig {}
  export interface HardhatConfig extends UniswapSkimScannerConfig {}
}
