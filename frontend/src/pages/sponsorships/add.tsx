import LoadingIndicator from "@/components/LoadingIndicator";
import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import Head from "next/head";
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { abi } from "../../../../backend/ignition/deployments/mainnet_v0-9-9/artifacts/SponsorshipQueueModule#SponsorshipQueue.json";
import deployed_addresses from "../../../../backend/ignition/deployments/mainnet_v0-9-9/deployed_addresses.json";
import { Address, formatEther, parseEther } from "viem";
import ErrorIndicator from "@/components/ErrorIndicator";
import EstimatedCost from "@/components/EstimatedCost";
import Link from "next/link";

export default function AddSponsorship() {
  console.debug("AddSponsorship");

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
          Become a Sponsor <span className="animate-pulse">💜</span>
        </h1>

        <div className="mt-8 text-center">
          Your sponsorship will cover the estimated cost (<EstimatedCost /> ETH)<br />
          for delivering education to one out-of-school child.
        </div>

        <div className="mt-8">
          {!address ? (
            <button disabled={true} className="p-8 text-2xl text-zinc-400 bg-zinc-300 rounded-lg">
              <div className="text-6xl rotate-12 mb-4">☝🏽</div>
              Connect wallet first
            </button>
          ) : (
            <ReadEstimatedCost />
          )}
        </div>
      </main>
      <MainFooter />
    </>
  );
}

export function ReadEstimatedCost() {
  console.debug("ReadEstimatedCost")

  const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
  console.debug("deploymentAddress:", deploymentAddress);
  const { isLoading, isError, error, data } = useReadContract({
      abi,
      address: deploymentAddress,
      functionName: "estimatedCost"
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

  const estimatedCost: bigint = BigInt(String(data))
  console.debug("estimatedCost:", estimatedCost);

  return (
    <>
      <SimulateContractButton estimatedCost={estimatedCost} />
    </>
  )
}

export function SimulateContractButton({ estimatedCost }: { estimatedCost: bigint }) {
  console.debug("SimulateContractButton");

  console.debug("estimatedCost:", estimatedCost)

  const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
  console.debug("deploymentAddress:", deploymentAddress);

  const { isPending, isError, error, isSuccess } = useSimulateContract({
    abi,
    address: deploymentAddress,
    functionName: "addSponsorship",
    value: estimatedCost
  })
  console.debug("isPending:", isPending);
  console.debug("isError:", isError);
  console.debug("error:", error);
  console.debug("isSuccess:", isSuccess);

  if (isPending) {
    return <button disabled={true} className="mt-4 p-8 text-2xl bg-purple-200 dark:bg-purple-950 rounded-lg border-purple-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
      <LoadingIndicator /> &nbsp; Simulating...
    </button>
  }

  if (isError) {
    return <ErrorIndicator description={error.name} />
  }

  return <WriteContractButton estimatedCost={estimatedCost} />
}

export function WriteContractButton({ estimatedCost }: { estimatedCost: bigint }) {
  console.debug("WriteContractButton");

  console.debug("estimatedCost:", estimatedCost)

  const deploymentAddress: Address = deployed_addresses["SponsorshipQueueModule#SponsorshipQueue"] as `0x${string}`;
  console.debug("deploymentAddress:", deploymentAddress);

  const { data: writeHash, writeContract, isSuccess: writeIsSuccess, isPending: writeIsPending } = useWriteContract();
  console.debug("writeHash:", writeHash);
  console.debug("writeIsPending:", writeIsPending);
  console.debug("writeIsSuccess:", writeIsSuccess);

  const { isLoading: txIsLoading } = useWaitForTransactionReceipt({ hash: writeHash });
  console.debug("txIsLoading:", txIsLoading);

  if (!writeIsSuccess) {
    if (!writeIsPending) {
      return (
        <button 
          className="mt-4 p-8 text-2xl bg-purple-200 dark:bg-purple-950 rounded-lg border-purple-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1 active:border-r-2 active:border-b-2"
          onClick={() =>
            writeContract({
              abi,
              address: deploymentAddress,
              functionName: "addSponsorship",
              value: estimatedCost
            })
          }
        >
          Send {formatEther(estimatedCost)} ETH ⟠
        </button>
      )
    } else {
      return (
        <>
          <button disabled={true} className="mt-4 p-8 text-2xl bg-gray-200 dark:bg-gray-800 rounded-lg border-gray-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
            <LoadingIndicator /> &nbsp; Confirming...
          </button>
          <div className="mt-4 p-2 border-2 rounded-xl bg-gray-700 border-gray-400 text-gray-300 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 inline mb-1 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg> Check wallet
          </div>
        </>
      )
    }
  }

  if (txIsLoading) {
    return (
      <>
        <button disabled={true} className="mt-4 p-8 text-2xl bg-gray-200 dark:bg-gray-800 rounded-lg border-gray-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
          <LoadingIndicator /> &nbsp; Finalizing... ⏳
        </button>
        <div className="mt-4 p-2 border-2 rounded-xl bg-gray-700 border-gray-400 text-gray-300 text-center">
          <Link href={`https://etherscan.io/tx/${writeHash}`} target='_blank' className="text-purple-400">
            View on Etherscan ↗
          </Link>
        </div>
      </>
    )
  } else {
    return (
      <div className="mt-4 p-2 border-2 rounded-xl bg-gray-700 border-gray-400 text-gray-300 text-center">
        🎉 Your sponsorship has been added successfully! 🎉<br />
        <Link href={`https://etherscan.io/tx/${writeHash}`} target='_blank' className="text-purple-400">
          View on Etherscan ↗
        </Link>
      </div>
    )
  }
}
