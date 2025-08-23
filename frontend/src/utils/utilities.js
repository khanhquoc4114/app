// utilities.js: Chứa các hàm dùng chung cho nhiều trang

// Hàm mở Google Maps chỉ đường hoặc tìm kiếm địa điểm
export const openGoogleMaps = (facility, userLocation) => {
    const destination = encodeURIComponent(facility.location);
    let url;
    if (userLocation) {
        url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${destination}`;
    } else {
        url = `https://www.google.com/maps/search/${destination}`;
    }
    window.open(url, '_blank');
};

// Hàm xử lý thêm/bỏ yêu thích cho facility
export const toggleFavoriteFacility = (facilityId) => {
    const key = 'facilityFavorites';
    let favorites = [];
    try {
        const saved = localStorage.getItem(key);
        if (saved) favorites = JSON.parse(saved);
    } catch {}
    let updated;
    if (favorites.includes(facilityId)) {
        updated = favorites.filter(id => id !== facilityId);
        localStorage.setItem(key, JSON.stringify(updated));
        return { isFavorite: false, favorites: updated };
    } else {
        updated = [...favorites, facilityId];
        localStorage.setItem(key, JSON.stringify(updated));
        return { isFavorite: true, favorites: updated };
    }
};

// Hàm kiểm tra facility có trong danh sách yêu thích không
export const isFavoriteFacility = (facilityId) => {
    try {
        const saved = localStorage.getItem('facilityFavorites');
        if (saved) {
            const favorites = JSON.parse(saved);
            return favorites.includes(facilityId);
        }
    } catch {}
    return false;
};
