<template>
  <div class="info">
    <el-form :model="model" :rules="rules" ref="ruleForm" class="rule-form">
      <el-form-item prop="userName">
        <el-input
          clearable
          v-model="model.userName"
          placeholder="请输入用户名"
          prefix-icon="el-icon-user"
        ></el-input>
      </el-form-item>
      <el-form-item prop="passWord">
        <el-input
          clearable
          type="password"
          show-password
          v-model="model.passWord"
          placeholder="请输入密码"
          prefix-icon="el-icon-lock"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.prevent="onBehavior">{{
          tipsFalse
        }}</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
      <span title="测试用户 直接登录" class="secret" @click="noSecret"
        >免密登录</span
      >
    </el-form>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  PropType,
  onBeforeMount,
  getCurrentInstance,
  watch,
  nextTick,
  toRef
} from "vue";
import { storageSession } from "/@/utils/storage";

export interface ContextProps {
  userName: string;
  passWord: string;
  svg: any;
  telephone?: number;
  dynamicText?: string;
}

import { useRouter, useRoute } from "vue-router";

import { initRouter } from "/@/router";

export default defineComponent({
  name: "Info",
  props: {
    ruleForm: {
      type: Object as PropType<ContextProps>,
      require: true
    }
  },
  emits: ["onBehavior"],
  setup(props, ctx) {
    let vm: any;

    const model = toRef(props, "ruleForm");
    let tips = ref("注册");
    let tipsFalse = ref("登录");

    const route = useRoute();
    const router = useRouter();

    watch(
      route,
      async ({ path }): Promise<void> => {
        await nextTick();
        path.includes("register")
          ? (tips.value = "登录") && (tipsFalse.value = "注册")
          : (tips.value = "注册") && (tipsFalse.value = "登录");
      },
      { immediate: true }
    );

    const rules: Object = ref({
      userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
      passWord: [
        { required: true, message: "请输入密码", trigger: "blur" },
        // { min: 6, message: "密码长度必须不小于6位", trigger: "blur" }
      ]
    });

    // 点击登录或注册
    const onBehavior = (evt: Object): void => {
      vm.refs.ruleForm.validate((valid: boolean) => {
        if (valid) {
          ctx.emit("onBehavior", evt);
        } else {
          return false;
        }
      });
    };

    // 表单重置
    const resetForm = (): void => {
      vm.refs.ruleForm.resetFields();
    };

    const noSecret = (): void => {
      storageSession.setItem("info", {
        username: "admin",
        accessToken: "eyJhbGciOiJIUzUxMiJ9.test"
      });
      initRouter("admin").then(() => {});
      router.push("/product");
    };

    onBeforeMount(() => {
      vm = getCurrentInstance(); //获取组件实例
    });

    return {
      model,
      rules,
      tips,
      tipsFalse,
      resetForm,
      onBehavior,
      noSecret
    };
  }
});
</script>

<style lang="scss" scoped>
.info {
  width: 30vw;
  height: 35vh;
  background: url("../../assets/login.png") no-repeat center;
  background-size: cover;
  position: absolute;
  border-radius: 20px;
  right: 100px;
  top: 30vh;
  display: flex;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 750px) {
    width: 88vw;
    right: 25px;
    top: 22vh;
  }
  .rule-form {
    width: 80%;
    .tips {
      color: #409eff;
      float: right;
      &:hover {
        cursor: pointer;
      }
    }
  }
  .secret {
    color: #409eff;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
