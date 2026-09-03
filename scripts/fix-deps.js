const fs = require('fs');
const path = require('path');

const sqliteBuildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-sqlite-storage',
  'platforms',
  'android',
  'build.gradle'
);

if (fs.existsSync(sqliteBuildGradlePath)) {
  let content = fs.readFileSync(sqliteBuildGradlePath, 'utf8');
  if (content.includes('jcenter()')) {
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    fs.writeFileSync(sqliteBuildGradlePath, content, 'utf8');
    console.log('Successfully replaced jcenter() with mavenCentral() in react-native-sqlite-storage!');
  }
}
