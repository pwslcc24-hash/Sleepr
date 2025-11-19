import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "@/layout/layout";
import Feed from "@/pages/Feed";
import AddSleep from "@/pages/AddSleep";
import Profile from "@/pages/Profile";
import { createPageUrl } from "@/utils";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Feed />} />
        <Route path={createPageUrl("AddSleep").slice(1)} element={<AddSleep />} />
        <Route path={createPageUrl("Profile").slice(1)} element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={createPageUrl("Feed")} replace />} />
    </Routes>
  );
}
