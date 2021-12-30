import { ExtensionType } from './ExtensionType.js';

export function isValidExtensionType( extType ) {

	const types = Object.values( ExtensionType );
	return types.indexOf( extType ) !== - 1;

}
