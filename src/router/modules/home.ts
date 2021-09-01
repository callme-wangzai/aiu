import Layout from "/@/layout/index.vue";

const homeRouter = {
  path: "/",
  name: "home",
  component: Layout,
  redirect: "/product",
  meta: {
    icon: "el-icon-s-home",
    showLink: true,
    savedPosition: false,
    rank: 0
  },
  children: [
    {
      path: "/welcome",
      name: "welcome",
      component: () => import("/@/views/welcome.vue"),
      meta: {
        title: "message.hshome",
        showLink: true,
        savedPosition: false
      }
    },
    // {
    //   path: "/product",
    //   name: "product",
    //   component: () => import("/@/views/product/index.vue"),
    //   meta: {
    //     title: "message.hsproduct",
    //     showLink: true,
    //     savedPosition: true
    //   }
    // },
  ]
};

export default homeRouter;
