import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import "@fontsource-variable/noto-sans-arabic";
import "./styles/global.css";
import "./styles/responsive.css";
import StoreLayout from "./layouts/StoreLayout";
import { CartProvider } from "./hooks/useCart";
import Home from "./pages/Home";
import { Empty } from "./components/UI";
import ProtectedRoute from "./components/ProtectedRoute";
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h1>تعذّر عرض الصفحة</h1>
        <p>حاول إعادة تحميل الصفحة.</p>
        <button className="button" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <CartProvider>
            <Suspense
              fallback={
                <div className="page-loading" role="status">
                  لحظة، نجهّز إطلالتك…
                </div>
              }
            >
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<Product />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route
                    path="branches"
                    element={<Navigate to="/contact" replace />}
                  />
                  <Route path="contact" element={<Contact />} />
                  <Route path="admin/login" element={<AdminLogin />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="admin" element={<Admin />} />
                    <Route path="admin/:section" element={<Admin />} />
                  </Route>
                  <Route
                    path="*"
                    element={
                      <Empty
                        title="الصفحة غير موجودة"
                        detail="إطلالتك القادمة ما زالت بانتظارك."
                      />
                    }
                  />
                </Route>
              </Routes>
            </Suspense>
          </CartProvider>
        </MotionConfig>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
