import { useReadContract } from "wagmi";
import { abi } from "../../../backend/ignition/deployments/sepolia_v0-9-8/artifacts/SponsorshipQueueModule#SponsorshipQueue.json";
import deployed_addresses from "../../../backend/ignition/deployments/sepolia_v0-9-8/deployed_addresses.json";
import LoadingIndicator from "./LoadingIndicator";
import { Address, formatEther } from "viem";
import SponsorshipSummary from "./SponsorshipSummary";
import Link from "next/link";
import ErrorIndicator from "./ErrorIndicator";

export default function Sponsorships() {
    console.debug("Sponsorships");

    const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi,
        address: deploymentAddress,
        functionName: "getLength"
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

    const queueLength = Number(data);
    console.debug("queueLength:", queueLength);
    if (queueLength == 0) {
        return <div>The queue is empty</div>;
    }

    return <LoadQueueNumbers queueLength={queueLength} />
}

export function LoadQueueNumbers({ queueLength }: { queueLength: number }) {
    console.debug('LoadQueueNumbers')

    console.debug('queueLength:', queueLength)

    const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi,
        address: deploymentAddress,
        functionName: "queueNumberFront"
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

    const queueNumberFront = Number(data)
    console.debug('queueNumberFront:', queueNumberFront)

    const queueNumbers: number[] = []
    for (let i = 0; i < queueLength; i++) {
        queueNumbers[i] = i + queueNumberFront
    }
    console.debug('queueNumbers:', queueNumbers)

    return (
        <>
            {queueNumbers.map((el, i) =>
                <Link key={i} href={`/sponsorships/${queueNumbers[i]}`}>
                    <div className="skew-y-3 p-4 text-2xl bg-purple-200 dark:bg-purple-950 rounded-lg border-purple-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
                        <SponsorshipSummary queueNumber={queueNumbers[i]} />
                    </div>
                </Link>
            )}
        </>
    )
}
