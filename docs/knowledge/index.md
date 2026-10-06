# Architecture knowledge

## Core

- [The BFF is the only API the app and the outside world reach](bff-only-public-api.md)
- [Errors are {"error": {"code", "message"}} with stable codes](error-contract.md)
- [Orders reserve stock first and are confirmed only after notification](order-lifecycle.md)

## This repository

- [The app adds its own "offline" and "unknown" error codes](client-synthesized-error-codes.md)
- [On web, selected and checked states need aria-* props, not accessibilityState](web-aria-props.md)
