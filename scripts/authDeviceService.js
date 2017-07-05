var ns = require('./namespace');

/**
 * Implements device authentication flow and loads literals
 */
angular.module('r4a.pp-api').service(ns('authDeviceService'), [
    '$q', ns('requestMaker'), ns('utils'),
    function($q, requestMaker, utils) {
        // link to entry point for back-end communications
        var serviceRootLink = {
                "Templated": true,
                "WithCredentials": true
            },
            relativeAuthHref = "api/devices{?apiKey,manufacturer,model,udid}",
            basePath = null;

        var rootData,
            literals,
            authDeferred = $q.defer();

        // ------------- Private methods
        function loadLiterals() {
            requestMaker.http(rootData.Literals, { language: rootData.DeviceAuthData.Language })
                .then(function(response) {
                    literals = response.data;

                    authDeferred.resolve({
                        rootData: rootData,
                        literals: literals
                    });
                }, function(response) {
                    authDeferred.reject(requestMaker.formatError(response.data, response.status));
                });
        }

        function registerDevice(link) {
            requestMaker.http(link).then(function(response) {
                setRootData(response.data);
                loadLiterals();
            }, function(response) {
                authDeferred.reject(requestMaker.formatError(response.data, response.status));
            });
        }

        function setRootData(deviceDataArray) {
            rootData = deviceDataArray[0];

            utils.checkPPVersion(rootData.ApiVersion);

            requestMaker.setAcceptLanguage(rootData.DeviceAuthData.Language);

            // make some links cacheable
            rootData.Home.cache = true;
        }

        // ------------- Public methods
        /**
         * Starts device authentication process
         * @param params
         * @returns auth process completion promise
         */
        this.doAuth = function(params) {
            serviceRootLink.Href = basePath + relativeAuthHref;
            requestMaker.http(serviceRootLink, params)
                .then(function(success) {
                    try {
                        setRootData(success.data);
                        loadLiterals();
                    }
                    catch(ex) {
                        rootData = null;
                        return authDeferred.reject({ Message: ex.message });
                    }
                }, function(error) {
                    if (error.status == 404) { // was not connected before
                        registerDevice(error.data);
                    }
                    else {
                        authDeferred.reject(requestMaker.formatError(error.data, error.status));
                    }
                });
            return authDeferred.promise;
        };

        /**
         * Sets base server path, relatively to base url
         */
        this.setBasePath = function(bPath) {
            basePath = bPath;
        };

        Object.defineProperties(this, {
            authPromise: {
                value: authDeferred.promise,
                writable: false
            }
        });
    }
]);
