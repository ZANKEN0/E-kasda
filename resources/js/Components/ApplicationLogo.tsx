import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="32" cy="32" r="28" fill="#89F5E7" />
            <text
                x="18"
                y="39"
                fill="#00201D"
                fontFamily="Manrope, Arial, sans-serif"
                fontSize="22"
                fontWeight="800"
            >
                EK
            </text>
        </svg>
    );
}
