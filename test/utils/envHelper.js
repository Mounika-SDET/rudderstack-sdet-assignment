const fs = require('fs');
const path = require('path');

async function updateEnvFile(key, value, envFilePath = path.resolve(__dirname, '../../.env')) {
  let envContent = '';

  // Read existing .env if it exists
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, 'utf8');
  }

  const keyRegex = new RegExp(`^${key}=.*$`, 'm');

  if (keyRegex.test(envContent)) {
    // Replace existing key's value
    envContent = envContent.replace(keyRegex, `${key}=${value}`);
  } else {
    // Append new key-value pair
    if (envContent.length && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `${key}=${value}\n`;
  }

  // Write back to the file
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  
  return value;
}

module.exports = { updateEnvFile };

