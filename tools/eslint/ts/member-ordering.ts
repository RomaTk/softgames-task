export const memberOrdering = {
	default: [
		// Index signature
		'signature',
		'readonly-signature',

		// Fields
		'public-static-field',
		'public-static-readonly-field',
		'protected-static-field',
		'protected-static-readonly-field',
		'private-static-field',
		'private-static-readonly-field',
		'#private-static-field',
		'#private-static-readonly-field',

		'public-decorated-field',
		'public-decorated-readonly-field',
		'protected-decorated-field',
		'protected-decorated-readonly-field',
		'private-decorated-field',
		'private-decorated-readonly-field',

		'public-instance-field',
		'public-instance-readonly-field',
		'protected-instance-field',
		'protected-instance-readonly-field',
		'private-instance-field',
		'private-instance-readonly-field',
		'#private-instance-field',
		'#private-instance-readonly-field',

		'public-abstract-field',
		'public-abstract-readonly-field',
		'protected-abstract-field',
		'protected-abstract-readonly-field',

		'public-field',
		'public-readonly-field',
		'protected-field',
		'protected-readonly-field',
		'private-field',
		'private-readonly-field',
		'#private-field',
		'#private-readonly-field',

		'static-field',
		'static-readonly-field',
		'instance-field',
		'instance-readonly-field',
		'abstract-field',
		'abstract-readonly-field',

		'decorated-field',
		'decorated-readonly-field',

		'field',
		'readonly-field',

		// Static initialization
		'static-initialization',

		// Constructors
		'public-constructor',
		'protected-constructor',
		'private-constructor',

		// Getters
		['public-static-get', 'public-static-set'],
		['protected-static-get', 'protected-static-set'],
		['private-static-get', 'private-static-set'],
		['#private-static-get', '#private-static-set'],

		['public-decorated-get', 'public-decorated-set'],
		['protected-decorated-get', 'protected-decorated-set'],
		['private-decorated-get', 'private-decorated-set'],

		['public-instance-get', 'public-instance-set'],
		['protected-instance-get', 'protected-instance-set'],
		['private-instance-get', 'private-instance-set'],
		['#private-instance-get', '#private-instance-set'],

		['public-abstract-get', 'public-abstract-set'],
		['protected-abstract-get', 'protected-abstract-set'],

		['public-get', 'public-set'],
		['protected-get', 'protected-set'],
		['private-get', 'private-set'],
		['#private-get', '#private-set'],

		['static-get', 'static-set'],
		['instance-get', 'instance-set'],
		['abstract-get', 'abstract-set'],

		['decorated-get', 'decorated-set'],

		['get', 'set'],

		// Methods
		'public-static-method',
		'protected-static-method',
		'private-static-method',
		'#private-static-method',
		'public-decorated-method',
		'protected-decorated-method',
		'private-decorated-method',
		'public-instance-method',
		'protected-instance-method',
		'private-instance-method',
		'#private-instance-method',
		'public-abstract-method',
		'protected-abstract-method',
	],
}
