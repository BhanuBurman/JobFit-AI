from typing import Annotated, List, TypedDict, Dict, Any
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, add_messages, START, END
from app.external import llm
from app.core.database import async_db  # <--- Import the global DB instance

# --- Define Graph Logic ---
class ChatState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

def call_llm(state: ChatState) -> Dict[str, List[AIMessage]]:
    messages = state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}

workflow = StateGraph(ChatState)
workflow.add_node("chatbot", call_llm)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)

class ChatBotService:
    # No __init__ needed for pool anymore
    
    # We removed the 'initialize' method because we don't need to inject the pool manually.
    
    async def generate_response(self, user_id: int, thread_id: str, message: str) -> str:
        """
        Executes the graph using the global async_db pool.
        """
        # We use the helper method from your database.py
        # This handles the connection and checkpointer creation automatically
        async for checkpointer in async_db.get_checkpointer():
            
            # 1. Compile the graph with this specific connection/checkpointer
            app_graph = workflow.compile(checkpointer=checkpointer)
            
            # 2. Config
            config = {"configurable": {"thread_id": thread_id}}
            input_messages = [HumanMessage(content=message)]
            
            # 3. Invoke
            result = await app_graph.ainvoke(
                {"messages": input_messages}, 
                config=config
            )
            
            return result["messages"][-1].content
    
    async def get_chat_history(self, user_id: int, thread_id: str) -> List[Dict[str, Any]]:
        config = {"configurable": {"thread_id": thread_id}}
        
        # FIX 1: Change 'async with' to 'async for'
        async for checkpointer in async_db.get_checkpointer():
            
            # Note: Ensure you use .aget (async get)
            snapshot = await checkpointer.aget(config)
            
            if not snapshot:
                return []

            raw_messages = snapshot['channel_values']['messages']
            
            clean_history = []
            for msg in raw_messages:
                clean_history.append({
                    "role": msg.type,
                    "content": msg.content,
                })
            
            return clean_history