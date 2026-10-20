import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Layout, Row, Col, Button, Input, Select, Space, Typography,
    Form, message, Popconfirm, Empty, Modal, ConfigProvider, theme
} from 'antd';
import {
    ArrowRightOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    HomeOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = 'http://localhost:8080/api';

const LocationManager = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    // ۱. واکشی اطلاعات از دیتابیس
    const fetchLocations = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/location/getAll`);
            setLocations(response.data || []);
        } catch (error) {
            console.error("خطا در واکشی لوکیشن‌ها:", error);
            message.error('خطا در بارگذاری لیست موقعیت‌ها');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    // ۲. تابع کمکی برای ساختار درختی در نمایش (تفکیک ریشه‌ها و فرزندان)
    const rootLocations = locations.filter(loc => !loc.parentId || loc.parentId === 0);

    // ۳. ثبت موقعیت جدید (فرم افقی بالای صفحه)
    const onFinish = async (values) => {
        try {
            const payload = {
                name: values.name,
                parentId: values.parentId ? values.parentId : null
            };

            await axios.post(`${API_BASE_URL}/location/save`, payload);
            message.success('موقعیت جدید با موفقیت ذخیره شد');
            form.resetFields();
            fetchLocations();
        } catch (error) {
            message.error('خطا در ذخیره‌سازی موقعیت جدید');
        }
    };

    // ۴. حذف موقعیت
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/location/delete/${id}`);
            message.warning('موقعیت حذف شد');
            fetchLocations();
        } catch (error) {
            message.error('خطا در حذف موقعیت');
        }
    };

    // ۵. باز کردن مدال ویرایش
    const openEditModal = (location) => {
        setEditingLocation(location);

        // اینجا مقدار قبلی رو به فرم می‌دیم تا سلکتور اتوماتیک پر بشه
        editForm.setFieldsValue({
            name: location.name,
            parentId: location.parentId ? location.parentId : null // یا undefined
        });

        setIsEditModalOpen(true);
    };

    // ۶. ثبت تغییرات ویرایش
    const handleUpdate = async (values) => {
        try {
            const updatedPayload = {
                id: editingLocation.id,
                name: values.name,
                parentId: values.parentId ? values.parentId : null
            };

            await axios.put(`${API_BASE_URL}/location/update`, updatedPayload);
            message.success('تغییرات با موفقیت اعمال شد');
            setIsEditModalOpen(false);
            setEditingLocation(null);
            fetchLocations();
        } catch (error) {
            message.error('خطا در به‌روزرسانی اطلاعات');
        }
    };

    // استایل‌های عمومی فیلدهای تیره داشبورد وستا
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

    // تابع رندر کارت‌ها به صورت درختی و بازگشتی برای حفظ لایه‌ها و رنگ‌ لبه‌ها
    const renderLocationTree = (loc, depth = 0) => {
        // رنگ لبه‌های کناری نئونی بر اساس عمق (آشپزخانه صورتی، بعدی آبی، بعدی سبز - دقیقاً مثل عکس)
        const borderColors = ['#ec4899', '#3b82f6', '#10b981', '#facc15'];
        const currentBorderColor = borderColors[depth % borderColors.length];

        // پیدا کردن بچه‌های این فضا بر اساس parentId ارسالی از DTO دیتابیس
        const children = locations.filter(child => child.parentId === loc.id);

        return (
            <div key={loc.id} style={{ width: '100%' }}>
                {/* کارت اصلی فضا */}
                <div style={{
                    background: '#151f32',
                    border: '1px solid #1e293b',
                    // اعمال فاصله افقی (Margin) از راست متناسب با عمق درختواره
                    marginRight: `${depth * 32}px`,
                    marginLeft: '0px',
                    marginBottom: '12px',
                    borderLeft: `5px solid ${currentBorderColor}`, // لبه رنگی نئونی سمت چپ
                    borderRadius: '12px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Space size="middle">
                        <div style={{ background: `${currentBorderColor}20`, padding: '8px', borderRadius: '8px', display: 'flex' }}>
                            <HomeOutlined style={{ color: currentBorderColor, fontSize: '18px' }} />
                        </div>
                        <Text style={{ color: '#fff', fontSize: '15px' }}>{loc.name}</Text>
                    </Space>

                    <Space size="middle">
                        <Button type="text" icon={<EditOutlined style={{ color: '#3b82f6' }} />} onClick={() => openEditModal(loc)} />
                        <Popconfirm title="آیا از حذف این فضا اطمینان دارید؟" onConfirm={() => handleDelete(loc.id)} okText="بله" cancelText="خیر">
                            <Button type="text" icon={<DeleteOutlined style={{ color: '#ef4444' }} />} />
                        </Popconfirm>
                    </Space>
                </div>

                {/* رندر بازگشتی برای فرزندان این فضا با افزایش عمق (depth + 1) */}
                {children.map(child => renderLocationTree(child, depth + 1))}
            </div>
        );
    };


    return (
        <Layout style={{ background: 'transparent', padding: '20px', direction: 'rtl' }}>

            {/* هدر بالایی کامپوننت */}
            <Header style={{ background: '#151f32', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #1e293b', height: '84px' }}>
                <Space size="middle" align="center">
                    {/* دکمه بازگشت فانتزی سمت راست */}
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined style={{ color: '#fff' }} />}
                        onClick={() => navigate(-1)}
                        style={{ background: '#1e293b', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />

                    {/* باکس هماهنگ‌کننده آیکون GPS و متن‌ها */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                        {/* آیکون پین لوکیشن (قطره آبی) با استایل نئونی وستا */}
                        <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <EnvironmentOutlined style={{ color: '#ec4899', fontSize: '22px' }} />
                        </div>

                        {/* چیدمان عمودی متن‌ها با فاصله مناسب و فونت خوانا */}
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 'normal', lineHeight: '1.2', fontSize: '17px' }}>
                                مدیریت هوشمند فضاها
                            </Title>
                            <Text style={{ color: '#64748b', fontSize: '13.5px', marginTop: '6px', display: 'block', fontWeight: '300' }}>
                                ساختار درختی ساختمان خود را مدیریت کنید
                            </Text>
                        </div>

                    </div>
                </Space>

                {/* بخش چپ هدر برای حفظ تعادل بصری دیزاین */}
                <div></div>
            </Header>
            <Content style={{ width: '100%' }}>
                {/* فرم ثبت فضا در یک خط افقی - عین عکس ارسالی */}
                <div style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                    <Form form={form} onFinish={onFinish} layout="inline" style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>

                        {/* ۱. ورودی نام فضا */}
                        {/* ورودی متن - نام فضا (اصلاح رنگ پلیس‌هولدر به خاکستری) */}
                        <Form.Item name="name" rules={[{ required: true, message: 'نام فضا را وارد کنید' }]} style={{ flex: '1', minWidth: '200px', margin: 0 }}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Input: {
                                            colorTextPlaceholder: '#64748b', // 👈 خاکستری کردن پلیس‌هولدر (عین پرنت)
                                            colorText: '#ffffff',            // سفید ماندن متن ورودی
                                        }
                                    }
                                }}
                            >
                                <Input
                                    placeholder="نام فضای جدید..."
                                    style={{
                                        backgroundColor: '#1a263f',
                                        borderColor: '#2e3f61',
                                        borderRadius: '8px',
                                        height: '44px'
                                    }}
                                />
                            </ConfigProvider>
                        </Form.Item>
                        {/* ۲. انتخاب مکان اصلی (والد) */}
                        <Form.Item name="parentId" style={{ width: '260px', margin: 0 }}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Select: {
                                            selectorBg: '#1a263f',          // رنگ پس‌زمینه باکس سلکتور
                                            colorText: '#ffffff',           // رنگ متن انتخاب شده
                                            colorTextPlaceholder: '#64748b', // رنگ متن راهنما
                                            colorBorder: '#2e3f61',         // رنگ بوردر دور باکس
                                            optionActiveBg: '#2e3f61',      // رنگ آپشن موقع هاور
                                            optionSelectedBg: '#be185d',    // رنگ آپشن وقتی انتخاب شده
                                        }
                                    }
                                }}
                            >
                                <Select
                                    placeholder="- به عنوان مکان اصلی -"
                                    dropdownStyle={{
                                        backgroundColor: '#151f32',
                                        border: '1px solid #2e3f61',
                                    }}
                                    allowClear
                                    size="large"
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        color: '#fff' // سفید کردن متن اصلی درون باکس
                                    }}
                                >
                                    {locations.map(loc => (
                                        <Select.Option key={loc.id} value={loc.id}>
                                            <span style={{ color: '#fff' }}>{loc.name}</span>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </ConfigProvider>
                        </Form.Item>

                        {/* ۳. دکمه ثبت فضا (رنگ صورتی داشبورد وستا) */}
                        <Form.Item style={{ margin: 0 }}>
                            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ height: '44px', background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)', border: 'none', borderRadius: '8px', fontWeight: 'bold', padding: '0 24px' }}>
                                ثبت فضا
                            </Button>
                        </Form.Item>
                    </Form>
                </div>

                {/* نمایش درختی فضاهای فعال در دیتابیس */}
                <div style={{ width: '100%' }}>
                    {locations.length === 0 ? (
                        <div style={{ background: '#151f32', padding: '60px', borderRadius: '16px', border: '1px dashed #1e293b', textAlign: 'center' }}>
                            <Empty description={<span style={{color:'#64748b'}}>هیچ فضا یا موقعیتی یافت نشد. اولین فضا را ثبت کنید.</span>} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {rootLocations.map(rootLoc => renderLocationTree(rootLoc, 0))}
                        </div>
                    )}
                </div>
            </Content>

            {/* مدال ویرایش فضا - ۱00٪ دارک و با افکت شیشه‌ای (بلور) پشت */}
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
                    title="ویرایش اطلاعات فضا / موقعیت"
                    open={isEditModalOpen}
                    onCancel={() => { setIsEditModalOpen(false); setEditingLocation(null); }}
                    footer={null}
                    style={{ direction: 'rtl' }}
                    width={550}
                    centered
                    styles={{
                        mask: {
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                        }
                    }}
                >
                    <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: '20px' }}>
                        <Form.Item name="name" label="نام موقعیت" rules={[{ required: true, message: 'وارد کردن نام الزامی است' }]}>
                            <Input style={{ ...darkFieldStyle, height: '42px' }} />
                        </Form.Item>

                        <Form.Item name="parentId" label="موقعیت والد (تغییر جایگاه)">
                            <Select dropdownStyle={dropdownStyle} style={{ ...darkFieldStyle, height: '42px' }} allowClear placeholder="تبدیل به مکان اصلی...">
                                {locations
                                    .filter(loc => editingLocation && loc.id !== editingLocation.id) // جلوگیری از لوپ والد خود شدن
                                    .map(loc => (
                                        <Select.Option key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'left', marginBottom: 0, marginTop: '24px' }}>
                            <Button type="primary" htmlType="submit" style={{ background: '#10b981', border: 'none', borderRadius: '8px', fontWeight: 'bold', height: '40px', padding: '0 24px' }}>
                                ثبت تغییرات
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </ConfigProvider>
        </Layout>
    );
};

export default LocationManager;