import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
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
    template: `
    <div class="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <!-- Toolbar -->
      <mat-toolbar color="accent" class="!min-h-[64px] !h-[64px] shadow-sm relative z-10">
        <span class="font-medium text-white">My Notes</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="refreshNotes()" matTooltip="Refresh Notes">
          <mat-icon class="text-white">refresh</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Add Note Form -->
      <div class="p-4 bg-white border-b border-gray-200 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Add Note</h3>
        
        <div class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full dense-form-field">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="noteTitleInput" placeholder="e.g. Project Idea">
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full dense-form-field">
            <mat-label>Content</mat-label>
            <textarea matInput [(ngModel)]="noteContentInput" rows="3" placeholder="Enter note details..."></textarea>
          </mat-form-field>
          
          <button mat-raised-button color="primary" (click)="saveNote()" 
                  [disabled]="!noteTitleInput || !noteContentInput"
                  class="w-full !rounded-lg !py-1">
            Save Note
          </button>
        </div>
      </div>

      <!-- Notes List -->
      <div class="flex-1 overflow-y-auto">
        <mat-nav-list class="pt-2">
          <div mat-subheader class="!font-semibold !text-gray-500">Recent Notes</div>
          
          @for (note of notes(); track note.createdAt) {
            <a mat-list-item class="!mb-1 hover:bg-gray-100 transition-colors">
              <mat-icon matListItemIcon class="text-gray-400">description</mat-icon>
              <span matListItemTitle class="font-medium text-gray-800">{{note.title}}</span>
              <span matListItemLine class="text-xs text-gray-500">{{note.createdAt | date:'short'}}</span>
            </a>
          } @empty {
             <div class="p-6 text-center text-gray-400 italic text-sm">
               No notes yet. Add one above!
             </div>
          }
        </mat-nav-list>
      </div>
    </div>
  `,
    styles: [`
    .dense-form-field {
      font-size: 14px;
    }
  `]
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
