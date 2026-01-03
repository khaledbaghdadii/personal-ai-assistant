import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Note } from './api.service';

// Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatCardModule,
    MatDialogModule,
    MarkdownModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private api = inject(ApiService);

  // State
  sessionId = signal('default');
  messages = signal<{ role: 'user' | 'ai', content: string }[]>([]);
  notes = signal<Note[]>([]);

  // Inputs
  chatInput = '';
  noteTitleInput = '';
  noteContentInput = '';

  constructor() {
    this.refreshNotes();
  }

  refreshNotes() {
    this.api.getNotes().subscribe(notes => this.notes.set(notes));
  }

  sendMessage() {
    if (!this.chatInput.trim()) return;

    const msg = this.chatInput;
    this.chatInput = ''; // Clear input

    // Optimistic update
    this.messages.update(msgs => [...msgs, { role: 'user', content: msg }]);

    this.api.chat(msg, this.sessionId()).subscribe(res => {
      this.messages.update(msgs => [...msgs, { role: 'ai', content: res.response }]);
      // If the AI saved a note, we might want to refresh. 
      // Ideally backend tells us, or we just refresh periodically/on specific actions.
      // For now, let's refresh notes after every chat turn just in case.
      this.refreshNotes();
    });
  }

  saveNote() {
    if (!this.noteTitleInput || !this.noteContentInput) return;

    this.api.saveNote(this.noteTitleInput, this.noteContentInput).subscribe(() => {
      this.noteTitleInput = '';
      this.noteContentInput = '';
      this.refreshNotes();
    });
  }

  onNewSession() {
    const newSession = prompt('Enter new session name:', `session-${Date.now()}`);
    if (newSession) {
      this.sessionId.set(newSession);
      this.messages.set([]); // Clear chat for new session
    }
  }
}
