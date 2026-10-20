import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Layout, Row, Col, Button, Input, Select, Space, Typography,
    Form, message, Popconfirm, Empty, Modal, ConfigProvider, theme, Tag
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
    SlidersOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const API_BASE_URL = 'http://localhost:8080/api';

// ==========================================
// ۱. کامپوننت پاپ‌آپ نمایش اکشن‌ها (به همان سبک کارت‌های تیره دوتایی)
// ==========================================
// ==========================================
// ۱. کامپوننت پاپ‌آپی که اصلاح شد (راست‌چین، بدون دکمه تست و عریض‌تر)
// ==========================================
// ==========================================
// ۱. کامپوننت پاپ‌آپ اصلاح شده (۲ ستونه همراه با دکمه حذف)
// ==========================================
const DeviceActionsPanel = ({ isOpen, onClose, deviceId, deviceName }) => {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && deviceId) {
            fetchActions();
        }
    }, [isOpen, deviceId]);

    const fetchActions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/deviceAction/getAll/${deviceId}`);
            setActions(response.data || []);
        } catch (error) {
            console.error("خطا در دریافت لیست دستورات:", error);
            message.error('خطا در دریافت لیست دستورات از سرور');
        } finally {
            setLoading(false);
        }
    };

    // متد حذف اکشن
    const handleDeleteAction = async (actionId) => {
        try {
            await axios.delete(`${API_BASE_URL}/device-actions/${actionId}`);
            message.warning('دستور با موفقیت حذف شد');
            fetchActions(); // لود مجدد لیست پس از حذف
        } catch (error) {
            console.error("خطا در حذف دستور:", error);
            message.error('خطا در حذف دستور');
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorBgElevated: '#151f32',
                    colorText: '#fff',
                    colorBorder: '#2e3f61'
                }
            }}
        >
            <Modal
                title={
                    <div style={{ color: '#fff', fontSize: '18px', textAlign: 'right', width: '100%', paddingRight: '10px' }}>
                        دستورات ذخیره شده - دستگاه <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{deviceName}</span>
                    </div>
                }
                open={isOpen}
                onCancel={onClose}
                footer={null}
                centered
                width={1100}
                styles={{
                    mask: { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' },
                    body: { direction: 'rtl', padding: '20px 10px' }
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>در حال بارگذاری دستورات...</div>
                ) : actions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed #2e3f61', borderRadius: '12px', color: '#64748b', margin: '20px 0', direction: 'rtl' }}>
                        هیچ دستوری برای این دستگاه ثبت نشده است.
                    </div>
                ) : (
                    /* 🟢 گرید فیکس شده روی ۲ ستون در هر ردیف */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginTop: '10px',
                        maxHeight: '500px',
                        overflowY: 'auto',
                        paddingLeft: '8px',
                        direction: 'rtl'
                    }}>
                        {actions.map((action) => (
                            <div
                                key={action.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between', /* 🟢 ایجاد فاصله بین محتوا و دکمه حذف */
                                    alignItems: 'center',
                                    background: '#192235',
                                    border: '1px solid #2e3f61',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    direction: 'rtl'
                                }}
                            >
                                {/* بخش راست کارت: آیکون و متون دستور */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    {/* آیکون سخت‌افزار */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', display: 'flex', color: '#64748b' }}>
                                        <SettingOutlined style={{ fontSize: '20px' }} />
                                    </div>

                                    {/* نام و پروتکل */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#fff', fontWeight: '500', fontSize: '15px', marginBottom: '2px' }}>{action.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>{action.protocol}</div>
                                    </div>
                                </div>

                                {/* 🟢 بخش چپ کارت: دکمه حذف به همراه تأییدیه Popconfirm */}
                                <Popconfirm
                                    title="آیا از حذف این دستور مطمئن هستید؟"
                                    onConfirm={() => handleDeleteAction(action.id)}
                                    okText="بله"
                                    cancelText="خیر"
                                    placement="right"
                                >
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined style={{ color: '#ef4444', fontSize: '16px' }} />}
                                        style={{
                                            background: '#1a263f',
                                            borderRadius: '8px',
                                            height: '36px',
                                            width: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                </Popconfirm>

                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </ConfigProvider>
    );
};


// ==========================================
// ۲. کامپوننت اصلی مدیریت دستگاه‌ها
// ==========================================
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

    // وضعیت کنترل پنل پاپ‌آپ اکشن‌ها
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);

    // دریافت داده‌های اولیه
    const fetchStaticData = async () => {
        try {
            const [locationsRes, typesRes, protocolsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/location/getAll`),
                axios.get(`${API_BASE_URL}/device/getDeviceTypes`),
                axios.get(`${API_BASE_URL}/device/getConnectionMethod`)
            ]);
            setLocations(locationsRes.data || []);
            setDeviceTypes(typesRes.data || []);
            setProtocols(protocolsRes.data || []);
        } catch (error) {
            console.error("خطا در بارگذاری اطلاعات پایه‌ای:", error);
            message.error('خطا در دریافت اطلاعات تعاریف اولیه از سرور وستا');
        }
    };

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/device/getAll`);
            setDevices(response.data || []);
        } catch (error) {
            console.error("خطا در بارگذاری لیست دستگاه‌ها:", error);
            message.error('خطا در به‌روزرسانی لیست دستگاه‌های وستا');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaticData();
        fetchDevices();
    }, []);

    const onFinish = async (values) => {
        try {
            await axios.post(`${API_BASE_URL}/device/save`, values);
            message.success('دستگاه جدید با موفقیت به شبکه وستا اضافه شد');
            form.resetFields();
            fetchDevices();
        } catch (error) {
            console.error("خطا در ثبت:", error);
            message.error('ثبت دستگاه با خطا مواجه شد');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/device/delete/${id}`);
            message.warning('دستگاه از شبکه حذف شد');
            fetchDevices();
        } catch (error) {
            message.error('خطا در حذف دستگاه');
        }
    };

    const openEditModal = (device) => {
        setEditingDevice(device);
        editForm.setFieldsValue({
            name: device.name,
            type: device.type,
            connectionMethod: device.connectionMethod,
            locationId: device.locationId || null
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (values) => {
        try {
            const updatedPayload = { id: editingDevice.id, ...values };
            await axios.put(`${API_BASE_URL}/device/update`, updatedPayload);
            message.success('تغییرات دستگاه با موفقیت اعمال شد');
            setIsEditModalOpen(false);
            setEditingDevice(null);
            editForm.resetFields();
            fetchDevices();
        } catch (error) {
            message.error('خطا در به‌روزرسانی اطلاعات دستگاه');
        }
    };

    const dropdownStyle = {
        backgroundColor: '#151f32',
        border: '1px solid #2e3f61',
        borderRadius: '8px'
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

            {/* هدر */}
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
                        </div>
                    </div>
                </Space>
                <div></div>
            </Header>

            <Content style={{ width: '100%' }}>
                {/* فرم ثبت دستگاه جدید */}
                <div style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Space style={{ color: '#fff', fontSize: '16px' }}><PlusOutlined style={{color: '#3b82f6'}} /> ثبت دستگاه جدید</Space>
                    </div>

                    <ConfigProvider
                        theme={{
                            components: {
                                Input: {
                                    colorBgContainer: '#1a263f',
                                    colorBorder: '#2e3f61',
                                    colorTextPlaceholder: '#64748b',
                                    colorText: '#fff',
                                    controlHeight: 44
                                },
                                Select: {
                                    selectorBg: '#1a263f',
                                    colorText: '#fff',
                                    colorTextPlaceholder: '#64748b',
                                    colorBorder: '#2e3f61',
                                    optionActiveBg: '#2e3f61',
                                    optionSelectedBg: '#2563eb',
                                    controlHeight: 44
                                }
                            }
                        }}
                    >
                        <Form form={form} onFinish={onFinish} layout="vertical">
                            <Row gutter={[16, 16]} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="name" label={<span style={{color: '#64748b', fontWeight: '500'}}>نام دستگاه</span>} rules={[{ required: true, message: 'نام دستگاه را وارد کنید' }]} style={{ margin: 0 }}>
                                        <Input placeholder="مثلاً: لوستر پذیرایی..." style={{ borderRadius: '8px' }} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={5}>
                                    <Form.Item name="type" label={<span style={{color: '#64748b', fontWeight: '500'}}>نوع قطعه</span>} rules={[{ required: true, message: 'نوع قطعه الزامی است' }]} style={{ margin: 0 }}>
                                        <Select placeholder="انتخاب کنید" dropdownStyle={dropdownStyle} style={{ width: '100%' }}>
                                            {deviceTypes.map(t => (
                                                <Select.Option key={t.value} value={t.value} style={{ color: '#fff' }}>
                                                    {t.persianTitle}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={5}>
                                    <Form.Item name="connectionMethod" label={<span style={{color: '#64748b', fontWeight: '500'}}>پروتکل اتصال</span>} rules={[{ required: true, message: 'پروتکل الزامی است' }]} style={{ margin: 0 }}>
                                        <Select placeholder="انتخاب کنید" dropdownStyle={dropdownStyle} style={{ width: '100%' }}>
                                            {protocols.map(proto => (
                                                <Select.Option key={proto.value} value={proto.value} style={{ color: '#fff' }}>
                                                    {proto.persianTitle}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={5}>
                                    <Form.Item name="locationId" label={<span style={{color: '#64748b', fontWeight: '500'}}>موقعیت مکانی</span>} style={{ margin: 0 }}>
                                        <Select placeholder="- انتخاب فضا -" allowClear dropdownStyle={dropdownStyle} style={{ width: '100%' }}>
                                            {locations.map(loc => (
                                                <Select.Option key={loc.id} value={loc.id} style={{ color: '#fff' }}>
                                                    {loc.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

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
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
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

                {/* کارت‌های دستگاه‌ها */}
                <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {devices.length === 0 ? (
                        <div style={{ width: '100%', background: '#151f32', padding: '60px', borderRadius: '16px', border: '1px dashed #1e293b', textAlign: 'center' }}>
                            <Empty description={<span style={{color:'#64748b'}}>هیچ دستگاهی در شبکه ثبت نشده است.</span>} />
                        </div>
                    ) : (
                        devices.map(device => {
                            const locName = locations.find(l => l.id === device.locationId)?.name || 'تخصیص نیافته';
                            const isOnline = device.status !== 'OFFLINE';

                            return (
                                <Col xs={24} sm={12} md={8} key={device.id} style={{ display: 'flex' }}>
                                    <div style={{
                                        background: '#151f32',
                                        border: '1px solid #1e293b',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '220px',
                                        width: '100%'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ background: '#1a263f', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                                                {getDeviceIcon(device.type)}
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
                                            <Tag color="blue" style={{ background: '#1e293b', border: '1px solid #2e3f61', color: '#3b82f6', borderRadius: '6px', padding: '2px 8px' }}>{device.connectionMethod}</Tag>
                                            <Tag color="purple" style={{ background: '#2e1065', border: '1px solid #4c1d95', color: '#a78bfa', borderRadius: '6px', padding: '2px 8px' }}>{device.type}</Tag>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: 'auto' }}>
                                            {/* باز شدن پاپ‌آپ با کلیک روی این دکمه */}
                                            <Button type="primary" icon={<SlidersOutlined />}
                                                    onClick={() => {
                                                        setSelectedDevice(device);
                                                        setIsPanelOpen(true);
                                                    }}
                                                    style={{ flex: 1, height: '38px', backgroundColor: '#1e293b', borderColor: '#2e3f61', borderRadius: '8px', color: '#3b82f6' }}>
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

            {/* مدال ویرایش هوشمند */}
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        colorBgElevated: '#151f32',
                        colorText: '#fff',
                        colorBorder: '#2e3f61'
                    },
                    components: {
                        Input: {
                            colorBgContainer: '#1a263f',
                            colorText: '#fff',
                            controlHeight: 42
                        },
                        Select: {
                            selectorBg: '#1a263f',
                            colorText: '#fff',
                            optionActiveBg: '#2e3f61',
                            optionSelectedBg: '#2563eb',
                            controlHeight: 42
                        }
                    }
                }}
            >
                <Modal
                    title="ویرایش تنظیمات دستگاه"
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setEditingDevice(null);
                    }}
                    footer={null}
                    centered
                    width={500}
                    styles={{ mask: { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } }}
                >
                    <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: '20px' }}>
                        <Form.Item name="name" label="نام دستگاه" rules={[{ required: true, message: 'نام دستگاه الزامی است' }]}>
                            <Input style={{ borderRadius: '8px' }} />
                        </Form.Item>

                        <Form.Item name="type" label="نوع قطعه">
                            <Select dropdownStyle={dropdownStyle} style={{ width: '100%' }} value={editForm.getFieldValue('type')}>
                                {deviceTypes.map(t => (
                                    <Select.Option key={t.value} value={t.value} style={{ color: '#fff' }}>
                                        {t.persianTitle}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="connectionMethod" label="پروتکل ارتباطی">
                            <Select dropdownStyle={dropdownStyle} style={{ width: '100%' }} value={editForm.getFieldValue('connectionMethod')}>
                                {protocols.map(proto => (
                                    <Select.Option key={proto.value} value={proto.value} style={{ color: '#fff' }}>
                                        {proto.persianTitle}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="locationId" label="تغییر موقعیت مکانی">
                            <Select placeholder="- انتخاب فضا -" allowClear dropdownStyle={dropdownStyle} style={{ width: '100%' }} value={editForm.getFieldValue('locationId')}>
                                {locations.map(loc => (
                                    <Select.Option key={loc.id} value={loc.id} style={{ color: '#fff' }}>
                                        {loc.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'left', marginTop: '24px', marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    background: '#10b981',
                                    border: 'none',
                                    borderRadius: '8px',
                                    height: '40px',
                                    padding: '0 24px',
                                    fontWeight: 'bold'
                                }}
                            >
                                ثبت تغییرات دستگاه
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </ConfigProvider>

            {/* ======================================================== */}
            {/* پاپ‌آپ جدید نمایش اکشن‌ها */}
            {/* ======================================================== */}
            {selectedDevice && (
                <DeviceActionsPanel
                    isOpen={isPanelOpen}
                    onClose={() => {
                        setIsPanelOpen(false);
                        setSelectedDevice(null);
                    }}
                    deviceId={selectedDevice.id}
                    deviceName={selectedDevice.name}
                />
            )}

        </Layout>
    );
};

export default DeviceManager;