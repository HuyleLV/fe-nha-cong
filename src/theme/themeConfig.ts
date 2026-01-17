import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const lightTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
        colorPrimary: '#006633', // Emerald-700-ish
        colorBgBase: '#ffffff',
        colorTextBase: '#171717',
        borderRadius: 8,
    },
    components: {
        Table: {
            headerBg: '#f0fdf4', // emerald-50
            headerColor: '#166534', // emerald-800
            headerBorderRadius: 8,
        },
        Button: {
            colorPrimary: '#006633',
            algorithm: true,
        },
        Select: {
            controlOutline: 'rgba(0, 102, 51, 0.2)',
        },
    },
};

export const darkTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: '#4CAF50', // Lighter Green for Dark Mode
        colorBgBase: '#000000',
        colorTextBase: '#ffffff',
        borderRadius: 8,
    },
    components: {
        Table: {
            headerBg: '#1e1e1e', // Darker gray
            headerColor: '#4CAF50',
            rowHoverBg: '#262626',
            borderColor: '#303030',
        },
        Layout: {
            bodyBg: '#0a0a0a',
            headerBg: '#171717',
        },
        Card: {
            colorBgContainer: '#171717',
        },
    },
};
