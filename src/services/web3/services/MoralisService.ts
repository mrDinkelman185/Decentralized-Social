import {create} from "apisauce";
import env from "../../../config/env";

const apisauce = create({baseURL: ""});
const MORALIS_API_KEY = env.MORALIS_API_KEY as string | undefined;

export default class MoralisService {
    static async tokenPrice(address: string, chain: string = "bsc") {
        if (!MORALIS_API_KEY) return null;
        const url = "https://deep-index.moralis.io/api/v2/erc20/" + address + "/price?chain=" + chain;

        const headers = {
            "X-API-KEY": MORALIS_API_KEY
        };
        const result = await apisauce.get(url, {}, {headers});
        const resultBody = result.data;
        return resultBody;
    }
}
