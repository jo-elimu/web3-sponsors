import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import Head from "next/head";
import { useRouter } from "next/router";
import { abi as abi_sponsorship_queue } from "../../../../backend/ignition/deployments/chain-11155111/artifacts/SponsorshipQueueModule#SponsorshipQueue.json";
import deployed_addresses from "../../../../backend/ignition/deployments/chain-11155111/deployed_addresses.json";
import { Address, createPublicClient, formatEther, http } from "viem";
import { sepolia } from "viem/chains";
import { useEffect, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import Link from "next/link";
import PairedDistribution from "@/components/PairedDistribution";

export default function Sponsor() {
  console.debug("Sponsor");

  const router = useRouter();
  if (!router.isReady) {
      return <LoadingIndicator />
  }

  const ethereumAddress: string = String(router.query.ethereumAddress);
  console.debug("ethereumAddress:", ethereumAddress);

  return (
    <>
      <Head>
          <title>Sponsors 🫶🏽</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900&display=swap" rel="stylesheet" />
      </Head>
      <MainHeader />
      <main
        className={`flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64`}
        >
        <h1 className="text-4xl">
          Sponsor <code>{ethereumAddress.substring(0, 6)}...{ethereumAddress.substring(38, 42)}</code>
        </h1>

        <div className="mt-8 border-purple-100 dark:border-purple-950 border-t-2 pt-8">
            <h2 className="text-2xl text-center">
                Sponsorships 👇🏽
            </h2>

            <div className="mt-8">
                <LoadSponsorshipAddedEvents ethereumAddress={ethereumAddress} />
            </div>
        </div>
      </main>
      <MainFooter />
    </>
  );
}

export function LoadSponsorshipAddedEvents({ ethereumAddress }: {ethereumAddress: string}) {
    console.log("LoadSponsorshipEvents")

    console.log("ethereumAddress:", ethereumAddress)


    const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`
    console.debug("deploymentAddress:", deploymentAddress)

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://ethereum-sepolia-rpc.publicnode.com") // Max 50k blocks per request
    })

    const [events, setEvents] = useState(Array(0))
    useEffect(() => {
        async function fetchContractEvents() {
            let allLogs: any[] = [];

            const startBlock = BigInt(9_907_880); // https://sepolia.etherscan.io/tx/0x12d1df9571a53d6b85911c1beae93f409c77a14d0f8e948a0021eb3f9da5e3d7
            const chunkSize = BigInt(50_000); // 50k blocks at a time
            const currentBlock = await publicClient.getBlockNumber();
            for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
                const toBlock = ((fromBlock + chunkSize) >= currentBlock) 
                    ? currentBlock 
                    : (fromBlock + chunkSize - BigInt(1));
                console.debug(`Fetching logs from block ${fromBlock} to ${toBlock}`);
                const logs = await publicClient.getContractEvents({
                    abi: abi_sponsorship_queue,
                    address: deploymentAddress,
                    fromBlock,
                    toBlock,
                    eventName: "SponsorshipAdded",
                    args: {
                        sponsor: ethereumAddress
                    }
                });
                
                allLogs = [...allLogs, ...logs];
                console.debug(`Found ${logs.length} events in this chunk. Total: ${allLogs.length}`);
            }
            
            console.debug("All logs fetched:", allLogs);
            setEvents(allLogs);
        }
        fetchContractEvents()
    }, [ethereumAddress])
    console.debug("events.length:", events.length)
    console.debug("events:", events)

    if (events.length == 0) {
        return <LoadingIndicator />
    }

    return (
        <table className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-800 border-spacing-2 border-separate rounded-lg">
            <thead>
                <tr>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">Timestamp</th>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">Queue Number</th>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">Estimated Cost</th>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">Paired Distribution</th>
                </tr>
            </thead>
            <tbody>
                {events.map((el, i) =>
                    <tr key={i}>
                        <td className="bg-zinc-800 text-zinc-400 p-2 rounded-md">
                            {new Date(el.blockTimestamp * 1_000).toISOString().substring(0,10)} {new Date(el.blockTimestamp * 1_000).toISOString().substring(11,16)}
                            <Link className="ml-2 text-purple-600" href={`https://sepolia.etherscan.io/tx/${el.transactionHash}`} target="_blank">
                                Tx ↗
                            </Link>
                        </td>
                        <td className="bg-zinc-800 text-zinc-400 p-2 rounded-md">
                            <Link href={`/sponsorships/${el.args.queueNumber}`} className="text-purple-600">
                                #{el.args.queueNumber}
                            </Link>
                        </td>
                        <td className="bg-zinc-800 text-zinc-400 p-2 rounded-md">??? ETH</td>
                        <td className="bg-zinc-800 text-zinc-400 p-2 rounded-md">
                            <PairedDistribution sponsorshipQueueNumber={el.args.queueNumber} />
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}
