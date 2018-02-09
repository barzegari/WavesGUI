(function () {

    if (location.href.indexOf('console=false') !== -1) {
        return null;
    }

    var css = function (element: HTMLElement, styles) {
        Object.keys(styles).forEach((styleName) => {
            var value = styles[styleName];
            element.style[styleName] = value;
        });
    };

    var out = document.createElement('DIV');
    css(out, {
        position: 'absolute',
        top: '10%',
        left: '10%',
        fontSize: '25px',
        padding: '20px',
        lineHeight: '30px',
        width: '80%',
        zIndex: 100000,
        borderRadius: '10px',
        border: '1px solid #000',
        backgroundColor: '#eee'
    });
    document.body.appendChild(out);

    window.onerror = function (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) {
        var line = document.createElement('div');
        line.innerText = `Message: ${message}\nFile name: ${filename}\nLine: ${lineno}\nStack: ${error.stack}`;
        out.appendChild(line);
    };

    ['log', 'warn', 'error'].forEach((methodName) => {
        var method = console[methodName];
        console[methodName] = function () {
            method.apply(console, arguments);
            var line = document.createElement('DIV');
            line.innerText = `Type: ${methodName}\nMessage: ${Array.prototype.join.call(arguments, ', ')}`;
            out.appendChild(line);
        };
    });

    if (!Object.values) {
        Object.values = function (target) {
            return Object.keys(target).map(function (name) {
                return target[name];
            });
        };
    }

    if (typeof Promise === 'undefined') {
        console.error('No Promise!');
    }

    if (typeof crypto === 'undefined') {
        console.error('No crypto!');
    }

})();
