import * as monaco from "monaco-editor";
import { IPosition } from "monaco-editor";
import { RemoteSelection } from "./RemoteSelection";
/**
 * The IRemoteSelectionManagerOptions represents the options that
 * configure the behavior a the RemoteSelectionManager.
 */
export interface IRemoteSelectionManagerOptions {
    /**
     * The Monaco Editor instance to render the remote selections into.
     */
    editor: monaco.editor.ICodeEditor;
}
/**
 * The RemoteSelectionManager renders remote users selections into the Monaco
 * editor using the editor's built-in decorators mechanism.
 */
export declare class RemoteSelectionManager {
    /**
     * Creates a new RemoteSelectionManager with the specified options.
     *
     * @param options
     *   Ths options that configure the RemoteSelectionManager.
     */
    constructor(options: IRemoteSelectionManagerOptions);
    /**
     * Adds a new remote selection with a unique id and the specified color.
     *
     * @param id
     *   The unique id of the selection.
     * @param color
     *   The color to render the selection with.
     */
    addSelection(id: string, color: string, label?: string): RemoteSelection;
    /**
     * Removes an existing remote selection from the editor.
     *
     * @param id
     *   The unique id of the selection.
     */
    removeSelection(id: string): void;
    /**
     * Sets the selection using zero-based text offset locations.
     *
     * @param id
     *   The unique id of the selection.
     * @param start
     *   The starting offset of the selection.
     * @param end
     *   The ending offset of the selection.
     */
    setSelectionOffsets(id: string, start: number, end: number): void;
    /**
     * Sets the selection using the Monaco Editor's IPosition (line numbers and columns)
     * location concept.
     *
     * @param id
     *   The unique id of the selection.
     * @param start
     *   The starting position of the selection.
     * @param end
     *   The ending position of the selection.
     */
    setSelectionPositions(id: string, start: IPosition, end: IPosition): void;
    /**
     * Shows the specified selection, if it is currently hidden.
     *
     * @param id
     *   The unique id of the selection.
     */
    showSelection(id: string): void;
    /**
     * Hides the specified selection, if it is currently shown.
     *
     * @param id
     *   The unique id of the selection.
     */
    hideSelection(id: string): void;
}
