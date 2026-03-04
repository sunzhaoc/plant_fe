// src/types/css-modules.d.ts
declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

// 如果你还用到 .module.scss/.module.sass，也可以一起加
declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.module.sass' {
    const classes: { [key: string]: string };
    export default classes;
}