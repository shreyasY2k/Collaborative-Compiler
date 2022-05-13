import { IPosition } from "monaco-editor";
export declare class RemoteSelection {
    /**
     * Gets the userland id of this selection.
     */
    getId(): string;
    /**
     * Gets the start position of the selection.
     *
     * @returns
     *   The start position of the selection.
     */
    getStartPosition(): IPosition;
    /**
     * Gets the start position of the selection.
     *
     * @returns
     *   The start position of the selection.
     */
    getEndPosition(): IPosition;
    /**
     * Sets the selection using zero-based text indices.
     *
     * @param start
     *   The start offset to set the selection to.
     * @param end
     *   The end offset to set the selection to.
     */
    setOffsets(start: number, end: number): void;
    /**
     * Sets the selection using Monaco's line-number / column coordinate system.
     *
     * @param start
     *   The start position to set the selection to.
     * @param end
     *   The end position to set the selection to.
     */
    setPositions(start: IPosition, end: IPosition): void;
    /**
     * Makes the selection visible if it is hidden.
     */
    show(): void;
    /**
     * Makes the selection hidden if it is visible.
     */
    hide(): void;
    /**
     * Determines if the selection has been permanently removed from the editor.
     *
     * @returns
     *   True if the selection has been disposed, false otherwise.
     */
    isDisposed(): boolean;
    /**
     * Permanently removes the selection from the editor.
     */
    dispose(): void;
}
