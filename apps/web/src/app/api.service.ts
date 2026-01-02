import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface ChatResponse {
    response: string;
    sessionId: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api';

    getNotes(): Observable<Note[]> {
        return this.http.get<Note[]>(`${this.apiUrl}/notes`);
    }

    saveNote(title: string, content: string): Observable<Note> {
        return this.http.post<Note>(`${this.apiUrl}/notes`, { title, content });
    }

    searchNotes(query: string): Observable<{ result: string }> {
        return this.http.get<{ result: string }>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
    }

    chat(message: string, sessionId: string): Observable<ChatResponse> {
        return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, { message, sessionId });
    }
}
