const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'expo-constants', 'scripts', 'get-app-config-android.gradle');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('def customProjectRoot = expoGradleExtension?.projectRoot')) {
    content = content.replace(
      'def customProjectRoot = expoGradleExtension?.projectRoot',
      'def customProjectRoot = (expoGradleExtension != null && expoGradleExtension.hasProperty("projectRoot")) ? expoGradleExtension.projectRoot : null'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✓ Successfully patched expo-constants get-app-config-android.gradle');
  }
}
