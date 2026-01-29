import {BigNumber, BigNumberish, BytesLike, providers} from "ethers";
import {Chain} from "wagmi";

export type ConnectorName = "metaMask" | "coinbaseWallet" | "walletConnect";

export type IWeb3Provider = providers.Web3Provider;
export type IJsonRpcSigner = providers.JsonRpcSigner;

export type HumanReadableAmountInput = BigNumberish | string | number | BigNumber | BytesLike | BigInt

export interface ExtendedChain extends Chain {
    keys: string[],
    addresses: {
        WETH: string
    }
}

export interface ConnectorInformation {
    icon: string
}

export interface ConnectorInformations {
    [connectorId: string]: ConnectorInformation
}
