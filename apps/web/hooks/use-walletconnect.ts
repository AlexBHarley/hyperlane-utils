import {
  PendingRequestTypes,
  ProposalTypes,
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { useAccount, useChainId, useNetwork } from "wagmi";
import { useWalletConnectStore } from "../app/state/walletconnect";
import { EIP155_SIGNING_METHODS } from "../constants";
import { useIcaAddresses } from "./use-ica-addresses";
import { web3wallet } from "./use-initialise-walletconnect";
import { formatJsonRpcError, formatJsonRpcResult } from "@json-rpc-tools/utils";

export function useWalletConnect() {
  const { chains: wagmiChains } = useNetwork();
  const icas = useIcaAddresses();
  const chainId = useChainId();
  const { address } = useAccount();

  const initialised = useWalletConnectStore.useInitialised();
  const removeProposal = useWalletConnectStore.useRemoveProposal();
  const addSession = useWalletConnectStore.useAddSession();
  const removeSession = useWalletConnectStore.useRemoveSession();
  const removeRequest = useWalletConnectStore.useRemoveRequest();

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

  const approveRequest = (request: PendingRequestTypes.Struct) => {
    console.log("approved", request);
    // await web3wallet.respondSessionRequest()
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
