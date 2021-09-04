<template>
  <div class="ModalFile-container">
        <!-- 列表 -->
    <vxe-modal
      resize
      width="70%"
      v-model="modal"
      :title="fileType===1?'选择图片':'选择视频'"
      :loading="submitLoading"
      @close="closeModal"
    >
    <vxe-table
      ref="fileGrid"
      border
      resizable
      :data="tableData"
      :edit-config="{trigger: 'click', mode: 'cell'}"
    >
      <vxe-column type="checkbox" width="60">
      </vxe-column>
      <vxe-table-column title="文件名称" field="name">
      </vxe-table-column>
      <vxe-table-column title="描述" field="description">
      </vxe-table-column>
      <vxe-table-column title="预览" field="mainImg">
        <template #default="{ row }">
          <img class="img" :src="row.mainImg" alt="">
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
import {
  VXETable,
  VxeTableInstance,
  VxeTableEvents,
  VxeFormPropTypes
} from "vxe-table";

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
      formData: {
        name: "",
        model: ""
      },
      tablePage1: {
                currentPage: 1,
                pageSize: 10,
                totalResult: 33
              }
    });

    const fileGrid = templateRef<HTMLElement | any>("fileGrid", null);

    function initData(){
      console.log('initData')
      // axios.get('').then(res=>{})
      setTimeout(()=>{
        fileData.tableData=[
          {
            id: "1-1",
            name: "筋膜枪",
            title:'',
            description: "serviceStatus",
            mainImg:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
              
          },
          {
            id: "1-2",
            name: "跳绳",
            title:'',
            description: "onlienStatus",
            mainImg:''

          },
          { 
            id: 2, 
            name: "体脂秤", 
            title:'',
            description: "operatingSystem" ,
            mainImg:''
          }
        ]
        // fileData.submitLoading = false;  
        // const $table = fileGrid.value; 
        // debugger
        // $table.loadData(fileData.tableData)
      },1000)
    }
    function handlePageChange1 ({ currentPage, pageSize }) {
      fileData.tablePage1.currentPage = currentPage
      fileData.tablePage1.pageSize = pageSize
      initData()
    }
    onMounted(()=>{
      initData()
    })

    return {
      ...toRefs(fileData),
      submit,
      closeModal,
      handlePageChange1
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
  // width: 100px;
  height: 80px;
}
.flex{
  // display:flex;
  text-align: center;
}
</style>
