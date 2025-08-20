// Class utilities for FacilitiesPage (if needed)
// You can define helper classes or models here

class FacilityHelper {
    static getSportIcon(sportType) {
        const icons = {
            badminton: '🏸',
            football: '⚽',
            tennis: '🎾',
            basketball: '🏀'
        };
        return icons[sportType] || '🏃';
    }

    static getSportName(sportType) {
        const names = {
            badminton: 'Cầu lông',
            football: 'Bóng đá',
            tennis: 'Tennis',
            basketball: 'Bóng rổ'
        };
        return names[sportType] || sportType;
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    static getShortAmenityName(amenity) {
        const shortNames = {
            'Điều hòa': 'AC',
            'Điều hòa phòng chờ': 'AC',
            'Wifi': 'WiFi',
            'Bãi đỗ xe': 'Parking',
            'Phòng thay đồ': 'Thay đồ',
            'Căng tin': 'Căng tin',
            'Thuê vợt': 'Thuê vợt',
            'Âm thanh': 'Audio',
            'Phòng tắm': 'WC',
            'Tủ khóa': 'Locker'
        };
        return shortNames[amenity] || amenity;
    }
}

export default FacilityHelper;
