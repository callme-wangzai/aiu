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
      <vxe-table-column title="商品名称" field="name" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="标题" field="title" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="描述" field="desc" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="商城链接" field="mallLink" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="首页顺序" field="sortForHome" sortable :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="智能硬件顺序" field="sortForMenu3" sortable :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="主图片" field="files">
        <template #default="{ row }">
          <div class="flex">
            <div>
              <span class="link" @click="editImg('files',row,0)" v-if="row.files[0]&&row.files[0].fileName!==''">
                {{row.files[0]?row.files[0].fileName:''}}
              </span>
              <span class="link" @click="editImg('files',row,0)" v-else>请选择</span>
              
            </div>
          </div>
          <div class="flex">
            <div>
              <span class="link" @click="editImg('files',row,1)" v-if="row.files[1]&&row.files[1].fileName!==''">{{row.files[1]?row.files[1].fileName:''}}</span>
              <span class="link" @click="editImg('files',row,1)" v-else>请选择</span>
            </div>
            <!-- <vxe-button type="text" icon="el-icon-edit" @click="editImg(row.files[1])"
            ></vxe-button> -->
          </div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="轮播图" field="carouselFigure">
        <template #default="{ row }">
          <div v-for="item,index of row.carouselFigure" :key="index" class="flex">
            <div>{{item.fileName}}</div>
            <div class="link" @click="carouseDel(row,index)">删除</div>
          </div>
          <div class="link" @click="editImg('carouselFigure',row,row.carouselFigure.length)">添加</div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="视频" field="videoName">
        <template #default="{ row }">
          <div v-if="row.videoName && row.videoName!==''" @click="editVideo('videoName',row)" class="link" >
            {{row.videoName}}
          </div>
          <div v-else @click="editVideo('videoName',row)" class="link" >
            请选择
          </div>
        </template>
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

    <!-- 选择图片 -->
    <ModalFile @selectFile="selectImg" @closeModal="closeModal" :fileType="1" :multi="false" v-if="imgModal" :modal="imgModal"></ModalFile>
    <!-- 选择视频 -->
    <ModalFile @selectFile="selectVideo" @closeModal="closeModal" :fileType="2" :multi="false" v-if="videoModal" :modal="videoModal"></ModalFile>

    
  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted } from "vue";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import XEUtils from "xe-utils";
import { templateRef } from "@vueuse/core";
import ModalFile from './components/ModalFile.vue'
import { http } from "../../utils/http";
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
      http.request("post", "http://47.106.86.150:8082/rest/api/product/v1/batch/delete",ids)
      .then(res=>{
        console.log('res',res)
        initData()
      })
      .catch(err=>{})
    };

    // 新增
    function onAdd() {
      const $table = xTree.value;
      $table.insert({
            id: 0,
            name: "",
            title:'',
            desc: "",
            mallLink:'',
            sortForHome:'',
            sortForMenu3:'',
            files:[],
            carouselFigure:[],
            videoName:'',
            videoLink:''
          },);
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
        http.request("post", "http://47.106.86.150:8082/rest/api/product/v1/batch/add",list1)
        .then(res=>{
          console.log('res',res)
          initData()
        })
        .catch(err=>{})
      }
      if(list2.length>0){
        http.request("post", "http://47.106.86.150:8082/rest/api/product/v1/batch/modify",list2)
        .then(res=>{
          console.log('res',res)
          initData()
        })
        .catch(err=>{})
      }
      
    }

    // 编辑主图片
    function editImg(type,row,index){
      console.log('row',row)
      console.log('type',type)
      console.log('index',index)
      console.log(row[type][index])
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
      dictData.selectRow.videoName = data[0].fileName
      dictData.selectRow.videoLink = data[0].filePath
      console.log('selectImg',data)
    }

    function initData(){
      http.request("post", "http://47.106.86.150:8082/rest/api/product/v1/query/list",
      {
        pageSize:dictData.tablePage.pageSize,
        pageNum:dictData.tablePage.currentPage
        
      }
      )
      .then(res=>{
        dictData.tableData = res.data.list
        dictData.tablePage.totalResult = res.data.total
      })
      .catch(err=>{})
      // setTimeout(()=>{
      //   dictData.tableData=[
      //     {
      //       id: "1-1",
      //       name: "筋膜枪",
      //       title:'',
      //       desc: "serviceStatus",
      //       mallLink:'',
      //       sortForHome:'',
      //       sortForMenu3:'',
      //       files:[
      //         {
      //           name:'img1',
      //           url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
      //         },
      //         {
      //           name:'img2',
      //           url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
      //         }
      //       ],
      //       carouselFigure:[
      //         {
      //           name:'img1',
      //           url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
      //         },
      //         {
      //           name:'img2',
      //           url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
      //         }
      //       ],
      //       videoLink:'',
      //     },
      //     {
      //       id: "1-2",
      //       name: "跳绳",
      //       title:'',
      //       desc: "onlienStatus",
      //       mallLink:'',
      //       sortForHome:'',
      //       sortForMenu3:'',
      //       files:[],
      //       carouselFigure:[],
      //       videoLink:''
      //     },
      //     { 
      //       id: 2, 
      //       name: "体脂秤", 
      //       title:'',
      //       desc: "operatingSystem",
      //       mallLink:'',
      //       sortForHome:'',
      //       sortForMenu3:'',
      //       files:[],
      //       carouselFigure:[],
      //       videoLink:'' 
      //     }
      //   ]
      // },1000)
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
      editVideo,
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
