import json
import time
import os
from typing import List, Dict, Any
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings  # Updated import
import sys

# --- 1. Configuration ---
# Use the same configuration as your main application
VECTOR_DB_ROOT_PATH = "./vector_db"
COLLECTION_NAME = "job_postings_v2"
INPUT_FILE = "../vector_db_config/data_for_ingestion.json"
BATCH_SIZE = 100  # Process in smaller batches

# Use local SentenceTransformer embeddings
MODEL_NAME = "all-MiniLM-L6-v2"
embeddings = HuggingFaceEmbeddings(model_name=MODEL_NAME)

# --- 2. Load Data from JSON File ---
print(f"Loading prepared data from {INPUT_FILE}...")
try:
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Error: Could not find file {INPUT_FILE}")
    print("Please run the 'prepare_files.py' script first.")
    exit()

texts = data['texts']
metadatas = data['metadatas']
total_texts = len(texts)

print(f"Loaded {total_texts} texts and metadatas.")

# --- 3. Progress Monitoring Setup ---
def print_progress(current: int, total: int, start_time: float, batch_size: int):
    """Print detailed progress with ETA"""
    elapsed = time.time() - start_time
    rate = current / elapsed if elapsed > 0 else 0
    remaining = total - current
    eta_seconds = remaining / rate if rate > 0 else 0
    
    # Format ETA
    if eta_seconds < 60:
        eta_str = f"{eta_seconds:.0f}s"
    elif eta_seconds < 3600:
        eta_str = f"{eta_seconds/60:.1f}m"
    else:
        eta_str = f"{eta_seconds/3600:.1f}h"
    
    progress = (current / total) * 100
    print(f"\rProgress: {current}/{total} ({progress:.1f}%) | "
          f"Rate: {rate:.1f} items/s | "
          f"ETA: {eta_str} | "
          f"Batch: {batch_size}", end="", flush=True)

# --- 4. Batch Processing with Progress ---
print("Starting batch processing...")

# Create vector database directory if it doesn't exist
os.makedirs(VECTOR_DB_ROOT_PATH, exist_ok=True)

# Process in batches
start_time = time.time()
vector_db = None

for i in range(0, total_texts, BATCH_SIZE):
    batch_end = min(i + BATCH_SIZE, total_texts)
    batch_texts = texts[i:batch_end]
    batch_metadatas = metadatas[i:batch_end] if metadatas else [{}] * len(batch_texts)
    
    print(f"\nProcessing batch {i//BATCH_SIZE + 1}/{((total_texts + BATCH_SIZE - 1)//BATCH_SIZE)} "
          f"(items {i+1}-{batch_end})")
    
    try:
        if vector_db is None:
            # First batch - create the vector store
            print("Creating initial vector store...")
            vector_db = Chroma.from_texts(
                texts=batch_texts,
                embedding=embeddings,
                metadatas=batch_metadatas,
                collection_name=COLLECTION_NAME,
                persist_directory=VECTOR_DB_ROOT_PATH
            )
            print("Initial vector store created.")
        else:
            # Add to existing vector store
            print("Adding to existing vector store...")
            vector_db.add_texts(
                texts=batch_texts,
                metadatas=batch_metadatas
            )
            print("Batch added successfully.")
            
        # Update progress
        print_progress(batch_end, total_texts, start_time, BATCH_SIZE)
        
    except Exception as e:
        print(f"\nError in batch {i//BATCH_SIZE + 1}: {e}")
        print("Continuing with next batch...")
        continue

# Persist the vector database
if vector_db:
    print("\nPersisting vector database...")
    vector_db.persist()
    print("Vector database persisted.")

# Final progress update
print(f"\n\n✅ Success! Your vector database is ready.")
print(f"Processed {total_texts} items in {time.time() - start_time:.1f} seconds")
print(f"Average rate: {total_texts / (time.time() - start_time):.1f} items/second")
print(f"Data from {INPUT_FILE} was ingested into '{COLLECTION_NAME}' in {VECTOR_DB_ROOT_PATH}.")