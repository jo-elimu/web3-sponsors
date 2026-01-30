import { Address, createPublicClient, http } from "viem";
import { abi as abi_queue_handler } from "../../../backend/ignition/deployments/chain-11155111/artifacts/QueueHandlerModule#QueueHandler.json"
import deployed_addresses from "../../../backend/ignition/deployments/chain-11155111/deployed_addresses.json"
import LoadingIndicator from "@/components/LoadingIndicator";
import { sepolia } from "viem/chains";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PairedDistribution({ sponsorshipQueueNumber }: { sponsorshipQueueNumber: number }) {
    console.debug("PairedDistribution")

    console.debug("sponsorshipQueueNumber:", sponsorshipQueueNumber)

    const deploymentAddress: Address = deployed_addresses["QueueHandlerModule#QueueHandler"] as `0x${string}`
    console.debug("deploymentAddress:", deploymentAddress)

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://ethereum-sepolia-rpc.publicnode.com") // Max 50k blocks per request
    })

    const [events, setEvents] = useState(Array(0))
    useEffect(() => {
        async function fetchContractEvents() {
            let allLogs: any[] = [];

            const startBlock = BigInt(9_907_904); // https://sepolia.etherscan.io/tx/0x4ccdae0794c5061a019b8674d2117b22b3e85b343ece4390b2fb22eb41d76bc3
            const chunkSize = BigInt(50_000); // 50k blocks at a time
            const currentBlock = await publicClient.getBlockNumber();
            for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
                const toBlock = ((fromBlock + chunkSize) >= currentBlock) 
                    ? currentBlock 
                    : (fromBlock + chunkSize - BigInt(1));
                console.debug(`Fetching logs from block ${fromBlock} to ${toBlock}`);
                const logs = await publicClient.getContractEvents({
                    abi: abi_queue_handler,
                    address: deploymentAddress,
                    fromBlock,
                    toBlock,
                    eventName: "QueuePairProcessed"
                });
                
                allLogs = [...allLogs, ...logs];
                console.debug(`Found ${logs.length} events in this chunk. Total: ${allLogs.length}`);
            }
            
            console.debug("All logs fetched:", allLogs);
            setEvents(allLogs);
        }
        fetchContractEvents()
    }, [])
    console.debug("events.length:", events.length)
    console.debug("events:", events)

    if (events.length == 0) {
        return <LoadingIndicator />
    }

    // Iterate processed queue pairs and look for matching queue number
    const matchingEvent = events.find(
        event => event.args.sponsorshipQueueNumber == sponsorshipQueueNumber
    )
    const distributionQueueNumber = matchingEvent?.args.distributionQueueNumber
    console.debug("distributionQueueNumber:", distributionQueueNumber)

    if (!distributionQueueNumber) {
        return (
            <span className="p-2 text-gray-300 border-gray-400 bg-gray-700 border-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 inline mb-1 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg> Pairing not yet <Link href="/process" className="text-purple-300" id="processLink">processed</Link>
            </span>
        )
    } else {
      return (
          <Link href={`/distributions/${distributionQueueNumber}`} className="text-indigo-600">
              <div className="skew-y-3 p-4 text-2xl bg-indigo-200 dark:bg-indigo-950 rounded-lg border-indigo-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
                  <div className="mb-4 text-center text-4xl">
                      🛵💨
                  </div>
                  Distribution #{distributionQueueNumber}
              </div>
          </Link>
      )
    }
}
