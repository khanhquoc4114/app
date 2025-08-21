// Định nghĩa class FacilityItem giống như BookingItem
class FacilityItem {
    constructor(id, name, sport_type, description, price_per_hour, status, bookings_today, bookings_this_month, revenue_today, revenue_this_month, image_url, amenities, key) {
        this.id = id;
        this.key = key || id;
        this.name = name;
        this.sport_type = sport_type;
        this.description = description;
        this.price_per_hour = price_per_hour;
        this.status = status;
        this.bookings_today = bookings_today;
        this.bookings_this_month = bookings_this_month;
        this.revenue_today = revenue_today;
        this.revenue_this_month = revenue_this_month;
        this.image_url = image_url;
        this.amenities = amenities || [];
    }
}

export default FacilityItem;
