import Distributions from "@/components/Distributions";
import EstimatedCost from "@/components/EstimatedCost";
import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import Sponsorships from "@/components/Sponsorships";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  console.debug("Home");
  return (
    <>
      <Head>
        <title>Sponsors 🫶🏽 | elimu.ai</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900&display=swap" rel="stylesheet" />
      </Head>
      <MainHeader />
      <main
        className={`flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64`}
        >
        <h1 className="relative flex place-items-center text-8xl">
          Sponsors 🫶🏽
        </h1>

        <div className="text-4xl mt-8">
          Sponsor the education of an out-of-school child
        </div>

        <Link href="/sponsorships/add" className="mt-8 shadow-lg shadow-purple-500/100">
          <button className="p-8 text-2xl bg-purple-200 dark:bg-purple-950 rounded-lg border-purple-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1"
              id="sponsorButton">
            Become a Sponsor <span className="animate-pulse">💜</span>
          </button>
        </Link>

        <Link href="/distributions/add" className="mt-8 shadow-lg shadow-indigo-500/100">
          <button className="p-8 text-2xl bg-indigo-200 dark:bg-indigo-950 rounded-lg border-indigo-400 border-r-4 border-b-4 hover:border-r-8 hover:border-b-8 hover:-translate-y-1"
              id="distributorButton">
            Become a Distributor <span>🛵💨</span>
          </button>
        </Link>

        <div id="steps" className="mt-16 p-8 flex flex-col space-y-8 border-4 border-purple-50 dark:border-purple-950 rounded-lg">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl">Step 1 - Sponsor sends <EstimatedCost /> ETH</h2>
            <Image src="/step1.avif" alt="Step 1" className="rounded-lg mt-4" width={160} height={0} />
          </div>

          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl">Step 2 - Distributor purchases device,<br />
            installs learning software, transports device</h2>
            <Image src="/step2.jpg" alt="Step 2" className="rounded-lg mt-4" width={240} height={0} />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl">Step 3 - Child receives learning device</h2>
            <Image src="/step3.jpg" alt="Step 3" className="rounded-lg mt-4" width={320} height={0} />
          </div>

          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl">Step 4 - Sponsor observes learning progress</h2>
            <Image src="/step4.png" alt="Step 4" className="rounded-lg mt-4" width={320} height={0} />
          </div>
        </div>

        <div className="flex space-x-8">
          <div className="w-1/2">
            <h2 className="mt-16 text-4xl text-center">
              Sponsorship Queue
            </h2>

            <div className="mt-8 grid space-y-4">
              <Sponsorships />
            </div>

            <div className="mt-6 border-purple-100 dark:border-purple-900 border-t-2 pt-6 text-center skew-y-3">
              <Link href="/sponsorships/add" className="text-purple-400 p-2 border border-purple-900 rounded-lg hover:border-r-4 hover:border-b-4 hover:-translate-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 inline mb-1 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg> Add sponsorship
              </Link>
            </div>
          </div>
          <div className="w-1/2">
            <h2 className="mt-16 text-4xl text-center">
              Distribution Queue
            </h2>

            <div className="mt-8 grid space-y-4">
              <Distributions />
            </div>

            <div className="mt-6 border-indigo-100 dark:border-indigo-900 border-t-2 pt-6 text-center skew-y-3">
              <Link href="/distributions/add" className="text-indigo-400 p-2 border border-indigo-900 rounded-lg hover:border-r-4 hover:border-b-4 hover:-translate-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 inline mb-1 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg> Add distribution
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-purple-100 dark:border-purple-950 border-t-2 pt-8">
          DAO operators can <Link href="/process" className="text-purple-600" id="processLink">process</Link> queue pairs.
        </div>
      </main>
      <MainFooter />
    </>
  );
}
