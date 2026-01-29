import React from "react";
import {WagmiConfig} from "wagmi";
import {wagmiClient} from "../connection";

export default function Web3ServicesProvider({children}: { children: any }) {
    return (
        <WagmiConfig client={wagmiClient}>
            {children}
        </WagmiConfig>
    )
}
