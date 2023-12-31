import {
  PendingRequestTypes,
  ProposalTypes,
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types";
import { create } from "zustand";
import { createSelectorHooks } from "auto-zustand-selectors-hook";

type WalletConnectStore = {
  initialised: boolean;

  proposals: ProposalTypes.Struct[];
  sessions: SessionTypes.Struct[];
  requests: PendingRequestTypes.Struct[];
  requestStatuses: { id: number; status: "approving" | "rejecting" }[];

  addProposal: (proposal: ProposalTypes.Struct) => void;
  removeProposal: (proposal: ProposalTypes.Struct) => void;

  addSession: (session: SessionTypes.Struct) => void;
  removeSession: (
    session: Pick<SignClientTypes.EventArguments["session_delete"], "topic">
  ) => void;

  addRequest: (request: PendingRequestTypes.Struct) => void;
  removeRequest: (request: PendingRequestTypes.Struct) => void;
  setRequestStatus: (id: number, status: "approving" | "rejecting") => void;
};

const walletConnectStore = create<WalletConnectStore>()((set) => ({
  initialised: false,

  proposals: [],
  requests: [],
  sessions: [],
  requestStatuses: [],

  addProposal: (proposal) =>
    set((state) => ({ proposals: [...state.proposals, proposal] })),
  removeProposal: (proposal) =>
    set((state) => ({
      proposals: state.proposals.filter((p) => p.id !== proposal.id),
    })),

  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  removeSession: (session) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.topic !== session.topic),
    })),

  addRequest: (request) =>
    set((state) => ({ requests: [...state.requests, request] })),
  removeRequest: (request) =>
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== request.id),
      requestStatuses: state.requestStatuses.filter((r) => r.id !== request.id),
    })),

  setRequestStatus: (id, status) =>
    set((state) => ({
      requestStatuses: [...state.requestStatuses, { id, status }],
    })),
}));

export const useWalletConnectStore = createSelectorHooks(walletConnectStore);
