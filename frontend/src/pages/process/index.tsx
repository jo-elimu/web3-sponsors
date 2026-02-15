import LoadingIndicator from "@/components/LoadingIndicator";
import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import Head from "next/head";
import { useAccount, useReadContract, useSimulateContract, useWriteContract } from "wagmi";
import { abi as abi_sponsorship_queue } from "../../../../backend/ignition/deployments/sepolia_v0-9-8/artifacts/SponsorshipQueueModule#SponsorshipQueue.json";
import { abi as abi_distribution_queue } from "../../../../backend/ignition/deployments/sepolia_v0-9-8/artifacts/DistributionQueueModule#DistributionQueue.json";
import deployed_addresses from "../../../../backend/ignition/deployments/sepolia_v0-9-8/deployed_addresses.json";
import { Address } from "viem";
import ErrorIndicator from "@/components/ErrorIndicator";
import NextQueuePair from "@/components/NextQueuePair";
import ProcessedQueuePairs from "@/components/ProcessedQueuePairs";

export default function Process() {
  console.debug("Process");

  const { address, isConnecting, isReconnecting } = useAccount();
  console.debug("address:", address);
  console.debug("isConnecting:", isConnecting);
  console.debug("isReconnecting:", isReconnecting);

  if (isConnecting || isReconnecting) {
    return <LoadingIndicator />
  }

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
        <h1 className="relative flex place-items-center text-4xl">
          Process Next Queue Pair <span>🔗</span>
        </h1>

        <div className="mt-8 text-center">
          Pair the next sponsorship with the<br />
          next distribution (if approved).
        </div>

        <div className="mt-8">
          <LoadSponsorshipQueueLength />
        </div>

        <div className="mt-8 border-purple-100 dark:border-purple-950 border-t-2 pt-8">
          <h2 className="text-2xl text-center">
            Previously Processed Queue Pairs 👇🏽
          </h2>

          <div className="mt-8">
            <ProcessedQueuePairs />
          </div>
        </div>
      </main>
      <MainFooter />
    </>
  );
}

export function LoadSponsorshipQueueLength() {
  console.debug("LoadSponsorshipQueueLength");

  const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi: abi_sponsorship_queue,
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
        return (
          <div className="mt-4 p-8 bg-orange-800 border-orange-400 border-4 rounded-lg">
              <p>Error: <code>The sponsorship queue is empty</code></p>
          </div>
        )
    }

    return <LoadDistributionQueueLength />
}

export function LoadDistributionQueueLength() {
  console.debug("LoadDistributionQueueLength");

  const deploymentAddress: Address = deployed_addresses["DistributionQueueModule#DistributionQueue"] as `0x${string}`;
    console.debug("deploymentAddress:", deploymentAddress);
    const { isLoading, isError, error, data } = useReadContract({
        abi: abi_distribution_queue,
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
        return (
          <div className="mt-4 p-8 bg-orange-800 border-orange-400 border-4 rounded-lg">
              <p>Error: <code>The distribution queue is empty</code></p>
          </div>
        )
    }

    return <NextQueuePair />
}
