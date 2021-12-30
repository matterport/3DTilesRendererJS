import { TilesRendererBase } from '..';
import { Tile } from '../base/Tile';
import { Tileset } from '../base/Tileset';

export enum ExtensionType {
    CONTENT = 'content',
    ASSET = 'asset',
    TILESET = 'tileset',
    TILE = 'tile',
}

/** A Tile, or a Tileset object to extract extension data out of */
type ExtensionInput = Tile | Tileset;
type ExtensionFactoryFn = () => ExtensionBase;
export class ExtensionSystem {

    constructor( tilesRenderer: TilesRendererBase );
    register( callback: ExtensionFactoryFn ): ExtensionSystem;
    unregister( callback: ExtensionFactoryFn ): ExtensionSystem;
    useFunction( funcName: FunctionName, obj: ExtensionInput, ...args: any[]): any|null;
    checkSupport( extensionName?: string ): boolean;
}

/** Available functions to use */
type FunctionName = 'parse' | 'fetch';

/** each extension combines a specific type of data, with a set of optional function implementations */
export abstract class ExtensionBase {

    constructor( type: ExtensionType, name: string );

    // Do these need to be here at all? They help solidify the expected return values
    parse?( extensionData: Record<string, any>, ...args: any[] ): Promise<any> | null;
    fetch?( extensionData: Record<string, any>, ...args: any[] ): Promise<TilesFetchResponse> | null;

}

interface TilesFetchResponse { ok: boolean, arrayBuffer:() => null|ArrayBuffer }
