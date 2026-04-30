import path from "node:path";
import browserslist from "browserslist";
import { bundle, browserslistToTargets, Features } from "lightningcss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default async function (eleventyConfig) {
	eleventyConfig.setInputDirectory("src");

	//Passthrough copy
	eleventyConfig.addPassthroughCopy("./src/assets/fonts");
	eleventyConfig.addPassthroughCopy("./src/assets/img/og.jpeg");
	eleventyConfig.addPassthroughCopy({ "./src/assets/favicons": "/" });
	eleventyConfig.addPassthroughCopy({
		"node_modules/@zachleat/heading-anchors/heading-anchors.js":
			"assets/scripts/heading-anchors.js",
	});

	// Lightning CSS
	eleventyConfig.addTemplateFormats("css");
	eleventyConfig.addExtension("css", {
		outputFileExtension: "css",
		compile: async function (_inputContent, inputPath) {
			const parsed = path.parse(inputPath);
			if (parsed.name.startsWith("_")) return;

			const targets = browserslistToTargets(browserslist());

			return async () => {
				const { code } = bundle({
					filename: inputPath,
					minify: true,
					sourceMap: false,
					targets,
					exclude: Features.LightDark,
				});
				return code.toString();
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
