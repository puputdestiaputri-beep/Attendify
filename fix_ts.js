const fs = require('fs');
const path = require('path');

const uiDir = 'src/components/ui';

// 1. DashboardCard.tsx
let dbCard = fs.readFileSync(path.join(uiDir, 'DashboardCard.tsx'), 'utf8');
dbCard = dbCard.replace(/import \{ DesignSystem \} from '\.\.\/\.\.\/constants\/DesignSystem';/g, "import { DesignSystem } from '@/constants/DesignSystem';");
dbCard = dbCard.replace(/colors=\{colors\}/g, "colors={colors as unknown as readonly [string, string, ...string[]]}");
fs.writeFileSync(path.join(uiDir, 'DashboardCard.tsx'), dbCard);

// 2. StudentCard.tsx
let stCard = fs.readFileSync(path.join(uiDir, 'StudentCard.tsx'), 'utf8');
stCard = stCard.replace(/import \{ DesignSystem \} from '\.\.\/\.\.\/constants\/DesignSystem';/g, "import { DesignSystem } from '@/constants/DesignSystem';");
stCard = stCard.replace(/colors=\{getGradient\(\)\}/g, "colors={getGradient() as unknown as readonly [string, string, ...string[]]}");
fs.writeFileSync(path.join(uiDir, 'StudentCard.tsx'), stCard);

// 3. SkeletonLoader.tsx
let skLoader = fs.readFileSync(path.join(uiDir, 'SkeletonLoader.tsx'), 'utf8');
skLoader = skLoader.replace(/import \{ DesignSystem \} from '\.\.\/\.\.\/constants\/DesignSystem';/g, "import { DesignSystem } from '@/constants/DesignSystem';");
skLoader = skLoader.replace(/width: string \| number;/g, "width: any;");
skLoader = skLoader.replace(/styles\.dashboardContainer/g, "styles.cardContainer");
fs.writeFileSync(path.join(uiDir, 'SkeletonLoader.tsx'), skLoader);

// 4. EmptyState.tsx
let emptySt = fs.readFileSync(path.join(uiDir, 'EmptyState.tsx'), 'utf8');
emptySt = emptySt.replace(/import \{ DesignSystem \} from '\.\.\/\.\.\/constants\/DesignSystem';/g, "import { DesignSystem } from '@/constants/DesignSystem';");
fs.writeFileSync(path.join(uiDir, 'EmptyState.tsx'), emptySt);

// 5. ModernToast.tsx
let mToast = fs.readFileSync(path.join(uiDir, 'ModernToast.tsx'), 'utf8');
mToast = mToast.replace(/import \{ DesignSystem \} from '\.\.\/\.\.\/constants\/DesignSystem';/g, "import { DesignSystem } from '@/constants/DesignSystem';");
mToast = mToast.replace(/interface ToastConfig/g, "export interface ToastConfig");
fs.writeFileSync(path.join(uiDir, 'ModernToast.tsx'), mToast);

// 6. AnimatedButton.tsx
let animBtn = fs.readFileSync(path.join(uiDir, 'AnimatedButton.tsx'), 'utf8');
animBtn = animBtn.replace(/colors=\{getColors\(\)\}/g, "colors={getColors() as unknown as readonly [string, string, ...string[]]}");
fs.writeFileSync(path.join(uiDir, 'AnimatedButton.tsx'), animBtn);

// 7. IoTSensorValidationScreen.tsx
let iotScreen = fs.readFileSync('src/screens/IoTSensorValidationScreen.tsx', 'utf8');
iotScreen = iotScreen.replace(/\{availableUsers\.map\(user => \(/g, "{availableUsers.map((user: any) => (");
fs.writeFileSync('src/screens/IoTSensorValidationScreen.tsx', iotScreen);

console.log('done');
