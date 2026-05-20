const fs = require('fs');
const path = require('path');

const OLD_IP1 = '10.61.4.23';
const OLD_IP2 = '10.61.4.23';
const NEW_IP = '10.61.4.23';

const walkSync = (dir, filelist = []) => {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filepath = path.join(dir, file);
            if (fs.statSync(filepath).isDirectory()) {
                if (!filepath.includes('node_modules') && !filepath.includes('.git') && !filepath.includes('.expo') && !filepath.includes('build')) {
                    filelist = walkSync(filepath, filelist);
                }
            } else {
                if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.js') || filepath.endsWith('.ino') || filepath.endsWith('.env')) {
                    filelist.push(filepath);
                }
            }
        }
    } catch (err) {
        console.error('Error walking directory', err);
    }
    return filelist;
};

const files = walkSync(__dirname);

let changedFiles = [];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        
        newContent = newContent.replace(new RegExp(OLD_IP1, 'g'), NEW_IP);
        newContent = newContent.replace(new RegExp(OLD_IP2, 'g'), NEW_IP);
        
        if (file.endsWith('.env')) {
            newContent = newContent.replace('API_URL=http://localhost:5000/api', `API_URL=http://${NEW_IP}:5000/api`);
        }
        
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            changedFiles.push(file);
            console.log(`Updated: ${file}`);
        }
    } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
    }
});

console.log('Total files updated: ' + changedFiles.length);
