import { useEffect, useState } from "react";
import { abi as abi_distribution_verifier } from "../../../backend/ignition/deployments/chain-11155111/artifacts/DistributionVerifierModule#DistributionVerifier.json";
import deployed_addresses from "../../../backend/ignition/deployments/chain-11155111/deployed_addresses.json";
import { Address, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import LoadingIndicator from "./LoadingIndicator";

export default function Verifications({ queueNumber, eventName }: { queueNumber: number, eventName: string }) {
    console.debug("Verifications");

    console.debug("queueNumber:", queueNumber)
    console.debug("eventName:", eventName)

    const deploymentAddress: Address = deployed_addresses["DistributionVerifierModule#DistributionVerifier"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://ethereum-sepolia-rpc.publicnode.com") // Max 50k blocks per request
    })

    const [events, setEvents] = useState(Array(0))
    useEffect(() => {
        async function fetchContractEvents() {
            let allLogs: any[] = [];

            const startBlock = BigInt(9_907_896); // https://sepolia.etherscan.io/tx/0xb087a52b94f22eb49b7b288e7a8371241e0e5d7dcb11638b2f2ec7b829f6ab57
            const chunkSize = BigInt(50_000); // 50k blocks at a time
            const currentBlock = await publicClient.getBlockNumber();
            for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += chunkSize) {
                const toBlock = ((fromBlock + chunkSize) >= currentBlock) 
                    ? currentBlock 
                    : (fromBlock + chunkSize - BigInt(1));
                console.debug(`Fetching logs from block ${fromBlock} to ${toBlock}`);
                const logs = await publicClient.getContractEvents({
                    abi: abi_distribution_verifier,
                    address: deploymentAddress,
                    fromBlock,
                    toBlock,
                    eventName: eventName,
                    args: {
                        queueNumber: queueNumber
                    }
                });
                
                allLogs = [...allLogs, ...logs];
                console.debug(`Found ${logs.length} events in this chunk. Total: ${allLogs.length}`);
            }
            
            console.debug("All logs fetched:", allLogs);
            setEvents(allLogs);
        }
        fetchContractEvents()
    }, [queueNumber])
    console.debug("events.length:", events.length)
    console.debug("events:", events)

    if (events.length == 0) {
        return <LoadingIndicator />
    }

    return (
        <table className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-800 border-spacing-2 border-separate rounded-lg">
            <thead>
                <tr>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">Block Number</th>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">DAO Operator</th>
                    <th className="bg-zinc-700 text-zinc-300 p-4 rounded-md">Verification</th>
                </tr>
            </thead>
            <tbody>
                {events.map((el, i) =>
                    <tr key={i}>
                        <td className="bg-zinc-800 text-zinc-400 p-2 rounded-md">#{Number(el.blockNumber)}</td>
                        <td className="bg-zinc-800 text-zinc-400 p-2 rounded-md"><code>{el.args.operator.substring(0, 6)}...{el.args.operator.substring(38, 42)}</code></td>
                        {eventName == "DistributionApproved" ?
                            <td className="p-2 rounded-md bg-teal-700 text-teal-300"><code>{el.eventName}</code></td>
                            :
                            <td className="p-2 rounded-md bg-orange-700 text-orange-300"><code>{el.eventName}</code></td>
                        }
                    </tr>
                )}
            </tbody>
        </table>
    )
}


