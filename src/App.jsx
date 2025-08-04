import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import CalendarPage from "./pages/CalendarPage";
import EditPage from "./pages/EditPage";
import NewCategoryPage from "./pages/NewCategoryPage";
import LoginPage from "./pages/LoginPage";
import SinginPage from "./pages/SigninPage";
import HomePage from "./pages/HomePage";
import { CategoryProvider } from "./context/CategoryContext";

function App() {
  const loggedIn = Boolean(localStorage.getItem("accessToken"));

  return (
    <BrowserRouter>
      <CategoryProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<SinginPage />} />

          {loggedIn && (
            <Route path="/app" element={<Layout />}>
              <Route index element={<CalendarPage />} />
              <Route path="category/new" element={<NewCategoryPage />} />
              <Route path="category/edit" element={<EditPage />} />
            </Route>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CategoryProvider>
    </BrowserRouter>
  );
}

export default App;
