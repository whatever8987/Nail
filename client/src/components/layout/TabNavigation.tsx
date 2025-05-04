// src/components/layout/TabNavigation.tsx
import React from 'react'; // Import React if not already implicitly available
import { Link } from 'wouter'; // Using Link for structure, won't navigate without Router

// Define expected prop types
interface Tab {
    name: string;
    href: string;
}

interface TabNavigationProps {
    tabs: Tab[];
    // Optionally accept activeHref for standalone display control
    activeHref?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeHref = '/' }) => {

    // Determine active state based on passed prop or a default
    const isActive = (href: string) => {
        return activeHref === href;
    };

    return (
        <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href} // Link destination (won't work without router)
                        className={`whitespace-nowrap px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                            isActive(tab.href)
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                        // aria-current only makes sense with real routing
                        // aria-current={isActive(tab.href) ? "page" : undefined}
                        // Prevent actual navigation in standalone mode
                        onClick={(e) => e.preventDefault()}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}