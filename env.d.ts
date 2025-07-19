// Pour les fichiers JSON
declare module '*.json' {
    const value: any
    export default value
}

// Pour les fichiers SVG ou images
declare module '*.svg' {
    const src: string
    export default src
}

declare module '*.png' {
    const src: string
    export default src
}

declare module '*.jpg' {
    const src: string
    export default src
}