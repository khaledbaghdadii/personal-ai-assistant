import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService, Note } from '../../api.service';

@Component({
    selector: 'app-notes-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatToolbarModule
    ],
    templateUrl: './notes-sidebar.component.html',
    styleUrl: './notes-sidebar.component.scss'
})
export class NotesSidebarComponent {
    private api = inject(ApiService);

    notes = signal<Note[]>([]);
    noteTitleInput = '';
    noteContentInput = '';

    constructor() {
        this.refreshNotes();
    }

    refreshNotes() {
        this.api.getNotes().subscribe(notes => this.notes.set(notes));
    }

    saveNote() {
        if (!this.noteTitleInput || !this.noteContentInput) return;

        this.api.saveNote(this.noteTitleInput, this.noteContentInput).subscribe(() => {
            this.noteTitleInput = '';
            this.noteContentInput = '';
            this.refreshNotes();
        });
    }
}
