import { Route } from "react-router-dom";
import { PublicRoute } from "@/components/auth/public-route";
import { lazy } from "react";

const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/Login"));
const RegisterPage = lazy(() => import("@/pages/auth/Register"));

export const publicRoutes = [
  <Route
    key="landing"
    path="/"
    element={
      <PublicRoute>
        <LandingPage />
      </PublicRoute>
    }
  />,
  <Route
    key="login"
    path="/auth/login"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />,
  <Route
    key="register"
    path="/auth/register"
    element={
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    }
  />,
];
