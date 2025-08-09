import React, { useState } from 'react';
import { FloatingActionButton } from './AnimatedComponents';
import { Drawer, List, Button, Typography } from 'antd';
import {
    PlusOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MessageOutlined,
    QuestionCircleOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const QuickActions = () => {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Đặt sân nhanh',
            icon: <CalendarOutlined />,
            description: 'Tìm và đặt sân ngay lập tức',
            action: () => {
                navigate('/facilities');
                setVisible(false);
            }
        },
        {
            title: 'Hỗ trợ trực tuyến',
            icon: <CustomerServiceOutlined />,
            description: 'Chat với AI hỗ trợ 24/7',
            action: () => {
                navigate('/chat');
                setVisible(false);
            }
        },
        {
            title: 'Liên hệ hotline',
            icon: <PhoneOutlined />,
            description: 'Gọi ngay: 1900-xxxx',
            action: () => {
                window.open('tel:1900xxxx');
            }
        },
        {
            title: 'Câu hỏi thường gặp',
            icon: <QuestionCircleOutlined />,
            description: 'Tìm câu trả lời nhanh chóng',
            action: () => {
                // Navigate to FAQ page
                setVisible(false);
            }
        }
    ];

    return (
        <>
            <FloatingActionButton
                icon={<PlusOutlined />}
                onClick={() => setVisible(true)}
                tooltip="Hành động nhanh"
            />

            <Drawer
                title={<Title level={4} style={{ margin: 0 }}>Hành động nhanh</Title>}
                placement="bottom"
                onClose={() => setVisible(false)}
                open={visible}
                height={300}
            >
                <List
                    dataSource={actions}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: '#1890ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 18
                                    }}>
                                        {item.icon}
                                    </div>
                                }
                                title={item.title}
                                description={item.description}
                            />
                            <Button type="primary" onClick={item.action}>
                                Thực hiện
                            </Button>
                        </List.Item>
                    )}
                />
            </Drawer>
        </>
    );
};

export default QuickActions;