import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Dashboard from './Dashboard';
import DeviceManager from './DeviceManager';
import CategoryManager from './CategoryManager';
import LocationManager from './LocationManager';
import UserManager from './UserManager';
/*import CommandManager from './CommandManager';*/


function App() {
    return (
        <Router>
            <Layout style={{ minHeight: '100vh', backgroundColor: '#0b111e', direction: 'rtl' }}>
                <Routes>
                    {/* مسیرهای واقعی پروژه وستا بر اساس آدرس URL */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/devices" element={<DeviceManager />} />
                    <Route path="/categories" element={<CategoryManager />} />
                    <Route path="/locations" element={<LocationManager />} />
                    <Route path="/users" element={<UserManager />} />
                    {/* <Route path="/commands" element={<CommandManager />} />
                    <Route path="/categories" element={<CategoryManager />} />*/}
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;