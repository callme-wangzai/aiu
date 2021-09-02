<template>
  <div class="product-container">
    <!-- 工具栏 -->
    <vxe-toolbar>
      <template #buttons>
        <vxe-button status="primary" icon="fa fa-plus" @click="onAdd()">新增</vxe-button>
        <vxe-button status="primary" icon="fa fa-save" @click="onSave()">保存</vxe-button>
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
      <vxe-table-column title="描述" field="des" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="商城链接" field="mallLink" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="首页顺序" field="sortForHome" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="智能硬件顺序" field="sortForMenu3" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="主图片" field="files">
        <template #default="{ row }">
          <div class="flex">
            <div>
              <span class="link" @click="editImg(row.files[0])" v-if="row.files[0]&&row.files[0].name!==''">
                {{row.files[0]?row.files[0].name:''}}
              </span>
              <span class="link" @click="editImg(row.files[0])" v-else>请选择</span>
              
            </div>
            <!-- <vxe-button type="text" icon="el-icon-edit" @click="editImg(row.files[0])"
            ></vxe-button> -->
          </div>
          <div class="flex">
            <div>
              <span class="link" @click="editImg(row.files[1])" v-if="row.files[1]&&row.files[1].name!==''">{{row.files[1]?row.files[1].name:''}}</span>
              <span class="link" @click="editImg(row.files[1])" v-else>请选择</span>
            </div>
            <!-- <vxe-button type="text" icon="el-icon-edit" @click="editImg(row.files[1])"
            ></vxe-button> -->
          </div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="轮播图" field="carouselFigure">
        <template #default="{ row }">
          <div class="flex">
            <div>
              <span class="link" @click="editImg(row.carouselFigure[0])" v-if="row.carouselFigure[0]&&row.carouselFigure[0].name!==''">
                {{row.carouselFigure[0]?row.carouselFigure[0].name:''}}
              </span>
              <span class="link" @click="editImg(row.carouselFigure[0])" v-else>请选择</span>
              
            </div>
          </div>
          <div class="flex">
            <div>
              <span class="link" @click="editImg(row.carouselFigure[1])" v-if="row.carouselFigure[1]&&row.carouselFigure[1].name!==''">{{row.carouselFigure[1]?row.carouselFigure[1].name:''}}</span>
              <span class="link" @click="editImg(row.carouselFigure[1])" v-else>请选择</span>
            </div>
          </div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="视频" field="videoLink">
        <template #default="{ row }">
          <div v-if="row.videoLink && row.videoLink!==''" @click="editVideo" class="link" >
            {{row.videoLink}}
          </div>
          <div v-else @click="editVideo" class="link" >
            请选择
          </div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="操作" width="100" fixed="right">
        <template #default="{ row }">
          <vxe-button type="text" icon="el-icon-delete" @click="confirmEvent(row)"
            >删除</vxe-button
          >
        </template>
      </vxe-table-column>
    </vxe-table>

    <!-- 选择图片 -->
    <vxe-modal
      resize
      width="450"
      v-model="showEdit"
      title="选择图片"
      :loading="submitLoading"
    >
      <template #default>
        <ModalFile ref="modal" @selectFile="selectImg" :fileType="1"></ModalFile>
      </template>
    </vxe-modal>

    <!-- 选择视频 -->
    <vxe-modal
      resize
      width="450"
      v-model="videoModal"
      title="选择视频"
      :loading="submitLoading"
    >
      <template #default>
        <ModalFile ref="modal" @selectFile="selectVideo" :fileType="2"></ModalFile>
      </template>
    </vxe-modal>

    
  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted } from "vue";
import { useRoute, useRouter, RouteLocationMatched } from "vue-router";
import XEUtils from "xe-utils";
import { templateRef } from "@vueuse/core";
import axios from 'axios';
import ModalFile from './components/ModalFile.vue'
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
      saveItem:'',
      showEdit: false,
      videoModal:false,
      selectRow: null,
      filterName: "",
      tableData: [
      ],
      formData: {
        name: "",
        model: ""
      }
    });

    const xTree = templateRef<HTMLElement | any>("xTree", null);
    const modal = templateRef<HTMLElement | any>("modal", null);
    const formatDate = (value: any) => {
      return XEUtils.toDateString(value, "yyyy-MM-dd HH:mm:ss.S");
    };

    const confirmEvent = async (row) => {
      const type = await VXETable.modal.confirm("您确定要删除吗？");
      if(await type!=='confirm')return
      let index:number
      for(let i=0 ; i < dictData.tableData.length;i++){
        if(dictData.tableData[i].id===row.id){
          index = i
        }
      }
      dictData.tableData.splice(index,1)
      setTimeout(() => {
        const $table = xTree.value;
        $table.loadData(dictData.tableData)
        VXETable.modal.message({ content: "删除成功", status: "success" })
        // initData()
      }, 500)
    };

    function commonFn(value, disabled) {
      dictData.selectRow = value;
      dictData.showEdit = true;
      // dictData.formItems[1].itemRender.props.disabled = disabled;
    }

    // 新增
    function onAdd() {
      // router.push("/product/addProduct")
      const $table = xTree.value;
      $table.insert({});
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
        if(item.id){
          list1.push(item)//修改
        }else{
          list2.push(item)//新增
        }
      }
      // let p1 = (url,params)=>{
      //   params = params || {};
      //   return new Promise((resolve,reject)=>{
      //       // axiso 自带 get 和 post 方法
      //       axios.get(url,{
      //           params,
      //       }).then(res=>{
      //           if(res.data.status===0){
      //               resolve(res.data);
      //           }else{
      //               alert(res.data.msg)
      //           }
      //       }).catch(error=>{
      //           alert('网络异常');
      //       })
      //   })
      // }
      // let p2 = (url,params)=>{
      //   params = params || {};
      //   return new Promise((resolve,reject)=>{
      //       // axiso 自带 get 和 post 方法
      //       axios.get(url,{
      //           params,
      //       }).then(res=>{
      //           if(res.data.status===0){
      //               resolve(res.data);
      //           }else{
      //               alert(res.data.msg)
      //           }
      //       }).catch(error=>{
      //           alert('网络异常');
      //       })
      //   })
      // }
      // Promise.all([p1('',list1), p2('',list2)]).then((result) => {
      //   console.log(result)               //['成功了', 'success']
      // }).catch((error) => {
      //   console.log(error)
      // })
      // axios.post('',list1).then(res=>{}).catch(err=>{})
      // axios.post('',list1).then(res=>{}).catch(err=>{})

      console.log('修改',list1)
      console.log('新增',list2)
      initData()
    }

    // 编辑主图片
    function editImg(item){
      dictData.showEdit = true;
      // const modalRef = modal.value;
      // modalRef
      // item.name = "picture"
      dictData.saveItem = item.name
    }
    // 编辑视频地址
    function editVideo(item){
      dictData.videoModal = true;
      // const modalRef = modal.value;
      // modalRef
      // item.name = "picture"
      // dictData.saveItem = item.name
    }
    const selectImg = (data) =>{
      dictData.showEdit = false;
      console.log('data',data)
      dictData.saveItem = data.name
    }

    const selectVideo = (data) =>{
      // dictData.videoModal = false;
      // console.log('data',data)
      // dictData.saveItem = data.name
    }

    function initData(){
      console.log('initData')
      // axios.get('').then(res=>{})
      setTimeout(()=>{
        dictData.tableData=[
          {
            id: "1-1",
            name: "筋膜枪",
            title:'',
            des: "serviceStatus",
            mallLink:'',
            sortForHome:'',
            sortForMenu3:'',
            files:[
              {
                name:'img1',
                url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
              },
              {
                name:'img2',
                url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
              }
            ],
            carouselFigure:[],
            videoLink:'',
          },
          {
            id: "1-2",
            name: "跳绳",
            title:'',
            des: "onlienStatus",
            mallLink:'',
            sortForHome:'',
            sortForMenu3:'',
            files:[],
            carouselFigure:[],
            videoLink:''
          },
          { 
            id: 2, 
            name: "体脂秤", 
            title:'',
            des: "operatingSystem",
            mallLink:'',
            sortForHome:'',
            sortForMenu3:'',
            files:[],
            carouselFigure:[],
            videoLink:'' 
          }
        ]
        // dictData.submitLoading = false;  
        const $table = xTree.value; 
        $table.loadData(dictData.tableData)
      },1000)
    }
    onMounted(()=>{
      initData()
    })

    return {
      ...toRefs(dictData),
      formatDate,
      confirmEvent,
      editImg,
      editVideo,
      onAdd,
      onSave,
      selectImg,
      selectVideo
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
