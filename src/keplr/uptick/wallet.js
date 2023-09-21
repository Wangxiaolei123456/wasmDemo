const md5 = require('md5');
const BigNumber = require('big-number');
const iris = require("@irisnet/irishub-sdk");
const long = require('long');
const { bech32 } = require('bech32');
// const { SigningCosmWasmClient } = require("@cosmwasm/sdk");
const toHexString = bytes =>
    bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

import { 
    SigningCosmWasmClient, 
    Secp256k1HdWallet 
} from "@uptsmart/cosmwasm-stargate";
import {
    SigningStargateClient,
    StargateClient,
} from '@uptsmart/stargate'

import {
    getRanHex
} from "../../utils/helper";

const chainId = "origin_1170-1";
const irisChainId = "gon-irishub-1";
const uptickUrl = window.location.protocol + "//" + window.location.host + "/uptick";
const irisUrl = window.location.protocol + "//" + window.location.host + "/iris";
const REGISTRY_CONTRACT =  'uptick14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s59l95g'


export async function convertCosmosNFT2ERC(denomId, nftId) {

    try {
        // let irisAccount = await getAccountInfo(irisChainId);
        let uptickAccount = await getAccountInfo();
        let uptickAddress = uptickAccount.bech32Address
        let evmAddress = getEvmAddress(uptickAddress)
        console.log('wwww', "/uptick.erc721.v1.MsgConvertNFT", denomId, nftId, evmAddress, uptickAddress);
        console.log("convertCosmosNFT2ERC evmAddress ", evmAddress);
        console.log("convertCosmosNFT2ERC uptickAddress ", uptickAddress);
        // classId: jspb.Message.getFieldWithDefault(msg, 1, ""),
        // nftId: jspb.Message.getFieldWithDefault(msg, 2, ""),
        // receiver: jspb.Message.getFieldWithDefault(msg, 3, ""),
        // sender: jspb.Message.getFieldWithDefault(msg, 4, ""),
        // contractAddress: jspb.Message.getFieldWithDefault(msg, 5, ""),
        // tokenId: jspb.Message.getFieldWithDefault(msg, 6, "")
        let msg = {
            typeUrl: "/uptick.erc721.v1.MsgConvertNFT",
            value: [
                denomId,
                nftId,
                evmAddress,
                uptickAddress,
                "",//contractAddress
                ""]//tokenId
        }
        const result = await sendMsgsTx(uptickAddress, [msg], 1000000, "");
        console.log(result)
        console.log(JSON.parse(result.rawLog))
        // debugger
        if (result.code == 0) {

            const logInfo = JSON.parse(result.rawLog)

            let contractAddress = logInfo[0].events[0].attributes[4].value
            let tokenId = logInfo[0].events[0].attributes[5].value
            console.log("contractAddress, tokenId", contractAddress, tokenId)
            
            return {
                "evmNftAddress": contractAddress,
                "evmNftId": tokenId,
                "evmOwner": evmAddress,
                "nftAddress": denomId,
                "nftId": nftId,
                "owner": uptickAddress
            };
        } else {
            throw new Error(result.rawLog)
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export async function convertERC2CosmosNFT(contractAddress, tokenId) {

    try {

        let uptickAccount = await getAccountInfo();
        let uptickAddress = uptickAccount.bech32Address
        let evmAddress = getEvmAddress(uptickAddress)


        console.log('wwww', "/uptick.erc721.v1.MsgConvertERC721", contractAddress, tokenId, evmAddress, uptickAddress);
        console.log("convertERC2CosmosNFT evmAddress ", evmAddress);
        console.log("convertERC2CosmosNFT uptickAddress ", uptickAddress);

        // contractAddress: jspb.Message.getFieldWithDefault(msg, 1, ""),
        // tokenId: jspb.Message.getFieldWithDefault(msg, 2, ""),
        // receiver: jspb.Message.getFieldWithDefault(msg, 3, ""),
        // sender: jspb.Message.getFieldWithDefault(msg, 4, ""),
        // classId: jspb.Message.getFieldWithDefault(msg, 5, ""),
        // nftId: jspb.Message.getFieldWithDefault(msg, 6, "")
        let msg = {
            typeUrl: "/uptick.erc721.v1.MsgConvertERC721",
            value: [
                contractAddress,
                tokenId,
                uptickAddress,
                evmAddress,
                "",//classId
                ""]//nftId
        }

        const result = await sendMsgsTx(uptickAddress, [msg], 1000000, "");
        console.log(result)

        if (result.code == 0) {
            const logInfo = JSON.parse(result.rawLog)
            let denomId = logInfo[0].events[0].attributes[2].value
            let nftId = logInfo[0].events[0].attributes[3].value
            console.log("denomId, nftId", denomId, nftId)

            return {
                "uptickNftAddress": denomId,
                "uptickNftId": nftId,
                "uptickOwner": uptickAddress,
                "nftAddress": contractAddress,
                "nftId": tokenId,
                "owner": evmAddress
            };
        } else {
            throw new Error(result.rawLog)
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }

}


export async function iris2Uptick(denomId, nftId) {

    try {
        let irisAccount = await getAccountInfo(irisChainId);
        let uptickAccount = await getAccountInfo();

        console.log("iris2Uptick uptickAddress ", uptickAccount.bech32Address);
        console.log("iris2Uptick irisAddress ", irisAccount.bech32Address);

        let timespan = (Date.now() + 60000) * 1000000;
        let msg = {
            typeUrl: "/ibc.applications.nft_transfer.v1.MsgTransfer",
            value: [
                "nft-transfer",
                "channel-68",
                denomId,
                [nftId],
                irisAccount.bech32Address,
                uptickAccount.bech32Address,
                [0, 0],
                timespan,
                "iris to uptick"
            ]
        }

        console.log(msg);

        const result = await sendMsgsTx(irisAccount.bech32Address, [msg], 1000000, "", true);
        console.log(result)
        if (result.code == 0) {
            return result;
        } else {
            throw new Error(result.rawLog)
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }

}

export async function uptick2Iris(denomId, nftId) {
    try {

        let uptickAccount = await getAccountInfo();
        let irisAccount = await getAccountInfo(irisChainId);

        console.log("uptick2Iris uptickAddress ", uptickAccount.bech32Address);
        console.log("uptick2Iris irisAddress ", irisAccount.bech32Address);

        // sourcePort: jspb.Message.getFieldWithDefault(msg, 1, ""),
        // sourceChannel: jspb.Message.getFieldWithDefault(msg, 2, ""),
        // classId: jspb.Message.getFieldWithDefault(msg, 3, ""),
        // tokenIdsList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f,
        // sender: jspb.Message.getFieldWithDefault(msg, 5, ""),
        // receiver: jspb.Message.getFieldWithDefault(msg, 6, ""),
        // timeoutHeight: (f = msg.getTimeoutHeight()) && ibc_core_client_v1_client_pb.Height.toObject(includeInstance, f),
        // timeoutTimestamp: jspb.Message.getFieldWithDefault(msg, 8, 0),
        // memo: jspb.Message.getFieldWithDefault(msg, 9, ""
        let timespan = (Date.now() + 60000) * 1000000;
        let msg = {
            typeUrl: "/ibc.applications.nft_transfer.v1.MsgTransfer",
            value: [
                "nft-transfer",
                "channel-0",
                denomId,
                [nftId],
                uptickAccount.bech32Address,
                irisAccount.bech32Address,
                [0, 0],
                timespan,
                "uptick to iris"
            ]
        }
        const result = await sendMsgsTx(uptickAccount.bech32Address, [msg], 1000000, "");
        console.log(result)
        if (result.code == 0) {
            return result;
        } else {
            throw new Error(result.rawLog)
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export async function getAccountInfo(pChainId = "origin_1170-1") {

    console.log("xxl getAccountInfo ", pChainId);
    try {
        // keplr 检测
        await window.keplr.enable(pChainId);
        // get account
        const account = await window.keplr.getKey(pChainId);
        return account;
    } catch (error) {
        console.log(error)
    }
}

async function sendMsgsTx(address, msgs, amount, data, isIris = false) {
    let client, fee;
    if (isIris == false) {
        fee = {
            amount: [{
                denom: 'auptick',
                amount: amount,
            }],
            gas: '10000000',
        };
        const offlineSigner = await window.getOfflineSigner(chainId);

        client = await SigningStargateClient.connectWithSigner(
            uptickUrl,
            offlineSigner
        )
    } else {
        fee = {
            amount: [{
                denom: 'uiris',
                amount: amount,
            }],
            gas: '10000000',
        };

        const offlineSigner = await window.getOfflineSigner(irisChainId);

        client = await SigningStargateClient.connectWithSigner(
            irisUrl,
            offlineSigner
        )

    }
    // debugger
    console.log("###xxl sendMsgsTx", [address, msgs, fee, data]);
    const result = await client.sendMsgsTx(address, msgs, fee, data);
    console.log("###xxl result", result);
    return result;



}

export async function WasmNftMint(
  
) {

    console.log(1);
    // 随机生成助记词
    // const wallet = await Secp256k1HdWallet.generate();
    // const mnemonic = await wallet.mnemonic;
    // console.log("Mnemonic:", mnemonic);
    const offlineSigner = await window.getOfflineSigner(chainId);

    // // let client = await CosmWasmClient.connect(uptickUrl);
    // console.log(2);
    // const walletMemon = await Secp256k1HdWallet.fromMnemonic(mnemonic);

    // Using
    console.log(3);
    const client = await SigningCosmWasmClient.connectWithSigner(
        uptickUrl,
        offlineSigner,
    );
    console.log(client);

    console.log(4);
    let accountInfo = await getAccountInfo()
    console.log("accountInfo",accountInfo);
    // const handleMsg = { name: "smile" };
    const handleMsg = {"mint": {"token_id":"abc123", "owner":"uptick103rx84uqa7n4mtmz8f88n4g9m7973rxutrtn7d", "token_uri":"http://test.com"}}
    const coins = { denom: "auptick", amount: "1000000" };
    const gas = "200000";

    console.log(5.1);
    let result
    try{
        // senderAddress：发送者的地址，也就是执行合约的账户地址。
        // contractAddress：要执行的合约的地址。
        // handleMsg：要传递给合约的消息，可以是一个字符串或者一个对象。
        // coins：要发送给合约的货币数量，可以是一个字符串或者一个对象。
        // gas：用于执行合约的gas数量，可以是一个字符串或者一个数字。

        console.log("xxl param is ",[
            accountInfo.bech32Address,
            REGISTRY_CONTRACT,
            handleMsg,
            coins,
            gas
        ]);

        // export interface StdFee {
        //     readonly amount: readonly Coin[];
        //     readonly gas: string;
        // }
        let fee = {
            amount:[coins],
            gas:"200000"
        }

        result = await client.execute(
            accountInfo.bech32Address,
            REGISTRY_CONTRACT,
            handleMsg,
            fee
        );

        console.log("5.4 xxl result is : ",result);
    }catch(e){
        console.log(5.5); 
        console.log("error is ",e);
    }


  
  console.log("xxl 6 result ",result); 
  return result;

}

export async function issueUptickDenomAndMint(
    orgName,
    sender,
    recipient,
    uri,
    data,
    amount,
) {

    let accountInfo = await getAccountInfo()
    let msgs = [];
    let name = getDenomName(orgName, accountInfo.bech32Address);
    let id = getDenomId(name)

    let value = [
        id,
        name,
        getDenomSchema(),
        sender,
        id
    ]
    let msg = {
        typeUrl: "/uptick.collection.v1.MsgIssueDenom",
        value
    }
    msgs.push(msg);
    // // debugger
    for (var i = 0; i < amount; i++) {

        let nftID = getNftId();
        msg = {
            typeUrl: "/uptick.collection.v1.MsgMintNFT",
            value: [
                nftID,
                id,
                name,
                uri,
                data,
                accountInfo.bech32Address,
                recipient
            ]
        }
        msgs.push(msg);
    }

    console.log("xxl --- msgs");
    console.log(msgs);
    const result = await sendMsgsTx(accountInfo.bech32Address, msgs, 1000000, "");
    if (result.code == 0) {
        alert("successful ! ");
    }
    console.log(result)
    return result;

    // console.log("https://gon.ping.pub/iris/tx/" + txInfo.hash)
    // return {
    // 	txInfo,
    // 	denomInfo: msgs
    // }
}

export async function quiryUptickTx(tx) {

    console.log("xxl ....");
    try {
        const offlineSigner = await window.getOfflineSigner(chainId);

        let client = await StargateClient.connectWithSigner(
            uptickUrl,
            offlineSigner
        )
        let result = await client.searchTx(tx);
        console.log(result);
        if (result.tx_result != null && result.tx_result.code == 0) {
            return {
                code: "0",
                log: ""
            }
        } else if (result.tx_result != null && result.tx_result.code != 0) {
            return {
                code: "-1",
                log: result.tx_result.log
            }
        } else {
            return {
                code: "-2",
                log: "cannot get log"
            }
        }
    } catch (e) {
        return [-3, e.toString()];
    }

}

function getDenomName(name, address) {

    let denomName = name + "_" + Math.floor(Date.now() / 1000) + "_" + address.substr(address.length - 4);
    return denomName;

}

function getDenomId(name) {

    let preFix = process.env.VUE_APP_PREFIX;
    return preFix + md5(name);

}

function getDenomSchema() {

    let json = {
        "type": "/uptick.souvenirCard"
    };
    return JSON.stringify(json);

}

function getNftId() {

    let preFix = process.env.VUE_APP_PREFIX;
    return preFix + getRanHex(16);

}


export function getEvmAddress(uptickAddress) {
    let decode = bech32.decode(uptickAddress);
    let array = bech32.fromWords(decode.words);
    let address = toHexString(array);

    return "0x" + address;
}