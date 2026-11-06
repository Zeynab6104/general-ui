import { useState, useEffect } from 'react';
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
    EyeOutlined,
    UserOutlined,
    UserAddOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = 'http://localhost:8080/api';

// نقش‌های کاربر — مثل CATEGORY_TYPES در CategoryManager
const USER_ROLES = {
    ADMIN: { label: 'مدیر', color: '#8b5cf6' },
    USER: { label: 'کاربر', color: '#3b82f6' }
};

const UserManager = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const [users, setUsers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileUser, setProfileUser] = useState(null);

    // ۱. واکشی کاربران از دیتابیس — مثل fetchCategories / fetchLocations
    // فرض: بک‌اند مثل بقیه موجودیت‌ها اندپوینت‌های مفرد دارد:
    // GET /user/getAll ، POST /user/save ، PUT /user/update ، DELETE /user/delete/{id}
    // اگر نام اندپوینت در بک‌اند فرق می‌کند، فقط همین چهار رشته را عوض کنید.
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/user/getAll`);
            setUsers(res.data || []);
        } catch (error) {
            console.error('خطا در به‌روزرسانی لیست کاربران:', error);
        }
    };

    useEffect(() => {
        const initPageData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/user/getAll`);
                setUsers(res.data || []);
            } catch (error) {
                console.error('خطا در بارگذاری اطلاعات کاربران:', error);
                message.error('خطا در بارگذاری اطلاعات کاربران');
            }
        };

        initPageData();
    }, []);

    // ۲. ثبت کاربر جدید
    const onFinish = async (values) => {
        try {
            const userPayload = {
                name: values.name,
                username: values.username,
                email: values.email,
                phone: values.phone || null,
                role: values.role,
                password: values.password
            };

            await axios.post(`${API_BASE_URL}/user/save`, userPayload);
            message.success('کاربر جدید با موفقیت ذخیره شد');
            form.resetFields();
            fetchUsers();
        } catch (error) {
            console.error('خطا در ذخیره‌سازی کاربر جدید:', error);
            message.error('خطا در ذخیره‌سازی کاربر جدید');
        }
    };

    // ۳. حذف کاربر
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/user/delete/${id}`);
            message.warning('کاربر با موفقیت حذف شد');
            fetchUsers();
        } catch (error) {
            console.error('خطا در حذف کاربر:', error);
            message.error('خطا در حذف کاربر');
        }
    };

    // ۴. مشاهده پروفایل کاربر
    const openProfileModal = (user) => {
        setProfileUser(user);
        setIsProfileModalOpen(true);
    };

    // ۵. باز کردن مدال ویرایش
    const openEditModal = (user) => {
        setEditingUser(user);
        editForm.setFieldsValue({
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone || undefined,
            role: user.role,
            password: undefined
        });
        setIsEditModalOpen(true);
    };

    // ۶. ثبت تغییرات ویرایش — رمز عبور فقط وقتی فرستاده می‌شود که پر شده باشد
    const handleUpdate = async (values) => {
        try {
            const updatedPayload = {
                id: editingUser.id,
                name: values.name,
                username: values.username,
                email: values.email,
                phone: values.phone || null,
                role: values.role
            };
            if (values.password) {
                updatedPayload.password = values.password;
            }

            await axios.put(`${API_BASE_URL}/user/update`, updatedPayload);
            message.success('تغییرات با موفقیت اعمال شد');
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('خطا در به‌روزرسانی اطلاعات:', error);
            message.error('خطا در به‌روزرسانی اطلاعات');
        }
    };

    const darkFieldStyle = {
        backgroundColor: '#1a263f',
        borderColor: '#2e3f61',
        borderRadius: '8px'
    };

    const dropdownStyle = {
        backgroundColor: '#151f32',
        border: '1px solid #2e3f61',
        borderRadius: '8px'
    };

    const getRoleInfo = (role) => USER_ROLES[role] || { label: role || 'نامشخص', color: '#64748b' };

    const getInitial = (user) => (user.name || user.username || '?').trim().charAt(0);

    return (
        <Layout style={{ background: 'transparent', padding: '20px' }}>
            <Header style={{ background: '#151f32', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #1e293b', height: '64px' }}>
                <Space size="middle">
                    <Button type="text" icon={<ArrowRightOutlined style={{ color: '#fff' }} />} onClick={() => navigate('/')} style={{ background: '#1e293b', borderRadius: '8px' }} />
                    <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>مدیریت کاربران</Title>
                </Space>
                <UserOutlined style={{ color: '#8b5cf6', fontSize: '20px' }} />
            </Header>

            <Content style={{ width: '100%' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={10}>
                        <Card
                            title={<span style={{ color: '#fff' }}><UserAddOutlined /> تعریف کاربر جدید</span>}
                            style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px' }}
                            bodyStyle={{ padding: '24px' }}
                        >
                            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ role: 'USER' }}>
                                <Form.Item name="name" label={<Text style={{ color: '#94a3b8' }}>نام و نام خانوادگی</Text>} rules={[{ required: true, message: 'لطفاً نام را وارد کنید' }]}>
                                    <Input
                                        placeholder="مثلاً: زینب محمدی"
                                        style={{ ...darkFieldStyle, color: '#fff', fontWeight: 'bold', height: '42px' }}
                                    />
                                </Form.Item>

                                <Form.Item name="username" label={<Text style={{ color: '#94a3b8' }}>نام کاربری</Text>} rules={[{ required: true, message: 'لطفاً نام کاربری را وارد کنید' }]}>
                                    <Input
                                        placeholder="مثلاً: zeynab"
                                        style={{ ...darkFieldStyle, color: '#fff', height: '42px' }}
                                    />
                                </Form.Item>

                                <Form.Item name="email" label={<Text style={{ color: '#94a3b8' }}>ایمیل</Text>} rules={[{ required: true, message: 'لطفاً ایمیل را وارد کنید' }, { type: 'email', message: 'ایمیل معتبر نیست' }]}>
                                    <Input
                                        placeholder="example@mail.com"
                                        style={{ ...darkFieldStyle, color: '#fff', height: '42px' }}
                                    />
                                </Form.Item>

                                <Form.Item name="phone" label={<Text style={{ color: '#94a3b8' }}>تلفن</Text>}>
                                    <Input
                                        placeholder="09123456789"
                                        style={{ ...darkFieldStyle, color: '#fff', height: '42px' }}
                                    />
                                </Form.Item>

                                <Form.Item name="role" label={<Text style={{ color: '#94a3b8' }}>نقش</Text>} rules={[{ required: true, message: 'انتخاب نقش الزامی است' }]}>
                                    <Select
                                        placeholder="انتخاب نقش..."
                                        dropdownStyle={dropdownStyle}
                                        size="large"
                                        style={{ width: '100%', ...darkFieldStyle }}
                                    >
                                        <Select.Option value="ADMIN" style={{ backgroundColor: '#151f32', color: '#fff' }}>مدیر</Select.Option>
                                        <Select.Option value="USER" style={{ backgroundColor: '#151f32', color: '#fff' }}>کاربر</Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item name="password" label={<Text style={{ color: '#94a3b8' }}>رمز عبور</Text>} rules={[{ required: true, message: 'لطفاً رمز عبور را وارد کنید' }]}>
                                    <Input.Password
                                        placeholder="رمز عبور"
                                        style={{ ...darkFieldStyle, color: '#fff', height: '42px' }}
                                    />
                                </Form.Item>

                                <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} style={{ height: '42px', background: '#8b5cf6', border: 'none', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold' }}>
                                    ذخیره
                                </Button>
                            </Form>
                        </Card>
                    </Col>

                    {/* لیست کاربران */}
                    <Col xs={24} lg={14}>
                        <div style={{ marginBottom: '16px' }}>
                            <Text style={{ color: '#64748b' }}>کاربران فعال</Text>
                        </div>

                        {users.length === 0 ? (
                            <div style={{ background: '#151f32', padding: '60px', borderRadius: '16px', border: '1px dashed #1e293b', textAlign: 'center' }}>
                                <Empty description={<span style={{ color: '#64748b' }}>هیچ کاربری در دیتابیس یافت نشد.</span>} />
                            </div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {users.map((user) => {
                                    const roleInfo = getRoleInfo(user.role);
                                    return (
                                        <Col span={24} key={user.id}>
                                            <Card style={{ background: '#151f32', border: '1px solid #1e293b', borderRadius: '12px' }} bodyStyle={{ padding: '16px' }}>
                                                <Row align="middle" justify="space-between">
                                                    <Col>
                                                        <Space size="middle">
                                                            <div style={{ background: `${roleInfo.color}20`, width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ color: roleInfo.color, fontSize: '20px', fontWeight: 'bold' }}>{getInitial(user)}</Text>
                                                            </div>
                                                            <div>
                                                                <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 'normal' }}>{user.name}</Title>
                                                                <Text style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>@{user.username}</Text>
                                                                <Tag style={{ backgroundColor: `${roleInfo.color}20`, border: `1px solid ${roleInfo.color}`, color: roleInfo.color, marginTop: '5px', borderRadius: '6px', padding: '2px 10px' }}>
                                                                    {roleInfo.label}
                                                                </Tag>
                                                            </div>
                                                        </Space>
                                                    </Col>
                                                    <Col style={{ textAlign: 'left' }}>
                                                        <Space>
                                                            <Button type="text" icon={<EyeOutlined style={{ color: '#10b981' }} />} onClick={() => openProfileModal(user)} title="مشاهده پروفایل" />
                                                            <Button type="text" icon={<EditOutlined style={{ color: '#3b82f6' }} />} onClick={() => openEditModal(user)} />
                                                            <Popconfirm title="آیا از حذف این کاربر اطمینان دارید" onConfirm={() => handleDelete(user.id)} okText="بله" cancelText="خیر">
                                                                <Button type="text" danger icon={<DeleteOutlined />} />
                                                            </Popconfirm>
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

            {/* مدال پروفایل کاربر */}
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: { colorBgElevated: '#151f32', colorText: '#fff', colorBorder: '#2e3f61' },
                    components: { Modal: { headerBg: '#151f32', contentBg: '#151f32', footerBg: '#151f32' } }
                }}
            >
                <Modal
                    title="پروفایل کاربر"
                    open={isProfileModalOpen}
                    onCancel={() => { setIsProfileModalOpen(false); setProfileUser(null); }}
                    footer={null}
                    style={{ direction: 'rtl' }}
                    width={500}
                    centered
                    styles={{ mask: { backdropFilter: 'blur(4px)' }, content: { background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' } }}
                >
                    {profileUser && (
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <div style={{ background: `${getRoleInfo(profileUser.role).color}20`, width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                                <Text style={{ color: getRoleInfo(profileUser.role).color, fontSize: '32px', fontWeight: 'bold' }}>{getInitial(profileUser)}</Text>
                            </div>
                            <Title level={4} style={{ color: '#fff', margin: '0 0 4px 0' }}>{profileUser.name}</Title>
                            <Text style={{ color: '#64748b' }}>@{profileUser.username}</Text>
                            <div style={{ marginTop: '12px' }}>
                                <Tag style={{ backgroundColor: `${getRoleInfo(profileUser.role).color}20`, border: `1px solid ${getRoleInfo(profileUser.role).color}`, color: getRoleInfo(profileUser.role).color, borderRadius: '6px', padding: '2px 10px' }}>
                                    {getRoleInfo(profileUser.role).label}
                                </Tag>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Space><MailOutlined style={{ color: '#94a3b8' }} /><Text style={{ color: '#fff' }}>{profileUser.email || '—'}</Text></Space>
                                <Space><PhoneOutlined style={{ color: '#94a3b8' }} /><Text style={{ color: '#fff' }}>{profileUser.phone || '—'}</Text></Space>
                                <Space><UserOutlined style={{ color: '#94a3b8' }} /><Text style={{ color: '#94a3b8' }}>شناسه کاربر: {profileUser.id}</Text></Space>
                            </div>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => { setIsProfileModalOpen(false); openEditModal(profileUser); }}
                                style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', marginTop: '24px', height: '40px', padding: '0 24px' }}
                            >
                                ویرایش پروفایل
                            </Button>
                        </div>
                    )}
                </Modal>
            </ConfigProvider>

            {/* مدال ویرایش */}
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: { colorBgElevated: '#151f32', colorText: '#fff', colorBorder: '#2e3f61' },
                    components: {
                        Modal: { headerBg: '#151f32', contentBg: '#151f32', footerBg: '#151f32' },
                        Select: { selectorBg: '#1a263f' }
                    }
                }}
            >
                <Modal
                    title="ویرایش اطلاعات کاربر"
                    open={isEditModalOpen}
                    onCancel={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                    footer={null}
                    style={{ direction: 'rtl' }}
                    width={600}
                    centered
                    styles={{ mask: { backdropFilter: 'blur(4px)' }, content: { background: '#151f32', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' } }}
                >
                    <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: '20px' }}>
                        <Form.Item name="name" label="نام و نام خانوادگی" rules={[{ required: true, message: 'نام الزامی است' }]}>
                            <Input style={darkFieldStyle} />
                        </Form.Item>
                        <Form.Item name="username" label="نام کاربری" rules={[{ required: true, message: 'نام کاربری الزامی است' }]}>
                            <Input style={darkFieldStyle} />
                        </Form.Item>
                        <Form.Item name="email" label="ایمیل" rules={[{ required: true, message: 'ایمیل الزامی است' }, { type: 'email', message: 'ایمیل معتبر نیست' }]}>
                            <Input style={darkFieldStyle} />
                        </Form.Item>
                        <Form.Item name="phone" label="تلفن">
                            <Input style={darkFieldStyle} />
                        </Form.Item>
                        <Form.Item name="role" label="نقش" rules={[{ required: true }]}>
                            <Select dropdownStyle={dropdownStyle} style={{ ...darkFieldStyle, height: '42px' }}>
                                <Select.Option value="ADMIN">مدیر</Select.Option>
                                <Select.Option value="USER">کاربر</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="password" label="رمز عبور جدید (اختیاری)">
                            <Input.Password placeholder="خالی بگذارید اگر نمی‌خواهید تغییر کند" style={{ ...darkFieldStyle, height: '42px' }} />
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

export default UserManager;
