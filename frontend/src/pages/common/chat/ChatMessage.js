// ChatMessage class đại diện cho một tin nhắn trong chat
export default class ChatMessage {
    constructor(id, type, content, timestamp, avatar = null) {
        this.id = id;
        this.type = type; // 'user', 'bot', 'staff', 'system'
        this.content = content;
        this.timestamp = timestamp;
        this.avatar = avatar;
    }
}
