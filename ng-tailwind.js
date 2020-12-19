module.exports = {
    // Tailwind Paths
    configJS: 'tailwind.config.js',
    sourceCSS: 'src\\tailwind.scss',
    outputCSS: 'src\\tailwind.css',
    watchRelatedFiles: ['src\\**\\*.html'],
    // Sass
    sass: true,
    // PurgeCSS Settings
    purge: true,
    keyframes: false,
    fontFace: false,
    rejected: false,
    whitelist: [],
    whitelistPatterns: [],
    whitelistPatternsChildren: [],
    extensions: [
        '.ts',
        '.html',
        '.js'
    ],
    extractors: [],
    content: []
}
