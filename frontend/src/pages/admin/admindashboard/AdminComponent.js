import { Typography, Select, Tabs, DatePicker, Image } from "antd";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export const ImagePreview = ({ src, alt, title }) => {
    const getImageUrl = (imagePath) => {
        return imagePath ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/uploads/${imagePath.split('/').pop()}` : null;
    };

    return (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{title}</Text>
            {src ? (
                <Image
                    src={getImageUrl(src)}
                    alt={alt}
                    style={{ 
                        width: '100%', 
                        maxWidth: 200, 
                        height: 150, 
                        objectFit: 'cover',
                        border: '1px solid #d9d9d9',
                        borderRadius: 6
                    }}
                    preview={{
                        mask: 'Xem chi tiết'
                    }}
                    fallback="/api/placeholder/200/150"
                />
            ) : (
                <div style={{ 
                    width: 200, 
                    height: 150, 
                    backgroundColor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px dashed #d9d9d9',
                    borderRadius: 6
                }}>
                    <Text type="secondary">Không có hình ảnh</Text>
                </div>
            )}
        </div>
    );
};

export const FacilityImages = ({ images }) => {
    const parseImages = (imageData) => {
        try {
            return typeof imageData === 'string' ? JSON.parse(imageData) : imageData || [];
        } catch (error) {
            return [];
        }
    };

    const facilityImagesList = parseImages(images);
    
    const getImageUrl = (imagePath) => {
        return imagePath ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/uploads/${imagePath.split('/').pop()}` : null;
    };

    return (
        <div>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>Hình ảnh cơ sở ({facilityImagesList.length} ảnh)</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {facilityImagesList.map((imagePath, index) => (
                    <Image
                        key={index}
                        src={getImageUrl(imagePath)}
                        alt={`Cơ sở ${index + 1}`}
                        style={{ 
                            width: 120, 
                            height: 90, 
                            objectFit: 'cover',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4
                        }}
                        preview={{
                            mask: 'Xem'
                        }}
                        fallback="/api/placeholder/120/90"
                    />
                ))}
                {facilityImagesList.length === 0 && (
                    <div style={{ 
                        width: 120, 
                        height: 90, 
                        backgroundColor: '#f5f5f5', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px dashed #d9d9d9',
                        borderRadius: 4
                    }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Không có ảnh</Text>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CompactImagePreview = ({ src, alt, title, width = 80, height = 60 }) => {
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('uploads/')) {
            return `${baseURL}/${imagePath}`;
        }
        
        const fileName = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
        return `${baseURL}/uploads/${fileName}`;
    };

    const imageUrl = getImageUrl(src);

    return (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{title}</Text>
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={alt}
                    style={{ 
                        width: width, 
                        height: height, 
                        objectFit: 'cover',
                        border: '1px solid #d9d9d9',
                        borderRadius: 4
                    }}
                    preview={{
                        mask: 'Xem'
                    }}
                    fallback="data:image/svg+xml,%3Csvg%20width='80'%20height='60'%20xmlns='http://www.w3.org/2000/svg'%3E%3Crect%20width='100%25'%20height='100%25'%20fill='%23f0f0f0'/%3E%3Ctext%20x='50%25'%20y='50%25'%20text-anchor='middle'%20dy='.3em'%20fill='%23999'%20font-size='10'%3ELỗi%3C/text%3E%3C/svg%3E"
                />
            ) : (
                <div style={{ 
                    width: width, 
                    height: height, 
                    backgroundColor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px dashed #d9d9d9',
                    borderRadius: 4
                }}>
                    <Text type="secondary" style={{ fontSize: 10 }}>Không có</Text>
                </div>
            )}
        </div>
    );
};

export const CompactFacilityImages = ({ images, maxShow = 3 }) => {
    const parseImages = (imageData) => {
        try {
            return typeof imageData === 'string' ? JSON.parse(imageData) : imageData || [];
        } catch (error) {
            return [];
        }
    };

    const facilityImagesList = parseImages(images);
    const displayImages = facilityImagesList.slice(0, maxShow);
    const remainingCount = facilityImagesList.length - maxShow;
    
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('uploads/')) {
            return `${baseURL}/${imagePath}`;
        }
        
        const fileName = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
        return `${baseURL}/uploads/${fileName}`;
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                {displayImages.map((imagePath, index) => {
                    const imageUrl = getImageUrl(imagePath);
                    return (
                        <Image
                            key={index}
                            src={imageUrl}
                            alt={`Cơ sở ${index + 1}`}
                            style={{ 
                                width: 50, 
                                height: 40, 
                                objectFit: 'cover',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4
                            }}
                            preview={{
                                mask: false
                            }}
                            fallback="data:image/svg+xml,%3Csvg%20width='50'%20height='40'%20xmlns='http://www.w3.org/2000/svg'%3E%3Crect%20width='100%25'%20height='100%25'%20fill='%23f0f0f0'/%3E%3C/svg%3E"
                        />
                    );
                })}
                {remainingCount > 0 && (
                    <div style={{
                        width: 50,
                        height: 40,
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text style={{ fontSize: 10 }}>+{remainingCount}</Text>
                    </div>
                )}
            </div>
            {facilityImagesList.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>Không có hình ảnh</Text>
            )}
        </div>
    );
};