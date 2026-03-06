

// App.tsx - Add Collections route
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StaffManagement from "./pages/StaffManagement";
import RoomBooking from "./pages/RoomBooking";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ConditionalFooter from './components/ConditionalFooter';

import Expenses from "./pages/Expenses";
import Salaries from "./pages/Salaries";
import Collections from "./pages/Collections"; // <-- Add this import
import Reports from "./pages/Reports";
import Housekeeping from "./pages/Housekeeping";
import MetaPixel from "./components/MetaPixel";
import UpgradeFlow from "./components/UpgradeFlow";
import ReferralDashboard from "./components/ReferralDashboard";
import TransactionHistory from "./components/TransactionHistory";
import WalletDashboard from "./components/WalletDashboard";
import FunctionRooms from "./pages/FunctionRooms"; // NEW
import ForgotPassword from "@/components/ForgotPassword";
import ResetPassword from "@/components/ResetPassword";
import AdvanceBookings from "./pages/AdvanceBookings";




const queryClient = new QueryClient();

const App = () => {


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MetaPixel />
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />


            <Route path="/contact" element={<Contact />} />
            <Route path="/upgrade" element={<UpgradeFlow />} />

            {/* --- PROTECTED ROUTES --- */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredPermission="view_dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute requiredPermission="manage_staff">
                <StaffManagement />
              </ProtectedRoute>
            } />

            {/* Income & Expenses Group */}
            <Route path="/collections" element={
              <ProtectedRoute requiredPermission="view_collections">
                <Collections />
              </ProtectedRoute>
            } />

            <Route path="/expenses" element={
              <ProtectedRoute requiredPermission="view_expenses">
                <Expenses />
              </ProtectedRoute>
            } />

            <Route path="/salaries" element={
              <ProtectedRoute requiredPermission="view_salaries">
                <Salaries />
              </ProtectedRoute>
            } />
            <Route path="/housekeeping" element={
              <ProtectedRoute requiredPermission="manage_housekeeping">
                <Housekeeping />
              </ProtectedRoute>
            } />

            {/* Other Routes */}
            <Route path="/roombooking" element={
              <ProtectedRoute requiredPermission="create_booking">
                <RoomBooking />
              </ProtectedRoute>
            } />

            <Route path="/rooms" element={
              <ProtectedRoute requiredPermission="view_rooms">
                <Rooms />
              </ProtectedRoute>
            } />

            <Route path="/function-rooms" element={
              <ProtectedRoute requiredPermission="manage_function_rooms">
                <FunctionRooms />
              </ProtectedRoute>
            } />



            <Route path="/bookings" element={
              <ProtectedRoute requiredPermission="view_bookings">
                <Bookings />
              </ProtectedRoute>
            } />

              <Route path="/advance-bookings" element={
              <ProtectedRoute requiredPermission="create_booking">
                <AdvanceBookings />
              </ProtectedRoute>
            } />

            <Route path="/customers" element={
              <ProtectedRoute requiredPermission="view_customers">
                <Customers />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute requiredPermission="view_reports">
                <Reports />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="manage_hotel_settings">
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/wallet" element={
              <ProtectedRoute requiredPermission="view_dashboard">
                <WalletDashboard />
              </ProtectedRoute>
            } />

            <Route path="/wallet/transactions" element={
              <ProtectedRoute requiredPermission="view_dashboard">
                <TransactionHistory />
              </ProtectedRoute>
            } />

            <Route path="/referrals" element={
              <ProtectedRoute requiredPermission="view_dashboard">
                <ReferralDashboard />
              </ProtectedRoute>
            } />

            <Route path="/upgrade" element={
              <ProtectedRoute>
                <UpgradeFlow />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>

          <ConditionalFooter />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;