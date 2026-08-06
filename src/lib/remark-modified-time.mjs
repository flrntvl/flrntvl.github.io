import { execFileSync } from 'node:child_process';

export function remarkModifiedTime() {
	return (_tree, file) => {
		const filepath = file.history[0];
		let lastModified = '';
		try {
			// execFileSync (not execSync + string interpolation, unlike the docs
			// recipe): no shell involved, so the path never needs escaping.
			lastModified = execFileSync('git', ['log', '-1', '--pretty=format:%cI', filepath]).toString().trim();
		} catch {
			// No git history yet — a new, uncommitted article. Leave it unset.
		}
		if (lastModified) {
			file.data.astro.frontmatter.lastModified = lastModified;
		}
	};
}
