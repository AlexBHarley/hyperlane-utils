import {
  chainIdToMetadata,
  hyperlaneContractAddresses,
} from "@hyperlane-xyz/sdk";
import { addressToBytes32 } from "@hyperlane-xyz/utils/dist/src/utils";
import { isPresent } from "ts-is-present";
import { zeroAddress } from "viem";
import {
  Address,
  useAccount,
  useChainId,
  useContractReads,
  useNetwork,
} from "wagmi";

export function useIcaAddresses() {
  const account = useAccount();
  const localChainId = useChainId();
  // These are the chains configured via Wagmi
  const { chains: supportedChains } = useNetwork();

  const results = useContractReads({
    contracts: supportedChains.map(({ id: remoteChainId }) => {
      const localChainMetadata = chainIdToMetadata[localChainId];
      const remoteChainMetadata = chainIdToMetadata[remoteChainId];

      return {
        chainId: remoteChainMetadata.chainId,
        address:
          hyperlaneContractAddresses[remoteChainMetadata.name]
            .interchainAccountRouter,
        abi: [
          {
            name: "getLocalInterchainAccount",
            inputs: [
              { name: "_destination", type: "uint32" },
              { name: "_owner", type: "bytes32" },
              { name: "_router", type: "bytes32" },
              { name: "_ism", type: "address" },
            ],
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function" as "function",
          },
        ],
        functionName: "getLocalInterchainAccount",
        args: [
          localChainId,
          addressToBytes32(account.address),
          addressToBytes32(
            hyperlaneContractAddresses[localChainMetadata.name]
              .interchainAccountRouter
          ),
          zeroAddress,
        ],
      };
    }),
  });

  return (
    results.data
      ?.map((result, index) => {
        if (result.status === "success") {
          return {
            chainMetadata: chainIdToMetadata[supportedChains[index].id],
            address: result.result as unknown as Address,
          };
        }
        return null;
      })
      .filter(({ chainMetadata }) => chainMetadata.chainId !== localChainId)
      .filter(isPresent) ?? []
  );
}
