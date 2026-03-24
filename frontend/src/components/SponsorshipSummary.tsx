import { useReadContract } from "wagmi";
import { abi } from "../../../backend/ignition/deployments/mainnet_v0-9-9/artifacts/SponsorshipQueueModule#SponsorshipQueue.json";
import deployed_addresses from "../../../backend/ignition/deployments/mainnet_v0-9-9/deployed_addresses.json";
import LoadingIndicator from "./LoadingIndicator";
import { Address, formatEther } from "viem";
import ErrorIndicator from "./ErrorIndicator";
import Link from "next/link";

export default function SponsorshipSummary({ queueNumber }: any) {
    console.debug("SponsorshipSummary");

    console.debug("queueNumber:", queueNumber);

    const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi,
        address: deploymentAddress,
        functionName: "queue",
        args: [queueNumber]
    });
    console.debug("isLoading:", isLoading);
    console.debug("isError:", isError);
    console.debug("error:", error);
    console.debug("data:", data);

    if (isLoading) {
        return <LoadingIndicator />
    }

    if (isError) {
        return <ErrorIndicator description={error.name} />
    }
    
    const sponsorship: any = data;
    const estimatedCost = BigInt(sponsorship[0]);
    const timestamp = Number(sponsorship[1]);
    const sponsor = sponsorship[2];
    return (
        <>
            <div className="mb-4 text-center text-4xl">
                💜
            </div>
            Queue number: #{queueNumber}
            <div className="mt-2">
                {new Date(timestamp * 1_000).toISOString().substring(0,10)} {new Date(timestamp * 1_000).toISOString().substring(11,16)}
            </div>
            Amount: {formatEther(estimatedCost)} ETH
            <div className="mt-2">
                Sponsor: <Link href={`/sponsors/${sponsor}`}>
                    <code>{sponsor.substring(0, 6)}...{sponsor.substring(38, 42)}</code>
                </Link>
            </div>
        </>
    )
}
