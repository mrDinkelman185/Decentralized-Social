import React, {useEffect, useRef, useState} from 'react';
import axios from "axios";
import {Box, Button, Skeleton} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useNetwork, useTransaction} from 'wagmi';
import JSConfetti from 'js-confetti'
import env from "../../../config/env";
import {USERNAME_ADDRESS} from "../../../services/web3";
import {save} from "../../../utils/storage";

// Minimum ms between expensive operations to prevent resource exhaustion / DoS
const THROTTLE_MS = 2000;

interface INFTDATA {
    name: string,
    description: string,
    image: string
}

const IMAGE = {
    width: "150px",
    borderRadius: "20px",
    mb: 1,
    mt:2,
    boxShadow: "-21px -4px 27px #1514269e, 23px -2px 31px #f8c136c4"
}

const USERNAME = {
    fontFamily: "Karla",
    mt: 2,
    mb: 5,
    fontWeight: "bold",
    fontSize: "20px",
}


const {OPENSEA} = env;

// Security: Validate URL to prevent open redirect
const isValidURL = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        // Only allow https/http protocols
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }
        // Whitelist allowed domains
        const allowedDomains = [
            'opensea.io',
            'etherscan.io',
            'sepolia.etherscan.io',
            'nft.cawmnty.com'
        ];
        return allowedDomains.some(domain => parsed.hostname.endsWith(domain));
    } catch {
        return false;
    }
};

const safeOpenURL = (url: string): void => {
    if (isValidURL(url)) {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        console.error('Invalid URL:', url);
    }
};

const sanitizeTokenId = (id: unknown): string => {
    const s = typeof id === 'number' ? String(id) : typeof id === 'string' ? id : '';
    return /^\d+$/.test(s) ? s : '0';
};


export const Setup5 = ({transaction}: { transaction: string }) => {

    const successElemets = transaction.split("||"); // 0 tx, 1 url
    const ipfsConverter = successElemets[1].replaceAll("ipfs://", "https://ipfs.io/ipfs/")
    const [data, setData] = useState<INFTDATA>();
    const [nftId, setNftId] = useState(0)
    const lastFetchRef = useRef<number>(0);
    const inFlightRef = useRef<boolean>(false);

    const jsConfetti = new JSConfetti()
    const { chain} = useNetwork();


    const { data:hashedData } = useTransaction({
        hash: (successElemets[0] as unknown as any),
    })


    async function checkNftsData(){
        const now = Date.now();
        if (inFlightRef.current || (now - lastFetchRef.current < THROTTLE_MS)) return;
        inFlightRef.current = true;
        lastFetchRef.current = now;
        try {
            // ⚠️ SECURITY: Hardcoded JWT token removed - use environment variable instead
            const MORALIS_API_KEY = env.MORALIS_API_KEY;
            if (!MORALIS_API_KEY) {
                console.error('MORALIS_API_KEY not configured');
                return;
            }
            const url = "https://deep-index.moralis.io/api/v2/block/"+ hashedData?.blockNumber +"/nft/transfers?chain=" + "0xaa36a7";
            const response = await axios.get(
                url,
                {
                    headers: {
                        "Accept": 'application/json',
                        'X-API-Key': MORALIS_API_KEY,
                    }
                }
            );
            const nfts = response?.data?.result;
            for (let i = 0; i < nfts?.length; i++) {
                if(nfts?.[i]?.transaction_hash === successElemets[0]) setNftId(nfts?.[i]?.token_id);
            }
        } finally {
            inFlightRef.current = false;
        }
    }


    const checkNftDetails = async () => {
        const now = Date.now();
        if (now - lastFetchRef.current < THROTTLE_MS) return;
        lastFetchRef.current = now;
        return await axios
            .get(ipfsConverter)
            .then(function (response) {
                setData(response?.data)
            });
    }

    function deneme(){
       return  jsConfetti.addConfetti({
           emojis: ['🌙', "🎉"],
           emojiSize: 100,
           confettiNumber: 30,
       })
    }


    function genareteHashed(hashed: any) {
        save("access_token", btoa(JSON.stringify(hashed)));
        return
    }



    useEffect(() => {
        checkNftDetails()
        checkNftsData()
    }, [])



    useEffect(() => {
        deneme()
        if(data) {
             genareteHashed(data)
        }
    } ,[data])


    useEffect(() => {
        checkNftsData()
    },[hashedData])

    return (
        <Box>
            <Box sx={{position:"absolute", top:0, left:0, width:"360px", height:"100%", zIndex:-1, opacity: "0.06", backgroundImage:"url(/assets/caw_token.png)", backgroundSize:"25px 28px"}}>
            </Box>
            {
                data ?
                    <Box>
                        <Typography sx={{...USERNAME,mb:2}}> You have successfully minted an NFT 🔮</Typography>
                        <Box sx={IMAGE} component={"img"} src={data?.image?.replaceAll("ipfs://","https://ipfs.io/ipfs/")}/>
                        <Typography sx={USERNAME}> @{data?.name} <br/> successfully minted 🎉 🌙</Typography>
                    </Box>
                    :
                    <>
                        <Box sx={{height: "150px", width: "100%"}} display={"flex"} justifyContent={"center"}>
                            <Skeleton width={"150px"} height={"250px"}/>
                        </Box>
                        <Box sx={{mt:7}} display={"flex"} justifyContent={"center"}>
                            <Skeleton>
                                <Typography sx={{...USERNAME, mt:3}}> dsfsdfsd <br/> successfully minted 🎉 🌙</Typography>
                            </Skeleton>
                        </Box>
                    </>
            }

            <Button onClick={() => {
                const url = chain?.blockExplorers?.default?.url + "tx/" + successElemets[0];
                if (url && isValidURL(url)) {
                    safeOpenURL(url);
                }
            }}>VIEW ETHERSCAN</Button>
            <Button onClick={() => safeOpenURL(OPENSEA + "/" + USERNAME_ADDRESS + "/" + sanitizeTokenId(nftId))}>VIEW OPENSEA</Button>
            <Button onClick={() => safeOpenURL("https://nft.cawmnty.com/asset/" + sanitizeTokenId(nftId))}>VIEW CAW MARKET</Button>
        </Box>
    );
};
