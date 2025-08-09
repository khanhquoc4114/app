import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationBufferMemory
from langchain.schema import BaseMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiChatbot:
    def __init__(self):
        # Khởi tạo model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.7,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        # Tạo prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """Bạn là trợ lý đặt sân thể thao thông minh tên là SportBot.
            
            Nhiệm vụ của bạn:
            - Giúp khách hàng đặt sân thể thao (cầu lông, tennis, bóng đá, v.v.)
            - Hỏi thông tin cần thiết: thời gian, loại sân, số người chơi, ngân sách
            - Đưa ra gợi ý phù hợp
            - Trả lời bằng tiếng Việt thân thiện và chuyên nghiệp
            
            Thông tin sân hiện có:
            - Sân cầu lông: 100k/giờ, có 5 sân
            - Sân tennis: 150k/giờ, có 3 sân  
            - Sân bóng đá mini: 300k/giờ, có 2 sân
            """),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Tạo chain
        self.chain = self.prompt | self.llm | StrOutputParser()
        
        # Memory để lưu lịch sử hội thoại
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
    
    def chat(self, user_input: str) -> str:
        """Chat với user"""
        try:
            # Lấy lịch sử chat
            chat_history = self.memory.chat_memory.messages
            
            # Gọi chain
            response = self.chain.invoke({
                "input": user_input,
                "chat_history": chat_history
            })
            
            # Lưu vào memory
            self.memory.chat_memory.add_user_message(user_input)
            self.memory.chat_memory.add_ai_message(response)
            
            return response
            
        except Exception as e:
            return f"Xin lỗi, có lỗi xảy ra: {e}"
    
    def clear_history(self):
        """Xóa lịch sử hội thoại"""
        self.memory.clear()
        print("Đã xóa lịch sử hội thoại!")

# Sử dụng chatbot
if __name__ == "__main__":
    # Khởi tạo chatbot
    bot = GeminiChatbot()
    
    print("🏸 SportBot - Trợ lý đặt sân thể thao")
    print("Gõ 'exit' để thoát, 'clear' để xóa lịch sử")
    print("-" * 50)
    
    while True:
        user_input = input("\n🧑 Bạn: ")
        
        if user_input.lower() == 'exit':
            print("👋 Tạm biệt! Hẹn gặp lại!")
            break
        elif user_input.lower() == 'clear':
            bot.clear_history()
            continue
        elif user_input.strip() == '':
            continue
        
        # Chat với bot
        response = bot.chat(user_input)
        print(f"🤖 SportBot: {response}")

# Hoặc test tự động
def test_chatbot():
    """Test chatbot tự động"""
    bot = GeminiChatbot()
    
    test_messages = [
        "Xin chào, tôi muốn đặt sân",
        "Tôi muốn đặt sân cầu lông",
        "Vào 8h sáng mai được không?",
        "4 người chơi",
        "Giá bao nhiêu vậy?"
    ]
    
    print("=== TEST CHATBOT TỰ ĐỘNG ===")
    for msg in test_messages:
        print(f"\n🧑 User: {msg}")
        response = bot.chat(msg)
        print(f"🤖 Bot: {response}")

# Uncomment để test
# test_chatbot()