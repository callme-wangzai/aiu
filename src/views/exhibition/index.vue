<template>
  <div class="product-container">
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
      :edit-config="{trigger: 'click', mode: 'cell'}"
    >
      <vxe-column type="checkbox" width="60"></vxe-column>
      <vxe-table-column title="名称" field="name" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="key" field="key" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="图片尺寸" field="">
        <template #default="{ row }">
          <div v-if="row.key=='about_us'">1860*任意</div>
          <div v-if="row.key=='course_list'">595*500</div>
          <div v-if="row.key=='intelligent_data'">1920*任意</div>
          <div v-if="row.key=='main_carouselFigure'">1920*1080</div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="value" field="value" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="轮播图" field="pictures">
        <template #default="{ row }">
          <div v-for="item,index of row.pictures" :key="index" class="flex">
            <div>{{item.fileName}}</div>
            <div class="link" @click="carouseDel(row,index)">删除</div>
          </div>
          <div class="link" @click="editImg('pictures',row,row.pictures?row.pictures.length:0)">添加</div>
        </template>
      </vxe-table-column>
    </vxe-table>

    <!-- 选择图片 -->
    <ModalFile @selectFile="selectImg" @closeModal="closeModal" :fileType="1" :multi="false" v-if="imgModal" :modal="imgModal"></ModalFile>
    
  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted } from "vue";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import XEUtils from "xe-utils";
import { templateRef } from "@vueuse/core";
import ModalFile from './components/ModalFile.vue'
import { http } from "../../utils/http";
import { genConfig } from "/@/utils/http/config";
import {
  VXETable,
  VxeTableInstance,
  VxeTableEvents,
  VxeFormPropTypes
} from "vxe-table";

export default {
  name: "product",
  
  components: {
    ModalFile
  },
  setup() {
    const router = useRouter();
    const dictData = reactive({
      fileType:1,//1图片 2视频
      submitLoading: false,
      imgModal: false,
      videoModal:false,
      selectRow: null,
      selectType: null,
      selectIndex: null,
      tableData: [
      ],
      loading:false,
      tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      }
    });

    const xTree = templateRef<HTMLElement | any>("xTree", null);
    const modal = templateRef<HTMLElement | any>("modal", null);
    const formatDate = (value: any) => {
      return XEUtils.toDateString(value, "yyyy-MM-dd HH:mm:ss.S");
    };

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
      http.request("post", `${genConfig().apiURL}/rest/api/display/v1/batch/delete`,ids)
      .then(res=>{
        if(res.code==0){
            VXETable.modal.message({ content: res.msg, status: "success" })
            initData()
          }else{
            VXETable.modal.message({ content: res.msg , status: "warning" })
          }
      })
      .catch(err=>{})
    };

    // 新增
    function onAdd() {
      const $table = xTree.value;
      $table.insert(
          {
            id: 0,
            key : "",
            name : "",
            pictures : [ 
              // {
              //   fileName : "",
              //   filePath : "",
              //   id : 0
              // } 
            ],
            value : ""
          }
      );
    }

    //保存å
    function onSave(){
      const $table = xTree.value;
      const selectRecords = $table.getCheckboxRecords()
      if(selectRecords.length===0){
        VXETable.modal.message({ content: "请勾选数据", status: "success" })
        return
      }
      let list1 = []
      let list2 = []
      for(let item of selectRecords){
        if(item.id&&item.id!==0){
          list2.push(item)//修改
        }else{
          list1.push(item)//新增
        }
      }
      if(list1.length>0){
        http.request("post", `${genConfig().apiURL}/rest/api/display/v1/batch/add`,list1)
        .then(res=>{
          if(res.code==0){
            VXETable.modal.message({ content: res.msg, status: "success" })
            initData()
          }else{
            VXETable.modal.message({ content: res.msg , status: "warning" })
          }
        })
        .catch(err=>{})
      }
      if(list2.length>0){
        http.request("post", `${genConfig().apiURL}/rest/api/display/v1/batch/modify`,list2)
        .then(res=>{
          if(res.code==0){
            VXETable.modal.message({ content: res.msg, status: "success" })
            initData()
          }else{
            VXETable.modal.message({ content: res.msg , status: "warning" })
          }
        })
        .catch(err=>{})
      }
      
    }

    // 编辑主图片
    function editImg(type,row,index){
      dictData.selectRow = row 
      dictData.selectType = type 
      dictData.selectIndex = index

      dictData.imgModal = true;
    }
    function carouseDel(row,index){
      row.pictures.splice(index,1)
    }
    const selectImg = (data) =>{
      dictData.imgModal = false;
      if(!dictData.selectRow[dictData.selectType]){
        dictData.selectRow[dictData.selectType]=[]
      }
      dictData.selectRow[dictData.selectType][dictData.selectIndex]={
          fileName:data[0].fileName,
          filePath:data[0].filePath,
          id:data[0].id
      }
    }

    const closeModal = ()=>{
      dictData.imgModal = false;
      dictData.videoModal = false;
    }

    const selectVideo = (data) =>{
      dictData.videoModal = false;
      // dictData.selectRow.videoName = data[0].fileName
      // dictData.selectRow.videoLink = data[0].filePath
      dictData.selectRow.video = data[0]
      console.log('selectImg',data)
    }

    function initData(){
      http.request("get", `${genConfig().apiURL}/rest/api/display/v1/list/all`
      )
      .then(res=>{
        dictData.tableData = res.data
      })
      .catch(err=>{})
    }
    function handlePageChange ({ currentPage, pageSize }) {
      dictData.tablePage.currentPage = currentPage
      dictData.tablePage.pageSize = pageSize
      initData()
    }
    onMounted(()=>{
      initData()
    })

    return {
      ...toRefs(dictData),
      formatDate,
      onDelete,
      editImg,
      onAdd,
      onSave,
      selectImg,
      closeModal,
      selectVideo,
      carouseDel,
      handlePageChange
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
</style>
