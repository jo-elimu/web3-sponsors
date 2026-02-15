import LoadingIndicator from "@/components/LoadingIndicator";
import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import Head from "next/head";
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { abi } from "../../../../backend/ignition/deployments/sepolia_v0-9-8/artifacts/DistributionQueueModule#DistributionQueue.json";
import deployed_addresses from "../../../../backend/ignition/deployments/sepolia_v0-9-8/deployed_addresses.json";
import { Address } from "viem";
import ErrorIndicator from "@/components/ErrorIndicator";
import { useState } from "react";
import Link from "next/link";

export default function AddDistribution() {
  console.debug("AddDistribution");

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
          Become a Distributor <span>🛵💨</span>
        </h1>

        <div className="mt-8 text-center">
          Help create real-world impact by delivering<br />
          education to out-of-school children.
        </div>

        <div className="mt-8 text-center">
          {!address ? (
            <button disabled={true} className="p-8 text-2xl text-zinc-400 bg-zinc-300 rounded-lg">
              <div className="text-6xl rotate-12 mb-4">☝🏽</div>
              Connect wallet first
            </button>
          ) : (
            <InputAndroidId />
          )}
        </div>
      </main>
      <MainFooter />
    </>
  );
}

export function InputAndroidId() {
  console.debug("InputAndroidId");

  const [languageCode, setLanguageCode] = useState("");
  const handleLanguageCodeChange = (event: any) => {
    console.debug('handleLanguageCodeChange');
    setLanguageCode(event.target.value);
  }
  console.debug('languageCode:', languageCode);

  const [androidId, setAndroidId] = useState("");
  const handleAndroidIdChange = (event: any) => {
    console.debug('handleAndroidIdChange');
    setAndroidId(event.target.value);
  }
  console.debug('androidId:', androidId);

  return (
    <>
      <select
          onChange={handleLanguageCodeChange}
          className="p-4 text-2xl text-indigo-200 bg-indigo-800 rounded-lg">
        <option value="">-- Select language --</option>
        <option value="ENG">ENG (eng.elimu.ai)</option>
        <option value="HIN">HIN (hin.elimu.ai)</option>
        <option value="TGL">TGL (tgl.elimu.ai)</option>
        <option value="THA">THA (tha.elimu.ai)</option>
        <option value="VIE">VIE (vie.elimu.ai)</option>
      </select><br />

      <input
        onChange={handleAndroidIdChange}
        type="text"
        placeholder="Android ID"
        className="mt-4 p-4 text-2xl text-indigo-200 bg-indigo-800 rounded-lg"
      /><br />
      
      {((languageCode.length != 3) || (androidId.length != 16)) ? (
        <button disabled={true} className="mt-4 p-8 text-2xl text-zinc-400 bg-zinc-300 rounded-lg">
          Add Distribution 📦
        </button>
      ) : (
        <SimulateContractButton languageCode={languageCode} androidId={androidId} />
      )}
    </>
  )
}

export function SimulateContractButton({ languageCode, androidId}: any) {
  console.debug("SimulateContractButton");

  const deploymentAddress: Address = deployed_addresses["DistributionQueueModule#DistributionQueue"] as `0x${string}`;
  console.debug("deploymentAddress:", deploymentAddress);

  const { isPending, isError, error, isSuccess } = useSimulateContract({
    abi,
    address: deploymentAddress,
    functionName: "addDistribution",
    args: [languageCode, androidId]
  })
  console.debug("isPending:", isPending);
  console.debug("isError:", isError);
  console.debug("error:", error);
  console.debug("isSuccess:", isSuccess);

  if (isPending) {
    return (
      <>
        <button disabled={true} className="mt-4 p-8 text-2xl bg-indigo-200 dark:bg-indigo-950 rounded-lg border-indigo-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1">
          <LoadingIndicator /> &nbsp; Simulating...
        </button>
      </>
    )
  }

  if (isError) {
    return <ErrorIndicator description={error.name} />
  }

  return <WriteContractButton languageCode={languageCode} androidId={androidId} />
}

export function WriteContractButton({ languageCode, androidId}: any) {
  console.debug("WriteContractButton");

  const deploymentAddress: Address = deployed_addresses["DistributionQueueModule#DistributionQueue"] as `0x${string}`;
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
          className="mt-4 p-8 text-2xl bg-indigo-200 dark:bg-indigo-950 rounded-lg border-indigo-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1 active:border-r-2 active:border-b-2"
          onClick={() =>
            writeContract({
              abi,
              address: deploymentAddress,
              functionName: "addDistribution",
              args: [languageCode, androidId]
            })
          }
        >
          Add Distribution 📦
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
          <Link href={`https://sepolia.etherscan.io/tx/${writeHash}`} target='_blank' className="text-purple-400">
            View on Etherscan ↗
          </Link>
        </div>
      </>
    )
  } else {
    return (
      <div className="mt-4 p-2 border-2 rounded-xl bg-gray-700 border-gray-400 text-gray-300 text-center">
        🎉 Your distribution has been added successfully! 🎉<br />
        <Link href={`https://sepolia.etherscan.io/tx/${writeHash}`} target='_blank' className="text-purple-400">
          View on Etherscan ↗
        </Link>
      </div>
    )
  }
}
