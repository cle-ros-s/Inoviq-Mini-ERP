const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if(file.endsWith('.jsx')) filelist.push(path.join(dir, file));
    }
  });
  return filelist;
}

const files = walkSync('D:/MINI- ERP/src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replace btn-secondary text-sm with btn btn-secondary btn-sm
  newContent = newContent.replace(/className="btn-secondary text-sm([^"]*)"/g, 'className="btn btn-secondary btn-sm$1"');
  
  // Replace btn-XXX with btn btn-XXX if 'btn ' is not already present
  newContent = newContent.replace(/className="([^"]*)btn-(primary|secondary|danger|warning|ghost)([^"]*)"/g, (match, before, type, after) => {
    if (before.includes('btn ')) return match; // already has btn
    return 'className="' + before + 'btn btn-' + type + after + '"';
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed:', file);
    changedCount++;
  }
});
console.log('Total fixed:', changedCount);
