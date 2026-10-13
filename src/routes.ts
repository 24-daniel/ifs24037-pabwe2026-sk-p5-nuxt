import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import CashFlowLayout from "./features/cashflows/layouts/CashFlowLayout.vue";
import HomePage from "./features/cashflows/pages/HomePage.vue";
import DetailPage from "./features/cashflows/pages/DetailPage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";
import { getAccessToken } from "./helpers/apiHelper";

/** Halaman dashboard hanya untuk pengguna yang sudah login. */
export const requireAuth = () => (getAccessToken() ? true : "/auth/login");

/** Halaman login/registrasi hanya untuk tamu. */
export const requireGuest = () => (getAccessToken() ? "/" : true);

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    redirect: "/auth/login",
    beforeEnter: requireGuest,
    children: [
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: CashFlowLayout,
    beforeEnter: requireAuth,
    children: [
      { path: "", component: HomePage },
      { path: "cash-flows/:cashFlowId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export default routes;
