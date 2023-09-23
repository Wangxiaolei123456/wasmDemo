
import { ethers } from "ethers";
import Web3 from 'web3';
// const web3Obj = new Web3("https://json-rpc.origin.uptick.network");

export async function addNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x1b58',
                chainName: 'Uptick Test',
                nativeCurrency: {
                    name: 'UptickToken',
                    symbol: 'UPTICK', // 2-6 characters long
                    decimals: 18,
                  
                },
                rpcUrls: ['http://47.242.107.228:26657'],
                blockExplorerUrls: ['https://evm-explorer.origin.uptick.network/'],
               
                
            }],
        });
    }
    catch (error) {
        console.error(error);
    }
}
export async function connect(address, abi) {
    let web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await web3Provider.send('eth_requestAccounts', []);
    let signer = await web3Provider.getSigner();
	let contract = new ethers.Contract(address, abi, signer);
	return contract;

}
export async function getGasPriceAndGasLimit(){

    let gasPrice = 10000000000;
    //xxl TODO setting from .evn
    let gasLimit = "0x7a1200";


    return {gasPrice,gasLimit};

}
   