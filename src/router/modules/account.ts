import Layout from "/@/layout/index.vue";

const productRouter = {
  path: "/account",
  name: "account",
  component: Layout,
  redirect: "/account",
  meta: {
    icon: "el-icon-s-custom",
    title: "message.hsproduct",
    showLink: true,
    savedPosition: true,
    rank: 1
  },
  children: [
    {
      path: "/account",
      name: "account",
      component: () => import("/@/views/account/index.vue"),
      meta: {
        title: "message.hsaccount",
        showLink: true,
        savedPosition: true
      },
    }
  ]
};

export default productRouter;
