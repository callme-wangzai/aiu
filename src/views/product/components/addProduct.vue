<template>
  <div class="addProduct-container">
    <vxe-form :data="formData" @submit="searchEvent" @reset="resetEvent">
        <vxe-form-item title="产品名称" span="8" field="name" :item-render="{}">
            <template #default="{ data }">
            <vxe-input v-model="data.name" placeholder="请输入名称" clearable></vxe-input>
            </template>
        </vxe-form-item>
        <vxe-form-item title="标题" span="8" field="title">
            <template #default="{ data }">
            <vxe-input v-model="data.title" placeholder="请输入标题"></vxe-input>
            </template>
        </vxe-form-item>
        <vxe-form-item title="商品链接" span="8" field="shopLink" >
            <template #default="{ data }">
                <vxe-input v-model="data.shopLink" placeholder="请输入地址"></vxe-input>
            </template>
        </vxe-form-item>
        <vxe-form-item title="商品链接" span="24" field="shopLink">
            <template #default="{ data }">
                <vxe-input v-model="data.shopLink" placeholder="请输入地址"></vxe-input>
            </template>
        </vxe-form-item>
        <vxe-form-item align="center" span="24" :item-render="{}">
            <template #default>
                <vxe-button type="submit" @submit="searchEvent" status="primary" >提交</vxe-button>
                <vxe-button type="reset" @reset="resetEvent">取消</vxe-button>
            </template>
        </vxe-form-item>
    </vxe-form>
  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs } from "vue";
import axios from 'axios';
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import XEUtils from "xe-utils";
import { templateRef } from "@vueuse/core";
import {
  VXETable,
  VxeTableInstance,
  VxeTableEvents,
  VxeFormPropTypes
} from "vxe-table";

export default {
  name: "addProduct",
  components: {
  
  },
  setup() {
    const router = useRouter();
    const dictData = reactive({
        formData: {
            name: '',
            title:'',
            picList: [],
            video: '',
            shopLink:'',
            
        }
    
    })

    function searchEvent() {
        let obj = dictData.formData
        // axios.post('https://web.rongxinvip.com/weixin/add',obj).then(res=>{
            
        // })
        // .catch(err=>{

        // })
        VXETable.modal.message({ content: "查询事件", status: "info" })
    }
    function resetEvent () {
        router.go(-1)
        VXETable.modal.message({ message: "重置事件", status: "info" })
    }
    return {
      ...toRefs(dictData),
      searchEvent,
      resetEvent
    };
  }
};
</script>
<style lang="scss" scoped>
.addProduct-container {
  margin: 10px;
}
.vxe-input + .vxe-button,
.vxe-input + .vxe-button--dropdown,
.vxe-button + .vxe-button,
.vxe-button + .vxe-button--dropdown {
  margin-left: 0;
}
.vxe-button.type--button:not(.is--round) {
  border-radius: 0;
}
.vxe-button.size--medium.type--button {
  margin-right: 0.07em;
}
.text-model {
  &:hover {
    cursor: pointer;
  }
}
</style>
