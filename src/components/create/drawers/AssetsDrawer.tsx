import React, { useMemo } from "react";
import { Engine } from "../../../engine/Core";
import { BottomSheet } from "../panels/BottomSheet";

import { ElementsDrawerContent } from "./ElementsDrawer";


interface AssetsDrawerProps {
    engine: Engine | null;
    activeTab: string | null;
    onClose: () => void;
}

export const AssetsDrawer: React.FC<AssetsDrawerProps> = ({ engine, activeTab, onClose }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Reset expansion when tab changes
    React.useEffect(() => {
        setIsExpanded(false);
    }, [activeTab]);

    const isOpen = useMemo(() => {
        return false;
    }, [activeTab]);

    const title = useMemo(() => {
        switch (activeTab) {
            default: return 'Assets';
        }
    }, [activeTab]);

    const content = useMemo(() => {
        switch (activeTab) {
            default: return null;
        }
    }, [activeTab, engine, onClose, isExpanded]);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={undefined}
            initialSnap={0.5}
            snaps={[0.5, 0.95]}
            onSnapChange={(curr) => setIsExpanded(curr === 1)}
        >
            {content}
        </BottomSheet>
    );
};
