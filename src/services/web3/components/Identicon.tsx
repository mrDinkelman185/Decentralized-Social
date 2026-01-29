import React, {useEffect, useRef} from "react";
import blockies from "ethereum-blockies";
import {Box} from "@mui/material";

export default function Identicon({address, sx = {}, ...props}: { address?: string | undefined, sx?: any }) {
    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        if (address && ref.current) {
            ref.current.innerHTML = "";
            const canvas = blockies.create({
                seed: address.toLowerCase(),
                size: 8,
                scale: 2
            });
            if (canvas) {
                ref.current.appendChild(canvas);
            }
        }
    }, [address]);

    return <Box ref={ref as any} sx={{
        height: "1rem",
        width: "1rem",
        borderRadius: "1.125rem",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx
    }} {...props}/>;
}
