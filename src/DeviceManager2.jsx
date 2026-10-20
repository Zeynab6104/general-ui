import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Button, Input, Select, Space, Typography, Badge, Empty, Modal, Form, message } from 'antd';
import { ArrowRightOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ThunderboltOutlined, InfoCircleOutlined, AlertOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DeviceManager = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // ۱. این استیت رکوردهای واقعی دیتابیس شماست
    const [devices, setDevices] = useState([]);

    // استیت‌های مربوط به کنترل مدال ویرایش
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    // ۲. افکت لود اولیه دیتا از دیتابیس (شبیه‌سازی اتصال به اسپرینگ‌بوت)
    useEffect(() => {
        // اینجا در آینده با Axios دیتا رو از بک‌اند می‌گیری:
        // axios.get('/api/devices').then(res => setDevices(res.data))
        setDevices([]); // فعلاً دیتابیس خالی است
    }, []);

    // ۳. عملیات ثبت دستگاه جدید (C)
    const handleCreate = (values) => {
        const newDevice = {
            id: Date.now(), // شناسه موقت دیتابیس
            name: values.name,
            room: values.room || 'تخصیص نیافته',
            protocol: values.protocol,
            type: values.type,
            interface: values.protocol === 'WiFi' ? 'IP' : 'IR_NEC', // فیلد سخت‌افزاری
            online: true // پیش‌فرض سنسور تازه متصل شده
        };

        // در آینده: axios.post('/api/devices', newDevice).then(...)
        setDevices([...devices, newDevice]);
        form.resetFields();
        message.success('دستگاه جدید با موفقیت در دیتابیس ثبت شد');
    };

    // ۴. عملیات حذف دستگاه از دیتابیس (D)
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'آیا از حذف این دستگاه اطمینان دارید؟',
            content: 'با حذف این آیتم، دسترسی سخت‌افزاری هاب به آن قطع خواهد شد.',
            okText: 'بله، حذف کن',
            okType: 'danger',
            cancelText: 'لغو',
            onOk() {
                // در آینده: axios.delete(`/api/devices/${id}`).then(...)
                setDevices(devices.filter(d => d.id !== id));
                message.warning('دستگاه از رکورد دیتابیس حذف شد');
            }
        });
    };

    // ۵. باز کردن مدال ویرایش و لود دیتای قدیمی (U)
    const openEditModal = (device) => {
        setEditingDevice(device);
        editForm.setFieldsValue(device);
        setIsEditModalOpen(true);
    };

    // ۶. ذخیره تغییرات ویرایش شده در دیتابیس
    const handleUpdate = (values) => {
        // در آینده: axios.put(`/api/devices/${editingDevice.id}`, values).then(...)
        setDevices(devices.map(d => d.id === editingDevice.id ? { ...d, ...values } : d));
        setIsEditModalOpen(false);
        setEditingDevice(null);
        message.success('تغییرات دستگاه در دیتابیس به‌روزرسانی شد');
    };

    return (
        <Layout style={{ background: 'transparent', padding: '20px' }}>
            {/* هدر صفحه */}
            <Header style={{ background: '#151f32', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #1e293b', height: '64px' }}>
                <Space size="middle">
                    <Button type="text" icon={<ArrowRightOutlined style={{ color: '#fff', fontSize: '18px' }} />} onClick={() => navigate('/')} style={{ background: '#1e293b', borderRadius: '8px' }} />
                    <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>ثبت و مدیریت دستگاه‌ها</Title>
                </Space>
                <PlusOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
            </Header>

            <Content style={{ width: '100%' }}>
                {/* فرم ثبت دستگاه جدید (بر اساس مدل کامپوننت اسپرینگ شما) */}
                <div style={{ background: '#151f32', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #1e293b' }}>
                    <Form form={form} layout="vertical" onFinish={handleCreate}>
                        <Row gutter={[16, 16]} align="bottom">
                            <Col xs={24} md={5}>
                                <Form.Item name="name" label={<span style={{ color: '#94a3b8' }}>نام دستگاه</span>} rules={[{ required: true, message: 'نام الزامی است' }]}>
                                    <Input placeholder="مثلاً: لوستر پذیرایی..." style={{ background: '#0b111e', color: '#fff', borderColor: '#1e293b', height: '40px' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                                <Form.Item name="type" label={<span style={{ color: '#94a3b8' }}>نوع قطعه</span>} rules={[{ required: true, message: 'نوع الزامی است' }]}>
                                    <Select placeholder="انتخاب نوع" style={{ width: '100%' }}>
                                        <Select.Option value="سنسور">سنسور (Sensor)</Select.Option>
                                        <Select.Option value="عملگر">عملگر (Actuator)</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                                <Form.Item name="protocol" label={<span style={{ color: '#94a3b8' }}>پروتکل اتصال</span>} rules={[{ required: true, message: 'پروتکل الزامی است' }]}>
                                    <Select placeholder="انتخاب پروتکل" style={{ width: '100%' }}>
                                        <Select.Option value="WiFi">WiFi</Select.Option>
                                        <Select.Option value="RF">RF (433MHz)</Select.Option>
                                        <Select.Option value="IR">IR (Infrared)</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                                <Form.Item name="room" label={<span style={{ color: '#94a3b8' }}>موقعیت مکانی (مکان‌ها)</span>}>
                                    <Select placeholder="- تخصیص نیافته -" style={{ width: '100%' }}>
                                        <Select.Option value="پذیرایی">پذیرایی</Select.Option>
                                        <Select.Option value="آشپزخانه">آشپزخانه</Select.Option>
                                        <Select.Option value="اتاق خواب">اتاق خواب</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={4}>
                                <Form.Item style={{ margin: 0 }}>
                                    <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} style={{ height: '40px', background: '#2563eb', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                                        افزودن به شبکه
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>

                {/* بخش نمایش رکوردهای دیتابیس */}
                {devices.length === 0 ? (
                    <div style={{ background: '#151f32', padding: '60px', borderRadius: '16px', border: '1px dashed #1e293b', textAlign: 'center' }}>
                        <Empty
                            image={<AlertOutlined style={{ fontSize: '48px', color: '#64748b' }} />}
                            description={
                                <span style={{ color: '#94a3b8', fontSize: '16px' }}>
                  هیچ دستگاهی در دیتابیس ثبت نشده است. از فرم بالا اولین دستگاه را اضافه کنید.
                </span>
                            }
                        />
                    </div>
                ) : (
                    <Row gutter={[20, 20]}>
                        {devices.map((device) => (
                            <Col xs={24} sm={12} md={8} key={device.id}>
                                <Card
                                    bordered={false}
                                    style={{ background: '#151f32', borderRadius: '16px', border: '1px solid #1e293b' }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                        <ThunderboltOutlined style={{ color: device.online ? '#3b82f6' : '#64748b', fontSize: '18px' }} />
                                        <Space size="small">
                                            <Text style={{ color: device.online ? '#10b981' : '#64748b', fontSize: '13px' }}>
                                                {device.online ? 'آنلاین' : 'آفلاین'}
                                            </Text>
                                            <Badge status={device.online ? 'processing' : 'default'} color={device.online ? '#10b981' : '#64748b'} />
                                        </Space>
                                    </div>

                                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                        <Title level={3} style={{ color: '#fff', margin: '0 0 8px 0', fontWeight: 'normal' }}>
                                            {device.name}
                                        </Title>
                                        <Text style={{ color: '#64748b', fontSize: '13px' }}>
                                            📍 {device.room}
                                        </Text>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '25px' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '6px', fontSize: '12px' }}>
                      {device.protocol}
                    </span>
                                        <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '4px 12px', borderRadius: '6px', fontSize: '12px' }}>
                      {device.type}
                    </span>
                                    </div>

                                    {/* دکمه‌های عملیاتی حذف و ویرایش واقعی */}
                                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(device.id)} style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px' }} />
                                            <Button type="text" icon={<EditOutlined style={{ color: '#f59e0b' }} />} onClick={() => openEditModal(device)} style={{ background: 'rgba(245, 158, 11, 0.05)', borderRadius: '6px' }} />
                                        </Space>
                                        <Button type="primary" ghost icon={<InfoCircleOutlined />} style={{ borderColor: '#1e3a8a', color: '#3b82f6', borderRadius: '8px', fontSize: '13px' }}>
                                            پنل اکشن‌ها
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Content>

            {/* مـدال هوشمند ویرایش اطلاعات دستگاه */}
            <Modal
                title={<span style={{ color: '#fff' }}>ویرایش اطلاعات دستگاه</span>}
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                className="dark-modal"
                style={{ direction: 'rtl' }}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: '20px' }}>
                    <Form.Item name="name" label={<span style={{ color: '#94a3b8' }}>نام دستگاه</span>} rules={[{ required: true, message: 'نام الزامی است' }]}>
                        <Input style={{ background: '#0b111e', color: '#fff', borderColor: '#1e293b' }} />
                    </Form.Item>
                    <Form.Item name="type" label={<span style={{ color: '#94a3b8' }}>نوع قطعه</span>}>
                        <Select style={{ width: '100%' }}>
                            <Select.Option value="سنسور">سنسور</Select.Option>
                            <Select.Option value="عملگر">عملگر</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="protocol" label={<span style={{ color: '#94a3b8' }}>پروتکل اتصال</span>}>
                        <Select style={{ width: '100%' }}>
                            <Select.Option value="WiFi">WiFi</Select.Option>
                            <Select.Option value="RF">RF</Select.Option>
                            <Select.Option value="IR">IR</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="room" label={<span style={{ color: '#94a3b8' }}>موقعیت مکانی</span>}>
                        <Select style={{ width: '100%' }}>
                            <Select.Option value="پذیرایی">پذیرایی</Select.Option>
                            <Select.Option value="آشپزخانه">آشپزخانه</Select.Option>
                            <Select.Option value="اتاق خواب">اتاق خواب</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'left', marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" style={{ background: '#10b981', border: 'none', borderRadius: '6px' }}>
                            ذخیره تغییرات دیتابیس
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default DeviceManager;