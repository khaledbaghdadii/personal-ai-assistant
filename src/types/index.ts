export type Note = {
    id: string;
    createdAt: string;
    title: string;
    content: string;
};

export interface NoteFilter {
    limit?: number;
}
