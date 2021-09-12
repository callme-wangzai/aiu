import Layout from "/@/layout/index.vue";

const productRouter = {
  path: "/exhibition",
  name: "exhibition",
  component: Layout,
  redirect: "/exhibition",
  meta: {
    icon: "el-icon-sell",
    title: "message.hsExhibition",
    showLink: true,
    savedPosition: true,
    rank: 1
  },
  children: [
    {
      path: "/exhibition",
      name: "exhibition",
      component: () => import("/@/views/exhibition/index.vue"),
      meta: {
        title: "message.hsExhibition",
        showLink: true,
        savedPosition: true
      },
    },
  ]
};

export default productRouter;
