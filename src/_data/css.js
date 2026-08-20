import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import browserslist from "browserslist";
import { bundle, browserslistToTargets, Features } from "lightningcss";

const STYLES_DIR = "./src/assets/styles";

/**
 * Bundles every CSS entrypoint (files not prefixed with `_`) and fingerprints
 * the result, so `index.css` ships as `/assets/styles/index.<hash>.css`.
 *
 * Runs once per build, before templates render. Both the emitted file (see the
 * `css` extension in eleventy.config.js) and the `<link>` in base.njk read the
 * output from here, so the URL and the bytes can never drift apart.
 *
 * Fingerprinting is skipped outside `eleventy` builds: under `--serve` the hash
 * changes on every keystroke, and each one would leave another stale stylesheet
 * behind in _site/.
 */
export default async function () {
	const fingerprint = process.env.ELEVENTY_RUN_MODE === "build";
	const targets = browserslistToTargets(browserslist());
	const entries = (await fs.readdir(STYLES_DIR)).filter(
		(name) => name.endsWith(".css") && !name.startsWith("_"),
	);

	return Object.fromEntries(
		entries.map((name) => {
			const slug = path.parse(name).name;
			const { code } = bundle({
				filename: path.join(STYLES_DIR, name),
				minify: true,
				sourceMap: false,
				targets,
				exclude: Features.LightDark,
			});
			const hash = createHash("sha256").update(code).digest("hex").slice(0, 8);
			const filename = fingerprint ? `${slug}.${hash}.css` : `${slug}.css`;

			return [
				slug,
				{ code: code.toString(), url: `/assets/styles/${filename}` },
			];
		}),
	);
}
