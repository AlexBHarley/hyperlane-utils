"use client";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import {
  chainIdToMetadata,
  chainMetadata,
  hyperlaneContractAddresses,
} from "@hyperlane-xyz/sdk";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Fragment, useState } from "react";
import {
  Address,
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
} from "wagmi";

import GasPaymasterAbi from "../abis/ica-gas-paymaster.json";
import { classNames } from "../utils/class-names";

export default function Page() {
  const chainId = useChainId();
  const { address } = useAccount();

  const [messageId, setMessageId] = useState("");
  const [gas, setGas] = useState("1000000");
  const [destination, setDestination] = useState(chainMetadata.goerli);

  const paymasterAddress: Address =
    hyperlaneContractAddresses[chainIdToMetadata[chainId].name]
      .defaultIsmInterchainGasPaymaster;

  const quoteGas = useContractRead({
    address: paymasterAddress,
    abi: GasPaymasterAbi,
    functionName: "quoteGasPayment",
    args: [destination.chainId, BigInt(gas)],
  });

  const payGas = useContractWrite({
    address: paymasterAddress,
    abi: GasPaymasterAbi,
    functionName: "payForGas",
    args: [messageId as Address, destination.chainId, BigInt(gas), address!],
    value: quoteGas.data ? BigInt(quoteGas.data as string) : BigInt("0"),
  });

  const enabled = !!messageId && !!gas && !!address && !payGas.isLoading;

  const onClick = () => {
    if (!enabled) {
      return;
    }
    payGas.write();
  };

  return (
    <div className="max-w-screen-lg mx-auto mt-10">
      <div className="space-y-10 divide-y divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Hyperlane Gas Payments
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Use this page to easily pay gas for a submitted message.
            </p>
            <ConnectButton />
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="space-y-4">
                <div className="">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Message ID
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0x88f7b338764f4e2b047e9f54896587e4096652a7f618699d501a85c4fbb06512"
                        value={messageId}
                        onChange={(e) => setMessageId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Listbox value={destination} onChange={setDestination}>
                  {({ open }) => (
                    <>
                      <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                        Destination
                      </Listbox.Label>
                      <div className="relative mt-2">
                        <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                          <span className="flex items-center">
                            <img
                              // @ts-expect-error
                              src={destination.avatar}
                              alt=""
                              className="h-5 w-5 flex-shrink-0 rounded-full"
                            />
                            <span className="ml-3 block truncate">
                              {destination.displayName}
                            </span>
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {Object.values(chainMetadata).map((chain) => (
                              <Listbox.Option
                                key={chain.chainId}
                                className={({ active }) =>
                                  classNames(
                                    active
                                      ? "bg-indigo-600 text-white"
                                      : "text-gray-900",
                                    "relative cursor-default select-none py-2 pl-3 pr-9"
                                  )
                                }
                                value={chain}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <div className="flex items-center">
                                      <img
                                        // @ts-expect-error
                                        src={chain.avatar}
                                        alt=""
                                        className="h-5 w-5 flex-shrink-0 rounded-full"
                                      />
                                      <span
                                        className={classNames(
                                          selected
                                            ? "font-semibold"
                                            : "font-normal",
                                          "ml-3 block truncate"
                                        )}
                                      >
                                        {chain.displayName}
                                      </span>
                                    </div>

                                    {selected ? (
                                      <span
                                        className={classNames(
                                          active
                                            ? "text-white"
                                            : "text-indigo-600",
                                          "absolute inset-y-0 right-0 flex items-center pr-4"
                                        )}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>

                <div className="">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Gas
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        id="about"
                        name="about"
                        className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder={"100000"}
                        value={gas}
                        onChange={(e) => setGas(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button
                onClick={onClick}
                className={classNames(
                  `rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`,
                  enabled && "bg-indigo-600 hover:bg-indigo-500",
                  !enabled && "bg-indigo-500"
                )}
                disabled={!enabled}
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
