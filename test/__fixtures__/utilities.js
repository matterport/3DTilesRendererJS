export function clone( src ) {

	const dst = {};

	for ( const u in src ) {

		if ( Array.isArray( src[ u ] ) ) {

			dst[ u ] = [];

		} else if ( typeof src[ u ] === 'object' ) {

			dst[ u ] = {};

		} else {

			dst[ u ] = src[ u ];

		}

		for ( const p in src[ u ] ) {

			const property = src[ u ][ p ];

			if ( Array.isArray( property ) ) {

				dst[ u ][ p ] = property.slice();

			} else if ( property !== undefined ) {

				dst[ u ][ p ] = property;

			}

		}

	}

	return dst;

}

export function merge( objects ) {

	const merged = {};

	for ( let u = 0; u < objects.length; u ++ ) {

		const tmp = clone( objects[ u ] );

		for ( const p in tmp ) {

			// eh, assumes types are consistant, and that we want to always merge arrays
			if ( Array.isArray( tmp[ p ] ) ) {

				const arr = merged[ p ];

				if ( Array.isArray( arr ) ) {

					merged[ p ] = tmp[ p ].slice().concat( arr );

				} else {

					merged[ p ] = tmp[ p ].slice();

				}

			} else {

				merged[ p ] = tmp[ p ];

			}

		}

	}

	return merged;

}
