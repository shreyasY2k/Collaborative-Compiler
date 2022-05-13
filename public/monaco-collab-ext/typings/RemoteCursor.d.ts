import { IPosition } from "monaco-editor";
/**
 * The RemoteCursor class represents a remote cursor in the MonacoEditor. This
 * class allows you to control the location and visibility of the cursor.
 */
export declare class RemoteCursor {
    /**
     * Gets the unique id of this cursor.
     *
     * @returns
     *   The unique id of this cursor.
     */
    getId(): string;
    /**
     * Gets the position of the cursor.
     *
     * @returns
     *   The position of the cursor.
     */
    getPosition(): IPosition;
    /**
     * Sets the location of the cursor based on a Monaco Editor IPosition.
     *
     * @param position
     *   The line / column position of the cursor.
     */
    setPosition(position: IPosition): void;
    /**
     * Sets the location of the cursor using a zero-based text offset.
     *
     * @param offset
     *   The offset of the cursor.
     */
    setOffset(offset: number): void;
    /**
     * Shows the cursor if it is hidden.
     */
    show(): void;
    /**
     * Hides the cursor if it is shown.
     */
    hide(): void;
    /**
     * Determines if the cursor has already been disposed. A cursor is disposed
     * when it has been permanently removed from the editor.
     *
     * @returns
     *   True if the cursor has been disposed, false otherwise.
     */
    isDisposed(): boolean;
    /**
     * Disposes of this cursor, removing it from the editor.
     */
    dispose(): void;
}
