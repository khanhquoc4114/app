// 2.Định nghĩa class BookingItem để dùng cho các booking
class BookingItem {
    constructor(key, id, facility, sport, date, time, amount, status, location, options = {}) {
        this.key = key; // key cho Table
        this.id = id; // mã đặt sân
        this.facility = facility; // tên sân
        this.sport = sport; // môn thể thao
        this.date = date; // ngày đặt
        this.time = time; // khung giờ
        this.amount = amount; // số tiền
        this.status = status; // trạng thái
        this.location = location; // địa chỉ sân
        // Các thuộc tính tuỳ chọn (canCancel, canReview, reviewed, refunded...)
        Object.assign(this, options);
    }
}

export default BookingItem;
