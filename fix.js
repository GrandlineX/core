import fs from 'fs';
import path from 'path';
const __dirname = process.cwd();
fs.writeFileSync(path.join(__dirname,'dist','cjs','package.json'),`{
    "type": "commonjs"
}`);

fs.writeFileSync(path.join(__dirname,'dist','mjs','package.json'),`{
    "type": "module"
}`);
