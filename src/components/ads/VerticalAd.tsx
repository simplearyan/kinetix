import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const VerticalAd = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error(e);
        }
    }, []);

    return (
        <div style={{
            width: '160px',
            minHeight: '600px',
            backgroundColor: 'aliceblue',
            borderRadius: '8px',
            /* Removed flex and overflow:hidden to allow ad expansion */
        }}>
            <div style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#94a3b8',
                margin: '4px 0',
                textAlign: 'center',
                fontFamily: 'sans-serif',
            }}>
                Advertisement
            </div>
            {/* AdSense Script */}
            {/* <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-7993314093599705"
                 data-ad-slot="9544937585"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins> */}
            {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7993314093599705"
     crossorigin="anonymous"></script> */}
            {/* <!-- Kinetix_Vertical_Ad --> */}
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-7993314093599705"
                data-ad-slot="4826677960"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            {/* <script>
                (adsbygoogle = window.adsbygoogle || []).push({ });
            </script> */}
        </div>
    );
};
