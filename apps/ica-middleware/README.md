## Hyperlane ICA middleware

Turns any wallet - EOA or SC (incl. Gnosis Safes) - into an interchain enabled wallet.

Imagine using your account on Polygon to easily lend on zkSync, swap on Arbitrum or mint NFTs on Optimism!

Live demo deployed [here](https://hyperlane-ica-demo-web.vercel.app/).

### How does it work?

One of the main features of the recent WalletConnect V2 launch (🎉🎉🎉) was their native multi-account/chain functionality. During the connection handshake wallets share a list of CAIP-10 identifiers so dapps can offer multi-chain experiences without needing to prompt additional chain or account switches from users.

Pairing this with Hyperlane's interchain accounts, and deriving all the remote ICA addresses once we connect a wallet to the proxy, we’ve now turned our wallet into one that can be used anywhere Hyperlane is deployed. Dapps don’t need to know the difference between a standard account and an ICA one.

### Limitations

#### Required gas balance

Dapps often require the active account to have a sufficient gas balance before allowing transactions to be issued. In the context of an ICA where gas is paid via the origin chain, it's not actually necessary that an ICA maintains a gas token balance.

However because the dapp thinks the ICA will be issuing transactions, it will often need to have a small gas balance despite this never being used.

#### Signatures

Some dapps (e.g. OpenSea, 1Inch) require users to sign terms of service before being allowed access. When the active account session is an ICA it will be impossible to sign with this account.

#### Slow destination transaction hash indexing

Interchain messages are actually pretty quick to land on the destination chain, however the [Hyperlane explorer indexer](https://explorer.hyperlane.xyz/api-docs) can sometimes be slow to finalise destination chain transactions. This time to finality varies heavily based on the chain you're trying to send messages to.

Because we need to wait for the hash of the destination transaction to pass back to the dapp, some dapps will time out requests before the indexer has retrieved this hash, but the transaction will usually be successful.

#### Transaction validation

If dapps enforce some kind of anti-tampering checks on transactions (e.g. making sure the data, from and to properties of a submitted transaction match what they gave to the wallet) it could lead to UX problems with these ICA's
