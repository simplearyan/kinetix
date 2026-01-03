import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const SquareAd = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error(e);
        }
    }, []);

    return (
        <div style={{
            width: '100%',
            aspectRatio: '1/1',
            minHeight: '250px',
            backgroundColor: 'aliceblue',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            /* Removed flex/overflow/position relative */
        }}>
            <div style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: 'rgba(29, 29, 29, 0.5)',
                marginBottom: '4px',
                width: '100%',
                textAlign: 'center',
                background: 'transparent',
            }}>
                Advertisement
            </div>
            {/* Google AdSense */}
            {/* <ins className="adsbygoogle"
                 style={{ display: 'block', width: '100%', height: '100%' }}
                 data-ad-client="ca-pub-7993314093599705"
                 data-ad-slot="1234567890"
                 data-ad-format="rectangle"
                 data-full-width-responsive="true"></ins> */}
            {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7993314093599705"
     crossorigin="anonymous"></script> */}
            {/* <!-- Kinetix_Square_Ad --> */}
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-7993314093599705"
                data-ad-slot="3150634211"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            {/* <script>
                (adsbygoogle = window.adsbygoogle || []).push({ });
            </script> */}
        </div>
    );
};
