const fs = require('fs');
const files = [
    'Home_icon-icons.com_55890.svg',
    'workspace_icon_217150.svg',
    'alarm_alert_attention_bell_clock_notification_ring_icon_123203.svg',
    '1904675-configuration-edit-gear-options-preferences-setting-settings_122525.svg',
    'projects_icon_142976.svg'
];

files.forEach(file => {
    let content = fs.readFileSync('public/' + file, 'utf-8');
    // Inject style tag right after <svg ... >
    content = content.replace(/(<svg[^>]*>)/i, '$1<style>* { fill: #ffffff !important; stroke: none !important; color: #ffffff !important; }</style>');
    const newName = file.replace('.svg', '_white.svg');
    fs.writeFileSync('public/' + newName, content);
});
console.log('White SVGs generated successfully.');
