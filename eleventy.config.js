import path from "node:path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default async function (eleventyConfig) {
	eleventyConfig.setInputDirectory("src");

	//Passthrough copy
	eleventyConfig.addPassthroughCopy("./src/assets/fonts");
	eleventyConfig.addPassthroughCopy("./src/assets/img/og.jpeg");
	eleventyConfig.addPassthroughCopy({ "./src/assets/favicons": "/" });

	// Lightning CSS. The bundling and fingerprinting happen once per build in
	// src/_data/css.js; this only writes the result out under its hashed name.
	eleventyConfig.addTemplateFormats("css");
	eleventyConfig.addExtension("css", {
		outputFileExtension: "css",
		compile: async function (_inputContent, inputPath) {
			const { name } = path.parse(inputPath);
			if (name.startsWith("_")) return;

			return async (data) => {
				const entrypoint = data.css[name];
				if (!entrypoint) {
					throw new Error(
						`No bundle for ${inputPath}. Entrypoints are the files without a leading underscore at the top level of src/assets/styles/; everything nested below it is a partial and needs the underscore.`,
					);
				}
				return entrypoint.code;
			};
		},
	});

	//Plugins
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// output image formats
		formats: ["avif", "webp", "jpeg"],

		// output image widths
		widths: ["auto"],
	});

	eleventyConfig.addWatchTarget("./src/assets/styles");
}

export const config = {
	htmlTemplateEngine: "njk",
	markdownTemplateEngine: "njk",
};
