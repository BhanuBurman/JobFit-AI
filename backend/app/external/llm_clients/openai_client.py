import os, getpass
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

a4f_api_key = os.getenv("A4F_API_KEY")
a4f_base_url = os.getenv("A4F_BASE_URL")

llm = ChatOpenAI(
    model="provider-3/gpt-4o-mini",
    api_key=a4f_api_key,
    base_url=a4f_base_url, 
    temperature=0.5,
)
