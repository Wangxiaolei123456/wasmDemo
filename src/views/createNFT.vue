<template>
    <div class="d-flex flex-column justify-space-center align-center">  
          <div class="create d-flex flex-row justify-space-center align-center">
            <div class="addButton" @click="chooseFile" v-on:dragover.prevent v-on:drop="onDrop">
                <input type="file" accept="image/*" ref="fileInput" style="display: none;" @change="uploadFile">
                <img v-if="uploadedImageHash == ''" class="addImage"
                    :src="loadeImageUrl('QmVCQFds8badbodqRDJ7d2H5pg7gbMutmM5ShMb9FNppWH')">
                <img class="uploadImage" :src="loadeImageUrl(uploadedImageHash)" v-if="uploadedImageHash != ''">
            </div>

        </div> 
        <div class="name mt-6">
            <div class="d-flex flex-row justify-space-between">
                  <div class="title">TokenId <span class="star">*</span></div>
                <div class="title" style="text-align: right;">{{ nameValue.length }}/80</div>
            </div>
            <input class="textInput" type="text" placeholder="Token ID" v-model="nameValue" maxlength="80">
        </div>
        <div class="description mt-6">
            <div class="d-flex flex-row justify-space-between">
                  <div class="title">Token uri</div>
                <div class="title" style="text-align: right;">{{ descriptionValue.length }}/800</div>
            </div>
           
            <textarea class="descriptionText" placeholder="Token uri" v-model="descriptionValue"
                maxlength="800"></textarea>
        </div>
        <div style="width: 90%;">
            <button class="subBtn" @click="submitButton" :disabled="isInputEmpty">Create NFT</button>
        </div>                                                       
        <loading :isShowLoading="isShowLoading"></loading>
        <uComponents ref="ucom"></uComponents>
    </div>
</template>

<script>

import { uploadImage, getNftImg } from "/src/api/image"
import Loading from "@/components/loading.vue";
import { keplrKeystoreChange } from "/src/keplr/index";
import { uploadJsonData, requestCreateNFT } from "/src/api/home"
import { deployContract, mintNft } from "/src/metaMask/evm/handler/uptick721.js"
import { getTokenId } from "/src/utils/helper.js"
import { getEvmAddress,WasmNftMint } from "/src/keplr/uptick/wallet.js"


// import { issueDenomAndMint } from "/src/keplr/iris/wallet"
//  const Web3 = require('web3');

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Create',
    inheritAttrs: false,
    components: { Loading },
    props: {
        imgUrl: String,
        name: String,
        NFTInfo: Object
    },
    data() {
        return {
            uploadedImageHash: '',//默认的图片,
            nameValue: '',// 初始化输入框的值为空
            descriptionValue: 'http://ipfs.upticknft.com/ipfs',
            isInputEmpty: true,
            isShowLoading: false,
            sender: '',
        }
    },
    filters: {

    },
     watch: {

        nameValue: 'checkInput',
        
    },
    async mounted() {

        this.sender = this.$store.state.UptickAddress

        console.log(this.sender)
        // debugger
        window.addEventListener("keplr_keystorechange", keplrKeystoreChange);
    },
   
    methods: {
         onDrop(event) {
            debugger
            event.preventDefault(); // 阻止浏览器默认的拖动行为
            const file = event.dataTransfer.files[0]; // 获取上传的文件
            this.requestUploadFile(file)
        },
         chooseFile() {
            this.$refs.fileInput.click()
        },
        async uploadFile(event) {
            console.log(event)
            const file = event.target.files[0]
            console.log(file)
            if (!file) { return }
            this.requestUploadFile(file)
        },
        async requestUploadFile(file) {
            const formData = new FormData()
            formData.append('file', file)
            this.isShowLoading = true
            try {
                const value = await uploadImage(file);
                this.isShowLoading = false
                console.log(value.data.data);
                this.uploadedImageHash = value.data.data
            } catch (error) {
                console.error(error);
                this.isShowLoading = false
            }
        },
        loadeImageUrl(hash) {
            return getNftImg(hash)
        },
     

        keplrKeystoreChange() {
            keplrKeystoreChange();
        },
        checkInput() {
            debugger
            this.isInputEmpty =
                this.nameValue.trim() === '' 
            console.log(this.isInputEmpty)
        },
       
      
        async submitButton() {

            try {
                console.log(this.nameValue)
                this.isShowLoading = true
                let result = await WasmNftMint(this.nameValue,this.descriptionValue)
                if(result){
                    this.$mtip({
                    title:result,
                });
                  this.isShowLoading = false
                }else{
                     this.$mtip({
                    title:result,
                });
                     this.isShowLoading = false
                }

              
            } catch (error) {
                console.log(error);
                // debugger
                this.isShowLoading = false
                this.$mtip({
                    title: error.message,
                });
            }
        },
    },

}

</script>
<style lang='scss' scoped>
.star {
  color: red;
  font-size: 18px;
  font-family: "宋体";
  margin-left: 10px;
}
.title {

    width: 100%;
	font-family: "AvenirNext-Regular" !important;
    font-size: 15px !important;
    font-weight: normal;
    font-stretch: normal;
    color: #ffffff;
}

.create {
    width: 100%;

    .addButton {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #401b45;
        background-position: center;
        height: 270px;
        width: 100%;
        position: relative;

        input {
            position: absolute;
            // top: 10px;
            // left: 10px;
            background-color: green;
            width: 100%;
            height: 100%;
            opacity: 0.0;
        }

        .addImage {
            // background-image: url('/src/assets/icon_addimage.png');
            background-size: 100px;
            height: 90px;
            width: 100px;
        }

        .uploadImage {
            height: 100%;
            width: 100%;
            object-fit: contain;

            // background-color: green;

        }
    }
}

.name {
    width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;

    // background-color: green;
    .textInput {
        // width: 100%;
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
}


.description {
    width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;

    .descriptionText {
        resize: none;
        padding-left: 10px;
        padding-right: 10px;
        font-family: AvenirNext-Regular;
        font-size: 15px;
        font-weight: normal;
        font-stretch: normal;
        /* width: 325px; */
        width: 100%;
        height: 119px;
        background-image: linear-gradient(#e8daff,
                #e8daff),
            linear-gradient(#a17ae0,
                #a17ae0);
        background-blend-mode: normal,
            normal;
        border-radius: 5px;
    }
}


.subBtn {
    margin-top: 25px;
    // margin-bottom: 20px;
    width: 100%;
    height: 41px;
    background-color: #fb599b;
    border-radius: 20px;

    font-family: AmpleSoft-Bold !important;
    font-size: 15px !important;
    font-weight: normal;
    font-stretch: normal;
    letter-spacing: 0px;
    color: #ffffff;
    cursor: pointer;

}


.subBtn:disabled {
    background-color: gray;
}
</style>