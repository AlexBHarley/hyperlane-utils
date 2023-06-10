import { Core } from "@walletconnect/core";
import { SignClientTypes } from "@walletconnect/types";
import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet";
import { useCallback, useEffect } from "react";

import { useWalletConnectStore } from "../app/state/walletconnect";

export let web3wallet: IWeb3Wallet | undefined;

const core = new Core({
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  relayUrl: "wss://relay.walletconnect.com",
});

export function useInitialiseWalletConnect() {
  const { initialised, addProposal, removeSession, addRequest } =
    useWalletConnectStore();

  const init = useCallback(async () => {
    web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "Demo app",
        description: "Demo Client as Wallet/Peer",
        url: "www.walletconnect.com",
        icons: [],
      },
    });

    useWalletConnectStore.setState({
      initialised: true,
      sessions: Object.values(web3wallet.getActiveSessions()),
      proposals: Object.values(web3wallet.getPendingSessionProposals()),
      requests: Object.values(web3wallet.getPendingSessionRequests()),
    });
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const onSessionProposal = (
    proposal: SignClientTypes.EventArguments["session_proposal"]
  ) => addProposal(proposal.params);

  const onSessionDelete = (
    session: SignClientTypes.EventArguments["session_delete"]
  ) => removeSession(session);

  const onSessionRequest = async (
    request: SignClientTypes.EventArguments["session_request"]
  ) => addRequest(request);

  useEffect(() => {
    if (initialised && web3wallet) {
      web3wallet.on("session_proposal", onSessionProposal);
      web3wallet.on("session_request", onSessionRequest);
      web3wallet.on("session_delete", onSessionDelete);

      // TODOs
      // signClient.on('session_ping', data => console.log('ping', data))
      // signClient.on('session_event', data => console.log('event', data))
      // signClient.on('session_update', data => console.log('update', data))
    }

    return () => {
      if (web3wallet) {
        web3wallet.off("session_proposal", onSessionProposal);
        web3wallet.off("session_request", onSessionRequest);
        web3wallet.off("session_delete", onSessionDelete);
      }
    };
  }, [initialised]);

  return {
    initialised,
  };
}
