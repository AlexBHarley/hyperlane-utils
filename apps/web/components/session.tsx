"use client";

import { SessionTypes } from "@walletconnect/types";
import { FC } from "react";
import { useWalletConnect } from "../hooks/use-walletconnect";

export const Session: FC<{
  session: SessionTypes.Struct;
}> = ({ session }) => {
  const { disconnectSession } = useWalletConnect();

  return (
    <div className="flex flex-col border rounded p-4 space-y-4">
      <div className="flex space-x-3">
        <img
          src={session.peer.metadata.icons[0]}
          className="h-16 w-16 rounded"
        />
        <div>
          <div className="font-medium underline">
            <a href={session.peer.metadata.url} target="_blank">
              {session.peer.metadata.name}
            </a>
          </div>
          <div className="text-gray-700 text-sm">
            {session.peer.metadata.description}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="ml-auto rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={() => disconnectSession(session)}
      >
        Disconnect
      </button>
    </div>
  );
};
