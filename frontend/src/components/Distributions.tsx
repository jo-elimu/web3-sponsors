import { useReadContract } from "wagmi";
import { abi } from "../../../backend/ignition/deployments/mainnet_v0-9-9/artifacts/DistributionQueueModule#DistributionQueue.json";
import deployed_addresses from "../../../backend/ignition/deployments/mainnet_v0-9-9/deployed_addresses.json";
import LoadingIndicator from "./LoadingIndicator";
import { Address, formatEther } from "viem";
import DistributionSummary from "./DistributionSummary";
import Link from "next/link";
import ErrorIndicator from "./ErrorIndicator";

export default function Distributions() {
    console.debug("Distributions");

    const deploymentAddress: Address = deployed_addresses["DistributionQueueModule#DistributionQueue"] as `0x${string}`;
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

    const deploymentAddress: Address = deployed_addresses["DistributionQueueModule#DistributionQueue"] as `0x${string}`;
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
                <Link key={i} href={`/distributions/${queueNumbers[i]}`}>
                    <div className="skew-y-3 p-4 text-2xl bg-indigo-200 dark:bg-indigo-950 rounded-lg border-indigo-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
                        <DistributionSummary queueNumber={queueNumbers[i]} />
                    </div>
                </Link>
            )}
        </>
    )
}
