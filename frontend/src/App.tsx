import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import './App.css'
import Home from './pages/Home'
import ProtectedRoute from './components/protected-route'
import Admin from './pages/Admin'
import Inventories from './pages/Inventories'
import Items from './pages/InventorySections/Items'
import Discussions from './pages/InventorySections/Discussions'
import Settings from './pages/InventorySections/Settings'
import Custom from './pages/InventorySections/Custom'
import Access from './pages/InventorySections/Access'
import Fields from './pages/InventorySections/Fields'
import Statistics from './pages/InventorySections/Statistics'
import Inventory from './pages/Inventory'
import Layout from './components/layout'
import ItemPage from './pages/ItemPage'
import UserInventories from './pages/UserInventories'
import Search from './pages/Search'

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/admin" element={<ProtectedRoute requiredRoles={['admin']}><Admin /></ProtectedRoute>} />
                    <Route path="/admin/users/:userId/inventories" element={<ProtectedRoute requiredRoles={['admin']}><UserInventories /></ProtectedRoute>} />
                    <Route path="/my-inventories" element={<ProtectedRoute requiredRoles={['admin', 'user']}><Inventories /></ProtectedRoute>} />
                    <Route path="/inventory/:inventoryId" element={<Inventory />}>
                        <Route path="items" element={<Items />} />
                        <Route path='items/:itemId' element={<ItemPage />} />
                        <Route path="discussions" element={<Discussions />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="custom" element={<Custom />} />
                        <Route path="access" element={<Access />} />
                        <Route path="fields" element={<Fields />} />
                        <Route path="statistics" element={<Statistics />} />
                        <Route index element={<Navigate to="items" replace />} />
                    </Route>
                    <Route path="/search" element={<Search />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default App
