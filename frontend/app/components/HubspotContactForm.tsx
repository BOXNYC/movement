'use client';

import {useEffect} from "react";

declare global {
    interface Window {
        hbspt?: {
            forms: {
                create: (options: { portalId: string; formId: string; target: string }) => void;
            };
        };
    }
}

const HubspotContactForm = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src='https://js.hsforms.net/forms/v2.js';
        document.body.appendChild(script);

        script.addEventListener('load', () => {
            if (window.hbspt) {
                window.hbspt.forms.create({
                    portalId: '8350854',
                    formId: '138302df-1ae0-47a7-bf01-a13bb7fbc176',
                    target: '#hubspotForm'
                })
            }
        });
    }, []);

    return (
        <div>
            <div id="hubspotForm"></div>
        </div>
    );

}

export default HubspotContactForm;