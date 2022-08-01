const urlTree = [
    {
        baseURL: 'js/class',
        extension: 'js',
        endpoint: [
            'ant',
            'antHill',
            'food',
            'path',
            'quadtree',
            'wall',
            'colony',
        ]
    },
    {
        baseURL: 'js/script',
        extension: 'js',
        endpoint: [
            'main'
        ]
    }
]

urlTree.forEach(e => {
    e.endpoint.forEach(endpoint => {
        var script = document.createElement('script')
        script.src = `${e.baseURL}/${endpoint}.${e.extension}`
        document.head.appendChild(script)
    })
})
