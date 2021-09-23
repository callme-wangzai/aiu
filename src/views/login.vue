<template>
  <div class="login">
    <info
      :ruleForm="contextInfo"
      @on-behavior="onLogin"
    />
  </div>
</template>

<script lang="ts">
import { reactive, onBeforeMount } from "vue";
import info, { ContextProps } from "../components/ReInfo/index.vue";
import { getVerify, getLogin } from "/@/api/user";
import { useRouter } from "vue-router";
import { storageSession } from "/@/utils/storage";
import { warnMessage, successMessage } from "/@/utils/message";
import { http } from "/@/utils/http";
import { initRouter } from "/@/router";
import { genConfig } from "/@/utils/http/config";
import {
  VXETable,
} from "vxe-table";
export default {
  name: "login",
  components: {
    info
  },
  setup() {
    const router = useRouter();

    const contextInfo: ContextProps = reactive({
      userName: "",
      passWord: "",
      verify: null,
      svg: null
    });

    const toPage = (info: Object): void => {
      storageSession.setItem("info", info);
      initRouter(info.username).then(() => {});
      router.push("/product");
    };

    // 登录
    const onLogin = async () => {
      let { userName, passWord } = contextInfo;
      // let { code, info, accessToken } = await getLogin({
      //   username: userName,
      //   password: passWord
      // });
      // code === 0
      //   ? successMessage(info) &&
      //     toPage({
      //       username: userName,
      //       accessToken
      //     })
      //   : warnMessage(info);
      http.request("post", `${genConfig().apiURL}/rest/api/user/v1/login`,{
        username: userName,
        password: passWord
      })
        .then(res=>{
          console.log('res',res)
          if(res.code==0){
            VXETable.modal.message({ content: res.msg, status: "success" })
            toPage({
              username: userName,
            })
          }else{
            VXETable.modal.message({ content: res.msg , status: "warning" })
          }
          
        })
        .catch(err=>{})
    };

    onBeforeMount(() => {
      // refreshGetVerify();
    });

    return {
      contextInfo,
      onLogin,
      router,
      toPage
    };
  }
};
</script>
