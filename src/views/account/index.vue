<template>
  <div class="account-container">
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
      <vxe-table-column title="用户名" field="username" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="密码(默认不展示)" field="password" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="手机" field="phone" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="备注" field="remark" :edit-render="{name: 'input', attrs: {type: 'text'}}">
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

  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted } from "vue";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import { templateRef } from "@vueuse/core";
import { http } from "/@/utils/http";
import { storageSession } from "/@/utils/storage";
import {
  VXETable
} from "vxe-table";

export default {
  name: "account",
  
  components: {
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

    let usename = storageSession.getItem("info")?.username;

    const onDelete = async () => {
      if(usename!=='admin'){
        VXETable.modal.message({ content: "admin账户才有权限进行该操作", status: "warning" })
        return
      }
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
      http.request("post", "/rest/api/user/v1/batch/delete",ids)
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
      if(usename!=='admin'){
        VXETable.modal.message({ content: "admin账户才有权限进行该操作", status: "warning" })
        return
      }
      const $table = xTree.value;
      $table.insert({
            id: 0,
            username: "",
            password:'',
            phone: "",
            remark:'',
            status:0
          },);
    }

    //保存å
    function onSave(){
      if(usename!=='admin'){
        VXETable.modal.message({ content: "admin账户才有权限进行该操作", status: "warning" })
        return
      }
      const $table = xTree.value;
      const selectRecords = $table.getCheckboxRecords()
      if(selectRecords.length===0){
        VXETable.modal.message({ content: "请勾选数据", status: "warning" })
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
        http.request("post", "/rest/api/user/v1/bach/add",list1)
        .then(res=>{
          console.log('res',res)
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
        http.request("post", "/rest/api/user/v1/batch/modify",list2)
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
    // 编辑视频地址
    function editVideo(type,row){
      dictData.selectRow = row 
      dictData.selectType = type 
      
      dictData.videoModal = true;
    }
    function carouseDel(row,index){
      row.carouselFigure.splice(index,1)
    }
    const selectImg = (data) =>{
      dictData.imgModal = false;
      if(dictData.selectRow[dictData.selectType][dictData.selectIndex]===undefined){
        dictData.selectRow[dictData.selectType][dictData.selectIndex]={
          fileName:data[0].fileName,
          filePath:data[0].filePath,
          id:data[0].id
        }
      }else{     
        dictData.selectRow[dictData.selectType][dictData.selectIndex].fileName = data[0].fileName
        dictData.selectRow[dictData.selectType][dictData.selectIndex].filePath = data[0].filePath
        dictData.selectRow[dictData.selectType][dictData.selectIndex].id = data[0].id
      }
      console.log('selectImg',data)
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
      http.request("post", "/rest/api/user/v1/list",
      {
        // pageSize:dictData.tablePage.pageSize,
        // pageNum:dictData.tablePage.currentPage

      }
      )
      .then(res=>{
        dictData.tableData = res.data.list
        dictData.tablePage.totalResult = res.data.total
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
      onDelete,
      editImg,
      editVideo,
      onAdd,
      onSave,
      selectImg,
      closeModal,
      selectVideo,
      carouseDel,
      handlePageChange,
      usename
    };
  }
};
</script>
<style lang="scss" scoped>
.account-container {
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
