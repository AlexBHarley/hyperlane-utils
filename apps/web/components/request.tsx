import { chainIdToMetadata } from "@hyperlane-xyz/sdk";
import { PendingRequestTypes } from "@walletconnect/types";
import { ChainId } from "caip";
import { FC } from "react";
import { Address, useAccount, useChainId } from "wagmi";

import { useIcaAddresses } from "../hooks/use-ica-addresses";
import { web3wallet } from "../hooks/use-initialise-walletconnect";
import { useWalletConnect } from "../hooks/use-walletconnect";

function formatAddress(address: Address) {
  return `${address.slice(0, 8)}...${address.slice(address.length - 8)}`;
}

export const Request: FC<{
  request: PendingRequestTypes.Struct;
}> = ({ request }) => {
  const { approveRequest, rejectRequest } = useWalletConnect();
  const icas = useIcaAddresses();
  const { address } = useAccount();
  const chainId = useChainId();

  const requestChainid = parseInt(
    ChainId.parse(request.params.chainId).reference
  );
  const chainMetadata = chainIdToMetadata[requestChainid];

  const session = web3wallet.engine.signClient.session.get(request.topic);

  return (
    <div className="flex flex-col border rounded p-4 space-y-4">
      <dl className="divide-y divide-gray-100">
        <div className="pt-2 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">
            Method
          </dt>
          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
            {request.params.request.method}
          </dd>
        </div>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">Chain</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
            <div className="flex items-center space-x-2">
              <span>{chainMetadata.displayName}</span>
              <img src="" alt="" className="h-4 w-4" />
            </div>
          </dd>
        </div>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">
            Account
          </dt>
          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
            {formatAddress(
              [
                { address, chainMetadata: chainIdToMetadata[chainId] },
                ...(icas ?? []),
              ].find((x) => x.chainMetadata.chainId === chainId)?.address ??
                "0x"
            )}
          </dd>
        </div>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-gray-900">App</dt>
          <div className="flex items-center col-span-2">
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {session.peer.metadata.name}
            </dd>
            <img
              src={session.peer.metadata.icons[0]}
              className="h-6 w-6 rounded ml-2"
            />
          </div>
        </div>
      </dl>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => approveRequest(request)}
          className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ml-auto"
        >
          Approve
        </button>
        <button
          type="button"
          className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={() => rejectRequest(request)}
        >
          Deny
        </button>
      </div>
    </div>
  );
};
