import {ConnectorName} from "./types";
import {useAccount, useConnect} from "wagmi";

export function useConnector(name?: ConnectorName, config?: (Parameters<typeof useConnect>)[0]) {
    const {connector} = useAccount();
    const {
        connectors
    } = useConnect(config);

    const requestedConnector = name ? connectors.find(connector => connector.name === name) : connector;

    return requestedConnector;
}

// Removed useInventory - Moralis SDK removed for security
// Use MoralisService.tokenPrice() for REST API calls instead
