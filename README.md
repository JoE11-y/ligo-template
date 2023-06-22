# Tezos DApp Template

## Requirements

The contract is written in `cameligo` flavour of [LigoLANG](https://ligolang.org/),
to be able to compile the contract, you need either:

- a [ligo binary](https://ligolang.org/docs/intro/installation#static-linux-binary),
  in this case, to use the binary, you need to have set up a `LIGO` environment variable,
  pointing to the binary (see [Makefile](./Makefile))
- or [docker](https://docs.docker.com/engine/install/)

For deploy scripts, you also need to have [nodejs](https://nodejs.org/en/) installed,
up to version 14 and docker if you wish to deploy on a sandbox.

## Usage

1. Run `make install` to install dependencies
2. Run `make compile` to compile the contracts
3. Run `make test` to run tests on compiled smart contracts
4. Run `make deploy` to deploy the contracts. You have to rename `deploy/.env.dist` to `deploy/.env` and **fill the required variables**.

You can also override `make` parameters by running :

```sh
make compile ligo_compiler=<LIGO_EXECUTABLE> protocol_opt="--protocol <PROTOCOL>"
```
