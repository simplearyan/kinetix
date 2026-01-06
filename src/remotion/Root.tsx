import { Composition } from 'remotion';
import { HelloWorld } from './compositions/HelloWorld';
import { MathFormula } from './compositions/MathFormula';
import { BarChartRace } from './compositions/BarChartRace';
import { CodeBlock } from './compositions/CodeBlock';
import { useAnimatorStore } from '../store/animatorStore';

export const MyRemotionRoot: React.FC = () => {
    // We can pull initial data from store to set default props, 
    // but Remotion prefers serializable props passed in.
    // For this app, we are mostly Client-Side, so accessing Store inside Composition is allowed/easier 
    // BUT 'inputProps' in Player is the cleaner way.

    // However, Root isn't a component that renders inside the Player, it DEFINES the Player structure.
    // The Store is external.
    const { barChartData, currentCode } = useAnimatorStore.getState();

    return (
        <>
            <Composition
                id="BarChartRace"
                component={BarChartRace}
                durationInFrames={1200}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    data: barChartData
                }}
            />
            <Composition
                id="CodeBlock"
                component={CodeBlock}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    code: 'console.log("Hello Kinetix!");',
                    language: 'javascript'
                }}
            />
            <Composition
                id="MathFormula"
                component={MathFormula}
                durationInFrames={120}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    latex: '\\sum x^2',
                }}
            />
        </>
    );
};
