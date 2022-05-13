import * as monaco from "monaco-editor";
import { IPosition } from "monaco-editor";
import { RemoteCursor } from "./RemoteCursor";
/**
 * The IRemoteCursorManagerOptions interface represents the set of options that
 * configures how the RemoteCursorManager works.
 */
export interface IRemoteCursorManagerOptions {
    /**
     * The instance of the Monaco editor to add the remote cursors to.
     */
    editor: monaco.editor.ICodeEditor;
    /**
     * Determines if tooltips will be shown when the cursor is moved.
     */
    tooltips?: boolean;
    /**
     * The time (in seconds) that the tooltip should remain visible after
     * it was last moved.
     */
    tooltipDuration?: number;
}
/**
 * The RemoteCursorManager class is responsible for creating and managing a
 * set of indicators that show where remote users's cursors are located when
 * using Monaco in a collaborative editing context.  The RemoteCursorManager
 * leverages Monaco's Content Widget concept.
 */
export declare class RemoteCursorManager {
    /**
     * Creates a new RemoteCursorManager with the supplied options.
     *
     * @param options
     *   The options that will configure the RemoteCursorManager behavior.
     */
    constructor(options: IRemoteCursorManagerOptions);
    /**
     * Adds a new remote cursor to the editor.
     *
     * @param id
     *   A unique id that will be used to reference this cursor.
     * @param color
     *   The css color that the cursor and tooltip should be rendered in.
     * @param label
     *   An optional label for the tooltip. If tooltips are enabled.
     *
     * @returns
     *   The remote cursor widget that will be added to the editor.
     */
    addCursor(id: string, color: string, label?: string): RemoteCursor;
    /**
     * Removes the remote cursor from the editor.
     *
     * @param id
     *   The unique id of the cursor to remove.
     */
    removeCursor(id: string): void;
    /**
     * Updates the location of the specified remote cursor using a Monaco
     * IPosition object..
     *
     * @param id
     *   The unique id of the cursor to remove.
     * @param position
     *   The location of the cursor to set.
     */
    setCursorPosition(id: string, position: IPosition): void;
    /**
     * Updates the location of the specified remote cursor based on a zero-based
     * text offset.
     *
     * @param id
     *   The unique id of the cursor to remove.
     * @param offset
     *   The location of the cursor to set.
     */
    setCursorOffset(id: string, offset: number): void;
    /**
     * Shows the specified cursor. Note the cursor may be scrolled out of view.
     *
     * @param id
     *   The unique id of the cursor to show.
     */
    showCursor(id: string): void;
    /**
     * Hides the specified cursor.
     *
     * @param id
     *   The unique id of the cursor to show.
     */
    hideCursor(id: string): void;
}
