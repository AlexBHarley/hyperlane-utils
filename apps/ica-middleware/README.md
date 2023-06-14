## Hyperlane ICA demo

Utility application used in conjunction with WalletConnect to make any EOA a Hyperlane ICA enabled account.

### Limitations

- Gas balances. Dapps often require the active account to have a sufficient gas balance. In the context of an ICA where gas is paid via the origin chain, ICAs will often need to have a small gas balance despite it never being used
- Signatures, some dapps (e.g. OpenSea, 1Inch) require users to sign ToS before being given access. When the active account session is an ICA it will be impossible to sign with this account
- Transaction validation, if dapps enforce some kind of anti-tampering checks on transactions (e.g. making sure the data, from and to properties of a submitted transaction match what they gave to the wallet) it could lead to UX problems with these ICA's
