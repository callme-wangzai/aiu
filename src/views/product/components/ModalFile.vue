<template>
  <div class="ModalFile-container">
        <!-- 列表 -->
    <vxe-table
      ref="xTree"
      border
      resizable
      :data="tableData"
      :edit-config="{trigger: 'click', mode: 'cell'}"
    >
      <vxe-column type="checkbox" width="60"></vxe-column>
      <vxe-table-column title="文件名称" field="name" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="描述" field="description" :edit-render="{name: 'input', attrs: {type: 'text'}}">
      </vxe-table-column>
      <vxe-table-column title="图片" field="mainImg">
        <template #default="{ row }">
          <div v-for="(item,index) in row.mainImg" :key="index">
            {{item.name}} 
            <vxe-button type="text" icon="el-icon-edit" @click="editImg(item)"
            ></vxe-button
          >
          </div>
          <!-- <div>
            <span>图1:{{row.mainImg[0].name}}</span>
            <vxe-button type="text" icon="el-icon-edit" @click="editImg(row.mainImg[0])"
            ></vxe-button>
          </div>
          <div>
            <span>图2:{{row.mainImg[1].name}}</span>
            <vxe-button type="text" icon="el-icon-edit" @click="editImg(row.mainImg[1])"
            ></vxe-button>
          </div> -->
        </template>
      </vxe-table-column>
    </vxe-table>

    <vxe-button status="primary" @click="submit()">确定</vxe-button>
    <!-- <vxe-button @click="onSave()">取消</vxe-button> -->

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
    fileType: Number
  },
  components: {
  
  },
  setup(props,ctx) {
    const submit = () =>{
      const $table = xTree.value;
      const selectRecords = $table.getCheckboxRecords()
      ctx.emit('selectFile',selectRecords)
    }
    const router = useRouter();
    const dictData = reactive({
      submitLoading: false,
      showEdit: false,
      selectRow: null,
      filterName: "",
      tableData: [
      ],
      formData: {
        name: "",
        model: ""
      },
      formItems: [
        {
          field: "name",
          title: "商品名称",
          span: 24,
          itemRender: {
            name: "$input",
            props: { placeholder: "请输入商品名称" }
          }
        },
        {
          field: "model",
          title: "标题",
          span: 24,
          itemRender: {
            name: "$input",
            props: {
              placeholder: "请输入",
              //这里vxe-table文档并没有提到，可以配置所选组件的所有属性，比如这里可以配置关于vxe-input的所有属性
              // disabled: true
            }
          }
        },
        {
          field: "description",
          title: "描述",
          span: 24,
          itemRender: {
            name: "$input",
            props: {placeholder: "请输入"}
          }
        },
        // {
        //   align: "right",
        //   span: 24,
        //   itemRender: {
        //     name: "$buttons",
        //     children: [
        //       { props: { type: "submit", content: "提交", status: "primary" } },
        //       { props: { type: "reset", content: "重置" } }
        //     ]
        //   }
        // }
      ] as VxeFormPropTypes.Items
    });

    const xTree = templateRef<HTMLElement | any>("xTree", null);
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

    // 编辑
    function onEdit(row: any) {
      dictData.formData = {
        name: row.name,
        model: row.model ? row.model : "暂无字典类型"
      };
      commonFn(row, false);
    }
    // 编辑主图片
    function editImg(item){
      dictData.showEdit = true;
      // item.name = "picture"
    }

    const submitEvent = () => {
      dictData.submitLoading = true;
      setTimeout(() => {
        const $table = xTree.value;
        dictData.submitLoading = false;
        dictData.showEdit = false;
        if (dictData.selectRow) {
          VXETable.modal.message({ content: "保存成功", status: "success" });
          Object.assign(dictData.selectRow, dictData.formData);
        } else {
          VXETable.modal.message({ content: "新增成功", status: "success" });
          $table.insert(dictData.formData);
        }
      }, 500);
    };
    function initData(){
      console.log('initData')
      // axios.get('').then(res=>{})
      setTimeout(()=>{
        dictData.tableData=[
          {
            id: "1-1",
            name: "筋膜枪",
            title:'',
            description: "serviceStatus",
            mainImg:[
              {
                name:'img1',
                url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
              },
              {
                name:'img2',
                url:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F58%2F6a4f15a4993c8d0989f2c7e876de7f62.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1633102006&t=74b390905eccbdc405e596af5352a8f2'
              }
            ]
          },
          {
            id: "1-2",
            name: "跳绳",
            title:'',
            description: "onlienStatus",
            mainImg:[]

          },
          { 
            id: 2, 
            name: "体脂秤", 
            title:'',
            description: "operatingSystem" 
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
      submitEvent,
      onEdit,
      editImg,
      onAdd,
      onSave,submit
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
