## Hyperlane ICA middleware

Turns any wallet - EOA or SC (incl. Gnosis Safes) - into an interchain enabled wallet.

Imagine using your account on Polygon to easily lend on zkSync, swap on Arbitrum or mint NFTs on Optimism!

### How does it work?

One of the main features of the recent WalletConnect V2 launch (🎉🎉🎉) was their native multi-account/chain functionality. During the connection handshake wallets share a list of CAIP-10 identifiers so dapps can offer multi-chain experiences without needing to prompt additional chain or account switches from users.

Pairing this with Hyperlane's interchain accounts, and deriving all the remote ICA addresses once we connect a wallet to the proxy, we’ve now turned our wallet into one that can be used anywhere Hyperlane is deployed. Dapps don’t need to know the difference between a standard account and an ICA one.

### Limitations

#### Required gas balance

Dapps often require the active account to have a sufficient gas balance before allowing transactions to be issued. In the context of an ICA where gas is paid via the origin chain, it's not usually necessary that an ICA needs to hold any native tokens.

However because the dapp thinks the ICA will be issuing transactions, it will often need to have a small gas balance despite it never being used.

#### Signatures

Some dapps (e.g. OpenSea, 1Inch) require users to sign ToS before being given access. When the active account session is an ICA it will be impossible to sign with this account.

#### Transaction validation

If dapps enforce some kind of anti-tampering checks on transactions (e.g. making sure the data, from and to properties of a submitted transaction match what they gave to the wallet) it could lead to UX problems with these ICA's
