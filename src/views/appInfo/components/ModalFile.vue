<template>
  <div class="ModalFile-container">
        <!-- 列表 -->
    <vxe-modal
      resize
      width="70%"
      height="80%"
      v-model="modal"
      :title="fileType===1?'选择图片':'选择视频'"
      :loading="submitLoading"
      @close="closeModal"
    >
    <vxe-form :data="formData" @submit="searchEvent" @reset="resetEvent">
      <vxe-form-item title="名称" field="name" :item-render="{}">
        <template #default="{ data }">
          <vxe-input v-model="data.name" placeholder="请输入名称" clearable></vxe-input>
        </template>
      </vxe-form-item>
     
      <vxe-form-item>
        <template #default>
          <vxe-button type="submit" status="primary">搜索</vxe-button>
          <vxe-button type="reset" >重置</vxe-button>
        </template>
      </vxe-form-item>
    </vxe-form>

    <vxe-table
      ref="fileGrid"
      border
      resizable
      :data="tableData"
      :edit-config="{trigger: 'click', mode: 'cell'}"
    >
      <vxe-column type="checkbox" width="60">
      </vxe-column>
      <vxe-table-column title="文件名称" field="fileName">
      </vxe-table-column>
      <vxe-table-column title="描述" field="description">
      </vxe-table-column>
      <vxe-table-column title="预览" field="filePath">
        <template #default="{ row }">
          <!-- <img class="img" :src="SRCURL+row.filePath" alt=""> -->
          <img v-if="row.fileType=='1'" class="img" :src="SRCURL+row.filePath" alt="">
          <video v-else class="img" :src="SRCURL+row.filePath" alt=""></video>
        </template>
      </vxe-table-column>
    </vxe-table>
    <vxe-pager
          :loading="loading"
          :current-page="tablePage1.currentPage"
          :page-size="tablePage1.pageSize"
          :total="tablePage1.totalResult"
          :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
          @page-change="handlePageChange1">
        </vxe-pager>

    <div class="flex">
      <vxe-button status="primary" @click="submit()">确定</vxe-button>
    </div>
    
    <!-- <vxe-button @click="cancel()">取消</vxe-button> -->
    </vxe-modal>
  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted } from "vue";
import axios from 'axios';
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import XEUtils from "xe-utils";
import { templateRef } from "@vueuse/core";
import { http } from "../../../utils/http";
import {
  VXETable,
  VxeTableInstance,
  VxeTableEvents,
  VxeFormPropTypes
} from "vxe-table";
import { genConfig } from "../../../utils/http/config";
export default {
  name: "ModalFile",
  props: {
    fileType: Number,//1:图片；2:视频；
    multi:Boolean,//true：多选；false：单选
    modal: Boolean,//模态框展示与否
  },
  components: {
  
  },
  setup(props,ctx) {
    console.log('props',props)
    const submit = () =>{
      const $table = fileGrid.value;
      const selectRecords = $table.getCheckboxRecords()
      if(selectRecords.length===0){
        VXETable.modal.message({ content: "请勾选数据", status: "warning" })
        return
      }
      if(selectRecords.length>1 && !props.multi){
        VXETable.modal.message({ content: "请勿勾选多条数据", status: "warning" })
        return
      }
      ctx.emit('selectFile',selectRecords)
    }
    const closeModal = () => {
      ctx.emit('closeModal',[])
    }
    const fileData = reactive({
      submitLoading: false,
      showEdit: false,
      selectRow: null,
      filterName: "",
      loading:false,
      tableData: [
      ],
      tablePage1: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      SRCURL:'',
      formData:{},
    });

    const fileGrid = templateRef<HTMLElement | any>("fileGrid", null);

    function initData(){
      http.request("post", `${genConfig().apiURL}/rest/api/file/v1/query/list`,
      {
        request:{
          fileName:fileData.formData.name,
          fileType:props.fileType
        },
        pageSize:fileData.tablePage1.pageSize,
        pageNum:fileData.tablePage1.currentPage
        
      })
      .then(res=>{
        fileData.tableData = res.data.list
        fileData.tablePage1.totalResult = res.data.total
      })
      .catch(err=>{})
    }
    function handlePageChange1 ({ currentPage, pageSize }) {
      fileData.tablePage1.currentPage = currentPage
      fileData.tablePage1.pageSize = pageSize
      initData()
    }
    function searchEvent(){
      initData()
    }
    function resetEvent(){
      fileData.formData.name = ''
      initData()
    }
    onMounted(()=>{
      fileData.SRCURL = genConfig().SRCURL
      initData()
    })

    return {
      ...toRefs(fileData),
      submit,
      closeModal,
      handlePageChange1,
      searchEvent,
      resetEvent
    };
  }
};
</script>
<style lang="scss" scoped>
.ModalFile-container {
  margin: 10px;
}
.vxe-input + .vxe-button,
.vxe-input + .vxe-button--dropdown,
.vxe-button + .vxe-button,
.vxe-button + .vxe-button--dropdown {
  margin-left: 0;
}
// .vxe-button.type--button:not(.is--round) {
//   border-radius: 0;
// }
.vxe-button.size--medium.type--button {
  margin-right: 0.07em;
}
.text-model {
  &:hover {
    cursor: pointer;
  }
}
.img{
  max-width: 100px;
  max-height: 100px;
}
.flex{
  // display:flex;
  text-align: center;
}
</style>
