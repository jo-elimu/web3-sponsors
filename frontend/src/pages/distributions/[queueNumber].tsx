import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import DistributionSummary from "@/components/DistributionSummary";
import Head from "next/head";
import { useRouter } from "next/router";
import Verifications from "@/components/Verifications";
import deployed_addresses from "../../../../backend/ignition/deployments/sepolia_v0-9-8/deployed_addresses.json";
import { Address } from "viem";
import Link from "next/link";
import PairedSponsorship from "@/components/PairedSponsorship";

export default function DistributionDetails() {
  console.debug("DistributionDetails");

  const router = useRouter();
  const queueNumber = Number(router.query.queueNumber);
  console.debug("queueNumber:", queueNumber);

  const deploymentAddress: Address = deployed_addresses["DistributionVerifierModule#DistributionVerifier"] as `0x${string}`;
  console.debug("deploymentAddress:", deploymentAddress);

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
          Distribution Details
        </h1>

        <div className="mt-8 p-4 text-2xl bg-zinc-50 dark:bg-zinc-900 rounded-lg">
          <DistributionSummary queueNumber={queueNumber} />
        </div>

        <div className="mt-8">
          <Link className="text-purple-600" href={`https://sepolia.etherscan.io/address/${deploymentAddress}#writeContract#F3`} target="_blank">
            Add verification ↗
          </Link>
        </div>

        <div className="mt-8 border-purple-100 dark:border-purple-950 border-t-2 pt-8">
          <h2 className="text-2xl text-center">
            Verification Approvals 👍🏽
          </h2>
          <div className="mt-4 text-center">
            <Verifications queueNumber={queueNumber} eventName="DistributionApproved" />
          </div>

          <h2 className="mt-8 text-2xl text-center">
            Verification Rejections 👎🏽
          </h2>
          <div className="mt-4 text-center">
            <Verifications queueNumber={queueNumber} eventName="DistributionRejected"  />
          </div>
        </div>

        <div className="mt-8 border-purple-100 dark:border-purple-950 border-t-2 pt-8">
          <h2 className="text-2xl text-center">
            Paired Sponsorship 🔗
          </h2>
          <div className="mt-4 text-center">
            <PairedSponsorship distributionQueueNumber={queueNumber} />
          </div>
        </div>
      </main>
      <MainFooter />
    </>
  );
}
