from src.pipeline import RAGPipeline

def main():
    rag = RAGPipeline()

    print("\nIngesting documents from 'data/'...")
    rag.ingest_data_folder()

    while True:
        q = input("\nQuestion (or 'exit'): ").strip()
        if q.lower() in ['exit', 'quit', 'q']:
            break
        if not q:
            continue

        answer, sources = rag.query(q)
        print("\n" + "═" * 70)
        print("Q:", q)
        print("A:", answer)

        if sources:
            print("\nSOURCES:")
            for s in sources:
                print(f"• {s['source']} ({s['chunks_count']} chunks, top score: {s['top_score']:.3f})")

if __name__ == "__main__":
    main()