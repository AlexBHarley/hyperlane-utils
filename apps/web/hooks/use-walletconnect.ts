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
  encodeFunctionData,
  hexToBigInt,
  isAddressEqual,
  parseAbi,
} from "viem";
import { useAccount, useChainId, useNetwork, useWalletClient } from "wagmi";

import { useWalletConnectStore } from "../app/state/walletconnect";
import { EIP155_SIGNING_METHODS } from "../constants";
import { useIcaAddresses } from "./use-ica-addresses";
import { web3wallet } from "./use-initialise-walletconnect";

const callRemoteAbi = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_destination",
        type: "uint32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "to",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct CallLib.Call[]",
        name: "_calls",
        type: "tuple[]",
      },
    ],
    name: "callRemote",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export function useWalletConnect() {
  const { chains: wagmiChains } = useNetwork();
  const icas = useIcaAddresses();
  const chainId = useChainId();
  const { address } = useAccount();
  const wallet = useWalletClient();

  const {
    initialised,
    removeProposal,
    addSession,
    removeSession,
    removeRequest,
  } = useWalletConnectStore();

  const approveProposal = async (proposal: ProposalTypes.Struct) => {
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
    await web3wallet.rejectSession({
      id: proposal.id,
      reason: getSdkError("USER_REJECTED"),
    });
    removeProposal(proposal);
  };

  const disconnectSession = async (session: SessionTypes.Struct) => {
    await web3wallet.disconnectSession({
      topic: session.topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
    removeSession(session);
  };

  const approveRequest = async (request: PendingRequestTypes.Struct) => {
    if (
      request.params.request.method !==
      EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION
    ) {
      return rejectRequest(request);
    }

    const destinationChainId = parseInt(
      ChainId.parse(request.params.chainId).reference
    );

    const { id, topic } = request;

    const tx = request.params.request.params[0];

    if (isAddressEqual(address, tx.from)) {
      const signature = await wallet.data.sendTransaction(tx);
      await web3wallet.respondSessionRequest({
        topic,
        response: formatJsonRpcResult(id, signature),
      });
    } else {
      const fooCall = encodeFunctionData({
        abi: parseAbi(["function fooBar(uint256 amount, string message)"]),
        functionName: "fooBar",
        args: [hexToBigInt("0x3"), "yes it worked"],
      });

      const data = encodeFunctionData({
        abi: callRemoteAbi,
        functionName: "callRemote",
        args: [
          destinationChainId,
          [
            // {
            //   to: utils.addressToBytes32(tx.to),
            //   value: "0x0",
            //   data: "0x1",
            // },
            // Temp override while no things support WC2
            {
              to: utils.addressToBytes32(
                "0xBC3cFeca7Df5A45d61BC60E7898E63670e1654aE"
              ),
              value: "0x0",
              data: fooCall,
            },
          ],
        ],
      });

      const wrappedTx = {
        ...tx,
        value: "0x0",
        from: address,
        to: hyperlaneContractAddresses[chainIdToMetadata[chainId].name]
          .interchainAccountRouter,
        data,
        nonce: undefined, // let wallet populate for now
      };

      const signature = await wallet.data.sendTransaction(wrappedTx);
      await web3wallet.respondSessionRequest({
        topic,
        response: formatJsonRpcResult(id, signature),
      });
    }

    removeRequest(request);
  };

  const rejectRequest = async (request: PendingRequestTypes.Struct) => {
    const { id, topic } = request;
    await web3wallet.respondSessionRequest({
      topic,
      response: formatJsonRpcError(id, getSdkError("USER_REJECTED").message),
    });
    removeRequest(request);
  };

  const pair = (uri: string) => web3wallet.core.pairing.pair({ uri });

  return {
    initialised,
    pair,
    approveProposal,
    rejectProposal,
    disconnectSession,
    rejectRequest,
    approveRequest,
  };
}
