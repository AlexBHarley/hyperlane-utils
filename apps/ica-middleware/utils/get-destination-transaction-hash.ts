interface GetMessageResponse {
  status: "1" | "0";
  message: "OK";
  result: [
    {
      status: "delivered" | "pending";
      id: "0xbd6bdd0e4f27cca0476a785580b110c57c6b0f904d135db8e94834c963a52b3a";
      nonce: 26685;
      sender: "0xcb0ba89f564e31180a101df54b7971206e03ee9b";
      recipient: "0x6a9ced0e13e738517558aa283da0e93e5904d49b";
      originChainId: 5;
      originDomainId: 5;
      destinationChainId: 80001;
      destinationDomainId: 80001;
      origin: {
        timestamp: 1688677008000;
        hash: "0x6eb7909b70cb162023f3a27ba728b5f0e91f517110f34b4917c71bf11d7efb6c";
        from: "0x4444d38c385d0969c64c4c8f996d7536d16c28b9";
        blockHash: "0xd1c1537cc75d0f8e216d2195812667668ecb78bfd42af929bdfeea9b510d7584";
        blockNumber: 9301876;
        mailbox: "0xcc737a94fecaec165abcf12ded095bb13f037685";
        nonce: 425;
        to: "0xcb0ba89f564e31180a101df54b7971206e03ee9b";
        gasLimit: 115345;
        gasPrice: 2500000015;
        effectiveGasPrice: 2500000015;
        gasUsed: 75626;
        cumulativeGasUsed: 440919;
        maxFeePerGas: 2500000015;
        maxPriorityPerGas: 2500000015;
      };
      destination?: {
        timestamp: 1688677069000;
        hash: "0xc29cccbddb8e4982926ff6934ac09179ccbc3bcd33c85bf07e4b9690f8c10bdd";
        from: "0xa33fb3878f07fffa0bfd9393d229d9e776f32cc7";
        blockHash: "0x2e4255ea5b67d3effdbcc761110d2a9d9b6dcdd90891ec51926b775886cf1516";
        blockNumber: 37637186;
        mailbox: "0xcc737a94fecaec165abcf12ded095bb13f037685";
        nonce: 381;
        to: "0xcc737a94fecaec165abcf12ded095bb13f037685";
        gasLimit: 213224;
        gasPrice: 3000000015;
        effectiveGasPrice: 3000000015;
        gasUsed: 156553;
        cumulativeGasUsed: 580948;
        maxFeePerGas: 3000000030;
        maxPriorityPerGas: 3000000000;
      };
      isPiMsg: boolean;
      body: "0x0000000000000000000000004444d38c385d0969c64c4c8f996d7536d16c28b90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000278e1ae8efd11c2ff5df5fd7d214a8aee7da2526000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000";
      totalGasAmount: "223448";
      totalPayment: "2614341600000000";
      numPayments: 1;
    }
  ];
}

/**
 * Defaults to a 5 minute timeout because the explorer API
 * can be quite slow
 */
export async function getDestinationTransactionHash(
  messageId: string,
  attempts = 60,
  timeout = 5_000
) {
  let attempt = 0;
  while (attempt < attempts) {
    const baseUrl = "https://explorer.hyperlane.xyz/api";
    const action = "module=message&action=get-messages";
    const url = `${baseUrl}?${action}&id=${messageId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = (await response.json()) as GetMessageResponse;

    if (data.result[0]) {
      console.log(data.result[0].status);
    }

    if (data.status === "1" && data.result[0]?.destination?.hash) {
      return data.result[0].destination.hash;
    }

    attempt++;
    await new Promise((resolve) => setTimeout(resolve, timeout));
  }

  return null;
}
