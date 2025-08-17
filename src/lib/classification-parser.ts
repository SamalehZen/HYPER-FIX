import type { ClassificationNode } from './types';

const getTabCount = (line: string): number => {
    const match = line.match(/^\t+/);
    return match ? match[0].length : 0;
};

export const parseHierarchy = (hierarchyString: string): ClassificationNode[] => {
    const lines = hierarchyString.split('\n').filter(line => line.trim() !== '');
    const nodes: ClassificationNode[] = [];
    // The parent stack now tracks the code at each indentation level.
    // Index 0 = parent for tabCount 1, Index 1 = parent for tabCount 2, etc.
    const parentCodeStack: (string | null)[] = [null, null, null, null, null];

    // First line is the root, let's process it separately to set up the stack.
    if (lines.length > 0) {
        const rootContent = lines[0].trim();
        const rootParts = rootContent.split(/\s+/);
        parentCodeStack[0] = rootParts[0]; // e.g., '201'
    }

    for (const line of lines) {
        const tabCount = getTabCount(line);
        const content = line.trim();

        if (!content) continue;

        const parts = content.split(/\s+/);
        const code = parts[0];
        const name = parts.slice(1).join(' ');

        if (!code || !name) continue;

        // The level is determined by the number of tabs.
        // 1 tab = Secteur, 2 tabs = Rayon, etc.
        const level = tabCount;

        // Validate the structure based on level and code length
        if (level === 1 && code.length !== 2) continue; // Secteur must have 2-digit code
        if (level > 1 && code.length !== 3) continue; // Others must have 3-digit codes
        if (level < 1 || level > 4) continue; // We only care about levels 1-4

        // The parent code is at the stack index for the level *above* the current one.
        // A level 1 (1 tab) node's parent is at stack index 0.
        const parentCode = parentCodeStack[level - 1];

        nodes.push({
            level,
            code,
            name,
            parentCode,
        });

        // Store the current code at the current level's index for future children.
        parentCodeStack[level] = code;
    }

    return nodes;
};
