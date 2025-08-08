import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import CalendarPage from "./pages/CalendarPage";
import EditPage from "./pages/EditPage";
import NewCategoryPage from "./pages/NewCategoryPage";
import LoginPage from "./pages/LoginPage";
import SinginPage from "./pages/SigninPage";
import HomePage from "./pages/HomePage";
import { CategoryProvider } from "./context/CategoryContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<SinginPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <CategoryProvider>
                <Layout />
              </CategoryProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<CalendarPage />} />
          <Route path="category/new" element={<NewCategoryPage />} />
          <Route path="category/edit" element={<EditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
