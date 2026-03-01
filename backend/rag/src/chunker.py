from langchain_text_splitters import RecursiveCharacterTextSplitter

def get_recursive_chunker(chunk_size: int = 1000, chunk_overlap: int = 200):
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
        is_separator_regex=False,
        add_start_index=True,
        strip_whitespace=True
    )