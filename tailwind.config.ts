import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}', // Garante que Tailwind analise todos os arquivos TS/JS/TSX/JSX
    ],
    theme: {
        extend: {
            colors: {
                military: '#4B5320',
                olive: '#6B8E23',
                beige: '#F5F5F0',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Fonte moderna para UI
            },
        },
    },
    darkMode: 'class', // Ativa o modo escuro via classe (recomendado)
    plugins: [],
};

export default config;
