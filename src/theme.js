import ace from 'ace-builds';
import themeGithubUrl from 'ace-builds/src-noconflict/theme-github?url';
import themeDraculaUrl from 'ace-builds/src-noconflict/theme-dracula?url';

export function initAceTheme() {
    ace.config.setModuleUrl('ace/theme/github', themeGithubUrl);
    ace.config.setModuleUrl('ace/theme/dracula', themeDraculaUrl);
}

export function getAceTheme(theme) {
    switch (theme) {
        case 'light': return 'github';
        case 'dark': return 'dracula';
        default: return 'github';
    }
}

export function getAvailableThemes() {
    return ['light', 'dark']
}
