import { useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Typography, Space, Button } from 'antd';
import {
    SettingOutlined,
    EnvironmentOutlined,
    FolderOpenOutlined,
    SafetyOutlined,
    FileTextOutlined,
    LogoutOutlined,
    UserOutlined,
    DashboardOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function Dashboard() {
    const navigate = useNavigate(); // هوک جابجایی بین مسیرها

    const menuItems = [
        {
            title: 'مدیریت دستگاه‌ها',
            desc: 'افزودن و کنترل سنسورها',
            icon: <SettingOutlined style={{ fontSize: '28px', color: '#3b82f6' }} />,
            bgIcon: 'rgba(59, 130, 246, 0.15)',
            path: '/devices' // مسیر واقعی
        },
        {
            title: 'مدیریت اماکن',
            desc: 'تعریف طبقات و اتاق‌ها',
            icon: <EnvironmentOutlined style={{ fontSize: '28px', color: '#ec4899' }} />,
            bgIcon: 'rgba(236, 72, 153, 0.15)',
            path: '/locations'
        },
        {
            title: 'دسته‌بندی‌ها',
            desc: 'مدیریت و گروه‌بندی آیتم‌ها',
            icon: <FolderOpenOutlined style={{ fontSize: '28px', color: '#14b8a6' }} />,
            bgIcon: 'rgba(20, 184, 166, 0.15)',
            path: '/categories'
        },
        {
            title: 'مدیریت قوانین',
            desc: 'تعریف شروط و خودکارسازی',
            icon: <FileTextOutlined style={{ fontSize: '28px', color: '#f59e0b' }} />,
            bgIcon: 'rgba(245, 158, 11, 0.15)',
            path: '/commands'
        },
        {
            title: 'مدیریت کاربران',
            desc: 'مشاهده و ویرایش پروفایل کاربران',
            icon: <UserOutlined style={{ fontSize: '28px', color: '#8b5cf6' }} />,
            bgIcon: 'rgba(139, 92, 246, 0.15)',
            path: '/users'
        },
        {
            title: 'امنیت',
            desc: 'مدیریت دسترسی کاربران',
            icon: <SafetyOutlined style={{ fontSize: '28px', color: '#8b5cf6' }} />,
            bgIcon: 'rgba(139, 92, 246, 0.15)',
            path: '/' // فعلاً در صفحه اصلی می‌ماند
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#0b111e', direction: 'rtl', padding: '20px' }}>
            {/* هدر بالایی داشبورد */}
            <Header style={{ background: '#151f32', borderRadius: '12px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', marginBottom: '30px', border: '1px solid #1e293b' }}>
                <Space size="middle" style={{ alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#1e3a8a', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                        <DashboardOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
                    </div>
                    <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>هوم سرور</Title>
                </Space>

                <Space size="large" style={{ color: '#94a3b8', fontSize: '13px' }}>
                    <Space style={{ borderLeft: '1px solid #334155', paddingLeft: '15px' }}>
                        <span style={{ color: '#10b981' }}>52.0°C</span>
                        <ThunderboltOutlined style={{ color: '#10b981' }} />
                    </Space>
                    <Space style={{ borderLeft: '1px solid #334155', paddingLeft: '15px' }}>
                        <span>0% <span style={{ color: '#64748b' }}>8 Cores</span></span>
                        <SettingOutlined style={{ color: '#3b82f6' }} />
                    </Space>
                </Space>

                <Space size="middle">
                    <Space style={{ background: '#1e293b', padding: '4px 12px', borderRadius: '20px', color: '#fff' }}>
                        <UserOutlined style={{ color: '#94a3b8' }} />
                        <Text style={{ color: '#fff', fontSize: '14px' }}>admin</Text>
                    </Space>
                    <Button type="text" icon={<LogoutOutlined style={{ color: '#ef4444' }} />} style={{ background: '#1e293b', borderRadius: '8px' }} />
                </Space>
            </Header>

            {/* گرید کارت‌ها */}
            <Content style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <Row gutter={[24, 24]}>
                    {menuItems.map((item, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <Card
                                hoverable
                                bordered={false}
                                onClick={() => navigate(item.path)} // انتقال هوشمند به صفحه جدید
                                style={{ background: '#151f32', borderRadius: '16px', textAlign: 'center', padding: '30px 10px', border: '1px solid #1e293b', cursor: 'pointer' }}
                            >
                                <div style={{ width: '65px', height: '65px', backgroundColor: item.bgIcon, borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto' }}>
                                    {item.icon}
                                </div>
                                <Title level={4} style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '18px' }}>
                                    {item.title}
                                </Title>
                                <Text style={{ color: '#64748b', fontSize: '13px' }}>
                                    {item.desc}
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>
        </Layout>
    );
}

export default Dashboard;