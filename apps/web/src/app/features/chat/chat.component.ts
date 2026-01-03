import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../api.service';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MarkdownModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatTooltipModule
    ],
    template: `
    <div class="flex flex-col h-full bg-gray-50">
      <!-- Toolbar -->
      <mat-toolbar color="primary" class="!min-h-[64px] !h-[64px] shadow-sm z-10 px-6 relative">
        <mat-icon class="mr-3">smart_toy</mat-icon>
        <span class="font-medium text-lg tracking-wide">AI Planner</span>
        <span class="spacer"></span>
        <div class="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/10">
          <mat-icon class="text-xs !w-4 !h-4 !min-w-4 text-white/70">key</mat-icon>
          <span class="text-sm font-medium text-white/90">{{sessionId()}}</span>
        </div>
        <button mat-icon-button (click)="onNewSession()" class="ml-2 text-white/80 hover:text-white" matTooltip="New Session">
          <mat-icon>add_circle_outline</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-gray-50" #scrollContainer>
        @if (messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 select-none animate-fade-in">
            <mat-icon class="!w-24 !h-24 !text-[6rem] text-gray-300 mb-6 font-light">chat_bubble_outline</mat-icon>
            <p class="text-xl font-medium tracking-tight">How can I help you today?</p>
          </div>
        }

        @for (msg of messages(); track msg) {
          <div class="flex w-full animate-slide-up" [class.justify-end]="msg.role === 'user'">
            <div [class]="'max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm transition-all ' + 
                          (msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none shadow-blue-200' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none')">
              @if(msg.role === 'user') {
                <p class="whitespace-pre-wrap leading-relaxed">{{msg.content}}</p>
              } @else {
                <markdown [data]="msg.content" class="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-pre:bg-gray-50 prose-a:text-blue-600"></markdown>
              }
            </div>
          </div>
        }
        
        @if (isLoading()) {
           <div class="flex justify-start w-full animate-fade-in">
             <div class="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
               <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
               <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-gray-200">
        <div class="max-w-4xl mx-auto flex gap-3 relative items-center">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
            <mat-label>Message Agent...</mat-label>
            <input matInput [(ngModel)]="chatInput" (keydown.enter)="sendMessage()" [disabled]="isLoading()" autocomplete="off">
            @if (chatInput) {
              <button mat-icon-button matSuffix (click)="chatInput = ''" matTooltip="Clear">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          
          <button mat-fab color="primary" (click)="sendMessage()" 
                  [disabled]="!chatInput.trim() || isLoading()" 
                  class="shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
            <mat-icon>{{ isLoading() ? 'hourglass_empty' : 'send' }}</mat-icon>
          </button>
        </div>
        <div class="text-center mt-2">
            <span class="text-xs text-gray-400">Press Enter to send</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ChatComponent implements AfterViewChecked {
    private api = inject(ApiService);

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    sessionId = signal('default');
    messages = signal<{ role: 'user' | 'ai', content: string }[]>([]);
    isLoading = signal(false);

    chatInput = '';
    // Simple flag to auto-scroll only when new messages added, avoiding user scroll interruption in future.
    // For now, always scroll on view checked if near bottom is simple.

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    sendMessage() {
        if (!this.chatInput.trim() || this.isLoading()) return;

        const msg = this.chatInput;
        this.chatInput = '';

        this.messages.update(msgs => [...msgs, { role: 'user', content: msg }]);
        this.isLoading.set(true);

        this.api.chat(msg, this.sessionId()).subscribe({
            next: (res) => {
                this.messages.update(msgs => [...msgs, { role: 'ai', content: res.response }]);
                this.isLoading.set(false);
                // Refresh notes via global service or event? 
                // We'll leave sidebar independent for now, user can click refresh. 
                // Ideal: Shared SignalStore.
            },
            error: () => {
                this.messages.update(msgs => [...msgs, { role: 'ai', content: "⚠️ Error talking to agent." }]);
                this.isLoading.set(false);
            }
        });
    }

    onNewSession() {
        const newSession = prompt('Enter new session name:', `session-${Date.now()}`);
        if (newSession) {
            this.sessionId.set(newSession);
            this.messages.set([]);
        }
    }
}
