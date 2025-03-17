import { Range, EmitterSource } from "quill";

export interface QuillEvent {}

export class TextChangedEvent implements QuillEvent {
    constructor(source: EmitterSource) {
        this.source = source;
    }
    source: EmitterSource;
}

export class SelectionChangedEvent implements QuillEvent {
    constructor(oldRange: Range, newRange: Range, source: EmitterSource) {
        this.oldRange = oldRange;
        this.newRange = newRange;
        this.source = source;
    }
    oldRange: Range;
    newRange: Range;
    source: EmitterSource;
}
