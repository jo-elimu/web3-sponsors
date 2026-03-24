import deployed_addresses from "../../../backend/ignition/deployments/mainnet_v0-9-9/deployed_addresses.json";
import { abi } from "../../../backend/ignition/deployments/mainnet_v0-9-9/artifacts/DistributionVerifierModule#DistributionVerifier.json";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import LoadingIndicator from "./LoadingIndicator";
import ErrorIndicator from "./ErrorIndicator";
import Link from "next/link";

export default function VerificationStatus({ queueNumber } : { queueNumber: number }) {
    console.debug("VerificationStatus")

    console.debug("queueNumber:", queueNumber)

    return <LoadIsDistributionApproved queueNumber={queueNumber} />
}

export function LoadIsDistributionApproved({ queueNumber } : { queueNumber: number }) {
    console.debug("LoadIsDistributionApproved")

    console.debug("queueNumber:", queueNumber)

    const deploymentAddress: Address = deployed_addresses["DistributionVerifierModule#DistributionVerifier"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi: abi,
        address: deploymentAddress,
        functionName: "isDistributionApproved",
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

    const isDistributionApproved = Boolean(data)
    console.debug('isDistributionApproved:', isDistributionApproved)

    if (isDistributionApproved) {
        return (
            <>
                <span className="p-2 text-sm text-teal-400 border-teal-600 bg-teal-800 border-2 rounded-xl">
                    Verification: <code className="ml-2 font-bold bg-teal-900 px-2 py-1 rounded-lg">APPROVED🟢</code>
                </span>
            </>
        )
    } else {
        return <LoadIsDistributionRejected queueNumber={queueNumber} />
    }
}

export function LoadIsDistributionRejected({ queueNumber } : { queueNumber: number }) {
    console.debug("LoadIsDistributionRejected")

    console.debug("queueNumber:", queueNumber)

    const deploymentAddress: Address = deployed_addresses["DistributionVerifierModule#DistributionVerifier"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi: abi,
        address: deploymentAddress,
        functionName: "isDistributionRejected",
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

    const isDistributionRejected = Boolean(data)
    console.debug('isDistributionRejected:', isDistributionRejected)

    const deploymentAddressQueueHandler: Address = deployed_addresses["QueueHandlerModule#QueueHandler"] as `0x${string}`;
    console.debug("deploymentAddressQueueHandler:", deploymentAddressQueueHandler);

    if (isDistributionRejected) {
        return (
            <>
                <span className="p-2 text-sm text-orange-400 border-orange-600 bg-orange-800 border-2 rounded-xl">
                    Verification: <code className="ml-2 font-bold bg-orange-900 px-2 py-1 rounded-lg">REJECTED🟠</code>
                </span>
                <div className="pt-2 text-sm">
                    <Link className="text-orange-700" href={`https://etherscan.io/address/${deploymentAddressQueueHandler}#writeContract#F2`} target="_blank">
                        Remove from queue ↗
                    </Link>
                </div>
            </>
        )
    } else {
        return (
            <>
                <span className="p-2 text-sm text-gray-300 border-gray-400 bg-gray-600 border-2 rounded-xl">
                    Verification: <code className="ml-2 font-bold bg-gray-500 px-2 py-1 rounded-lg">PENDING⚪</code>
                </span>
            </>
        )
    }
}
