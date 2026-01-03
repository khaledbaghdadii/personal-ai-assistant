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
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
    private api = inject(ApiService);

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    sessionId = signal('default');
    messages = signal<{ role: 'user' | 'ai', content: string }[]>([]);
    isLoading = signal(false);

    chatInput = '';

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
