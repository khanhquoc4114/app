// Class đại diện cho một người dùng trong dashboard admin
export default class AdminUser {
    constructor(id, username, full_name, email, role, is_active, total_bookings, total_spent, created_at) {
        this.id = id;
        this.username = username;
        this.full_name = full_name;
        this.email = email;
        this.role = role;
        this.is_active = is_active;
        this.total_bookings = total_bookings;
        this.total_spent = total_spent;
        this.created_at = created_at;
    }
}
