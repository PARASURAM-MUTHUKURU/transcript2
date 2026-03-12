import { fetchWithAuth } from '../lib/api';

export interface RAGSource {
    source: string;
    chunks_count: number;
    top_score: number;
}

export interface RAGQueryResponse {
    answer: string;
    sources: RAGSource[];
}

export async function queryRAG(question: string): Promise<RAGQueryResponse> {
    const response = await fetchWithAuth('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error('Failed to query RAG');
    return response.json();
}

export async function ingestFile(file: File): Promise<{ status: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth('/api/rag/ingest', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Failed to ingest file');
    return response.json();
}
