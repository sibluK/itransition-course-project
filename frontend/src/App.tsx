import { BrowserRouter, Routes, Route } from 'react-router'
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

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/admin" element={<ProtectedRoute requiredRoles={['admin']}><Admin /></ProtectedRoute>} />
                    <Route path="/inventories" element={<ProtectedRoute requiredRoles={['admin', 'user']}><Inventories /></ProtectedRoute>} />
                    <Route path="/inventories/:id" element={<Inventory />}>
                        <Route path="items" element={<Items />} />
                        <Route path="discussions" element={<Discussions />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="custom" element={<Custom />} />
                        <Route path="access" element={<Access />} />
                        <Route path="fields" element={<Fields />} />
                        <Route path="statistics" element={<Statistics />} />
                    </Route>
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default App
