import React, { useMemo } from "react";
import { Engine } from "../../../engine/Core";
import { BottomSheet } from "../panels/BottomSheet";
import { TextDrawerContent } from "./TextDrawer";
import { ShapesDrawerContent } from "./ShapesDrawer";
import { CodeDrawerContent } from "./CodeDrawer";
import { ChartsDrawerContent } from "./ChartsDrawer";

interface AssetsDrawerProps {
    engine: Engine | null;
    activeTab: string | null;
    onClose: () => void;
}

export const AssetsDrawer: React.FC<AssetsDrawerProps> = ({ engine, activeTab, onClose }) => {

    const isOpen = useMemo(() => {
        return ['text', 'shapes', 'code', 'charts'].includes(activeTab || '');
    }, [activeTab]);

    const title = useMemo(() => {
        switch (activeTab) {
            case 'text': return 'Typography';
            case 'shapes': return 'Shapes & Assets';
            case 'code': return 'Code Blocks';
            case 'charts': return 'Charts & Data';
            default: return 'Assets';
        }
    }, [activeTab]);

    const content = useMemo(() => {
        switch (activeTab) {
            case 'text': return <TextDrawerContent engine={engine} onClose={onClose} />;
            case 'shapes': return <ShapesDrawerContent engine={engine} onClose={onClose} />;
            case 'code': return <CodeDrawerContent engine={engine} onClose={onClose} />;
            case 'charts': return <ChartsDrawerContent engine={engine} onClose={onClose} />;
            default: return null;
        }
    }, [activeTab, engine, onClose]);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            initialSnap={0.5}
            snaps={[0.5, 0.95]}
        >
            {content}
        </BottomSheet>
    );
};
