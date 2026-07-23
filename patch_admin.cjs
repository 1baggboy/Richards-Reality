const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  "const [activeTab, setActiveTab] = useState('overview');",
  "const [activeTab, setActiveTab] = useState('overview');\n  const [settingsTab, setSettingsTab] = useState('general');"
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
