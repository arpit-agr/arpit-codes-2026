import path from "node:path";

export default {
	eleventyExcludeFromCollections: true,

	// Entrypoints are written to their fingerprinted URL; partials (prefixed
	// with `_`) are absent from the `css` data and so emit no file of their own.
	// Keyed off inputPath rather than page.fileSlug, which resolves to the parent
	// directory name for `index.css`.
	permalink: (data) =>
		data.css[path.parse(data.page.inputPath).name]?.url ?? false,
};
