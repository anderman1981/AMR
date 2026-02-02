
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // 1. Get total commit count (Build Number)
    const commitCount = execSync('git rev-list --count HEAD').toString().trim();
    
    // 2. Get current branch name
    let branch = 'unknown';
    try {
        branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch (e) {
        // Fallback if detached head
        branch = process.env.VITE_BRANCH_NAME || 'HEAD';
    }

    // 3. Construct Version Object
    const versionInfo = {
        major: 1,
        minor: 0,
        patch: parseInt(commitCount),
        branch: branch,
        buildDate: new Date().toISOString()
    };

    const versionString = `v${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;
    
    console.log(`✅ Generating Version: ${versionString} (${branch})`);

    // 4. Write to dashboard/src/version.json
    const outputPath = path.resolve(__dirname, '../dashboard/src/version.json');
    fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

    console.log(`📄 Version file written to: ${outputPath}`);

} catch (error) {
    console.error('❌ Error generating version:', error.message);
    // Write fallback
    const fallbackPath = path.resolve(__dirname, '../dashboard/src/version.json');
    fs.writeFileSync(fallbackPath, JSON.stringify({
        major: 1, minor: 0, patch: 0, branch: 'unknown', buildDate: new Date().toISOString()
    }, null, 2));
}
