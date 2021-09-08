<template>
  <div class="addFile">
    <vxe-modal
      resize
      width="70%"
      v-model="modal"
      title="上传文件"
      :loading="submitLoading"
      @close="closeModal"
    >
      <el-upload
        class="upload-demo"
        action="/rest/api/file/v1/upload"
        :on-preview="handlePreview"
        :on-success="uploadSuccess"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        multiple
        :limit="3"
        name="files"
        :data="{ fileType: fileType}"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div>
        </template>
      </el-upload>

    <div class="flex">
      <vxe-button status="primary" @click="submit()">确定</vxe-button>
    </div>
    </vxe-modal>
  </div>
</template>
<script lang="ts">
import { reactive, ref, unref, nextTick, toRefs,onMounted } from "vue";
import { ElUpload } from "element-plus";
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

export default {
  name: "AddFile",
  props: {
    fileType: Number,//1:图片；2:视频；
    multi:Boolean,//true：多选；false：单选
    modal: Boolean,//模态框展示与否
  },
  components: {
    ElUpload
  },
  setup(props,ctx) {

    const submit = () =>{
      console.log(fileData.fileList)
      let fileDtos=[]
      fileDtos = fileData.fileList.map(item=>{
        return {
          fileName:item.name,
          filePath:item.response.data[0].filePath,
          fileSize:item.size,
          fileType:item.response.data[0].fileType,
          // id:0,
          remark:''
        }
      })
      http.request("post", "/rest/api/file/v1/batch/save",fileDtos)
      .then(res=>{
        console.log('res',res)
        // initData()
        ctx.emit('addSuccess')
      })
      .catch(err=>{})
      // 
    }
    
    const closeModal = () => {
      ctx.emit('closeModal',[])
    }
    const fileData = reactive({
      submitLoading: false,
      fileList:[]
    });

    function handleRemove(file, fileList) {
      console.log(file, fileList);
    }
    function handlePreview(file) {
      console.log(file);
    }
    function uploadSuccess(response, file, fileList){
      console.log('response',response)
      console.log('file',file)
      console.log('fileList',fileList)
      fileData.fileList=fileList
      
    }
    function handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    }
    function beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    }

    onMounted(()=>{

    })

    return {
      ...toRefs(fileData),
      submit,
      closeModal,
      handleRemove,
      handlePreview,
      uploadSuccess,
      handleExceed,
      beforeRemove
    };
  }
};
</script>
<style lang="scss" scoped>
.addFile {
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
