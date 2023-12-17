import { RangeStatic, Sources } from "quill";

export interface QuillEvent {}

export class TextChangedEvent implements QuillEvent {
    constructor(source: Sources) {
        this.source = source;
    }
    source: Sources;
}

export class SelectionChangedEvent implements QuillEvent {
    constructor(oldRange: RangeStatic, newRange: RangeStatic, source: Sources) {
        this.oldRange = oldRange;
        this.newRange = newRange;
        this.source = source;
    }
    oldRange: RangeStatic;
    newRange: RangeStatic;
    source: Sources;
}
