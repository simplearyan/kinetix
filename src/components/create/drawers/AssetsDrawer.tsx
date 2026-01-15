import React, { useMemo } from "react";
import { Engine } from "../../../engine/Core";
import { BottomSheet } from "../panels/BottomSheet";
import { TextDrawerContent } from "./TextDrawer";
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
        return ['text', 'elements'].includes(activeTab || '');
    }, [activeTab]);

    const title = useMemo(() => {
        switch (activeTab) {
            case 'text': return 'Typography';
            case 'elements': return 'Elements';

            default: return 'Assets';
        }
    }, [activeTab]);

    const content = useMemo(() => {
        switch (activeTab) {
            case 'text': return <TextDrawerContent engine={engine} onClose={onClose} isExpanded={isExpanded} />;
            case 'elements': return <ElementsDrawerContent engine={engine} onClose={onClose} />;

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
