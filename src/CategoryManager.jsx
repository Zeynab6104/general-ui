import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Layout, Row, Col, Card, Button, Input, Select, Space, Typography,
    Form, message, Popconfirm, Tag, Empty, Modal, ConfigProvider, theme
} from 'antd';
import {
    ArrowRightOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderOpenOutlined,
    TagOutlined,
    AppstoreAddOutlined,
    BulbOutlined,
    ThunderboltOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = 'http://localhost:8080/api';

// 🟢 مپینگ بر اساس نام استاندارد رشته‌ای Enum های بک‌آند
const CATEGORY_TYPES = {
    'LIGHTING': { label: 'روشنایی', color: '#facc15', icon: <BulbOutlined /> },
    'COOLING': { label: 'سرمایشی/گرمایشی', color: '#3b82f6', icon: <ThunderboltOutlined /> },
    'SECURITY': { label: 'امنیت و سنسور', color: '#10b981', icon: <SafetyCertificateOutlined /> },
    // 🟢 اضافه کردن حالت‌های قدیمی یا کلمات خاص برای پیشگیری از باگ تگ انگلیسی
};

const CategoryManager = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const [categories, setCategories] = useState([]);
    const [dbDevices, setDbDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // 🟢 ۱. استیت‌های خودت (بدون تغییر)

// ۱. این رفرنس رو بالای کامپوننت (کنار بقیه useStateها) اضافه کن:
    const isFetchedRef = useRef(false);

// ۲. متد اختصاصی برای بعد از CRUD (بدون تغییر)
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/category/getAll`);
            const normalized = (res.data || []).map(cat => ({
                ...cat,
                devices: cat.devices || []
            }));
            setCategories(normalized);
        } catch (error) {
            console.error("خطا در به‌روزرسانی لیست گروه‌ها:", error);
        }
    };

// ۳. قفل‌گذاری ۱۰۰٪ تضمینی با useRef در useEffect
    useEffect(() => {
        // اگر قفل قبلاً باز شده، فوراً اجرای دوم رو متوقف کن و برگرد
        if (isFetchedRef.current) return;

        // قفل رو فوراً می‌بندیم تا هیچ رندر هم‌زمانی نتونه از این خط رد بشه
        isFetchedRef.current = true;

        const initPageData = async () => {
            setLoading(true);
            try {
                const [devicesRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/device/getAll`).catch(() => ({ data: [] })),
                    axios.get(`${API_BASE_URL}/category/getAll`)
                ]);

                setDbDevices(devicesRes.data || []);

                const normalized = (categoriesRes.data || []).map(cat => ({
                    ...cat,
                    devices: cat.devices || []
                }));
                setCategories(normalized);
            } catch (error) {
                message.error('خطا در بارگذاری اطلاعات اولیه شبکه وستا');
            } finally {
                setLoading(false);
            }
        };

        initPageData();
    }, []);


    const onFinish = async (values) => {
        try {
            const categoryPayload = {
                name: values.name,
                type: values.type, // 🟢 حالا مقدار رشته‌ای استاندارد (مثل LIGHTING) فرستاده می‌شود
                devices: values.devices ? values.devices.map(id => ({ id: id })) : []
            };

            await axios.post(`${API_BASE_URL}/category/save`, categoryPayload);
            message.success('دسته‌بندی جدید با موفقیت ذخیره شد');
            form.resetFields();
            fetchCategories();
        } catch (error) {
            message.error('خطا در ذخیره‌سازی گروه جدید');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/category/delete/${id}`);
            message.warning('دسته‌بندی با موفقیت حذف شد');
            fetchCategories();
        } catch (error) {
            message.error('خطا در حذف دسته بندی');
        }
    };

    const openEditModal = (category) => {
        setEditingCategory(category);

        // استخراج دقیق آیدی‌ها به صورت عدد
        const selectedDeviceIds = category.devices
            ? category.devices.map(d => Number(d.id))
            : [];

        editForm.setFieldsValue({
            name: category.name,
            type: category.type,
            devices: selectedDeviceIds // 🟢 فرستادن آرایه صاف و پوست‌کنده از آیدی‌ها
        });

        setIsEditModalOpen(true);
    };

    const handleUpdate = async (values) => {
        try {
            const updatedPayload = {
                id: editingCategory.id,
                name: values.name,
                type: values.type,
                devices: values.devices ? values.devices.map(id => ({ id: id })) : []
            };

            await axios.put(`${API_BASE_URL}/category/update`, updatedPayload);
            message.success('تغییرات با موفقیت اعمال شد');
            setIsEditModalOpen(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            message.error('خطا در به‌روزرسانی اطلاعات');
        }
    };

    const darkFieldStyle = {
        backgroundColor: '#1a263f',
        borderColor: '#2e3f61',
        borderRadius: '8px',
    };

    const dropdownStyle = {
        backgroundColor: '#151f32',
        border: '1px solid #2e3f61',
        borderRadius: '8px',
    };

    return (
        <Layout style={{ background: 'transparent', padding: '20px' }}>
            <Header style={{ background: '#151f32', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #1e293b', height: '64px' }}>
                <Space size="middle">
                    <Button type="text" icon={<ArrowRightOutlined style={{ color: '#fff' }} />} onClick={() => navigate('/')} style={{ background: '#1e293b', borderRadius: '8px' }} />
                    <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>مدیریت دسته‌بندی‌ها</Title>
                </Space>
                <FolderOpenOutlined style={{ color: '#14b8a6', fontSize: '20px' }} />
            </Header>

            <Content style={{ width: '100%' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={10}>
                        <Card
                            title={<span style={{ color: '#fff' }}><AppstoreAddOutlined /> تعریف گروه جدید</span>}
                            style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px' }}
                            bodyStyle={{ padding: '24px' }}
                        >
                            <Form form={form} layout="vertical" onFinish={onFinish}>

                                <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>نام دسته‌بندی</Text>} rules={[{ required: true, message: 'لطفاً نام را وارد کنید' }]}>
                                    <Input
                                        placeholder="مثلاً: روشنایی پذیرایی"
                                        style={{ ...darkFieldStyle, color: '#fff', fontWeight: 'bold', height: '42px' }}
                                    />
                                </Form.Item>

                                {/* 🟢 اصلاح اینپوت آپشن‌ها به کلیدهای متنی انوم */}
                                <Form.Item name="type" label={<Text style={{ color: '#94a3b8' }}>نوع عملکرد (تایپ سیستم)</Text>} rules={[{ required: true, message: 'انتخاب نوع الزامی است' }]}>
                                    <Select
                                        placeholder="انتخاب نوع..."
                                        dropdownStyle={dropdownStyle}
                                        size="large"
                                        style={{ width: '100%', ...darkFieldStyle }}
                                        styles={{
                                            singleItem: { color: '#000000', fontWeight: 'bold', background: 'transparent' }
                                        }}
                                    >
                                        <Select.Option value="LIGHTING" style={{ backgroundColor: '#151f32', color: '#fff' }}>
                                            <Space>{CATEGORY_TYPES['LIGHTING'].icon} روشنایی</Space>
                                        </Select.Option>
                                        <Select.Option value="COOLING" style={{ backgroundColor: '#151f32', color: '#fff' }}>
                                            <Space>{CATEGORY_TYPES['COOLING'].icon} سرمایشی/گرمایشی</Space>
                                        </Select.Option>
                                        <Select.Option value="SECURITY" style={{ backgroundColor: '#151f32', color: '#fff' }}>
                                            <Space>{CATEGORY_TYPES['SECURITY'].icon} امنیت و سنسور</Space>
                                        </Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item name="devices" label={<Text style={{ color: '#94a3b8' }}>تخصیص قطعات به این دسته‌بندی</Text>}>
                                    <Select
                                        mode="multiple"
                                        placeholder="دستگاه‌های مورد نظر را انتخاب کنید..."
                                        dropdownStyle={dropdownStyle}
                                        size="large"
                                        style={{ width: '100%', ...darkFieldStyle }}
                                    >
                                        {dbDevices.map(dev => (
                                            <Select.Option key={dev.id} value={Number(dev.id)} style={{ backgroundColor: '#151f32', color: '#fff' }}>
                                                <span>{dev.name || `دستگاه کد ${dev.id}`}</span>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} style={{ height: '42px', background: '#14b8a6', border: 'none', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold' }}>
                                    ذخیره
                                </Button>
                            </Form>
                        </Card>
                    </Col>

                    {/* لیست گروه‌ها */}
                    <Col xs={24} lg={14}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text style={{ color: '#64748b' }}>گروه‌های فعال</Text>
                        </div>

                        {categories.length === 0 ? (
                            <div style={{ background: '#151f32', padding: '60px', borderRadius: '16px', border: '1px dashed #1e293b', textAlign: 'center' }}>
                                <Empty description={<span style={{color:'#64748b'}}>هیچ گروه یا دسته‌بندی در دیتابیس یافت نشد.</span>} />
                            </div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {categories.map(cat => {
                                    // 🟢 واکشی پویای استایل‌ها با شناسه رشته‌ای انوم
                                   // const typeInfo = CATEGORY_TYPES[cat.type] || { label: cat.type || 'نامشخص', color: '#64748b', icon: <TagOutlined /> };
                                    const currentDeviceCount = cat.devices ? cat.devices.length : 0;
                                    const rawType = cat.type ? cat.type.toUpperCase() : 'نامشخص';
                                    const typeInfo = CATEGORY_TYPES[rawType] || { label: rawType, color: '#64748b', icon: <TagOutlined /> };
                                    return (
                                        <Col span={24} key={cat.id}>
                                            <Card style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '12px' }} bodyStyle={{ padding: '16px' }}>
                                                <Row align="middle" justify="space-between">
                                                    <Col>
                                                        <Space size="middle">
                                                            <div style={{ background: `${typeInfo.color}20`, padding: '10px', borderRadius: '10px', display: 'flex' }}>
                                                                <TagOutlined style={{ color: typeInfo.color, fontSize: '20px' }} />
                                                            </div>
                                                       {/*     <div>
                                                                <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>{cat.name}</Title>
                                                                <Tag color="black" style={{ border: `1px solid ${typeInfo.color}`, color: typeInfo.color, marginTop: '5px' }}>
                                                                    <Space size={4}>{typeInfo.icon} {typeInfo.label}</Space>
                                                                </Tag>

                                                            </div>*/}
                                                            <div>
                                                                <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>{cat.name}</Title>

                                                                {/* 🟢 اصلاح استایل تگ: استفاده از کدرنگ اصلی با پدینگ تیره برای تم دارک وستا */}
                                                                <Tag style={{
                                                                    backgroundColor: `${typeInfo.color}20`, // ۲۰ درصد غلظت رنگ روی پس‌زمینه دارک
                                                                    border: `1px solid ${typeInfo.color}`,
                                                                    color: typeInfo.color,
                                                                    marginTop: '5px',
                                                                    borderRadius: '6px',
                                                                    padding: '2px 10px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Space size={4}>{typeInfo.icon} {typeInfo.label}</Space>
                                                                </Tag>
                                                            </div>
                                                        </Space>
                                                    </Col>
                                                    <Col style={{ textAlign: 'left' }}>
                                                        <Space size="large">
                                                            <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                                                <Title level={4} style={{ color: '#fff', margin: 0 }}>{currentDeviceCount}</Title>
                                                                <Text style={{ color: '#64748b', fontSize: '11px' }}>دستگاه متصل</Text>
                                                            </div>
                                                            <Space>
                                                                <Button type="text" icon={<EditOutlined style={{ color: '#3b82f6' }} />} onClick={() => openEditModal(cat)} />
                                                                <Popconfirm title="آیا از حذف این دسته‌بندی اطمینان دارید" onConfirm={() => handleDelete(cat.id)} okText="بله" cancelText="خیر">
                                                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                                                </Popconfirm>
                                                            </Space>
                                                        </Space>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Content>

            {/* مدال ویرایش */}
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        colorBgElevated: '#151f32',
                        colorText: '#fff',
                        colorBorder: '#2e3f61',
                    },
                    components: {
                        Modal: {
                            headerBg: '#151f32',
                            contentBg: '#151f32',
                            footerBg: '#151f32',
                        },
                        Select: {
                            selectorBg: '#1a263f',
                        }
                    }
                }}
            >
                <Modal
                    title="ویرایش اطلاعات دسته‌بندی"
                    open={isEditModalOpen}
                    onCancel={() => { setIsEditModalOpen(false); setEditingCategory(null); }}
                    footer={null}
                    style={{ direction: 'rtl' }}
                    width={600}
                    centered
                    styles={{
                        mask: { backdropFilter: 'blur(4px)' },
                        content: { background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }
                    }}
                >
                    <Form
                        form={editForm}
                        layout="vertical"
                        onFinish={handleUpdate}
                        style={{ marginTop: '20px' }}
                    >
                        <Form.Item
                            name="name"
                            label="نام دسته‌بندی"
                            rules={[{ required: true, message: 'نام الزامی است' }]}
                        >
                            <Input style={darkFieldStyle} />
                        </Form.Item>

                        {/* 🟢 اصلاح سلکتور مدال ویرایش */}
                        <Form.Item
                            name="type"
                            label="نوع عملکرد"
                            rules={[{ required: true }]}
                        >
                            <Select dropdownStyle={dropdownStyle} style={{ ...darkFieldStyle, height: '42px' }}>
                                <Select.Option value="LIGHTING">روشنایی</Select.Option>
                                <Select.Option value="COOLING">سرمایشی/گرمایشی</Select.Option>
                                <Select.Option value="SECURITY">امنیت و سنسور</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="devices" label="تخصیص قطعات">
                            <Select
                                mode="multiple"
                                placeholder="دستگاه‌های مورد نظر را انتخاب کنید..."
                                dropdownStyle={dropdownStyle}
                                size="large"
                                style={{ width: '100%', ...darkFieldStyle }}
                            >
                                {dbDevices.map(dev => (
                                    <Select.Option key={dev.id} value={Number(dev.id)} style={{ backgroundColor: '#151f32', color: '#fff' }}>
                                        <span>{dev.name || `دستگاه کد ${dev.id}`}</span>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>




                        <Form.Item style={{ textAlign: 'left', marginBottom: 0, marginTop: '24px' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    background: '#10b981',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    height: '40px',
                                    padding: '0 24px'
                                }}
                            >
                                ثبت تغییرات
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </ConfigProvider>
        </Layout>
    );
};

export default CategoryManager;