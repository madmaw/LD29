﻿module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            build: {
                src: ['src/main/ts/**/*.ts', 'src/main/d.ts/**/*.d.ts'],
                dest: 'build/out.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'src/main/ts',
                    sourceMap: true,
                    declaration: true
                }
            }
        },
        clean: {
            all:["build", "dist", "dist.zip"]
        },
        uglify: {
            options: {
                mangle: false,
                compress: false
            },
            dist: {
                files: {
                    'dist/out.min.js': ['build/out.js'],
                    // compress handlebars
                    'dist/lib/analytics.min.js': ['lib/analytics.js']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, src: ['lib/*.min.js'], dest: 'dist/'},
                    {expand: true, src: ['res/**/*'], dest: 'dist/' },
                    {expand: true, src: ['*.css'], dest: 'dist/' },
                    {expand: true, src: ['*.html'], dest: 'dist/'}
                ]
            }
        },
        replace: {
            dist: {
                src: ['dist/*.html'],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                    from: /build\/out/g,
                    to: "out"
                },{
                    from: /.js/g,
                    to: ".min.js"
                }]
            }
        },
        zip: {
            dist: {
                router: function (filepath) {
                    // Route each file to all/{{filename}}
                    var s = 'dist/';
                    var index = filepath.indexOf(s);
                    var result;
                    if( index == 0 ) {
                        result = filepath.substring(s.length + index);
                    } else {
                        result = filepath;
                    }
                    return result;
                },
                src: ['dist/**'],
                dest: 'dist.zip'
            }
        },
        phonegap: {
            config: {
                root: 'dist',
                config: 'config.xml',
                cordova: '.cordova',
                path: 'phonegap',
                platforms: ['android'],
                maxBuffer: 200, // You may need to raise this for iOS.
                verbose: false,
                releases: 'releases',
                releaseName: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return(pkg.name + '-' + pkg.version);
                },

                // Must be set for ios to work.
                // Should return the app name.
                name: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return pkg.name;
                },

                // Add a key if you plan to use the `release:android` task
                // See http://developer.android.com/tools/publishing/app-signing.html
                key: {
                    store: 'release.keystore',
                    alias: 'release',
                    aliasPassword: function(){
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('');
                    },
                    storePassword: function(){
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('');
                    }
                },

                // Set an app icon at various sizes (optional)
                /*
                icons: {
                    android: {
                        ldpi: 'icon-36-ldpi.png',
                        mdpi: 'icon-48-mdpi.png',
                        hdpi: 'icon-72-hdpi.png',
                        xhdpi: 'icon-96-xhdpi.png'
                    },
                    wp8: {
                        app: 'icon-62-tile.png',
                        tile: 'icon-173-tile.png'
                    },
                    ios: {
                        icon29: 'icon29.png',
                        icon29x2: 'icon29x2.png',
                        icon40: 'icon40.png',
                        icon40x2: 'icon40x2.png',
                        icon57: 'icon57.png',
                        icon57x2: 'icon57x2.png',
                        icon60x2: 'icon60x2.png',
                        icon72: 'icon72.png',
                        icon72x2: 'icon72x2.png',
                        icon76: 'icon76.png',
                        icon76x2: 'icon76x2.png'
                    }
                },

                // Set a splash screen at various sizes (optional)
                // Only works for Android and IOS
                screens: {
                    android: {
                        ldpi: 'screen-ldpi-portrait.png'
                        // landscape version
                        ldpiLand: 'screen-ldpi-landscape.png'
                        mdpi: 'screen-mdpi-portrait.png'
                        // landscape version
                        mdpiLand: 'screen-mdpi-landscape.png'
                        hdpi: 'screen-hdpi-portrait.png'
                        // landscape version
                        hdpiLand: 'screen-hdpi-landscape.png'
                        xhdpi: 'screen-xhdpi-portrait.png'
                        // landscape version
                        xhdpiLand: 'www/screen-xhdpi-landscape.png'
                    },
                    ios: {
                        // ipad landscape
                        ipadLand: 'screen-ipad-landscape.png',
                        ipadLandx2: 'screen-ipad-landscape-2x.png',
                        // ipad portrait
                        ipadPortrait: 'screen-ipad-portrait.png',
                        ipadPortraitx2: 'screen-ipad-portrait-2x.png',
                        // iphone portrait
                        iphonePortrait: 'screen-iphone-portrait.png',
                        iphonePortraitx2: 'screen-iphone-portrait-2x.png',
                        iphone568hx2: 'screen-iphone-568h-2x.png'
                    }
                },
                */
                // Android-only integer version to increase with each release.
                // See http://developer.android.com/tools/publishing/versioning.html
                versionCode: function(){ return(1) },

                // Android-only options that will override the defaults set by Phonegap in the
                // generated AndroidManifest.xml
                // See https://developer.android.com/guide/topics/manifest/uses-sdk-element.html
                minSdkVersion: function(){ return(19) },
                targetSdkVersion: function(){ return(19) },

                // iOS7-only options that will make the status bar white and transparent
                iosStatusBar: 'WhiteAndTransparent',

                // If you want to use the Phonegap Build service to build one or more
                // of the platforms specified above, include these options.
                // See https://build.phonegap.com/
                /*
                remote: {
                    username: 'your_username',
                    password: 'your_password',
                    platforms: ['android', 'blackberry', 'ios', 'symbian', 'webos', 'wp7']
                },
                */

                // Set an explicit Android permissions list to override the automatic plugin defaults.
                // In most cases, you should omit this setting. See 'Android Permissions' in README.md for details.
                permissions: ['INTERNET', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'READ_PHONE_STATE']
            }
        }
    });

    // clean
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Load the plugin that provides the "TS" task.
    grunt.loadNpmTasks('grunt-typescript');
    // zip
    grunt.loadNpmTasks('grunt-zip');
    // copy
    grunt.loadNpmTasks('grunt-contrib-copy');
    // replace text in file
    grunt.loadNpmTasks('grunt-text-replace');
    // pg
    grunt.loadNpmTasks('grunt-phonegap');

    // Default task(s).
    grunt.registerTask('reset', ['clean']);
    grunt.registerTask('dist', ['typescript', 'uglify', 'copy', 'replace', 'zip']);
    grunt.registerTask('default', ['typescript']);

};