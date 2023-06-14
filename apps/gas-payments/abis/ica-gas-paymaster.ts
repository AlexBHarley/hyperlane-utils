export const gasPaymasterAbi = [
  {
    inputs: [{ internalType: "address", name: "_innerIgp", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint32", name: "domain", type: "uint32" },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasOverhead",
        type: "uint256",
      },
    ],
    name: "DestinationGasOverheadSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint32", name: "_destinationDomain", type: "uint32" },
      { internalType: "uint256", name: "_gasAmount", type: "uint256" },
    ],
    name: "destinationGasAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint32", name: "", type: "uint32" }],
    name: "destinationGasOverhead",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "innerIgp",
    outputs: [
      {
        internalType: "contract IInterchainGasPaymaster",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_messageId", type: "bytes32" },
      { internalType: "uint32", name: "_destinationDomain", type: "uint32" },
      { internalType: "uint256", name: "_gasAmount", type: "uint256" },
      { internalType: "address", name: "_refundAddress", type: "address" },
    ],
    name: "payForGas",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint32", name: "_destinationDomain", type: "uint32" },
      { internalType: "uint256", name: "_gasAmount", type: "uint256" },
    ],
    name: "quoteGasPayment",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "domain", type: "uint32" },
          { internalType: "uint256", name: "gasOverhead", type: "uint256" },
        ],
        internalType: "struct OverheadIgp.DomainConfig[]",
        name: "configs",
        type: "tuple[]",
      },
    ],
    name: "setDestinationGasOverheads",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
