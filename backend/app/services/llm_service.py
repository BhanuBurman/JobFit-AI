from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.external import llm
from langchain_core.messages import SystemMessage, trim_messages

class OPENAIService:
    def __init__(self): 
        self.llm = llm
        self.trimmer = trim_messages(
                        max_tokens=65,
                        strategy="last",
                        token_counter=self.llm,
                        include_system=True,
                        allow_partial=False,
                        start_on="human",
                    )
        workflow = StateGraph(state_schema=MessagesState)
        workflow.add_edge(START, "model")
        workflow.add_node("model", self.call_model)
        memory = MemorySaver()
        self.app = workflow.compile(checkpointer=memory)

    async def call_model(self, state):
        trimmed_messages = self.trimmer.invoke(state["messages"])
        prompt = self.get_prompt_template()
        resp = await self.llm.ainvoke(prompt.invoke(trimmed_messages))
        return {"messages": [resp]}

    def get_config(self, id):
        return {"configurable": {"thread_id": id}}

    def get_prompt_template(self):
        return ChatPromptTemplate.from_messages(
            [
                ("system", "You are a helpful assistant that can explain about resume and career guidance. You are given a query and you need to answer it in a way that is helpful and informative."),
                MessagesPlaceholder(variable_name="messages"),
            ]
        )



    async def generate_response(self, query, id):
        config = self.get_config(id)
        response = await self.app.ainvoke({"messages": [HumanMessage(content=query)]}, config=config)    
        return response["messages"][-1].content
    




