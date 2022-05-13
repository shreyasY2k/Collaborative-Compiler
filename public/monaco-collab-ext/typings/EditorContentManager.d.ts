import * as monaco from "monaco-editor";
/**
 * The IEditorContentManagerOptions interface represents the set of options that
 * configures how the EditorContentManager behaves.
 */
export interface IEditorContentManagerOptions {
    /**
     * The instance of the Monaco editor to add the remote cursors to.
     */
    editor: monaco.editor.ICodeEditor;
    /**
     * Handles cases where text was inserted into the editor.
     *
     * @param index
     *   The zero-based offset where the text insert occurred.
     * @param text
     *   the text that was inserted.
     */
    onInsert?: (index: number, text: string) => void;
    /**
     * Handles cases where text was replaced in the editor.
     *
     * @param index
     *   The zero-based offset at the beginning of the replaced range.
     * @param length
     *   The length of the range that was replaced.
     * @param text
     *   the text that was inserted.
     */
    onReplace?: (index: number, length: number, text: string) => void;
    /**
     * Handles cases where text was deleted from the editor.
     *
     * @param index
     *   The zero-based offset at the beginning of the removed range.
     * @param length
     *   The length of the range that was removed.
     */
    onDelete?: (index: number, length: number) => void;
    /**
     * The source id that will be used when making remote edits.
     */
    remoteSourceId?: string;
}
/**
 * The EditorContentManager facilitates listening to local content changes and
 * the playback of remote content changes into the editor.
 */
export declare class EditorContentManager {
    /**
     * Constructs a new EditorContentManager using the supplied options.
     *
     * @param options
     *   The options that configure the EditorContentManager.
     */
    constructor(options: IEditorContentManagerOptions);
    /**
     * Inserts text into the editor.
     *
     * @param index
     *   The index to insert text at.
     * @param text
     *   The text to insert.
     */
    insert(index: number, text: string): void;
    /**
     * Replaces text in the editor.
     *
     * @param index
     *   The start index of the range to replace.
     * @param length
     *   The length of the  range to replace.
     * @param text
     *   The text to insert.
     */
    replace(index: number, length: number, text: string): void;
    /**
     * Deletes text in the editor.
     *
     * @param index
     *   The start index of the range to remove.
     * @param length
     *   The length of the  range to remove.
     */
    delete(index: number, length: number): void;
    /**
     * Disposes of the content manager, freeing any resources.
     */
    dispose(): void;
}
