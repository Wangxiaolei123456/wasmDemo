<template>
  <div class="Home">
    <div class="hearder d-flex flex-row justify-space-between align-center">
      <div class="Title">Uptick-Wasm-721</div>
      <div class="d-flex flex-row align-center">
        <div class="address">{{ evmAddress }}</div>
        <button class="disconnect ml-4" @click="disconnect">Disconnect</button>
      </div>
    </div>
    <div class="content d-flex flex-row justify-space-between mt-12">
      <div class="left">
        <div class="createNft">
            <CreateNFT ></CreateNFT>
        </div>
      </div>
      <div class="right d-flex flex-column">
        
          <div class="d-flex flex-row align-center">
            <div  class="title-20">nftAddress :</div>
             <input class="textInput" type="text" placeholder="NFT Address" v-model="nftAddressValue"> 
             
             </div>
             <div class="d-flex flex-row align-center mt-6">
              <div  class="title-20">nftId :</div>
             <input class="textInput" type="text" placeholder="NFT ID" v-model="nftIdValue"> 
         
             </div>
             <div class="d-flex flex-row mt-5">
              <button type="submit" class="btn1"  @click="wasmToNative">WasmToNative</button>
              <button type="submit" class="btn1 ml-6" @click="NativeToEvm">NativeToEvm</button>
              <button type="submit" class="btn1 ml-6" @click="EvmToNative">EvmToNative</button>
              <button type="submit" class="btn1 ml-6" @click="NativeToWasm">NativeToWasm</button>
             </div>
          
              <div class="d-flex flex-row mt-5">


              <div class="btn mr-8" :class="{ btn2: wasmClick }"  @click="searchNft"
            >searchWasmNft</div
          > 
          <div class="btn mr-8" :class="{ btn2: nativeClick }" @click="searchNativeNft"
            >searchNativeNft</div
          >
             <div class="btn " :class="{ btn2:evmClick }"  @click="searchEvmNft"
            >searchEvmNft</div
          >  
               <!-- <button type="submit"  class="btn " @click="searchNft">searchWasmNft</button>
              <button type="submit" class="btn ml-6"  @click="searchNativeNft">searchNativeNft</button>
              <button type="submit" class="btn ml-6" @click="searchEvmNft">searchEvmNft</button> -->
              
              <!-- <button type="submit"  class="btn ml-6" @click="searchNft">search</button>
              -->
             </div>

               <div class="histroyList" v-if="histroyList.length == 0">
                 <div  class="empty">This is empty</div>
               </div>
                <div class="histroyList" v-else>
                 <div class="title d-flex flex-row">
                   <div class="s1"> nftId</div>
                    <div class="s2">nftAddress</div>
                 </div>
                 <div class="nftList" v-for="(item,index) in histroyList" :key='index'>
                   <div class="item d-flex flex-row">
                     <div class="nftaddtrss">{{item.nftId}}</div>
                      <div class="nftid">{{item.nftAddress}}</div>
                   
                   </div>
                 </div>
               </div>
              
            <!-- <div class="title-20"> nftId:  <input class="textInput" type="text" placeholder="NFT Id" v-model="nftIdValue" > </div> -->
      </div>

      <!-- <button @click="showPopup">弹出窗口</button> -->
      <popup :visible.sync="popupVisible"
        title="Cross chain conversion completed, switch to Uptick - COSMOS chain for cross chain operation"
        @reload:data="reladData" @submit:popup="submitPopup">
      </popup>
    </div>
  <uComponents ref="ucom"></uComponents>
  </div>
</template>

<script>

import { getNftImg } from "/src/api/image"
import CreateNFT from "./createNFT";
import ConvertCosmoss from "./convertCosmoss";
import Card from "../components/workCard/card.vue";
import { getMyCardList, updateUser,searchNativeNfts } from "@/api/home";
import { balanceOf } from "/src/metaMask/evm/handler/uptick721.js"
import Popup from './popup';
import { getEvmAddress,WasmNftMint,convertWasmNFT2NFT,convertNFT2Wasm,convertCosmosNFT2ERC,convertERC2CosmosNFT,queryNftFromWasm} from "/src/keplr/uptick/wallet"

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'convert',
  components: { CreateNFT, ConvertCosmoss, Card, Popup },
  data() {
    return {
      wasmClick:false,
      nativeClick:false,
      evmClick:false,
      list: [],
      nftIdValue:'',
      isShowLoading: false,
      isShowCreate: true,
      selectItem: {},
      popupVisible: false,
      nftAddressValue:'',
      evmAddress: "",
      chainType: "1170",
      uptickAddress:'',
      isShowChainList:false,
      currentSelect:'Wasm',
      chainList: [
        {
          text: "Cosmos Native",
          id: 0,
      
        },
        {
          text: "EVM",
          id: 1,
  
        },
        {
          text: "WASM",
          id: 2,
  
        },
      ],
      histroyList:[]
    }
  },
  filters: {

  },
  async mounted() { 
    let uptickAddress = this.$store.state.UptickAddress
    this.uptickAddress = uptickAddress
    this.evmAddress = getEvmAddress(uptickAddress)
    console.log(uptickAddress)
    if (uptickAddress == "") {
      this.$router.push({ name: "Home" });
      return
    }

  },
  methods: {
   async wasmToNative(){

     let hash = await convertWasmNFT2NFT(this.nftAddressValue,this.nftIdValue)
     if(hash){
          this.$mtip({
               title:hash,
          });
     }

    },
   async NativeToEvm(){

      let NativeToEvmResult =  await convertCosmosNFT2ERC(this.nftAddressValue,this.nftIdValue)
      this.EvmcontractAddress = NativeToEvmResult.evmNftAddress
      this.EvmtokenId = NativeToEvmResult.evmNftId
         let text = 'Evm contarctAddress :'+ this.EvmcontractAddress +'Evm TokenId :'+ this.EvmtokenId
         this.$mtip({
               title:text,
          });
    },
      async EvmToNative(){
  
       let result = await convertERC2CosmosNFT(this.nftAddressValue,this.nftIdValue) 
         
       const {uptickNftAddress,uptickNftId} = result
       let text = 'Uptick contarctAddress :'+uptickNftAddress +'Uptick TokenId :'+uptickNftId
         this.$mtip({
               title:text,
          });

    },
   async NativeToWasm(){
    let hash =   await convertNFT2Wasm(this.nftAddressValue,this.nftIdValue)
     if(hash){
          this.$mtip({
               title:hash,
          });
     }
   },
  async searchNft(){
         this.wasmClick = true
     this.nativeClick = false
     this.evmClick = false
    let result = await queryNftFromWasm();
     this.histroyList = result
   },
  async searchNativeNft(){
           this.wasmClick = false
     this.nativeClick = true
     this.evmClick = false
    //https://rest.origin.uptick.network/uptick/collection/nfts/uptick14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s59l95g/wasm006
      // window.open('http://47.242.107.228:1317/uptick/collection/nfts?owner='+ this.uptickAddress,'_blank')
      let params = {
        owner:this.uptickAddress
      }
      await searchNativeNfts(params)
  },
  async searchEvmNft(){
    this.wasmClick = false
     this.nativeClick = false
     this.evmClick = true
 let result = await balanceOf(this.nftAddressValue,this.nftIdValue);
 console.log("result",parseInt(result,16));
 let text = '当前资产所在账户'+result
  this.$mtip({
               title:text,
        });

  },

    
    showChain() {
      this.isShowChainList = !this.isShowChainList;
    },
    clickChain(item){
      this.currentSelect = item.text
      this.isShowChainList =false
      
  },
    disconnect() {
      localStorage.clear();
      this.$store.commit("SET_DID", "");
      this.$store.commit("SET_UPTICK_DID", "");
      this.$router.push({ name: "Home" });
    },
    async reladData() {
      console.log("reloadData")
      await this.getMyList();
    },
    submitPopup() {
      this.$router.push({ name: "cosmos" });
    },
    crossShowPop() {
      this.popupVisible = true
    },
    crossHidePop() {
      this.popupVisible = false
    },
    showPopup() {
      this.popupVisible = true;
    },
    switchButton() {
    
      // this.$router.push({ name: "cosmos" });
    },
 
   async wasmCreate(){
    let res = await WasmNftMint();

      console.log("wasmCreate",res);
    },

    onClickItem(item) {
      console.log(item)
      this.isShowCreate = false
      this.selectItem = item
    },
    showCreate() {
      this.selectItem = {}
      this.isShowCreate = true
    },
    async getMyList(selectChain) {
      // debugger
      console.log(selectChain)
      this.isShowLoading = true;
      let params = {
        //this.$store.state.uptickAddress,this.$store.state.IrisAddress
        owner: this.evmAddress,
        chainType: this.chainType,
        // type:this.filterList[this.filterIndex].id
      };

      let listInfo = await getMyCardList(
        params
      );
      this.list = listInfo.data.list;
      if (this.list.length > 0) {
        this.isShowCreate = false
        this.selectItem = this.list[0]
      } else {
        this.isShowCreate = true
      }
      this.isShowLoading = false;
      console.log("ssss", this.list);
    },
    loadeImageUrl(hash) {
      return getNftImg(hash)
    },

  },

}

</script>
<style lang='scss' scoped>
.Home {
  // background-color: green;
  // width: 100%;
  // height: 100px;
  position: relative;

}

.hearder {
  background-color: #1e0826;
  height: 75px;
  margin: auto 0;

  .Title {
    // padding-top: 10px;
    font-family: AvenirNext-Bold;
    font-size: 32px;
    font-weight: bold;
    font-stretch: normal;
    // line-height: 30px;
    // letter-spacing: 0px;
    color: #ffffff;

    span {
      color: #ed0091;
    }
  }

  .address {
    font-family: AvenirNext-Regular;
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    line-height: 20px;
    letter-spacing: 0px;
    color: #ffffff;
  }

  .disconnect {
    width: 98px;
    height: 31px;
    border-radius: 15px;
    border: solid 1px #ed0091;
    font-family: AvenirNext-Bold;
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    line-height: 20px;
    letter-spacing: 0px;
    color: #ffffff;
  }
}

.content {
  // background-color: #ffffff;
  height: 811px;

  .left {
    

    position: relative;
    // background-color: #ed0091;
    height: 100%;
    width: 40%;
     .createNft{
         width: 450px;
    height: 100%;
    background-color: #1e0826;
      }

    .top {
      height: 50px;
      // background-color: green;
      width: 100%;
      position: absolute;
      left: 0;
      right: 0;
     

      .leftButton {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 200px;
        height: 31px;
        border-radius: 15px;
        border: solid 1px #ed0091;
        font-family: AvenirNext-Bold !important;
        font-size: 11px;
        font-weight: normal;
        font-stretch: normal;
        letter-spacing: 0px;
        color: #ffffff;
        cursor: pointer;

      }
       .chainList {
    position: absolute;
    top: 45px;
    left: 5px;
    width: 190px;
    height: 115px;
    background-color: #ffffff;
    border-radius: 5px;
    z-index: 200;

    .list {
      margin: 15px 0px 20px 20px;

      .name {
        cursor: pointer;
        font-family: "AmpleSoft" !important;
        font-size: 15px !important;
        font-weight: normal;
        font-stretch: normal;
        line-height: 15px;
        letter-spacing: 0px;
        color: #fb599b;
      }
    }
  }
      .create {
        margin-right: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 111px;
        height: 31px;
        background-color: #ed0091;
        border-radius: 15px;
        font-family: AvenirNext-Bold !important;
        font-size: 11px;
        font-weight: normal;
        font-stretch: normal;
        letter-spacing: 0px;
        color: #ffffff;
        cursor: pointer;

      }
    }
  }

  .list {
    margin-top: 60px;
    // background-color: yellow;
    // position: relative;

    .Cardlist {
      height: 751px;
      overflow-y: auto;

      .listitem {
        width: calc(20% - 10px);
        // height: 125px;
        padding: 10px;
      }
    }

    
  }

  .right {
    width:50%;
    .content{
      width: 100%;
      height:300px;
      background-color: #ffffff;
      .title-20{
        font-family: AvenirNext-Medium;
	font-size: 15px;
	font-weight: normal;
	font-stretch: normal;
	line-height: 20px;
	letter-spacing: 0px;
	color: #766983;
      }
    }
    .btn1{
      width: 125px;
      height: 39px;
      background-color: #9530fd;
      border-radius: 19px;
      font-family: Helvetica;
      font-size: 13px;
      font-weight: bold;
      font-stretch: normal;
      line-height: 15px;
      letter-spacing: 0px;
      color: #ffffff;
    }
       .btn {
         
          font-family:Helvetica;
          font-size: 18px;
          font-weight: bold;
          font-stretch: normal;
          line-height: 45px;
          letter-spacing: 0px;
          color: #ffffff;
          cursor:pointer;
        }
        .btn2 {
          height: 40px;
    border-bottom: 2px solid #ffffff;

          font-family:Helvetica;
          font-size: 18px;
          font-weight: bold;
          font-stretch: normal;
      
          letter-spacing: 0px;
          color: #ffffff;
          cursor:pointer;
 
        }
      
    .title-20{
      width:90px;
      font-family: Helvetica;
	font-size: 15px;
	font-weight: normal;
	font-stretch: normal;
	line-height: 20px;
	letter-spacing: 0px;
	color: #ffffff;
    }
   .textInput {
         width: 80%;
        height: 44px;
        font-family: AvenirNext-Regular;
        font-size: 15px;
        font-weight: normal;
        font-stretch: normal;
        padding-left: 10px;
        padding-right: 10px;
        background-image: linear-gradient(#e8daff,
                #e8daff),
            linear-gradient(#a17ae0,
                #a17ae0);
        background-blend-mode: normal,
            normal;
        border-radius: 5px;
    }
    .histroyList{
      margin-top: 15px;
      width: 100%;
      height: 250px;
      background-color: black;
      border-radius: 10px;
      .empty {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "AvenirNext-Regular" !important;
      color: #ffffff;
    }
    .nftList{
      width: 100%;
      .item{
        width: 100%;
        height: 40px;
        align-items: center;
        border-bottom: 1px solid #ffffff;
        .nftaddtrss{
          width: 30%;
          color: #ffffff;
          font-size:13px;
          font-family: Helvetica;
          text-align: center;
        }
        .nftid{
           width: 70%;
           color: #ffffff;
           font-size:13px;
              font-family: Helvetica;
              text-align: center;

        }
       

      }
     
    }
    .title{
      width: 100%;
        font-family: Helvetica;
      font-size: 14px;
      align-items: center;
      height: 40px;
      font-weight: normal;
      font-stretch: normal;
      line-height: 20px;
      letter-spacing: 0px;
      color: #ffffff;
      border-bottom: 1px solid #ffffff;
      .s1{
        width:30%;
        text-align: center;
      

      }
      .s2{
            width:70%;
            text-align: center;

      }
    }
    }
  }

  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }

}
</style>