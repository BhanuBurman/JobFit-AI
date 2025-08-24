from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize embedding model
embeddings = OpenAIEmbeddings(model="provider-3/text-embedding-3-small",
base_url=os.getenv("A4F_BASE_URL"),
api_key=os.getenv("A4F_API_KEY")
)