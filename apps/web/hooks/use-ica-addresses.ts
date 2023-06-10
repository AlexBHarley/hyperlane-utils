import {
  chainIdToMetadata,
  hyperlaneContractAddresses,
} from "@hyperlane-xyz/sdk";
import { isPresent } from "ts-is-present";
import {
  Address,
  useAccount,
  useChainId,
  useContractReads,
  useNetwork,
} from "wagmi";

export function useIcaAddresses() {
  const account = useAccount();
  const chainId = useChainId();
  // These are the chains configured via Wagmi
  const { chains: supportedChains } = useNetwork();

  const results = useContractReads({
    contracts: supportedChains
      .map((chain) => chainIdToMetadata[chain.id])
      .map((chainMetadata) => {
        return {
          chainId,
          address:
            hyperlaneContractAddresses[chainIdToMetadata[chainId].name]
              .interchainAccountRouter,
          abi: [
            {
              name: "getRemoteInterchainAccount",
              inputs: [
                { name: "_destination", type: "uint32" },
                { name: "_owner", type: "address" },
              ],
              outputs: [{ name: "", type: "address" }],
              stateMutability: "view",
              type: "function" as "function",
            },
          ],
          functionName: "getRemoteInterchainAccount",
          args: [chainMetadata.chainId, account.address],
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
      .filter(isPresent) ?? []
  );
}
