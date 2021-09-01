import Layout from "/@/layout/index.vue";

const bannerRouter = {
  path: "/banner",
  name: "banner",
  component: Layout,
  redirect: "/banner",
  meta: {
    icon: "el-icon-set-up",
    title: "message.hsbanner",
    showLink: true,
    savedPosition: true,
    rank: 1
  },
  children: [
    {
      path: "/banner",
      name: "banner",
      component: () => import("/@/views/banner/index.vue"),
      meta: {
        title: "message.hsbanner",
        showLink: true,
        savedPosition: true
      }
    }
  ]
};

export default bannerRouter;
