"use client";

import { chainIdToMetadata } from "@hyperlane-xyz/sdk";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";

import { AccountRow } from "../components/account-row";
import { Session } from "../components/session";
import { SessionProposal } from "../components/proposal";
import { useIcaAddresses } from "../hooks/use-ica-addresses";
import { useInitialiseWalletConnect } from "../hooks/use-initialise-walletconnect";
import { useWalletConnect } from "../hooks/use-walletconnect";
import { useWalletConnectStore } from "../state/walletconnect";
import { Request } from "../components/request";

export default function Page() {
  const { address } = useAccount();
  const icas = useIcaAddresses();
  const chainId = useChainId();

  useInitialiseWalletConnect();

  const { pair } = useWalletConnect();
  const { proposals, sessions, requests } = useWalletConnectStore();

  const [uri, setUri] = useState("");

  const onConnect = async () => {
    await pair(uri);
    setUri("");
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 my-10">
      {!address ? (
        <div className="flex items-center justify-center">
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <ConnectButton />
          </div>
          <div>
            <h3 className="text-3xl mb-2">Interchain Accounts</h3>
            <div className="rounded border border-gray-300">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                            >
                              Network
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Address
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Balance
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[
                            {
                              address,
                              chainMetadata: chainIdToMetadata[chainId],
                            },
                            ...icas,
                          ].map((ica, index) => (
                            <AccountRow
                              key={ica.chainMetadata.chainId}
                              highlight={index === 0}
                              {...ica}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <h3 className="text-3xl mb-2">WalletConnect</h3>

            <div className="p-4 rounded border border-gray-300 space-y-8">
              <div className="flex items-center justify-center">
                <div className="flex flex-col">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="block w-80  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="wc:..."
                      aria-describedby="email-description"
                      value={uri}
                      onChange={(e) => setUri(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={onConnect}
                    >
                      Connect
                    </button>
                  </div>
                  <p
                    className="mt-2 text-sm text-gray-500"
                    id="email-description"
                  >
                    Connect to your favourite (WC2 enabled) dapps!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 ">
                <div>
                  <div className="text-xl text-gray-700 font-medium mb-2">
                    Active Sessions
                  </div>
                  {sessions.map((s) => (
                    <Session key={s.topic} session={s} />
                  ))}
                </div>

                <div>
                  <div className="text-xl text-gray-700 font-medium mb-2">
                    Session Proposals
                  </div>
                  {proposals.map((x) => (
                    <SessionProposal key={x.id} proposal={x} />
                  ))}
                </div>

                <div>
                  <div className="text-xl text-gray-700 font-medium mb-2">
                    Action Requests
                  </div>
                  {requests.map((x) => (
                    <Request key={x.id} request={x} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
