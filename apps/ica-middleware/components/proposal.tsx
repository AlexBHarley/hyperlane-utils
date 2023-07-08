import { chainIdToMetadata } from "@hyperlane-xyz/sdk";
import { ProposalTypes } from "@walletconnect/types";
import { ChainId } from "caip";
import { FC } from "react";

import { useWalletConnect } from "../hooks/use-walletconnect";

export const SessionProposal: FC<{
  proposal: ProposalTypes.Struct;
}> = ({ proposal }) => {
  const { approveProposal, rejectProposal } = useWalletConnect();

  return (
    <div className="flex flex-col border rounded p-4 space-y-4">
      <div className="flex space-x-3">
        <img
          src={proposal.proposer.metadata.icons[0]}
          className="h-16 w-16 rounded"
        />
        <div>
          <div className="font-medium underline">
            <a href={proposal.proposer.metadata.url} target="_blank">
              {proposal.proposer.metadata.name}
            </a>
          </div>
          <div className="text-gray-700 text-sm">
            {proposal.proposer.metadata.description}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Chains
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {(proposal.requiredNamespaces.eip155.chains ?? []).map((x) => (
                <div key={x} className="text-sm">
                  {
                    chainIdToMetadata[parseInt(ChainId.parse(x).reference)]
                      ?.displayName
                  }
                </div>
              ))}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Methods
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {proposal.requiredNamespaces.eip155.methods.map((x) => (
                <div key={x} className="text-sm">
                  {x}
                </div>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => approveProposal(proposal)}
          className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ml-auto"
        >
          Approve
        </button>
        <button
          type="button"
          className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={() => rejectProposal(proposal)}
        >
          Deny
        </button>
      </div>
    </div>
  );
};
