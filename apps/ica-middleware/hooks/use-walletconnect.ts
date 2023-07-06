import {
  chainIdToMetadata,
  hyperlaneContractAddresses,
} from "@hyperlane-xyz/sdk";
import { utils } from "@hyperlane-xyz/utils";
import { formatJsonRpcError, formatJsonRpcResult } from "@json-rpc-tools/utils";
import {
  PendingRequestTypes,
  ProposalTypes,
  SessionTypes,
} from "@walletconnect/types";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { ChainId } from "caip";
import {
  createPublicClient,
  decodeEventLog,
  encodeFunctionData,
  http,
  isAddressEqual,
} from "viem";
import {
  useAccount,
  useChainId,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import { gasPaymasterAbi, interchainAccountRouterAbi } from "../abis";
import { EIP155_SIGNING_METHODS } from "../constants";
import { useWalletConnectStore } from "../state/walletconnect";
import { useIcaAddresses } from "./use-ica-addresses";
import { web3wallet } from "./use-initialise-walletconnect";

export function useWalletConnect() {
  const { chains: wagmiChains } = useNetwork();
  const icas = useIcaAddresses();
  const chainId = useChainId();
  const { address } = useAccount();
  const wallet = useWalletClient();
  const client = usePublicClient({ chainId });

  const {
    removeProposal,
    addSession,
    removeSession,
    removeRequest,
    setRequestStatus,
  } = useWalletConnectStore();

  const approveProposal = async (proposal: ProposalTypes.Struct) => {
    if (!web3wallet) {
      return;
    }

    const namespaces = buildApprovedNamespaces({
      proposal,
      supportedNamespaces: {
        eip155: {
          chains: wagmiChains.map((x) => `eip155:${x.id}`),
          methods: Object.values(EIP155_SIGNING_METHODS),
          events: ["accountsChanged", "chainChanged"],
          accounts: [
            `eip155:${chainId}:${address}`,
            ...icas.map(
              (ica) => `eip155:${ica.chainMetadata.chainId}:${ica.address}`
            ),
          ],
        },
      },
    });

    const session = await web3wallet.approveSession({
      id: proposal.id,
      namespaces,
    });

    addSession(session);
    removeProposal(proposal);
  };

  const rejectProposal = async (proposal: ProposalTypes.Struct) => {
    if (!web3wallet) {
      return;
    }

    await web3wallet.rejectSession({
      id: proposal.id,
      reason: getSdkError("USER_REJECTED"),
    });
    removeProposal(proposal);
  };

  const disconnectSession = async (session: SessionTypes.Struct) => {
    if (!web3wallet) {
      return;
    }

    await web3wallet.disconnectSession({
      topic: session.topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
    removeSession(session);
  };

  const approveRequest = async (request: PendingRequestTypes.Struct) => {
    if (!wallet.data || !web3wallet) {
      return;
    }

    if (
      request.params.request.method !==
      EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION
    ) {
      return rejectRequest(request);
    }

    try {
      setRequestStatus(request.id, "approving");

      const destinationChainId = parseInt(
        ChainId.parse(request.params.chainId).reference
      );

      const { id, topic } = request;

      const tx = request.params.request.params[0];

      if (isAddressEqual(wallet.data.account.address, tx.from)) {
        const signature = await wallet.data.sendTransaction(tx);
        await web3wallet.respondSessionRequest({
          topic,
          response: formatJsonRpcResult(id, signature),
        });
      } else {
        const destinationClient = createPublicClient({
          transport: http(),
          chain: wagmiChains.find((x) => x.id === destinationChainId),
        });

        const ica = icas.find(
          (x) => x.chainMetadata.chainId === destinationChainId
        );
        if (!ica) {
          throw new Error("Missing ICA for this chain");
        }

        let [gasEstimate, icaBytecode] = await Promise.all([
          destinationClient.estimateGas({
            account: tx.from,
            ...tx,
          }),
          destinationClient.getBytecode({ address: ica.address }),
        ]);

        // https://docs.hyperlane.xyz/docs/apis-and-sdks/accounts#overhead-gas-amounts
        if (icaBytecode) {
          gasEstimate = gasEstimate + BigInt(30_000);
        } else {
          gasEstimate = gasEstimate + BigInt(150_000);
        }

        // safety value, usually not needed
        gasEstimate = gasEstimate + BigInt(10_000);

        const calls = [
          {
            to: utils.addressToBytes32(tx.to),
            data: tx.data,
            value: "0x0",
          },
        ];

        let wrappedTx = {
          ...tx,
          value: "0x0",
          from: address,
          nonce: undefined,
          to: hyperlaneContractAddresses[chainIdToMetadata[chainId].name]
            .interchainAccountRouter,
          data: encodeFunctionData({
            abi: interchainAccountRouterAbi,
            functionName: "callRemote",
            args: [destinationChainId, calls],
          }),
        };

        const originTransactionHash = await wallet.data.sendTransaction(
          wrappedTx
        );

        // automatically handles replaced transactions 🕺, important
        // to use receipt.transactionHash and not originTransactionHash
        // as they could be different
        const receipt = await client.waitForTransactionReceipt({
          hash: originTransactionHash,
        });

        if (receipt.status === "success") {
          const {
            // @ts-expect-error
            args: { messageId },
          } = decodeEventLog({
            abi: interchainAccountRouterAbi,
            data: receipt.logs[2].data,
            topics: receipt.logs[2].topics,
          });

          const gas = await client.readContract({
            address:
              hyperlaneContractAddresses[chainIdToMetadata[chainId].name]
                .defaultIsmInterchainGasPaymaster,
            abi: gasPaymasterAbi,
            functionName: "quoteGasPayment",
            args: [destinationChainId, gasEstimate],
          });

          console.log({ messageId });

          await wallet.data.writeContract({
            address:
              hyperlaneContractAddresses[chainIdToMetadata[chainId].name]
                .defaultIsmInterchainGasPaymaster,
            abi: gasPaymasterAbi,
            functionName: "payForGas",
            args: [messageId, destinationChainId, gasEstimate, address],
            // @ts-expect-error
            value: gas,
          });

          await web3wallet.respondSessionRequest({
            topic,
            response: formatJsonRpcResult(id, receipt.transactionHash),
          });
        } else {
          throw new Error(receipt.status);
        }

        removeRequest(request);
      }
    } catch (e) {
      console.error(e);
      rejectRequest(request);
    }
  };

  const rejectRequest = async (request: PendingRequestTypes.Struct) => {
    if (!web3wallet) {
      return;
    }

    const { id, topic } = request;
    setRequestStatus(id, "rejecting");
    await web3wallet.respondSessionRequest({
      topic,
      response: formatJsonRpcError(id, getSdkError("USER_REJECTED").message),
    });
    removeRequest(request);
  };

  const pair = (uri: string) => {
    if (!web3wallet) {
      return;
    }
    return web3wallet.core.pairing.pair({ uri });
  };

  return {
    pair,
    approveProposal,
    rejectProposal,
    disconnectSession,
    rejectRequest,
    approveRequest,
  };
}
