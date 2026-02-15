# Backend

Compiling:

```shell
npm install
npx hardhat clean
npx hardhat compile
```

Testing:

```shell
npx hardhat test
npx hardhat coverage
npx istanbul check-coverage --lines 80
```

Deploying:

Hardhat (`localhost`)
```shell
npx hardhat ignition deploy ./ignition/modules/SponsorshipQueue.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/DistributionQueue.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/DistributionVerifier.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/QueueHandler.ts --network hardhat

npx hardhat ignition deploy ./ignition/modules/CommunityFund.ts --network hardhat
npx hardhat ignition deploy ./ignition/modules/DistributionImporter.ts --network hardhat
```

Ethereum Sepolia
> [!IMPORTANT]
> _Before_ running the commands below, bump the version in these files:
> - [`./package.json`](./package.json)
> - [`./contracts/util/ProtocolVersion.sol`](./contracts/util/ProtocolVersion.sol)
```shell
npx hardhat ignition deploy ./ignition/modules/SponsorshipQueue.ts --network sepolia --deployment-id sepolia_v$(node -p "require('./package.json').version.replace(/\./g, '-')") --verify
npx hardhat ignition deploy ./ignition/modules/DistributionQueue.ts --network sepolia --deployment-id sepolia_v$(node -p "require('./package.json').version.replace(/\./g, '-')") --verify
npx hardhat ignition deploy ./ignition/modules/DistributionVerifier.ts --network sepolia --deployment-id sepolia_v$(node -p "require('./package.json').version.replace(/\./g, '-')") --verify
npx hardhat ignition deploy ./ignition/modules/QueueHandler.ts  --network sepolia --deployment-id sepolia_v$(node -p "require('./package.json').version.replace(/\./g, '-')") --verify

npx hardhat ignition deploy ./ignition/modules/CommunityFund.ts --network sepolia --deployment-id sepolia_v$(node -p "require('./package.json').version.replace(/\./g, '-')") --verify
npx hardhat ignition deploy ./ignition/modules/DistributionImporter.ts --network sepolia --deployment-id sepolia_v$(node -p "require('./package.json').version.replace(/\./g, '-')") --verify
```

Deployed addresses:
- [`./ignition/deployments/sepolia_v0-9-7/deployed_addresses.json`](./ignition/deployments/sepolia_v0-9-7/deployed_addresses.json)
- [`./ignition/deployments/sepolia_v0-9-8/deployed_addresses.json`](./ignition/deployments/sepolia_v0-9-8/deployed_addresses.json)

Ethereum Mainnet
> [!IMPORTANT]
> _Before_ running the commands below, bump the version in these files:
> - [`./package.json`](./package.json)
> - [`./contracts/util/ProtocolVersion.sol`](./contracts/util/ProtocolVersion.sol)
```shell
npx hardhat ignition deploy ./ignition/modules/SponsorshipQueue.ts --network mainnet --reset --verify
npx hardhat ignition deploy ./ignition/modules/DistributionQueue.ts --network mainnet --verify
npx hardhat ignition deploy ./ignition/modules/DistributionVerifier.ts --network mainnet --verify
npx hardhat ignition deploy ./ignition/modules/QueueHandler.ts --network mainnet --verify

npx hardhat ignition deploy ./ignition/modules/CommunityFund.ts --network mainnet --verify
npx hardhat ignition deploy ./ignition/modules/DistributionImporter.ts --network mainnet --verify
```

> [!NOTE]
> After deploying the `QueueHandler`, remember to update its address in the `SponsorshipQueue` and `DistributionQueue`.
