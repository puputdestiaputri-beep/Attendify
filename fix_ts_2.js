const fs = require('fs');

// 1. ModernToast.tsx
let mToast = fs.readFileSync('src/components/ui/ModernToast.tsx', 'utf8');
mToast = mToast.replace(/colors=\{getGradient\(\)\}/g, "colors={getGradient() as unknown as readonly [string, string, ...string[]]}");
fs.writeFileSync('src/components/ui/ModernToast.tsx', mToast);

// 2. ForgotPasswordScreen.tsx
let fpScreen = fs.readFileSync('src/screens/ForgotPasswordScreen.tsx', 'utf8');
fpScreen = fpScreen.replace(/'\.\.\/\.\.\/components\/ui\/AnimatedButton'/g, "'../components/ui/AnimatedButton'");
fs.writeFileSync('src/screens/ForgotPasswordScreen.tsx', fpScreen);

// 3. LoginScreen.tsx
let lgScreen = fs.readFileSync('src/screens/LoginScreen.tsx', 'utf8');
lgScreen = lgScreen.replace(/'\.\.\/\.\.\/components\/ui\/AnimatedButton'/g, "'../components/ui/AnimatedButton'");
fs.writeFileSync('src/screens/LoginScreen.tsx', lgScreen);

// 4. SettingsScreen.tsx
let sScreen = fs.readFileSync('src/screens/SettingsScreen.tsx', 'utf8');
sScreen = sScreen.replace(/colors=\{grad\.colors as readonly \[string, string, \.\.\.string\[\]\]\}/g, "colors={grad.colors as unknown as readonly [string, string, ...string[]]}");
fs.writeFileSync('src/screens/SettingsScreen.tsx', sScreen);

console.log('done');
