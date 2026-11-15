import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { SignUpPage } from "../features/auth/pages/SignUpPage";
import { SignInPage } from "../features/auth/pages/SignInPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../features/home/pages/HomePage";
import { BiltiesListPage } from "../features/bilties/pages/BiltiesListPage";
import { ProtectedRoute } from "./routing/ProtectedRoute";
import { CreateBiltyPage } from "../features/bilties/pages/CreateBiltyPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { VehiclesPage } from "../features/vehicles/pages/VehiclesPage";
import { DocumentSettingsPage } from "../features/documents/pages/DocumentSettingsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bilties"
          element={
            <ProtectedRoute>
              <BiltiesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bilties/create"
          element={
            <ProtectedRoute>
              <CreateBiltyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <VehiclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/document"
          element={
            <ProtectedRoute>
              <DocumentSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
