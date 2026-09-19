import * as Y from "yjs";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

const moveArrayItem = (arr: any[], from: number, to: number, inPlace = true) => {
    if (!inPlace) {
        arr = [...arr];
    }
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
};

const debounce = (callback: Function, wait: number) => {
    let timeoutId: any = null;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback(...args);
        }, wait);
    };
};

const areElementsSame = (els1: any[], els2: any[]) => {
    if (els1.length !== els2.length) {
        return false;
    }
    for (let i = 0; i < els1.length; i++) {
        if (els1[i].id !== els2[i].id || els1[i].version !== els2[i].version) {
            return false;
        }
    }
    return true;
};

export const yjsToExcalidraw = (yArray: Y.Array<Y.Map<any>>) => {
    const x = yArray.toArray().sort((a, b) => {
        const key1 = a.get("pos");
        const key2 = b.get("pos");
        return key1 > key2 ? 1 : key1 < key2 ? -1 : 0;
    }).map((x2) => x2.get("el"));
    return x;
};

const safeGenerateKeyBetween = (a: string | null | undefined, b: string | null | undefined): string => {
    try {
        if (a && b && a >= b) {
            return generateKeyBetween(null, null);
        }
        return generateKeyBetween(a, b);
    } catch {
        return generateKeyBetween(null, null);
    }
};

const getDeltaOperationsForElements = (lastKnownElements: any[], newElements: any[], bulkify = true) => {
    const updateOperations: any[] = [];
    const appendOperations: any[] = [];
    const deleteOperations: any[] = [];
    const moveOperations: any[] = [];
    const opsTracker: { elementIds: string[]; idMap: Record<string, any> } = {
        elementIds: lastKnownElements.map((x) => x.id),
        idMap: lastKnownElements.reduce((map: any, data: any, index: number) => {
            map[data.id] = { id: data.id, version: data.version, pos: data.pos, index };
            return map;
        }, {})
    };

    const _updateIdIndexLookup = () => {
        opsTracker.idMap = opsTracker.elementIds.reduce((map: any, id: string, index: number) => {
            map[id] = { ...opsTracker.idMap[id], index };
            return map;
        }, {});
    };

    for (let newElement of newElements) {
        let oldIndex = null;
        let oldElement = null;
        if (opsTracker.idMap[newElement.id]) {
            const { index, ...rest } = opsTracker.idMap[newElement.id];
            oldIndex = index;
            oldElement = rest;
        }
        if (!oldElement) {
            const lastPos = opsTracker.idMap[opsTracker.elementIds[opsTracker.elementIds.length - 1]]?.pos;
            const op = {
                id: newElement.id,
                version: newElement.version,
                pos: !bulkify ? safeGenerateKeyBetween(lastPos, null) : "",
                index: opsTracker.elementIds.length
            };
            opsTracker.elementIds.push(op.id);
            opsTracker.idMap[op.id] = op;
            appendOperations.push({ type: "append", id: newElement.id, pos: op.pos, element: newElement });
        } else if (oldElement && newElement.version !== oldElement.version) {
            const op = {
                id: newElement.id,
                version: newElement.version,
                pos: oldElement.pos,
                index: oldIndex
            };
            opsTracker.idMap[newElement.id] = op;
            updateOperations.push({ type: "update", id: op.id, index: op.index, element: newElement });
        }
    }

    const newElementIds = new Set(newElements.map((x) => x.id));
    const newOpsTrackerElementIds: string[] = [];
    let runningIndex = 0;
    for (let i = 0; i < opsTracker.elementIds.length; i++) {
        const id = opsTracker.elementIds[i];
        if (!newElementIds.has(id)) {
            deleteOperations.push({ type: "delete", index: runningIndex, id });
        } else {
            newOpsTrackerElementIds.push(id);
            runningIndex += 1;
        }
    }
    if (deleteOperations.length > 0) {
        opsTracker.elementIds = newOpsTrackerElementIds;
        _updateIdIndexLookup();
    }

    for (let toIndex = 0; toIndex < newElements.length; toIndex++) {
        const id = newElements[toIndex].id;
        const entry = opsTracker.idMap[id];
        if (!entry) continue;
        const { index: fromIndex } = entry;
        if (toIndex !== fromIndex) {
            let leftSortIndex = null;
            let rightSortIndex = null;
            if (fromIndex >= 0 && fromIndex < toIndex) {
                leftSortIndex = opsTracker.idMap[opsTracker.elementIds[toIndex]]?.pos || null;
                rightSortIndex = opsTracker.idMap[opsTracker.elementIds[toIndex + 1]]?.pos || null;
            } else {
                leftSortIndex = opsTracker.idMap[opsTracker.elementIds[toIndex - 1]]?.pos || null;
                rightSortIndex = opsTracker.idMap[opsTracker.elementIds[toIndex]]?.pos || null;
            }
            const newSortIndex = safeGenerateKeyBetween(leftSortIndex, rightSortIndex);
            opsTracker.elementIds = moveArrayItem(opsTracker.elementIds, fromIndex, toIndex, true);
            opsTracker.idMap[id].pos = newSortIndex;
            _updateIdIndexLookup();
            moveOperations.push({ type: "move", id, fromIndex, toIndex, pos: newSortIndex });
        }
    }

    const bulkAppendOperations: any[] = [];
    const bulkDeleteOperations: any[] = [];
    if (bulkify) {
        if (appendOperations.length > 0) {
            const lastKnownPos = lastKnownElements[lastKnownElements.length - 1]?.pos;
            let sortIndexes: string[] = [];
            try {
                sortIndexes = generateNKeysBetween(lastKnownPos, null, appendOperations.length);
            } catch {
                sortIndexes = generateNKeysBetween(null, null, appendOperations.length);
            }
            for (let [i, op] of appendOperations.entries()) {
                opsTracker.idMap[op.id].pos = sortIndexes[i];
            }
            bulkAppendOperations.push({
                type: "bulkAppend",
                data: appendOperations.map((op, _index) => ({ id: op.id, pos: sortIndexes[_index], element: op.element }))
            });
        }
        let lastIndex = null;
        for (let op of deleteOperations) {
            if (lastIndex === null || op.index > lastIndex) {
                bulkDeleteOperations.push({
                    type: "bulkDelete",
                    data: [{ id: op.id, index: op.index }]
                });
                lastIndex = op.index;
            } else {
                bulkDeleteOperations[bulkDeleteOperations.length - 1].data.push({ id: op.id, index: op.index });
            }
        }
    }

    const operations = !bulkify
        ? [...updateOperations, ...appendOperations, ...deleteOperations, ...moveOperations]
        : [...updateOperations, ...bulkAppendOperations, ...bulkDeleteOperations, ...moveOperations];

    const updatedLastKnownElements = opsTracker.elementIds.map((x) => {
        const { index, ...rest } = opsTracker.idMap[x];
        return rest;
    });

    return { operations, lastKnownElements: updatedLastKnownElements };
};

const getDeltaOperationsForAssets = (lastKnownFileIds: Set<string>, files: any) => {
    const operations: any[] = [];
    const newFields = new Set<string>();
    for (let fileId in files) {
        if (!files.hasOwnProperty(fileId)) continue;
        newFields.add(fileId);
        if (!lastKnownFileIds.has(fileId)) {
            operations.push({ type: "append", id: fileId, asset: files[fileId] });
        }
    }
    for (let fileId of lastKnownFileIds) {
        if (!files.hasOwnProperty(fileId)) {
            operations.push({ type: "delete", id: fileId });
        }
    }
    return { operations, lastKnownFileIds: newFields };
};

const applyElementOperations = (yElements: Y.Array<Y.Map<any>>, operations: any[], origin: any) => {
    yElements.doc?.transact(() => {
        const idYjsIndexMap: Record<string, number> = {};
        const _updateYjsIndexMap = () => {
            for (let i = 0; i < yElements.length; i++) {
                let item = yElements.get(i)?.get("el");
                if (item?.id) {
                    idYjsIndexMap[item.id] = i;
                }
            }
        };
        _updateYjsIndexMap();

        for (let op of operations) {
            switch (op.type) {
                case "update": {
                    const idx = idYjsIndexMap[op.id];
                    if (idx !== undefined && yElements.get(idx)) {
                        yElements.get(idx).set("el", { ...op.element });
                    }
                    break;
                }
                case "append":
                case "bulkAppend": {
                    if (op.type === "append") {
                        idYjsIndexMap[op.id] = yElements.length;
                        yElements.push([new Y.Map(Object.entries({ pos: op.pos, el: { ...op.element } }))]);
                    } else {
                        for (let i = 0; i < op.data.length; i++) {
                            idYjsIndexMap[op.data[i].id] = yElements.length + i;
                        }
                        yElements.push(
                            op.data.map((x: any) => new Y.Map(Object.entries({ pos: x.pos, el: { ...x.element } })))
                        );
                    }
                    break;
                }
                case "delete":
                case "bulkDelete": {
                    const idx = idYjsIndexMap[op.id];
                    if (idx !== undefined) {
                        if (op.type === "delete") {
                            yElements.delete(idx, 1);
                        } else {
                            yElements.delete(idx, op.data.length);
                        }
                        _updateYjsIndexMap();
                    }
                    break;
                }
                case "move": {
                    const idx = idYjsIndexMap[op.id];
                    if (idx !== undefined && yElements.get(idx)) {
                        yElements.get(idx).set("pos", op.pos);
                    }
                    break;
                }
            }
        }
    }, origin);
};

const applyAssetOperations = (yAssets: Y.Map<any>, operations: any[], origin: any) => {
    yAssets.doc?.transact(() => {
        for (let op of operations) {
            switch (op.type) {
                case "append": {
                    yAssets.set(op.id, op.asset);
                    break;
                }
                case "delete": {
                    yAssets.delete(op.id);
                    break;
                }
            }
        }
    }, origin);
};

export class ExcalidrawBinding {
    yElements: Y.Array<Y.Map<any>>;
    yAssets: Y.Map<any> | null = null;
    api: any;
    awareness: any;
    undoManager: any;
    subscriptions: Function[] = [];
    collaborators = new Map();
    lastKnownElements: any[] = [];
    lastKnownFileIds = new Set<string>();

    onPointerUpdate = (payload: any) => {
        if (this.awareness) {
            this.awareness.setLocalStateField("pointer", payload.pointer);
            this.awareness.setLocalStateField("button", payload.button);
        }
    };

    constructor(
        yElements: Y.Array<Y.Map<any>>,
        yAssets: Y.Map<any> | null,
        api: any,
        awareness: any,
        undoConfig?: { excalidrawDom?: HTMLElement; undoManager?: any }
    ) {
        this.yElements = yElements;
        this.yAssets = yAssets;
        this.api = api;
        this.awareness = awareness;
        const excalidrawDom = undoConfig?.excalidrawDom;
        this.undoManager = undoConfig?.undoManager;

        // Catch all exceptions inside api.onChange so nothing can ever crash Excalidraw's componentDidUpdate
        this.subscriptions.push(
            this.api.onChange((_: any, state: any, files: any) => {
                try {
                    const elements = this.api.getSceneElements();
                    let operations: any[] = [];
                    if (!areElementsSame(this.lastKnownElements, elements)) {
                        const res = getDeltaOperationsForElements(this.lastKnownElements, elements);
                        operations = res.operations;
                        this.lastKnownElements = res.lastKnownElements;
                        applyElementOperations(this.yElements, operations, this);
                    }
                    if (this.yAssets) {
                        const res = getDeltaOperationsForAssets(this.lastKnownFileIds, files);
                        const assetOperations = res.operations;
                        this.lastKnownFileIds = res.lastKnownFileIds;
                        if (assetOperations.length > 0) {
                            applyAssetOperations(this.yAssets, assetOperations, this);
                        }
                    }
                    if (this.awareness) {
                        this.awareness.setLocalStateField("selectedElementIds", state.selectedElementIds);
                    }
                } catch (err) {
                    console.warn("Whiteboard onChange sync error handled safely:", err);
                }
            })
        );

        const _remoteElementsChangeHandler = (event: any, txn: any) => {
            try {
                if (txn.origin === this) return;

                const changedElementIds = new Set(
                    event.flatMap((e: any) => {
                        if (e instanceof Y.YMapEvent) {
                            return [e.target.get("el")?.id];
                        }
                        return [];
                    })
                );

                const remoteElements = yjsToExcalidraw(this.yElements);
                const elements = remoteElements.map((el: any) => {
                    if (changedElementIds.has(el?.id)) {
                        return el;
                    }
                    return this.api.getSceneElements().find((existingEl: any) => existingEl.id === el?.id) || el;
                });

                this.lastKnownElements = this.yElements.toArray().map((x) => ({
                    id: x.get("el")?.id,
                    version: x.get("el")?.version,
                    pos: x.get("pos")
                })).sort((a, b) => {
                    const key1 = a.pos;
                    const key2 = b.pos;
                    return key1 > key2 ? 1 : key1 < key2 ? -1 : 0;
                });

                this.api.updateScene({ elements, appState: {}, captureUpdate: "NEVER" as any });
            } catch (err) {
                console.warn("Whiteboard remote change error handled safely:", err);
            }
        };

        this.yElements.observeDeep(_remoteElementsChangeHandler);
        this.subscriptions.push(() => this.yElements.unobserveDeep(_remoteElementsChangeHandler));

        const _remoteFilesChangeHandler = (events: any, txn: any) => {
            try {
                if (txn.origin === this) return;
                const addedFiles = [...events.keysChanged].map((key) => this.yAssets?.get(key));
                this.api.addFiles(addedFiles);
            } catch (err) {
                console.warn("Whiteboard file change error handled safely:", err);
            }
        };

        if (this.yAssets) {
            this.yAssets.observe(_remoteFilesChangeHandler);
            this.subscriptions.push(() => this.yAssets?.unobserve(_remoteFilesChangeHandler));
        }

        if (this.awareness) {
            const _remoteAwarenessChangeHandler = ({ added, updated, removed }: any) => {
                try {
                    const states = this.awareness.getStates();
                    const collaborators2 = new Map(this.collaborators);
                    const update = [...added, ...updated];
                    for (const id of update) {
                        const state = states.get(id);
                        if (!state) continue;
                        collaborators2.set(id.toString(), {
                            pointer: state.pointer,
                            button: state.button,
                            selectedElementIds: state.selectedElementIds,
                            username: state.user?.name,
                            color: state.user?.color,
                            avatarUrl: state.user?.avatarUrl,
                            userState: state.user?.state
                        });
                    }
                    for (const id of removed) {
                        collaborators2.delete(id.toString());
                    }
                    collaborators2.delete(this.awareness.clientID.toString());
                    this.api.updateScene({ collaborators: collaborators2 });
                    this.collaborators = collaborators2;
                } catch (err) {
                    console.warn("Whiteboard awareness error handled safely:", err);
                }
            };
            this.awareness.on("change", _remoteAwarenessChangeHandler);
            this.subscriptions.push(() => this.awareness.off("change", _remoteAwarenessChangeHandler));
        }

        if (this.undoManager && excalidrawDom) {
            this.setupUndoRedo(excalidrawDom);
        }

        try {
            const initialValue = yjsToExcalidraw(this.yElements);
            this.lastKnownElements = this.yElements.toArray().map((x) => ({
                id: x.get("el")?.id,
                version: x.get("el")?.version,
                pos: x.get("pos")
            })).sort((a, b) => {
                const key1 = a.pos;
                const key2 = b.pos;
                return key1 > key2 ? 1 : key1 < key2 ? -1 : 0;
            });
            this.api.updateScene({ elements: initialValue, appState: {}, captureUpdate: "NEVER" as any });

            if (this.yAssets) {
                this.api.addFiles([...this.yAssets.keys()].map((key) => this.yAssets?.get(key)));
            }
        } catch (err) {
            console.warn("Whiteboard initial scene update error handled safely:", err);
        }
    }

    setupUndoRedo(excalidrawDom: HTMLElement) {
        this.undoManager.addTrackedOrigin(this);
        this.subscriptions.push(() => this.undoManager.removeTrackedOrigin(this));

        const _keyPressHandler = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key?.toLocaleLowerCase() === "z") {
                event.stopPropagation();
                this.undoManager.redo();
            } else if (event.ctrlKey && event.key?.toLocaleLowerCase() === "z") {
                event.stopPropagation();
                this.undoManager.undo();
            }
        };

        excalidrawDom.addEventListener("keydown", _keyPressHandler, { capture: true });
        this.subscriptions.push(() => excalidrawDom.removeEventListener("keydown", _keyPressHandler, { capture: true }));
    }

    destroy() {
        for (const s of this.subscriptions) {
            try {
                s();
            } catch { }
        }
    }
}
