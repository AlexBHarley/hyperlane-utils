import { ChainMetadata } from "@hyperlane-xyz/sdk";
import { FC } from "react";
import { Address, useBalance } from "wagmi";

export const AccountRow: FC<{
  address: Address;
  chainMetadata: ChainMetadata;
  highlight?: boolean;
}> = ({ address, chainMetadata, highlight }) => {
  const balance = useBalance({ address, chainId: chainMetadata.chainId });

  return (
    <tr className={highlight ? `bg-gray-50` : ""}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
        {chainMetadata.displayName}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-500">
        <a
          href={`${chainMetadata.blockExplorers![0].url}/address/${address}`}
          target="_blank"
        >
          {address}
        </a>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {balance.data
          ? `${balance.data?.formatted} ${balance.data.symbol}`
          : "0"}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {chainMetadata.isTestnet ? "Testnet" : "Mainnet"}
      </td>
    </tr>
  );
};
