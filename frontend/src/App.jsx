import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from './services/api';

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin (Super Admin)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurantes from "./pages/admin/AdminRestaurantes";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminAuditoria from "./pages/admin/AdminAuditoria";
import AdminWizardRestaurante from "./pages/admin/AdminWizardRestaurante";

// Admin Restaurante (dentro de carpeta restaurante/admin-restaurante)
import AdminRestauranteDashboard from "./pages/restaurante/admin-restaurante/AdminRestauranteDashboard";
import AdminRestauranteUsuarios from "./pages/restaurante/admin-restaurante/AdminRestauranteUsuarios";
import AdminRestauranteReportes from "./pages/restaurante/admin-restaurante/AdminRestauranteReportes";
import AdminRestaurantePedidos from "./pages/restaurante/admin-restaurante/AdminRestaurantePedidos";
import AdminRestauranteMenu from "./pages/restaurante/admin-restaurante/AdminRestauranteMenu";

// Restaurante (Empleado) - SOLO pedidos y pagos
import RestauranteDashboard from "./pages/restaurante/RestauranteDashboard";
import RestaurantePedidos from "./pages/restaurante/RestaurantePedidos";
import RestaurantePagos from "./pages/restaurante/RestaurantePagos";

// Cliente
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import Menu from "./pages/cliente/Menu";
import Carrito from "./pages/cliente/Carrito";
import MisPedidos from "./pages/cliente/MisPedidos";
import RestauranteMenuPage from "./pages/cliente/RestauranteMenuPage";

// Shared
import Home from "./pages/shared/Home";

function ProtectedRoute({ children, allowedRoles }) {
    const user = getCurrentUser();
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
        console.log("No autorizado, redirigiendo a login");
        return <Navigate to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
        if (user.role === 'restaurante') return <Navigate to="/admin-restaurante/dashboard" />;
        if (user.role === 'empleado') return <Navigate to="/restaurante/dashboard" />;
        return <Navigate to="/cliente/dashboard" />;
    }
    
    return children;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/restaurante/:id/menu" element={<RestauranteMenuPage />} />
            
            {/* ============================================ */}
            {/* CLIENTE */}
            {/* ============================================ */}
            <Route path="/cliente/dashboard" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <ClienteDashboard />
                </ProtectedRoute>
            } />
            <Route path="/menu" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <Menu />
                </ProtectedRoute>
            } />
            <Route path="/carrito" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <Carrito />
                </ProtectedRoute>
            } />
            <Route path="/mis-pedidos" element={
                <ProtectedRoute allowedRoles={['cliente']}>
                    <MisPedidos />
                </ProtectedRoute>
            } />
            
            {/* ============================================ */}
            {/* SUPER ADMIN - Solo admin */}
            {/* ============================================ */}
            <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/restaurantes" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRestaurantes />
                </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsuarios />
                </ProtectedRoute>
            } />
            <Route path="/admin/reportes" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReportes />
                </ProtectedRoute>
            } />
            <Route path="/admin/auditoria" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAuditoria />
                </ProtectedRoute>
            } />
            <Route path="/admin/wizard-restaurante" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminWizardRestaurante />
                </ProtectedRoute>
            } />
            
            {/* ============================================ */}
            {/* ADMIN RESTAURANTE - Solo restaurante */}
            {/* ============================================ */}
            <Route path="/admin-restaurante/dashboard" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <AdminRestauranteDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin-restaurante/usuarios" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <AdminRestauranteUsuarios /> 
                </ProtectedRoute>
            } />
            <Route path="/admin-restaurante/reportes" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <AdminRestauranteReportes />
                </ProtectedRoute>
            } />
            <Route path="/admin-restaurante/pedidos" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <AdminRestaurantePedidos />
                </ProtectedRoute>
            } />
            <Route path="/admin-restaurante/menu" element={
                <ProtectedRoute allowedRoles={['restaurante']}>
                    <AdminRestauranteMenu /> 
                </ProtectedRoute>
            } />
            
            {/* ============================================ */}
            {/* EMPLEADO - Solo pedidos y pagos */}
            {/* ============================================ */}
            <Route path="/restaurante/dashboard" element={
                <ProtectedRoute allowedRoles={['empleado']}>
                    <RestauranteDashboard />
                </ProtectedRoute>
            } />
            <Route path="/restaurante/pedidos" element={
                <ProtectedRoute allowedRoles={['empleado']}>
                    <RestaurantePedidos />
                </ProtectedRoute>
            } />
            <Route path="/restaurante/pagos" element={
                <ProtectedRoute allowedRoles={['empleado']}>
                    <RestaurantePagos />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;