<div align="center">
  <h2>🦄 <code>uniswap-skim-scanner</code> 🦄</h2>
</div>

<br/>

Inspired from [`uniswap-skim`](https://github.com/nicholashc/uniswap-skim), `uniswap-skim-scanner` scans UniswapV2 clones across different L2s (eg. Honeyswap on xDai, Quickswap on Polygon, Pancakeswap on BSC) for skim opportunities.

### Usage

```bash
# Install dependencies
npm install

# Fetch all pairs (only needed if the corresponding file is missing from './pairs')
npx hardhat --network xdai fetch-pairs

# Scan for skim opportunities
npx hardhat --network xdai scan-pairs
```

### Todo

- [ ] Improve speed by using multicall to fetch data from multiple pairs at the same time
- [ ] Add contract and scripts for executing any outstanding skim opportunities
- [ ] Support Avalanche by deploying the multicall contract
- [ ] Investigate flakiness and wrong results
