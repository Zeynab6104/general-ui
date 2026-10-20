import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Layout, Row, Col, Button, Input, Select, Space, Typography,
    Form, message, Popconfirm, Empty, Modal, ConfigProvider, theme, Tag, TreeSelect
} from 'antd';
import {
    ArrowRightOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    WifiOutlined,
    BulbOutlined,
    DesktopOutlined,
    SlidersOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = 'http://localhost:8080/api';

const DeviceManager = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const [devices, setDevices] = useState([]);
    const [locations, setLocations] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    // ۱. دریافت همزمان تمام داده‌های داینامیک از بک‌آند
    const fetchData = async () => {
        setLoading(true);
        try {
            const [devicesRes, locationsRes, typesRes, protocolsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/device/getAll`),
                axios.get(`${API_BASE_URL}/location/getAll`),
                axios.get(`${API_BASE_URL}/device/getDeviceTypes`),
                axios.get(`${API_BASE_URL}/device/getConnectionMethod`)
            ]);
            setDevices(devicesRes.data || []);
            setLocations(locationsRes.data || []);
            setDeviceTypes(typesRes.data || []);
            setProtocols(protocolsRes.data || []);
        } catch (error) {
            console.error("خطا در بارگذاری داده‌ها:", error);
            message.error('خطا در دریافت اطلاعات از سرور وستا');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ۲. متد بازگشتی برای تبدیل لیست تخت لوکیشن‌ها به ساختار درختی برای TreeSelect
    const buildTreeSelectData = (locs, parentId = null) => {
        return locs
            .filter(loc => (parentId === null ? (!loc.parentId || loc.parentId === 0) : loc.parentId === parentId))
            .map(loc => ({
                id: loc.id,
                value: loc.id,
                title: loc.name,
                children: buildTreeSelectData(locs, loc.id)
            }));
    };

    const treeSelectData = buildTreeSelectData(locations);

    // ۳. ثبت دستگاه جدید
    const onFinish = async (values) => {
        try {
            await axios.post(`${API_BASE_URL}/devices/save`, values);
            message.success('دستگاه جدید با موفقیت به شبکه افزوده شد');
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error('خطا در ثبت دستگاه جدید');
        }
    };

    // ۴. حذف دستگاه
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/devices/${id}`);
            message.warning('دستگاه از شبکه حذف شد');
            fetchData();
        } catch (error) {
            message.error('خطا در حذف دستگاه');
        }
    };

    // ۵. باز کردن مدال ویرایش و لود دیتای قبلی در سلکتورها
    const openEditModal = (device) => {
        setEditingDevice(device);
        editForm.setFieldsValue({
            name: device.name,
            deviceType: device.deviceType,
            protocol: device.protocol,
            locationId: device.locationId ? device.locationId : null
        });
        setIsEditModalOpen(true);
    };

    // ۶. ذخیره تغییرات ویرایش
    const handleUpdate = async (values) => {
        try {
            const updatedPayload = { id: editingDevice.id, ...values };
            await axios.put(`${API_BASE_URL}/devices/${editingDevice.id}`, updatedPayload);
            message.success('تغییرات دستگاه با موفقیت اعمال شد');
            setIsEditModalOpen(false);
            setEditingDevice(null);
            editForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('خطا در به‌روزرسانی اطلاعات دستگاه');
        }
    };

    // استایل‌های کاستوم دارک
    const darkFieldStyle = {
        backgroundColor: '#1a263f',
        borderColor: '#2e3f61',
        borderRadius: '8px',
        color: '#fff',
        height: '44px'
    };

    const dropdownStyle = {
        backgroundColor: '#151f32',
        border: '1px solid #2e3f61',
        borderRadius: '8px',
    };

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'Light': return <BulbOutlined style={{ fontSize: '26px', color: '#3b82f6' }} />;
            case 'TV': return <DesktopOutlined style={{ fontSize: '26px', color: '#64748b' }} />;
            default: return <WifiOutlined style={{ fontSize: '26px', color: '#ec4899' }} />;
        }
    };

    return (
        <Layout style={{ background: 'transparent', padding: '20px', direction: 'rtl' }}>

            {/* هدر اصلاح شده با آیکون قطره‌ای GPS مپ */}
            <Header style={{ background: '#151f32', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #1e293b', height: '84px' }}>
                <Space size="middle" align="center">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined style={{ color: '#fff' }} />}
                        onClick={() => navigate(-1)}
                        style={{ background: '#1e293b', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <EnvironmentOutlined style={{ color: '#ec4899', fontSize: '22px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 'normal', lineHeight: '1.2', fontSize: '17px' }}>مدیریت هوشمند دستگاه‌ها</Title>
                            <Text style={{ color: '#64748b', fontSize: '13.5px', marginTop: '6px', display: 'block', fontWeight: '300' }}>کنترل و ثبت تجهیزات اینترنت اشیاء ساختمان</Text>
                        </div>
                    </div>
                </Space>
                <div></div>
            </Header>

            <Content style={{ width: '100%' }}>
                {/* فرم افقی ثبت دستگاه جدید */}
                <div style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Space style={{ color: '#fff', fontSize: '16px' }}><PlusOutlined style={{color: '#3b82f6'}} /> ثبت دستگاه جدید</Space>
                    </div>

                    <ConfigProvider
                        theme={{
                            algorithm: theme.darkAlgorithm, // 👈 فعال‌سازی الگوریتم دارک رسمی روی کل کنترل‌ها و بازشوها
                            token: {
                                colorBgContainer: '#1a263f',
                                colorBorder: '#2e3f61',
                                colorText: '#fff',
                                colorTextPlaceholder: '#64748b'
                            },
                            components: {
                                Select: {
                                    optionSelectedBg: '#2e3f61',
                                    controlHeight: 44
                                },
                                Input: {
                                    controlHeight: 44
                                }
                            }
                        }}
                    >
                        <Form form={form} onFinish={onFinish} layout="vertical">
                            <Row gutter={[16, 16]} align="bottom">
                                {/* نام دستگاه */}
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="name" label={<span style={{color: '#64748b', fontWeight: '500'}}>نام دستگاه</span>} rules={[{ required: true, message: 'نام دستگاه را وارد کنید' }]}>
                                        <Input placeholder="مثلاً: لوستر پذیرایی..." style={{ borderRadius: '8px' }} />
                                    </Form.Item>
                                </Col>

                                {/* نوع قطعه */}
                                <Col xs={24} sm={12} md={5}>
                                    <Form.Item name="deviceType" label={<span style={{color: '#64748b', fontWeight: '500'}}>نوع قطعه</span>} rules={[{ required: true, message: 'نوع قطعه الزامی است' }]}>
                                        <Select placeholder="انتخاب کنید" style={{ width: '100%' }}>
                                            {deviceTypes.map(t => (
                                                <Select.Option key={t.value} value={t.value}>
                                                    {t.persianTitle}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* پروتکل اتصال */}
                                <Col xs={24} sm={12} md={5}>
                                    <Form.Item name="protocol" label={<span style={{color: '#64748b', fontWeight: '500'}}>پروتکل اتصال</span>} rules={[{ required: true, message: 'پروتکل الزامی است' }]}>
                                        <Select placeholder="انتخاب کنید" style={{ width: '100%' }}>
                                            {protocols.map(proto => (
                                                <Select.Option key={proto.value} value={proto.value}>
                                                    {proto.persianTitle}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* موقعیت مکانی درختی - حل ریشه‌ای رنگ پوسته با الگوریتم محلی */}
                                <Col xs={24} sm={12} md={5}>
                                    <Form.Item name="locationId" label={<span style={{color: '#64748b', fontWeight: '500'}}>موقعیت مکانی</span>}>
                                        <TreeSelect
                                            showSearch
                                            style={{ width: '100%', height: '44px' }}
                                            dropdownStyle={{ maxHeight: 400, overflow: 'auto', borderRadius: '8px' }}
                                            placeholder="- انتخاب فضا از ساختار درختی -"
                                            allowClear
                                            treeDefaultExpandAll
                                            treeData={treeSelectData}
                                        />
                                    </Form.Item>
                                </Col>

                                {/* دکمه ثبت - فیکس تراز افقی بدون پدینگ دستی */}
                                <Col xs={24} md={3}>
                                    <Form.Item style={{ margin: 0 }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<PlusOutlined />}
                                            style={{
                                                height: '44px',
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            افزودن دستگاه
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </ConfigProvider>
                </div>

                {/* گرید نمایش کارت‌های دستگاه‌ها */}
                <Row gutter={[16, 16]}>
                    {devices.length === 0 ? (
                        <div style={{ width: '100%', background: '#151f32', padding: '60px', borderRadius: '16px', border: '1px dashed #1e293b', textAlign: 'center' }}>
                            <Empty description={<span style={{color:'#64748b'}}>هیچ دستگاهی در شبکه ثبت نشده است.</span>} />
                        </div>
                    ) : (
                        devices.map(device => {
                            const locName = locations.find(l => l.id === device.locationId)?.name || 'تخصیص نیافته';
                            const isOnline = device.status !== 'OFFLINE';

                            return (
                                <Col xs={24} sm={12} md={8} key={device.id}>
                                    <div style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ background: '#1a263f', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                                                {getDeviceIcon(device.deviceType)}
                                            </div>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOnline ? '#10b981' : '#64748b', fontSize: '13px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#64748b', display: 'inline-block' }}></span>
                                                {isOnline ? 'آنلاین' : 'آفلاین'}
                                            </span>
                                        </div>

                                        <div style={{ textAlign: 'center', margin: '16px 0' }}>
                                            <Title level={4} style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'normal' }}>{device.name}</Title>
                                            <Space style={{ color: '#64748b', fontSize: '13px' }}>
                                                <EnvironmentOutlined style={{ fontSize: '12px' }} /> {locName}
                                            </Space>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <Tag color="blue" style={{ background: '#1e293b', border: '1px solid #2e3f61', color: '#3b82f6', borderRadius: '6px', padding: '2px 8px' }}>{device.protocol}</Tag>
                                            <Tag color="purple" style={{ background: '#2e1065', border: '1px solid #4c1d95', color: '#a78bfa', borderRadius: '6px', padding: '2px 8px' }}>{device.deviceType}</Tag>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: 'auto' }}>
                                            <Button type="primary" icon={<SlidersOutlined />} style={{ flex: 1, height: '38px', backgroundColor: '#1e293b', borderColor: '#2e3f61', borderRadius: '8px', color: '#3b82f6' }}>
                                                پنل اکشن‌ها
                                            </Button>
                                            <Button type="text" icon={<EditOutlined style={{ color: '#facc15' }} />} onClick={() => openEditModal(device)} style={{ background: '#1a263f', borderRadius: '8px', height: '38px', width: '38px' }} />
                                            <Popconfirm title="آیا دستگاه از شبکه حذف شود؟" onConfirm={() => handleDelete(device.id)} okText="بله" cancelText="خیر">
                                                <Button type="text" icon={<DeleteOutlined style={{ color: '#ef4444' }} />} style={{ background: '#1a263f', borderRadius: '8px', height: '38px', width: '38px' }} />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })
                    )}
                </Row>
            </Content>

            {/* مدال تیره ویرایش هوشمند با ساختار درختی و انوم */}
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgElevated: '#151f32', colorText: '#fff', colorBorder: '#2e3f61' } }}>
                <Modal title="ویرایش تنظیمات دستگاه" open={isEditModalOpen} onCancel={() => { setIsEditModalOpen(false); setEditingDevice(null); }} footer={null} centered width={500} styles={{ mask: { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } }}>
                    <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: '20px' }}>
                        <Form.Item name="name" label="نام دستگاه" rules={[{ required: true, message: 'نام دستگاه الزامی است' }]}>
                            <Input style={darkFieldStyle} />
                        </Form.Item>

                        <Form.Item name="deviceType" label="نوع قطعه">
                            <Select dropdownStyle={dropdownStyle} style={{width:'100%', height:'42px'}}>
                                {deviceTypes.map(type => (
                                    <Select.Option key={type} value={type}>
                                        {type === 'Light' ? 'روشنایی' : type === 'Sensor' ? 'سنسور' : type === 'Cooler' ? 'سرمایشی' : type === 'TV' ? 'تلویزیون' : type}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="protocol" label="پروتکل ارتباطی">
                            <Select dropdownStyle={dropdownStyle} style={{width:'100%', height:'42px'}}>
                                {protocols.map(proto => (
                                    <Select.Option key={proto} value={proto}>{proto}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="locationId" label="تغییر موقعیت مکانی">
                            <TreeSelect
                                showSearch
                                style={{ width: '100%', height: '42px' }}
                                dropdownStyle={{ ...dropdownStyle, maxHeight: 400, overflow: 'auto' }}
                                placeholder="- انتخاب فضا از ساختار درختی -"
                                allowClear
                                treeDefaultExpandAll
                                treeData={treeSelectData}
                            />
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'left', marginTop: '24px', marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" style={{ background: '#10b981', border: 'none', borderRadius: '8px', height: '40px', padding: '0 24px' }}>
                                ثبت تغییرات دستگاه
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </ConfigProvider>
        </Layout>
    );
};

export default DeviceManager;