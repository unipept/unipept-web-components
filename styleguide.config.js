module.exports = {
	// set your styleguidist configuration here
    title: 'Unipept Web Components',
    components: 'src/components/**/[A-Z]*.vue',
    sections: [
        {
            name: 'analysis',
            components: 'src/components/analysis/**/[A-Z]*.vue'
        }, 
        {
            name: 'custom',
            components: 'src/components/custom/**/[A-Z]*.vue'
        },
        {
            name: 'dataset',
            components: 'src/components/dataset/**/[A-Z]*.vue'
        },
        {
            name: 'heatmap',
            components: 'src/components/heatmap/**/[A-Z]*.vue'
        },
        {
            name: 'tables',
            components: 'src/components/tables/**/[A-Z]*.vue'
        },
        {
            name: 'visualizations',
            components: 'src/components/visualizations/**/[A-Z]*.vue'
        }
    ],
	exampleMode: 'expand'
}
