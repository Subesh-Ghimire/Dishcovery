# gemini_wrapper.py
import os
from google import genai

# Initialize the Gemini client with your API key from .env
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class UserMessage:
    def __init__(self, text: str):
        self.text = text

class LlmChat:
    def __init__(self, api_key=None, session_id=None, system_message=None):
        self.system_message = system_message

    def with_model(self, model_type, model_name):
        self.model_name = model_name
        return self

    async def send_message(self, user_message: UserMessage):
        # Async call to Gemini
        response = await client.aio.models.generate_content(
            model=self.model_name,
            contents=f"{self.system_message}\n{user_message.text}"
        )
        return response.text
