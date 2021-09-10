import Layout from "/@/layout/index.vue";

const productRouter = {
  path: "/product",
  name: "product",
  component: Layout,
  redirect: "/product",
  meta: {
    icon: "el-icon-sell",
    title: "message.hsproduct",
    showLink: true,
    savedPosition: true,
    rank: 1
  },
  children: [
    {
      path: "/product",
      name: "product",
      component: () => import("/@/views/product/index.vue"),
      meta: {
        title: "message.hsproduct",
        showLink: true,
        savedPosition: true
      },
    },
    // {
    //   path: "/product/addProduct",
    //   name: "addProduct",
    //   component: () => import("/@/views/product/components/addProduct.vue"),
    //   meta: {
    //     title: "message.hsaddProduct",
    //     showLink: true,
    //     savedPosition: true
    //   }
    // }
  ]
};

export default productRouter;
