// Class đại diện cho một sân thể thao trong dashboard admin
export default class AdminFacility {
    constructor(id, name, sport_type, price_per_hour, status, bookings_count, revenue, owner) {
        this.id = id;
        this.name = name;
        this.sport_type = sport_type;
        this.price_per_hour = price_per_hour;
        this.status = status;
        this.bookings_count = bookings_count;
        this.revenue = revenue;
        this.owner = owner;
    }
}
