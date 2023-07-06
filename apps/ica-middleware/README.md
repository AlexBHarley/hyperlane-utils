## Hyperlane ICA demo

Utility application used in conjunction with WalletConnect to make any EOA a Hyperlane ICA enabled account.

### Limitations

#### Required gas balance

Dapps often require the active account to have a sufficient gas balance before allowing transactions to be issued. In the context of an ICA where gas is paid via the origin chain, it's not usually necessary that an ICA needs to hold any native tokens.

However because the dapp thinks the ICA will be issuing transactions, it will often need to have a small gas balance despite it never being used.

#### Signatures

Some dapps (e.g. OpenSea, 1Inch) require users to sign ToS before being given access. When the active account session is an ICA it will be impossible to sign with this account.

#### Transaction validation

If dapps enforce some kind of anti-tampering checks on transactions (e.g. making sure the data, from and to properties of a submitted transaction match what they gave to the wallet) it could lead to UX problems with these ICA's

#### Origin chain signature

Right now I don't have a good way to get the destination chain signature from an origin chain message. That means in the response payload to dapps, we currently pass the origin chain gas payment transaction.
