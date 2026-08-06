import { execFileSync } from 'node:child_process';

export function remarkModifiedTime() {
	return (_tree, file) => {
		const filepath = file.history[0];
		let published = '';
		let lastModified = '';
		try {
			// execFileSync (not execSync + string interpolation, unlike the docs
			// recipe): no shell involved, so the path never needs escaping.
			const history = execFileSync('git', ['log', '--reverse', '--pretty=format:%cI', filepath])
				.toString()
				.trim()
				.split('\n')
				.filter(Boolean);
			published = history[0] ?? '';
			lastModified = history[history.length - 1] ?? '';
		} catch {
			// No git history yet — a new, uncommitted article. Leave it unset.
		}
		if (published) {
			file.data.astro.frontmatter.published = published;
		}
		if (lastModified) {
			file.data.astro.frontmatter.lastModified = lastModified;
		}
	};
}
