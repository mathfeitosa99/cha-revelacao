// Garantir compatibilidade com todos os navegadores
(function() {
    'use strict';
    
    // Polyfill para padStart (IE/Edge antigos)
    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength, padString) {
            targetLength = targetLength >> 0;
            padString = String(typeof padString !== 'undefined' ? padString : ' ');
            if (this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length);
                }
                return padString.slice(0, targetLength) + String(this);
            }
        };
    }
    
    // Polyfill para Object.values (IE)
    if (!Object.values) {
        Object.values = function(obj) {
            return Object.keys(obj).map(function(key) {
                return obj[key];
            });
        };
    }
    
    // Polyfill para Array.find (IE)
    if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = parseInt(list.length) || 0;
            var thisArg = arguments[1];
            for (var i = 0; i < length; i++) {
                var element = list[i];
                if (predicate.call(thisArg, element, i, list)) {
                    return element;
                }
            }
            return undefined;
        };
    }
    
    // Polyfill para Array.findIndex (IE)
    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = parseInt(list.length) || 0;
            var thisArg = arguments[1];
            for (var i = 0; i < length; i++) {
                var element = list[i];
                if (predicate.call(thisArg, element, i, list)) {
                    return i;
                }
            }
            return -1;
        };
    }
    
    // Garantir localStorage funciona
    function testLocalStorage() {
        try {
            var test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    // Fallback para localStorage se não disponível
    if (!testLocalStorage()) {
        window.localStorage = {
            _data: {},
            setItem: function(id, val) {
                return this._data[id] = String(val);
            },
            getItem: function(id) {
                return this._data.hasOwnProperty(id) ? this._data[id] : null;
            },
            removeItem: function(id) {
                return delete this._data[id];
            },
            clear: function() {
                return this._data = {};
            }
        };
    }
    
    // Garantir que fetch existe (IE/Edge antigos)
    if (!window.fetch) {
        window.fetch = function(url, options) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(options && options.method || 'GET', url);
                
                if (options && options.headers) {
                    for (var key in options.headers) {
                        xhr.setRequestHeader(key, options.headers[key]);
                    }
                }
                
                xhr.onload = function() {
                    resolve({
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        text: function() {
                            return Promise.resolve(xhr.responseText);
                        },
                        json: function() {
                            return Promise.resolve(JSON.parse(xhr.responseText));
                        }
                    });
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                
                xhr.send(options && options.body || null);
            });
        };
    }
    
    // Garantir que Promise existe (IE)
    if (!window.Promise) {
        window.Promise = function(executor) {
            var self = this;
            self.state = 'pending';
            self.value = undefined;
            self.handlers = [];
            
            function resolve(result) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = result;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function reject(error) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = error;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function handle(handler) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }
            
            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(result) {
                            try {
                                resolve(onFulfilled ? onFulfilled(result) : result);
                            } catch (ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(error) {
                            try {
                                resolve(onRejected ? onRejected(error) : error);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };
            
            executor(resolve, reject);
        };
        
        Promise.resolve = function(value) {
            return new Promise(function(resolve) {
                resolve(value);
            });
        };
        
        Promise.reject = function(reason) {
            return new Promise(function(resolve, reject) {
                reject(reason);
            });
        };
    }
    
    // Verificar se todas as funcionalidades estão disponíveis
    const compatibilityCheck = {
        padStart: typeof String.prototype.padStart === 'function',
        objectValues: typeof Object.values === 'function',
        arrayFind: typeof Array.prototype.find === 'function',
        arrayFindIndex: typeof Array.prototype.findIndex === 'function',
        localStorage: (function() {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        })(),
        fetch: typeof fetch === 'function',
        promise: typeof Promise === 'function'
    };
    
    const allCompatible = Object.values(compatibilityCheck).every(Boolean);
    
    if (allCompatible) {
        console.log('✅ Polyfills de compatibilidade carregados - Navegador totalmente compatível');
    } else {
        console.log('⚠️ Polyfills de compatibilidade carregados - Algumas funcionalidades podem ser limitadas');
        console.log('📊 Status de compatibilidade:', compatibilityCheck);
    }
})();