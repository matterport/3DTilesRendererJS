import { Tile } from '../base/Tile';
import { Tileset } from '../base/Tileset';

export enum ExtensionType {
    CONTENT = 'content',
    ASSET = 'asset',
    TILESET = 'tileset',
    TILE = 'tile',
}
export const ExtensionNameGLTF = '3DTILES_content_gltf';

/** A Tile, or a Tileset object to extract extension data out of */
type ExtensionInput = Tile | Tileset;
type ExtensionFactoryFn = () => ExtensionBase;
type Registration = { renew: () => void, cancel: () => void, active: () => boolean, callback: ExtensionFactoryFn };
export class ExtensionSystem {
    /** resource tracking extension creation funcs by used function */
    extensionsByFunc: Map<string, Set<ExtensionFactoryFn>>;

    /** resource tracking extension creation funcs by used ExtensionName */
    extensionsByName: Map<string, Set<ExtensionFactoryFn>>;

    constructor( );

    /** register a callback which creates an extension which extends ExtensionBase */
    register( callback: ExtensionFactoryFn ): Registration;

    /** Select tileset, track any requirements for tileset */
    useTileset( tileset: Tileset|null ): void;

    /** Does system support an extension? */
    has( extensionName: string ): boolean;

    /** Does any used tileset require an extension? */
    requires( extensionName: string ): boolean;

    /** check all extensions seen in the tileset against registered extensions and log out missing items */
    checkSupport( ): void;

    /** usage in tiles-renderer package */
    useFunction( funcName: FunctionName, obj: ExtensionInput, ...args: any[]): any|null;
}

/** Available functions to use */
type FunctionName = 'parse' | 'fetch';

/** each extension combines a specific type of data, with a set of optional function implementations */
export abstract class ExtensionBase {

    constructor( extensionType: ExtensionType, extensionName: string );
    name: Readonly<string>;
    type: Readonly<ExtensionType>;
    useTileset( tileset?: Tileset ): ExtensionBase;

}

interface TilesFetchResponse { ok: boolean, arrayBuffer:() => null|ArrayBuffer }

/**
 * Typing for available functions that the extender of ExtensionBase may override
 *
 * Do these need to be here at all? They help solidify the expected return values
 * Might make sense once `...args: any[]` is expanded to legit function sigs?
 */
interface ExtensionFunctionInterface {

    parse?( extensionData: Record<string, any>, ...args: any[] ): Promise<any> | null;
    fetch?( extensionData: Record<string, any>, ...args: any[] ): Promise<TilesFetchResponse> | null;

}
