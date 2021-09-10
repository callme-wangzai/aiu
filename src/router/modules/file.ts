import Layout from "/@/layout/index.vue";

const fileRouter = {
  path: "/file",
  name: "file",
  component: Layout,
  redirect: "/file",
  meta: {
    icon: "el-icon-files",
    title: "message.hsfile",
    showLink: true,
    savedPosition: true,
    rank: 1
  },
  children: [
    {
      path: "/file",
      name: "file",
      component: () => import("/@/views/file/index.vue"),
      meta: {
        title: "message.hsfile",
        showLink: true,
        savedPosition: true
      }
    }
  ]
};

export default fileRouter;
