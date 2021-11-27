<template>
  <div class="product-container">
    <vxe-radio-group v-model="fileType">
      <vxe-radio-button :label="1" content="图片"></vxe-radio-button>
      <vxe-radio-button :label="2" content="视频"></vxe-radio-button>
    </vxe-radio-group>

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

    
    <!-- 工具栏 -->
    <vxe-toolbar>
      <template #buttons>
        <vxe-button status="primary" icon="fa fa-plus" @click="onAdd()">新增</vxe-button>
        <vxe-button status="primary" icon="fa fa-save" @click="onSave()">保存</vxe-button>
        <vxe-button status="primary" icon="fa fa-trash-o" @click="onDelete()">删除</vxe-button>
      </template>
    </vxe-toolbar>

    <!-- 列表 -->
    <vxe-table
      ref="xTree"
      border
      resizable
      :data="tableData"
      :loading="loading"
      :edit-config="{trigger: 'click', mode: 'cell'}"
    >
      <vxe-column type="checkbox" width="60"></vxe-column>
      <vxe-table-column title="文件名称" field="fileName" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="文件大小" field="fileSize">
        <template #default="{ row }">
          <div v-if="row.fileType=='1'">{{(row.fileSize/1024).toFixed(2)}} KB</div>
          <div v-else>{{(row.fileSize/(1024*1024)).toFixed(2)}} MB</div> 
        </template>
      </vxe-table-column>
      <vxe-table-column title="文件类型" field="fileType">
        <template #default="{ row }">
          <div v-if="row.fileType=='1'">图片</div>
          <div v-else>视频</div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="文件预览" field="filePath">
        <template #default="{ row }">
          <img v-if="row.fileType=='1'" class="img" @click="checkFile(row)" :src="SRCURL+row.filePath" alt="">
          <video v-else class="img" @click="checkFile(row)" :src="SRCURL+row.filePath" alt=""></video>
        </template>
      </vxe-table-column>
      <vxe-table-column title="链接地址" field="remark" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
    </vxe-table>
    <vxe-pager
      :loading="loading"
      :current-page="tablePage.currentPage"
      :page-size="tablePage.pageSize"
      :total="tablePage.totalResult"
      :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
      @page-change="handlePageChange">
    </vxe-pager>

    <!-- 上传图片 -->
    <addFile @closeModal="closeModal" @addSuccess="addSuccess" :fileType="fileType" v-if="imgModal" :modal="imgModal"></addFile>
    

  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted, watch } from "vue";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import XEUtils from "xe-utils";
import { templateRef } from "@vueuse/core";
import addFile from './components/AddFile.vue'
import { http } from "../../utils/http";
import { genConfig } from "../../utils/http/config";
import {
  VXETable,
  VxeTableInstance,
  VxeTableEvents,
  VxeFormPropTypes
} from "vxe-table";

export default {
  name: "product",
  
  components: {
    addFile
  },
  setup() {
    const dictData = reactive({
      fileType:1,//1图片 2视频
      submitLoading: false,
      imgModal: false,
      videoModal:false,
      selectRow: null,
      selectType: null,
      selectIndex: null,
      formData:{},
      tableData: [
      ],
      loading:false,
      tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      SRCURL:''
    });

    const xTree = templateRef<HTMLElement | any>("xTree", null);

    const onDelete = async () => {
      const $table = xTree.value;
      const selectRecords = $table.getCheckboxRecords()
      if(selectRecords.length===0){
        VXETable.modal.message({ content: "请勾选数据", status: "success" })
        return
      }

      const type = await VXETable.modal.confirm("您确定要删除吗？");
      if(await type!=='confirm')return
      let ids = selectRecords.map(item=>{
        return item.id
      })
      http.request("post", `${genConfig().apiURL}/rest/api/file/v1/batch/delete`,ids)
      .then(res=>{
        initData()
      })
      .catch(err=>{})
    };

    // 新增
    function onAdd() {
      dictData.imgModal = true;
    }

    //保存å
    function onSave(){
      const $table = xTree.value;
      const selectRecords = $table.getCheckboxRecords()
      if(selectRecords.length===0){
        VXETable.modal.message({ content: "请勾选数据", status: "success" })
        return
      }
      http.request("post", `${genConfig().apiURL}/rest/api/file/v1/batch/modify`,selectRecords)
      .then(res=>{
        console.log('res',res)
        initData()
      })
      .catch(err=>{})

      
    }

    const closeModal = ()=>{
      dictData.imgModal = false;
    }

    const addSuccess = () => {
      initData()
      dictData.imgModal = false;
    }

    const selectVideo = (data) =>{
      dictData.videoModal = false;
      dictData.selectRow.videoName = data[0].fileName
      dictData.selectRow.videoLink = data[0].filePath
      console.log('selectImg',data)
    }

    function initData(){
      dictData.loading = true;  
      http.request("post", `${genConfig().apiURL}/rest/api/file/v1/query/list`,
      {
        request:{
          fileType:dictData.fileType,
          fileName:dictData.formData.name
        },
        pageSize:dictData.tablePage.pageSize,
        pageNum:dictData.tablePage.currentPage
        
      }
      )
      .then(res=>{
        dictData.tableData = res.data.list
        dictData.tablePage.totalResult = res.data.total
        dictData.loading = false;  
      })
      .catch(err=>{})
    }
    
    watch(
      () => dictData.fileType,
      (count, prevCount) => {
        /* ... */
        initData()
      }
    )
    function checkFile(row){
      window.open(dictData.SRCURL+row.filePath)
    }

    function handlePageChange ({ currentPage, pageSize }) {
      dictData.tablePage.currentPage = currentPage
      dictData.tablePage.pageSize = pageSize
      initData()
    }
    function searchEvent(){
      initData()
    }
    function resetEvent(){
      dictData.formData.name = ''
      initData()
    }
    onMounted(()=>{
      dictData.SRCURL = genConfig().SRCURL
      initData()
    })

    return {
      ...toRefs(dictData),
      onDelete,
      onAdd,
      onSave,
      addSuccess,
      closeModal,
      selectVideo,
      handlePageChange,
      searchEvent,
      resetEvent,
      checkFile
    };
  }
};
</script>
<style lang="scss" scoped>
.product-container {
  margin: 10px;
}
.vxe-input + .vxe-button,
.vxe-input + .vxe-button--dropdown,
.vxe-button + .vxe-button,
.vxe-button + .vxe-button--dropdown {
  margin-left: 0;
}
.vxe-button.type--button:not(.is--round) {
  // border-radius: 0;
}
.vxe-button.size--medium.type--button {
  margin-right: 0.7em;
}
.text-model {
  &:hover {
    cursor: pointer;
  }
}
.flex{
  display:flex;
  justify-content: space-between;
}
.link{
  cursor: pointer;
  color: #409FFF;
}
.img{
  max-width: 200px;
  max-height: 200px;
  cursor:pointer;
}
</style>
