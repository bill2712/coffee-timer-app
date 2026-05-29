import fs from 'fs';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.astro')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return;
    
    let frontmatter = frontmatterMatch[1];
    let lines = frontmatter.split('\n');
    let imports = [];
    let others = [];
    
    lines.forEach(line => {
        if (line.trim().startsWith('import ')) {
            imports.push(line);
        } else {
            others.push(line);
        }
    });
    
    if (imports.length > 0) {
        const newFrontmatter = [...imports, ...others].join('\n');
        content = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Fixed imports in', files.length, 'files');
