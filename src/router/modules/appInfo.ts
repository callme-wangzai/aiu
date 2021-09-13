import Layout from "/@/layout/index.vue";

const productRouter = {
  path: "/appInfo",
  name: "appInfo",
  component: Layout,
  redirect: "/appInfo",
  meta: {
    icon: "el-icon-sell",
    title: "message.hsAppInfo",
    showLink: true,
    savedPosition: true,
    rank: 1
  },
  children: [
    {
      path: "/appInfo",
      name: "appInfo",
      component: () => import("/@/views/appInfo/index.vue"),
      meta: {
        title: "message.hsAppInfo",
        showLink: true,
        savedPosition: true
      },
    },
  ]
};

export default productRouter;
